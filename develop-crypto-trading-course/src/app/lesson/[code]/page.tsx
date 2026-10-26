import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allLessons, getLesson } from "@/lib/content";
import { MODULES, moduleById } from "@/lib/course-meta";
import { Md } from "@/components/Md";
import { LessonPlayer } from "@/components/LessonPlayer";
import { LockGate } from "@/components/LockGate";
import { Illustration } from "@/components/art/Illustration";

export function generateStaticParams() {
  return allLessons().map((l) => ({ code: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const l = getLesson(code);
  return { title: l ? `${l.code} · ${l.title} — Signal Arena` : "Урок" };
}

export default async function LessonPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const lesson = getLesson(code);
  if (!lesson) notFound();
  const meta = moduleById(lesson.moduleId)!;
  const list = allLessons();
  const idx = list.findIndex((l) => l.code === lesson.code);
  const prev = list[idx - 1];
  const next = list[idx + 1];
  const mIdx = MODULES.findIndex((m) => m.id === meta.id);
  const prevMod = MODULES[mIdx - 1];
  const v1 = lesson.visuals[0];
  const v2 = lesson.visuals[1] ?? lesson.visuals[0];
  const coverPrompt = lesson.visuals.find((v) => v.type !== "Таблица")?.prompt ?? v1.prompt;
  const common = { moduleId: meta.id, accent: meta.color, code: lesson.code, title: lesson.title };

  return (
    <LockGate prevExamCode={prevMod ? `${prevMod.id}${prevMod.to}` : undefined} prevModule={prevMod?.id}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#9fb0e6]">
          <Link href="/" className="hover:text-white">Маршрут</Link> /
          <Link href={`/module/${meta.id}`} className="hover:text-white">Модуль {meta.id} · {meta.short}</Link> /
          <span className="text-white">{lesson.code}</span>
        </nav>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-[#0a1130]" style={{ background: meta.color }}>{lesson.code}</div>
          <div>
            <div className="text-xs font-black tracking-[0.25em]" style={{ color: meta.color }}>{lesson.isExam ? "ЭКЗАМЕН МОДУЛЯ" : `УРОВЕНЬ ${lesson.n}`}</div>
            <h1 className="text-2xl font-black leading-tight md:text-4xl">{lesson.title}</h1>
          </div>
        </div>
        <div className="mt-6">
          <LessonPlayer
            code={lesson.code}
            title={lesson.title}
            color={meta.color}
            isExam={lesson.isExam}
            quiz={{ total: lesson.quiz.total, pass: lesson.quiz.pass, hasQuestion: lesson.quiz.question.length > 0 }}
            nodes={{
              T: <Md>{lesson.cards.T}</Md>,
              P: <Md>{lesson.cards.P}</Md>,
              R: <Md>{lesson.cards.R}</Md>,
              D: <Md>{lesson.cards.D}</Md>,
              QQ: <Md>{lesson.quiz.question}</Md>,
              QK: <Md>{lesson.quiz.key}</Md>,
              keyLabel: lesson.quiz.keyLabel,
            }}
            art={{
              cover: <Illustration seed={lesson.code} prompt={coverPrompt} {...common} cover />,
              viz1: <Illustration seed={lesson.code + "a"} prompt={v1.prompt} vtype={v1.type} {...common} title={lesson.title} />,
              viz2: <Illustration seed={lesson.code + "b"} prompt={v2.prompt} vtype={v2.type} {...common} title={lesson.title} />,
              cap1: `Рис. 1 · ${v1.type}: ${v1.prompt}`,
              cap2: `Рис. 2 · ${v2.type}: ${v2.prompt}`,
            }}
            prev={prev ? { code: prev.code, title: prev.title } : undefined}
            next={next ? { code: next.code, title: next.title } : undefined}
          />
        </div>
      </div>
    </LockGate>
  );
}
