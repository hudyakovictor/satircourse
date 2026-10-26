import { CARDS, ENTITIES, TREE } from "./content";
import {
  branchTotals, cardLevel, chapterStatus, dueCards, gateProgress, level, metrics, nodeFill, now, sessionPlan, today, type PlayerState, retrievability,
} from "./engine";

export function buildView(state: PlayerState, name: string) {
  const t = now(state);
  const cards = CARDS.map((c) => ({
    id: c.id,
    level: cardLevel(state, c.id),
    clean: state.cardStats[c.id]?.clean || 0,
    R: state.srs[c.id] ? retrievability(state.srs[c.id], t) : null,
    S: state.srs[c.id]?.S ?? null,
  }));
  const entities = ENTITIES.map((e) => {
    const es = state.entities[e.id];
    const g = gateProgress(state, e.native);
    return {
      id: e.id,
      status: es ? es.status : "hidden",
      rank: es?.rank || 0,
      ready: !!es && es.status === "awake" && t >= es.dueAt,
      dueInDays: es ? Math.max(0, Math.ceil((es.dueAt - t) / 86_400_000)) : null,
      wins: es?.wins || 0,
      losses: es?.losses || 0,
      // Hidden counter: players only see vague "traces" (0–4), designers see exact parts.
      traces: state.cards.includes(e.native) ? Math.floor(g.total * 4) : -1,
      gate: state.designerMode ? g : null,
    };
  });
  const tree = TREE.map((n) => ({ id: n.id, ...nodeFill(state, n.id) }));
  return {
    name,
    xp: state.xp,
    level: level(state.xp),
    dayOffset: state.dayOffset,
    designerMode: state.designerMode,
    shadowDemoSeen: state.shadowDemoSeen,
    lessonsDone: state.lessonsDone,
    examsPassed: state.examsPassed,
    practice: state.practiceByChapter,
    chapters: chapterStatus(state),
    cards,
    ownedCards: state.cards,
    entities,
    tree,
    branches: branchTotals(state),
    plan: sessionPlan(state),
    today: today(state),
    due: dueCards(state),
    metrics: metrics(state),
    errors: state.errors,
    decisions: state.decisions.slice(-40).reverse(),
    journal: state.journal.slice(-40).reverse(),
    arcadeBest: state.arcadeBest,
  };
}
export type View = ReturnType<typeof buildView>;
