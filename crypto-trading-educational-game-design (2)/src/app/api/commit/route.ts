import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { scenarios } from "@/db/schema";
import { ARCHETYPES, CARD_BY_ID, ENTITY_BY_ID, TREE, OPTION_RU, type Option } from "@/lib/content";
import { dayIndex, entityOutcome, mainChapter, refreshEntities, today, type PlayerState } from "@/lib/engine";
import { simulate, structuralStopPct, type Scenario } from "@/lib/market";
import { loadPlayer, savePlayer, logEvent, bad, sha256 } from "@/lib/server";
import { buildView } from "@/lib/view";

export const dynamic = "force-dynamic";

interface Decision {
  scenarioId: string; option: Option; stopPct: number; targetR: number; riskPct: number; confidence: number;
  cards?: string[]; reasonIdx?: number; explanation?: string; elapsedMs?: number;
}
type Payload = Scenario & { battle: { entityId: string; rank: number; hand: string[] } | null; hidden: { required?: string[]; decoys?: string[]; reasonCorrect?: number }; hintLevel: number };

export async function POST(req: Request) {
  const p = await loadPlayer();
  const d = (await req.json()) as Decision;
  if (!["long_now", "long_retest", "short", "no_trade"].includes(d.option)) return bad("Bad option");

  // Atomic claim: only the first commit is applied (idempotent rewards, no re-rolls after seeing the future).
  const decisionHash = sha256({ id: d.scenarioId, d });
  const claimed = await db.update(scenarios)
    .set({ committed: true, decision: d, decisionHash, committedAt: new Date() })
    .where(and(eq(scenarios.id, d.scenarioId), eq(scenarios.playerId, p.id), eq(scenarios.committed, false)))
    .returning();
  if (!claimed[0]) {
    const existing = await db.select().from(scenarios).where(and(eq(scenarios.id, d.scenarioId), eq(scenarios.playerId, p.id))).limit(1);
    if (!existing[0]) return bad("Scenario not found", 404);
    return Response.json({ ...(existing[0].result as object), replay: true, view: buildView(p.state, p.name) });
  }
  const row = claimed[0];
  const s = row.payload as Payload;
  const arch = ARCHETYPES[s.archetype];
  const weights = arch.weights;
  const best = (Object.keys(weights) as Option[]).reduce((a, b) => (weights[b] > weights[a] ? b : a));
  const isTrade = d.option !== "no_trade";

  // ---------- Quality Score (process, not outcome; speed excluded) ----------
  let quality = weights[d.option];
  const notes: string[] = [];
  const errors: string[] = [];
  let riskViolation = false;
  const structPct = structuralStopPct(s, d.option);
  if (isTrade) {
    if (!(d.stopPct > 0)) { quality = Math.min(quality, 20); riskViolation = true; notes.push("Нет стопа — критическое нарушение: качество ограничено 20."); }
    if (d.riskPct > 2) { quality = Math.min(quality, 20); riskViolation = true; notes.push(`Риск ${d.riskPct}% > 2% на сделку — критическое нарушение (Risk Cap).`); }
    else if (d.riskPct > 1) { quality -= 10; notes.push("Риск выше 1% — для обучения держи ≤1%."); }
    if (d.targetR < 1.5) { quality -= 20; riskViolation = true; notes.push(`R:R 1:${d.targetR} — ниже минимума (Minimum R Multiple ≥ 2).`); }
    else if (d.targetR < 2) { quality -= 10; notes.push("R:R между 1.5 и 2 — допустимо, но слабо."); }
    if (d.stopPct > 0 && structPct > 0) {
      if (d.stopPct < structPct * 0.5) { quality -= 10; notes.push(`Стоп ${d.stopPct.toFixed(2)}% внутри шума: структурный ≈ ${structPct.toFixed(2)}% (Stop Hunt Kraken любит такие).`); }
      else if (d.stopPct > structPct * 2.5) { quality -= 10; notes.push(`Стоп ${d.stopPct.toFixed(2)}% слишком далеко от структуры (≈ ${structPct.toFixed(2)}%).`); }
    }
  }
  quality = Math.max(0, Math.min(100, Math.round(quality)));

  // ---------- Execution on hidden future ----------
  const sim = simulate(s, { option: d.option, stopPct: d.stopPct, targetR: d.targetR, riskPct: d.riskPct });
  const bestSim = best === "no_trade" ? null : simulate(s, { option: best, stopPct: Math.max(0.3, structPct), targetR: 2, riskPct: 1 });

  // ---------- Battle resolution ----------
  let battle: Record<string, unknown> | null = null;
  let win = false;
  if (s.battle) {
    const ent = ENTITY_BY_ID[s.battle.entityId];
    const required = s.hidden.required || [];
    const picks = (d.cards || []).slice(0, required.length);
    const cardsCorrect = picks.length === required.length && required.every((c) => picks.includes(c));
    let reasonOk = true;
    let explanationOk = true;
    if (s.battle.rank === 2) reasonOk = d.reasonIdx === s.hidden.reasonCorrect;
    if (s.battle.rank === 3) {
      const txt = (d.explanation || "").toLowerCase();
      const hits = ent.keywords.filter((k) => txt.includes(k)).length;
      explanationOk = txt.length >= 40 && hits >= 2;
    }
    win = cardsCorrect && quality >= 60 && reasonOk && explanationOk;
    entityOutcome(p.state, ent.id, win);
    const node = TREE.find((n) => n.cards.includes(ent.native));
    battle = {
      entityId: ent.id, rank: s.battle.rank, win, cardsCorrect, reasonOk, explanationOk,
      required, decoys: s.hidden.decoys || [], picks, lesson: ent.lesson,
      // Loss never names the counter-card; it names the skill to train.
      targeted: win ? null : `Подтяни навык «${node?.name || CARD_BY_ID[ent.native].ru}». Реванш — через 2 дня.`,
      revealAfter: win,
      frozen: p.state.entities[ent.id].status === "frozen",
    };
  }

  // ---------- Error taxonomy ----------
  const conf = Math.min(100, Math.max(50, d.confidence || 70));
  const relevant = arch.cards.filter((c) => p.state.cards.includes(c));
  if (riskViolation) errors.push("risk_violation");
  if (quality < 60) {
    if (d.option === "long_now" && best !== "long_now" && (d.elapsedMs || 99999) < 8000) errors.push("impulsive_entry");
    if (conf >= 85) errors.push("overconfidence");
    const knew = relevant.some((c) => p.state.srs[c]?.lastCorrect);
    if (knew) errors.push("discipline_slip");
    if (!errors.some((e) => e !== "risk_violation")) errors.push("misread_signal");
  }
  errors.forEach((e) => (p.state.errors[e] = (p.state.errors[e] || 0) + 1));

  // ---------- Mastery telemetry ----------
  const clean = quality === 100 && !riskViolation;
  const di = dayIndex(p.state);
  applyCardStats(p.state, relevant, clean, quality < 60, s.contextKey, di);
  p.state.calibration.push({ p: conf / 100, y: quality >= 60 ? 1 : 0 });
  p.state.archetypeAttempts[s.archetype] = (p.state.archetypeAttempts[s.archetype] || 0) + 1;
  const t = today(p.state);
  if (s.battle) t.events += 1; else { t.decisions += 1; const ch = mainChapter(p.state); p.state.practiceByChapter[ch] = (p.state.practiceByChapter[ch] || 0) + 1; }
  const xpGain = Math.round(quality / 10) + (win ? 30 * (s.battle?.rank || 1) : 0);
  p.state.xp += xpGain;
  p.state.decisions.push({
    id: row.id, at: Date.now(), archetype: s.archetype, option: d.option, best, quality, r: sim.r, confidence: conf, errors,
    mode: row.mode, entity: s.battle?.entityId, asset: s.asset, timeframe: s.timeframe,
  });
  const awakened = refreshEntities(p.state);

  const result = {
    scenarioId: row.id, futureHash: row.futureHash, future: s.future, archetype: s.archetype, archetypeRu: arch.ru,
    truth: arch.truth, best, bestRu: OPTION_RU[best], weights, quality, notes, errors, sim, bestSim,
    outcomeVsProcess: quality >= 60 && sim.r < 0 ? "good_loss" : quality < 60 && sim.r > 0 ? "lucky_win" : "consistent",
    aligned: s.aligned, noiseSignals: s.signals.filter((x) => x.noise).map((x) => x.label),
    structuralStopPct: structPct, cardsTrained: relevant, clean, xpGain, battle, awakened, decisionHash,
    elapsedMs: d.elapsedMs,
  };
  await db.update(scenarios).set({ result }).where(eq(scenarios.id, row.id));
  await savePlayer(p.id, p.state);
  await logEvent(p.id, "decision_commit", { id: row.id, archetype: s.archetype, option: d.option, quality, r: sim.r, errors, win, decisionHash });
  return Response.json({ ...result, view: buildView(p.state, p.name) });
}

function applyCardStats(s: PlayerState, cards: string[], clean: boolean, fail: boolean, ctx: string, day: number) {
  for (const c of cards) {
    const st = (s.cardStats[c] ||= { clean: 0, streak: 0, contexts: [], days: [], uses: 0 });
    st.uses++;
    if (clean) {
      st.clean++; st.streak++;
      if (!st.contexts.includes(ctx)) st.contexts.push(ctx);
      if (!st.days.includes(day)) st.days.push(day);
    } else if (fail) st.streak = 0;
  }
}
