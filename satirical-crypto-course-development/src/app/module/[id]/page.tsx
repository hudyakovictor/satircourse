import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Art, lessonMotif } from "@/components/art";
import { IconBadge } from "@/components/Icon";
import { LessonTile, ModuleProgress } from "@/components/LessonTile";
import { MODULES, getModule, lessonsOf } from "@/lib/course";

export function generateStaticParams() {
  return MODULES.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = getModule(id);
  return { title: m ? `Модуль ${m.id} · ${m.title} — Signal Arena` : "Не найдено" };
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = getModule(id);
  if (!m) notFound();
  const lessons = lessonsOf(id);
  const idx = MODULES.findIndex((x) => x.id === id);
  const next = MODULES[idx + 1];
  const prev = MODULES[idx - 1];

  return (
    <div>
      <nav className="text-xs font-mono text-muted flex gap-2 mb-5"><Link href="/" className="hover:text-white">АКАДЕМИЯ</Link>/<span className="text-lime">МОДУЛЬ {m.id}</span></nav>
      <section className="grid md:grid-cols-[minmax(0,440px)_1fr] gap-8 items-center">
        <div className="art-frame border border-line max-w-[440px] w-full rotate-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/art/module-${m.id}.jpg`} alt={`Обложка модуля ${m.id}: ${m.title}`} width={500} height={500} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-3"><IconBadge name={m.icon} color={m.accent} size={52} /><div className="font-mono text-xs text-muted">{m.dept.toUpperCase()}<br />УРОВНИ {m.from}–{m.to} · {lessons.length} УРОКОВ</div></div>
          <h1 className="font-head text-4xl sm:text-5xl mt-4 leading-[1.02]" style={{ color: m.accent }}>{m.title}</h1>
          <p className="font-head text-2xl mt-2 text-white leading-tight">{m.headline}</p>
          <p className="text-[#c9cfd6] mt-3 max-w-xl">{m.teaser}</p>
          <div className="mt-4 card p-4 text-sm max-w-xl">
            <div className="font-mono text-[11px] text-muted mb-1">ЦЕЛЬ ГЛАВЫ</div>
            <p className="text-[#d7dbe0]">{m.goal}</p>
            {m.support && <p className="text-muted mt-2 text-xs">Опора: {m.support}</p>}
          </div>
          <div className="mt-4 max-w-xl"><ModuleProgress ids={m.lessons} accent={m.accent} /></div>
          <Link href={`/lesson/${m.lessons[0]}`} className="btn btn-solid drip mt-6">Начать с {m.lessons[0]}</Link>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-head text-3xl">Уровни {m.from}–{m.to}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {lessons.map((l) => (
            <LessonTile key={l.id} id={l.id} headline={`${l.id} · ${l.headline}`} teaser={l.teaser} accent={l.accent} exam={l.isExam}
              art={<Art motif={lessonMotif(l.id)} seedKey={l.id} accent={l.accent} tag={`УРОВЕНЬ ${l.id}`} caption={l.title} mascot={l.num % 3 === 0} />} />
          ))}
        </div>
      </section>

      <div className="mt-12 grid sm:grid-cols-2 gap-4">
        {prev ? <Link href={`/module/${prev.id}`} className="card p-4 hover:border-lime transition"><div className="font-mono text-[11px] text-muted">← МОДУЛЬ {prev.id}</div><div className="font-head text-xl">{prev.title}</div></Link> : <span />}
        {next && <Link href={`/module/${next.id}`} className="card p-4 hover:border-lime transition sm:text-right"><div className="font-mono text-[11px] text-muted">МОДУЛЬ {next.id} →</div><div className="font-head text-xl">{next.title}</div></Link>}
      </div>
    </div>
  );
}
