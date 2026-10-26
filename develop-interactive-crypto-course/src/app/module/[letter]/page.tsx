import { notFound } from "next/navigation";
import Link from "next/link";
import { modules, moduleOf, MODSAT, lessonsOf } from "@/lib/course";
import { LessonTile } from "@/components/Tiles";
import { ModuleProgress } from "@/components/Bits";
import { Md } from "@/components/Md";

export function generateStaticParams() {
  return modules.map((m) => ({ letter: m.letter }));
}

export async function generateMetadata({ params }: { params: Promise<{ letter: string }> }) {
  const { letter } = await params;
  const m = moduleOf(letter);
  return { title: m ? `Модуль ${letter} · ${m.title} — SIGNAL ARENA` : "Модуль" };
}

export default async function ModulePage({ params }: { params: Promise<{ letter: string }> }) {
  const { letter } = await params;
  const m = moduleOf(letter);
  if (!m) notFound();
  const ms = MODSAT[letter];
  const ls = lessonsOf(letter);
  const idx = modules.findIndex((x) => x.letter === letter);
  const prev = modules[idx - 1];
  const next = modules[idx + 1];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-[minmax(0,500px)_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/art/module/${letter}.svg`} alt={m.title} width={500} height={500} className="w-full border-2 border-black shadow-[8px_8px_0_#000]" />
        <div>
          <div className="stamp" style={{ color: ms.color }}>
            Модуль {letter} · уровни {m.range}
          </div>
          <h1 className="mt-3 font-display text-5xl uppercase leading-none text-paper md:text-6xl">{m.title}</h1>
          <div className="mt-2 font-display text-xl uppercase text-zinc-400">{ms.dept}</div>
          <p className="mt-4 text-lg text-zinc-200">{ms.teaser}</p>
          <div className="paper mt-5 p-4">
            <div className="font-mono text-xs uppercase">Цель главы</div>
            <p className="mt-1 text-lg">{m.goal}</p>
            {m.support && (
              <div className="mt-2 text-sm">
                <b>Опора для практики: </b>
                <Md className="inline">{m.support.replace(/\]\(\.\.\/appendices\/calculation-workbook\.md\)/, "](/tools)").replace(/\]\(\.\.\/appendices\/glossary\.md\)/, "](/glossary)")}</Md>
              </div>
            )}
          </div>
          <p className="mt-4 font-mono text-sm text-amber-300">» {ms.tag}</p>
          <div className="max-w-md">
            <ModuleProgress ids={ls.map((l) => l.id)} />
          </div>
          <div className="mt-5 flex gap-3">
            <Link href={`/lesson/${ls[0].id}`} className="border-2 border-black bg-toxic px-5 py-2 font-display uppercase text-black shadow-[4px_4px_0_#000]">
              Начать {ls[0].code}
            </Link>
            <Link href="/course" className="border-2 border-black bg-paper px-5 py-2 font-display uppercase text-black shadow-[4px_4px_0_#000]">
              Вся карта
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ls.map((l) => (
          <LessonTile key={l.id} id={l.id} big />
        ))}
      </div>
      <div className="mt-12 flex justify-between font-display uppercase">
        {prev ? (
          <Link href={`/module/${prev.letter}`} className="text-toxic hover:underline">
            ← {prev.letter} · {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/module/${next.letter}`} className="text-toxic hover:underline">
            {next.letter} · {next.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
