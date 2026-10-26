import {
  CARDS, CHAPTERS, ENTITIES, ENTITY_BY_CARD, LESSONS, TREE, ARCHETYPES, QUESTIONS_BY_CARD,
  type Archetype, type Branch,
} from "./content";

export const DAY = 86_400_000;

export interface SrsItem { S: number; D: number; last: number; reps: number; lapses: number; lastCorrect: boolean }
export interface CardStat { clean: number; streak: number; contexts: string[]; days: number[]; uses: number }
export interface EntityState { rank: number; status: "dormant" | "awake" | "defeated" | "frozen"; dueAt: number; losses: number; wins: number; lossStreak: number; history: { at: number; rank: number; win: boolean }[] }
export interface DecisionLog { id: string; at: number; archetype: Archetype; option: string; best: string; quality: number; r: number; confidence: number; errors: string[]; mode: string; entity?: string; asset: string; timeframe: string }

export interface PlayerState {
  version: 1;
  dayOffset: number;
  xp: number;
  lessonsDone: string[];
  examsPassed: string[];
  examAttempts: Record<string, number>;
  practiceByChapter: Record<string, number>;
  cards: string[];
  srs: Record<string, SrsItem>;
  cardStats: Record<string, CardStat>;
  entities: Record<string, EntityState>;
  archetypeAttempts: Record<string, number>;
  decisions: DecisionLog[];
  calibration: { p: number; y: number }[];
  errors: Record<string, number>;
  daily: Record<string, { decisions: number; recall: number; events: number; arcade: number; journal: number }>;
  journal: { id: string; at: number; decisionId: string; planFollowed: boolean; emotion: string; rulePatch: string; note: string }[];
  arcadeBest: number;
  designerMode: boolean;
  shadowDemoSeen: boolean;
}

export function newState(): PlayerState {
  return {
    version: 1, dayOffset: 0, xp: 0, lessonsDone: [], examsPassed: [], examAttempts: {}, practiceByChapter: {},
    cards: [], srs: {}, cardStats: {}, entities: {}, archetypeAttempts: {}, decisions: [], calibration: [], errors: {},
    daily: {}, journal: [], arcadeBest: 0, designerMode: false, shadowDemoSeen: false,
  };
}

export const now = (s: PlayerState) => Date.now() + s.dayOffset * DAY;
export const dayIndex = (s: PlayerState) => Math.floor(now(s) / DAY);
export function today(s: PlayerState) {
  const k = String(dayIndex(s));
  return (s.daily[k] ||= { decisions: 0, recall: 0, events: 0, arcade: 0, journal: 0 });
}

// ---------------- FSRS-4.5 style memory model ----------------
const FACTOR = 19 / 81;
const DECAY = -0.5;
export function retrievability(item: SrsItem, t: number) {
  const days = Math.max(0, (t - item.last) / DAY);
  return Math.pow(1 + (FACTOR * days) / item.S, DECAY);
}
export function srsReview(item: SrsItem | undefined, correct: boolean, t: number): SrsItem {
  if (!item) return { S: 1, D: 5, last: t, reps: 1, lapses: 0, lastCorrect: correct };
  const R = retrievability(item, t);
  if (correct) {
    const gain = Math.exp(1.2) * (11 - item.D) * Math.pow(item.S, -0.2) * (Math.exp((1 - R) * 1.0) - 1);
    // guard: reviewing too early (R≈1) yields tiny growth — spacing is enforced by the model itself
    const S = item.S * (1 + Math.max(0.05, gain));
    return { S: Math.min(365, S), D: Math.max(1, item.D - 0.3), last: t, reps: item.reps + 1, lapses: item.lapses, lastCorrect: true };
  }
  return { S: Math.max(0.5, item.S * 0.3), D: Math.min(10, item.D + 1), last: t, reps: item.reps + 1, lapses: item.lapses + 1, lastCorrect: false };
}
export function dueCards(s: PlayerState) {
  const t = now(s);
  return s.cards.filter((c) => s.srs[c] && retrievability(s.srs[c], t) < 0.9 && QUESTIONS_BY_CARD[c]?.length)
    .sort((a, b) => retrievability(s.srs[a], t) - retrievability(s.srs[b], t));
}

// ---------------- Academy unlock rules ----------------
export function chapterProgress(s: PlayerState, ch: string) {
  const lessons = LESSONS.filter((l) => l.chapter === ch);
  const done = lessons.filter((l) => s.lessonsDone.includes(l.id)).length;
  const practice = Math.min(5, s.practiceByChapter[ch] || 0);
  const exam = s.examsPassed.includes(ch) ? 1 : 0;
  return (done / lessons.length) * 0.6 + (practice / 5) * 0.2 + exam * 0.2;
}
export function chapterStatus(s: PlayerState) {
  const out: { id: string; progress: number; open: boolean; role: "main" | "next" | "done" | "locked"; lockReason?: string; examOpen: boolean }[] = [];
  CHAPTERS.forEach((c, i) => {
    const progress = chapterProgress(s, c.id);
    let open = i === 0;
    let lockReason: string | undefined;
    if (i > 0) {
      const prev = CHAPTERS[i - 1].id;
      const prevP = chapterProgress(s, prev);
      const capOk = i < 2 || s.examsPassed.includes(CHAPTERS[i - 2].id);
      open = prevP >= 0.65 && capOk;
      if (prevP < 0.65) lockReason = `Откроется при 65% главы ${prev} (сейчас ${Math.round(prevP * 100)}%)`;
      else if (!capOk) lockReason = `Кап 2 активных глав: сначала сдай экзамен ${CHAPTERS[i - 2].id}`;
      if (c.id === "J" && !s.examsPassed.includes("H")) { open = false; lockReason = "Глава-шлюз: сначала экзамен H (Risk Gate) на 85%"; }
    }
    const done = s.examsPassed.includes(c.id);
    const lessonsAll = LESSONS.filter((l) => l.chapter === c.id).every((l) => s.lessonsDone.includes(l.id));
    const prevExamOk = i === 0 || s.examsPassed.includes(CHAPTERS[i - 1].id);
    out.push({ id: c.id, progress, open, role: done ? "done" : open ? "main" : "locked", lockReason, examOpen: open && lessonsAll && prevExamOk && !done });
  });
  const active = out.filter((o) => o.role === "main");
  if (active.length === 2) active[1].role = "next";
  return out;
}
export function mainChapter(s: PlayerState) {
  const st = chapterStatus(s);
  return st.find((c) => c.role === "main")?.id || "J";
}
export function phaseDifficulty(ch: string) {
  const i = CHAPTERS.findIndex((c) => c.id === ch);
  return i <= 2 ? 2 : i <= 6 ? 3 : 4;
}

// ---------------- Cards ----------------
export function cardLevel(s: PlayerState, cardId: string): 0 | 1 | 2 | 3 {
  if (!s.cards.includes(cardId)) return 0;
  const ent = ENTITY_BY_CARD[cardId];
  const es = ent ? s.entities[ent.id] : undefined;
  if (es && es.history.some((h) => h.win && h.rank >= 2)) return 3;
  if ((s.cardStats[cardId]?.clean || 0) >= 10) return 2;
  return 1;
}

// ---------------- Mastery gate (hidden counter) ----------------
export function gateProgress(s: PlayerState, cardId: string) {
  const st = s.cardStats[cardId];
  const srs = s.srs[cardId];
  const parts = {
    streak: Math.min(1, (st?.streak || 0) / 5),
    contexts: Math.min(1, (st?.contexts.length || 0) / 3),
    sessions: Math.min(1, (st?.days.length || 0) / 2),
    recall: srs ? Math.min(1, srs.S / 3) : 0,
  };
  const total = (parts.streak + parts.contexts + parts.sessions + parts.recall) / 4;
  return { ...parts, total, met: parts.streak >= 1 && parts.contexts >= 1 && parts.sessions >= 1 && parts.recall >= 1 };
}

export function refreshEntities(s: PlayerState): string[] {
  const awakened: string[] = [];
  const t = now(s);
  for (const e of ENTITIES) {
    const es = s.entities[e.id];
    if (!es) {
      if (s.cards.includes(e.native) && gateProgress(s, e.native).met) {
        s.entities[e.id] = { rank: 1, status: "awake", dueAt: t, losses: 0, wins: 0, lossStreak: 0, history: [] };
        awakened.push(e.id);
      }
    } else if (es.status === "defeated" && es.rank < 3 && t >= es.dueAt) {
      es.rank += 1; es.status = "awake"; awakened.push(e.id);
    }
  }
  return awakened;
}

export function entityOutcome(s: PlayerState, entityId: string, win: boolean) {
  const t = now(s);
  const es = s.entities[entityId];
  es.history.push({ at: t, rank: es.rank, win });
  if (win) {
    es.wins++; es.lossStreak = 0; es.status = "defeated";
    es.dueAt = t + (es.rank === 1 ? 7 : 21) * DAY;
  } else {
    es.losses++; es.lossStreak++;
    es.dueAt = t + 2 * DAY; // revenge in 2 days, never immediately
    es.status = es.lossStreak >= 3 ? "frozen" : "awake";
  }
}

// ---------------- Skill tree: 30% lessons + 40% clean card uses + 30% entity wins ----------------
export function nodeFill(s: PlayerState, nodeId: string) {
  const n = TREE.find((x) => x.id === nodeId)!;
  const chLessons = LESSONS.filter((l) => l.chapter === n.chapter);
  const lessonPart = chLessons.filter((l) => s.lessonsDone.includes(l.id)).length / Math.max(1, chLessons.length);
  const clean = n.cards.reduce((a, c) => a + (s.cardStats[c]?.clean || 0), 0);
  const cleanPart = Math.min(1, clean / (8 * n.cards.length));
  const ents = n.cards.map((c) => ENTITY_BY_CARD[c]).filter(Boolean);
  const winsPart = ents.length ? ents.reduce((a, e) => a + Math.min(3, s.entities[e.id]?.history.filter((h) => h.win).length || 0) / 3, 0) / ents.length : 0;
  const hasR2 = ents.some((e) => s.entities[e.id]?.history.some((h) => h.win && h.rank >= 2));
  const fill = lessonPart * 0.3 + cleanPart * 0.4 + winsPart * 0.3;
  let div = fill >= 0.9 ? 3 : fill >= 0.55 ? 2 : fill >= 0.2 ? 1 : 0;
  if (div === 3 && !hasR2) div = 2;
  let locked = false;
  if (n.cross) {
    const other = TREE.filter((x) => x.branch === n.cross);
    const otherDivs = other.reduce((a, o) => a + baseDiv(s, o.id), 0);
    if (otherDivs < 3) { locked = true; div = 0; }
  }
  return { fill, div, lessonPart, cleanPart, winsPart, locked };
}
function baseDiv(s: PlayerState, nodeId: string) {
  const n = TREE.find((x) => x.id === nodeId)!;
  if (n.cross) return 0;
  const chLessons = LESSONS.filter((l) => l.chapter === n.chapter);
  const lp = chLessons.filter((l) => s.lessonsDone.includes(l.id)).length / Math.max(1, chLessons.length);
  const clean = n.cards.reduce((a, c) => a + (s.cardStats[c]?.clean || 0), 0);
  const f = lp * 0.3 + Math.min(1, clean / (8 * n.cards.length)) * 0.4;
  return f >= 0.55 ? 2 : f >= 0.2 ? 1 : 0;
}
export function branchTotals(s: PlayerState) {
  const res: Record<Branch, number> = { market: 0, trade: 0, discipline: 0 };
  TREE.forEach((n) => (res[n.branch] += nodeFill(s, n.id).div));
  return res;
}

// ---------------- Metrics ----------------
export function metrics(s: PlayerState) {
  const last = s.decisions.slice(-30);
  const q = last.length ? last.reduce((a, d) => a + d.quality, 0) / last.length : 0;
  const trades = last.filter((d) => d.option !== "no_trade");
  const expectancy = trades.length ? trades.reduce((a, d) => a + d.r, 0) / trades.length : 0;
  const cal = s.calibration.slice(-50);
  const brier = cal.length ? cal.reduce((a, c) => a + (c.p - c.y) ** 2, 0) / cal.length : null;
  const avgConf = cal.length ? cal.reduce((a, c) => a + c.p, 0) / cal.length : 0;
  const hit = cal.length ? cal.reduce((a, c) => a + c.y, 0) / cal.length : 0;
  const t = now(s);
  const memory = s.cards.map((c) => ({ card: c, R: s.srs[c] ? retrievability(s.srs[c], t) : 0, S: s.srs[c]?.S || 0 }));
  const avgR = memory.length ? memory.reduce((a, m) => a + m.R, 0) / memory.length : 0;
  const noTradeCorrect = last.filter((d) => d.best === "no_trade");
  const noTradeParity = noTradeCorrect.length ? noTradeCorrect.filter((d) => d.option === "no_trade").length / noTradeCorrect.length : null;
  return { quality: q, expectancy, brier, avgConf, hit, overconfidence: avgConf - hit, avgRetention: avgR, memory, noTradeParity, decisions: s.decisions.length };
}

export function level(xp: number) { return Math.floor(Math.sqrt(xp / 40)); }

// ---------------- Session plan: 60% current / 25% recall / 15% events ----------------
export function sessionPlan(s: PlayerState) {
  const d = today(s);
  const due = dueCards(s).length;
  const awake = Object.entries(s.entities).filter(([, e]) => e.status === "awake" && now(s) >= e.dueAt).length;
  const recallTarget = Math.min(3, due + d.recall);
  const eventTarget = Math.min(2, awake + d.events);
  return {
    slots: [
      { key: "decisions", label: "Решения в Арене / уроки", done: d.decisions, target: 7 },
      { key: "recall", label: "Патруль памяти (повтор)", done: d.recall, target: recallTarget },
      { key: "events", label: "События: охота на Entity", done: d.events, target: eventTarget },
    ],
    due, awake, arcadeUnlocked: due === 0 || d.recall >= 3,
  };
}

export function relevantOwnedArchetypes(s: PlayerState): Archetype[] {
  const all = Object.keys(ARCHETYPES) as Archetype[];
  const owned = all.filter((a) => ARCHETYPES[a].cards.some((c) => s.cards.includes(c)));
  const base: Archetype[] = ["range_chop", "trend_pullback", "real_breakout"];
  const set = Array.from(new Set([...base, ...owned]));
  return set;
}

export function allCardsCount() { return CARDS.length; }
