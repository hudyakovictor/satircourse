import { randomUUID } from "crypto";
import { ARCHETYPES, CARDS, ENTITY_BY_ID, ENTITIES, type Archetype } from "@/lib/content";
import { mainChapter, now, phaseDifficulty, relevantOwnedArchetypes } from "@/lib/engine";
import { generateScenario, rng } from "@/lib/market";
import { loadPlayer, logEvent, bad, sha256 } from "@/lib/server";
import { db } from "@/db";
import { scenarios } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const p = await loadPlayer();
  const body = (await req.json().catch(() => ({}))) as { mode?: "practice" | "battle"; entityId?: string };
  const mode = body.mode === "battle" ? "battle" : "practice";
  const seed = Math.floor(Math.random() * 2 ** 31);
  const r = rng(seed ^ 0x9e3779b9);
  let archetype: Archetype;
  let difficulty: number;
  let hintLevel: 0 | 1 | 2 = 0;
  let battle: Record<string, unknown> | null = null;
  let hidden: Record<string, unknown> = {};

  if (mode === "battle") {
    const ent = body.entityId ? ENTITY_BY_ID[body.entityId] : undefined;
    const es = ent ? p.state.entities[ent.id] : undefined;
    if (!ent || !es) return bad("Entity not awake");
    if (es.status === "frozen") return bad("Бой заморожен: сначала разбор-пример");
    if (es.status !== "awake" || now(p.state) < es.dueAt) return bad("Реванш ещё не доступен");
    const rank = es.rank;
    archetype = ent.archetype;
    difficulty = rank === 1 ? 2 : rank === 2 ? 3 : 5;
    const required = [ent.native, ...ent.secondary.slice(0, rank - 1)];
    const decoys = rank === 3 ? [...ent.decoys] : [];
    const exclude = new Set([...required, ...ent.decoys]);
    const fillers = CARDS.map((c) => c.id).filter((c) => !exclude.has(c)).sort(() => r() - 0.5);
    const handSize = rank === 1 ? 5 : 6;
    const hand = [...required, ...decoys, ...fillers].slice(0, handSize).sort(() => r() - 0.5);
    let reasons: string[] | null = null;
    let reasonCorrect = -1;
    if (rank === 2) {
      const others = ENTITIES.filter((e) => e.id !== ent.id).sort(() => r() - 0.5).slice(0, 3).map((e) => e.lesson);
      reasons = [ent.lesson, ...others].sort(() => r() - 0.5);
      reasonCorrect = reasons.indexOf(ent.lesson);
    }
    battle = { entityId: ent.id, rank, hand, picks: required.length, reasons, requiresExplanation: rank === 3 };
    hidden = { required, decoys, reasonCorrect };
  } else {
    const pool = relevantOwnedArchetypes(p.state);
    // no-trade parity: ~50% of practice scenarios are tradeable
    const trade = pool.filter((a) => ARCHETYPES[a].tradeable);
    const skip = pool.filter((a) => !ARCHETYPES[a].tradeable);
    const pickFrom = r() < 0.5 && trade.length ? trade : skip.length ? skip : trade;
    archetype = pickFrom[Math.floor(r() * pickFrom.length)];
    difficulty = phaseDifficulty(mainChapter(p.state));
    const attempts = p.state.archetypeAttempts[archetype] || 0;
    hintLevel = attempts < 2 ? 2 : attempts < 5 ? 1 : 0; // worked-example fading: full → partial → none
  }

  const s = generateScenario(seed, archetype, difficulty);
  const id = randomUUID();
  const futureHash = sha256({ id, future: s.future });
  await db.insert(scenarios).values({ id, playerId: p.id, mode, seed, payload: { ...s, battle, hidden, hintLevel }, futureHash });
  await logEvent(p.id, "scenario_created", { id, mode, archetype, difficulty });

  const a = ARCHETYPES[archetype];
  return Response.json({
    id, mode, futureHash,
    asset: s.asset, timeframe: s.timeframe, candles: s.candles, entry: s.entry, atr: s.atr,
    levels: hintLevel === 2 || mode === "battle" ? s.levels : s.levels.slice(0, 1),
    signals: s.signals.map(({ noise: _n, ...rest }) => rest), // noise flag is revealed only in debrief
    difficulty,
    hintLevel,
    hint: hintLevel >= 1 ? a.hint : null,
    suggestedStop: hintLevel === 2 ? { long: ((s.entry - (s.structure - s.atr * 0.5)) / s.entry) * 100, short: ((s.structureShort + s.atr * 0.5 - s.entry) / s.entry) * 100 } : null,
    zone: s.zone,
    battle,
  });
}
