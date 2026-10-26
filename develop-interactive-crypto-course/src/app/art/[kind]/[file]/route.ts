import { renderScene, renderVisual, renderCard } from "@/lib/art/scene";
import { lessons, getLesson, satOf, MODSAT, modules } from "@/lib/course";

export const dynamic = "force-static";

export function generateStaticParams() {
  const out: { kind: string; file: string }[] = [];
  for (const l of lessons) {
    out.push({ kind: "lesson", file: `${l.id}.svg` });
    l.visuals.forEach((_, i) => out.push({ kind: "visual", file: `${l.id}-${i}.svg` }));
  }
  for (const m of modules) out.push({ kind: "module", file: `${m.letter}.svg` });
  for (const k of ["T", "P", "R", "D", "E"]) out.push({ kind: "card", file: `${k}.svg` });
  return out;
}

function svg(body: string) {
  return new Response(body, {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}

export async function GET(_req: Request, ctx: { params: Promise<{ kind: string; file: string }> }) {
  const { kind, file } = await ctx.params;
  const name = (file ?? "").replace(/\.svg$/, "");
  if (kind === "lesson") {
    const l = getLesson(parseInt(name, 10));
    if (!l) return new Response("not found", { status: 404 });
    const s = satOf(l.id);
    return svg(
      renderScene({
        letter: l.module,
        seed: l.id + 1,
        slogan: s.s,
        labels: s.l,
        motifs: s.k,
        badge: l.code,
        rainy: ["E", "F", "H"].includes(l.module),
      }),
    );
  }
  if (kind === "visual") {
    const [a, b] = name.split("-").map((x) => parseInt(x, 10));
    const l = getLesson(a);
    const v = l?.visuals[b];
    if (!l || !v) return new Response("not found", { status: 404 });
    return svg(renderVisual({ kind: v.kind, prompt: v.prompt, seed: l.id * 10 + b + 3, letter: l.module, sat: satOf(l.id), code: l.code }));
  }
  if (kind === "module") {
    const m = modules.find((x) => x.letter === name);
    const ms = MODSAT[name];
    if (!m || !ms) return new Response("not found", { status: 404 });
    return svg(
      renderScene({
        letter: name,
        seed: name.charCodeAt(0) * 3,
        slogan: m.title.toUpperCase(),
        labels: [ms.dept, `Уровни ${m.range}`],
        motifs: ms.motifs,
        badge: name,
        rainy: ["E", "F", "H"].includes(name),
      }),
    );
  }
  if (kind === "card") {
    if (!["T", "P", "R", "D", "E"].includes(name)) return new Response("not found", { status: 404 });
    return svg(renderCard(name));
  }
  return new Response("not found", { status: 404 });
}
