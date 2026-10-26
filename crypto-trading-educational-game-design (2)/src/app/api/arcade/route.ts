import { ARCHETYPES, type Archetype, type Option } from "@/lib/content";
import { generateScenario, rng } from "@/lib/market";
import { loadPlayer, savePlayer, logEvent, bad } from "@/lib/server";
import { sessionPlan, today } from "@/lib/engine";
import { buildView } from "@/lib/view";

export const dynamic = "force-dynamic";

const ARCH = Object.keys(ARCHETYPES) as Archetype[];
function round(seed: number) {
  const r = rng(seed);
  const a = ARCH[Math.floor(r() * ARCH.length)];
  return { a, s: generateScenario(seed, a, 2) };
}
// Swipe classification collapses options into 3 classes: long / short / out.
function cls(o: Option) { return o === "short" ? "short" : o === "no_trade" ? "out" : "long"; }

export async function GET() {
  const p = await loadPlayer();
  if (!sessionPlan(p.state).arcadeUnlocked) return bad("Аркада — награда: сначала закрой патруль памяти");
  const base = Math.floor(Math.random() * 1e9);
  const rounds = Array.from({ length: 15 }, (_, i) => {
    const seed = base + i * 7919;
    const { s } = round(seed);
    return { seed, asset: s.asset, candles: s.candles.slice(-36), signals: s.signals.slice(0, 2).map(({ noise: _n, ...x }) => x) };
  });
  return Response.json({ rounds });
}

export async function POST(req: Request) {
  const p = await loadPlayer();
  const b = (await req.json()) as { answers: { seed: number; answer: "long" | "short" | "out" }[] };
  const answers = (b.answers || []).slice(0, 15);
  const graded = answers.map((x) => {
    const { a } = round(x.seed);
    const w = ARCHETYPES[a].weights;
    const best = (Object.keys(w) as Option[]).reduce((m, k) => (w[k] > w[m] ? k : m));
    return { seed: x.seed, correct: cls(best) === x.answer, best: cls(best), archetype: ARCHETYPES[a].ru };
  });
  const score = graded.filter((g) => g.correct).length;
  p.state.arcadeBest = Math.max(p.state.arcadeBest, score);
  const t = today(p.state);
  const xp = t.arcade < 3 ? score * 2 : 0; // capped: arcade is a reward, not a grind
  t.arcade += 1;
  p.state.xp += xp;
  await savePlayer(p.id, p.state);
  await logEvent(p.id, "arcade", { score, n: graded.length });
  return Response.json({ graded, score, xp, view: buildView(p.state, p.name) });
}
