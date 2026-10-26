import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDoc, splitViz } from "@/lib/content";
import { DOCS } from "@/lib/course-meta";
import { Md } from "@/components/Md";
import { Illustration } from "@/components/art/Illustration";

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = DOCS.find((x) => x.slug === slug);
  return { title: d ? `${d.title} — Signal Arena` : "Материал" };
}

const ACCENT: Record<string, string> = { "Методика": "#e9b949", "Приложения": "#4cc9f0", "Шаблоны": "#22e0a1" };

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  const parts = splitViz(doc.md);
  const accent = ACCENT[doc.meta.group];
  let vi = 0;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm font-bold text-[#9fb0e6]">
        <Link href="/materials" className="hover:text-white">Материалы</Link> / <span className="text-white">{doc.meta.title}</span>
      </nav>
      <div className="card3d mt-5 p-6 md:p-10">
        {parts.map((p, i) =>
          "viz" in p ? (
            <div key={i} className="my-6 flex justify-center">
              <div className="illus w-full max-w-[500px]">
                <Illustration seed={`${slug}-${vi++}`} prompt={p.viz.prompt} vtype={p.viz.type} moduleId="A" accent={accent} code={doc.meta.group.toUpperCase()} title={doc.meta.title} />
              </div>
            </div>
          ) : (
            <Md key={i}>{p.md}</Md>
          ),
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {DOCS.filter((d) => d.slug !== slug).slice(0, 5).map((d) => (
          <Link key={d.slug} href={`/docs/${d.slug}`} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">{d.emoji} {d.title}</Link>
        ))}
      </div>
    </div>
  );
}
