import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getModule } from "@/lib/content";
import { MODULES, moduleById } from "@/lib/course-meta";
import { Md } from "@/components/Md";
import { ModuleCover } from "@/components/ModuleCover";
import { LessonTile } from "@/components/LessonTile";
import { LockGate } from "@/components/LockGate";
import { Illustration, ModuleIcon } from "@/components/art/Illustration";

export function generateStaticParams() {
  return MODULES.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = moduleById(id.toUpperCase());
  return { title: m ? `Модуль ${m.id} · ${m.title} — Signal Arena` : "Модуль" };
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = rawId.toUpperCase();
  const meta = moduleById(id);
  const mod = getModule(id);
  if (!meta || !mod) notFound();
  const idx = MODULES.findIndex((m) => m.id === id);
  const prev = MODULES[idx - 1];
  const next = MODULES[idx + 1];

  return (
    <LockGate prevExamCode={prev ? `${prev.id}${prev.to}` : undefined} prevModule={prev?.id}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <nav className="text-sm font-bold text-[#9fb0e6]">
          <Link href="/" className="hover:text-white">Маршрут</Link> / <span className="text-white">Модуль {id}</span>
        </nav>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="slide-up">
            <ModuleCover mod={mod} />
          </div>
          <div className="slide-up">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/20" style={{ background: `linear-gradient(145deg,#c9d3ea,${meta.color}66)` }}>
                <ModuleIcon id={id} size={64} />
              </div>
              <div>
                <div className="text-xs font-black tracking-[0.25em]" style={{ color: meta.color }}>МОДУЛЬ {id} · УРОВНИ {meta.from}–{meta.to}</div>
                <h1 className="text-3xl font-black leading-tight md:text-4xl">{meta.title}</h1>
              </div>
            </div>
            <div className="card3d mt-6 p-6">
              <Md>{mod.intro}</Md>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/lesson/${mod.lessons[0].code}`} className="btn3d">Начать с {mod.lessons[0].code} →</Link>
              <Link href="/docs/rubrics" className="btn3d btn3d-ghost">Рубрики освоения</Link>
            </div>
          </div>
        </div>

        <h2 className="mt-14 text-2xl font-black">Уровни модуля</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mod.lessons.map((l) => (
            <LessonTile key={l.code} code={l.code} title={l.title} isExam={l.isExam} color={meta.color}>
              <Illustration seed={l.code} prompt={l.visuals.find((v) => v.type !== "Таблица")?.prompt ?? l.visuals[0]?.prompt ?? l.title} moduleId={id} accent={meta.color} cover code={l.code} title={l.title} />
            </LessonTile>
          ))}
        </div>

        <div className="mt-12 flex justify-between gap-4">
          {prev ? <Link href={`/module/${prev.id}`} className="btn3d btn3d-ghost">← Модуль {prev.id}</Link> : <span />}
          {next ? <Link href={`/module/${next.id}`} className="btn3d btn3d-gold">Модуль {next.id} →</Link> : <Link href="/docs/capstone-defense" className="btn3d btn3d-gold">Защита capstone 🎓</Link>}
        </div>
      </div>
    </LockGate>
  );
}
