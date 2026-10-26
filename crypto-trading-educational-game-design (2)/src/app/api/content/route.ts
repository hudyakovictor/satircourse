import { ARCHETYPES, CARDS, CHAPTERS, ENTITIES, LESSONS, TREE, ERROR_RU, OPTION_RU, BRANCH_RU } from "@/lib/content";
import { rng } from "@/lib/market";

function hashSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const dynamic = "force-static";

// Sanitized projection: no correct answers, no option weights, no counter-cards.
export function GET() {
  return Response.json({
    chapters: CHAPTERS,
    lessons: LESSONS.map((l) => ({
      id: l.id, chapter: l.chapter, title: l.title, theory: l.theory, example: l.example, cards: l.cards,
      questions: l.questions.map((q) => {
        const r = rng(hashSeed(q.id + "lesson"));
        const order = q.options.map((_, i) => i).sort(() => r() - 0.5);
        return { id: q.id, card: q.card, prompt: q.prompt, options: order.map((i) => q.options[i]), order };
      }),
    })),
    cards: CARDS,
    entities: ENTITIES.map((e) => ({ id: e.id, name: e.name, ru: e.ru, distortion: e.distortion })),
    tree: TREE,
    archetypes: Object.fromEntries(Object.entries(ARCHETYPES).map(([k, v]) => [k, { ru: v.ru }])),
    errors: ERROR_RU,
    options: OPTION_RU,
    branches: BRANCH_RU,
  });
}
