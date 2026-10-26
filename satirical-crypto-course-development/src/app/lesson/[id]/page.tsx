import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Art, lessonMotif, pickMotif } from "@/components/art";
import { Md } from "@/components/Md";
import { LessonRunner } from "@/components/LessonRunner";
import { IconBadge } from "@/components/Icon";
import { LESSONS, getLesson, getModule, neighbors } from "@/lib/course";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const l = getLesson(id);
  return { title: l ? `${l.id} · ${l.title} — Signal Arena` : "Не найдено" };
}

const CARD_NAMES: Record<string, string> = { "Т": "Теория", "П": "Пример", "Р": "Решение", "Д": "Разбор", "Э": "Проверка" };
const FALLBACK: Record<string, string> = { "Т": "", "Р": "longshort", "Э": "exam" };

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  const mod = getModule(lesson.module)!;
  const { prev, next } = neighbors(id);
  const motif = lessonMotif(id);

  let figNo = 0;
  const panels = lesson.cards.map((c) => {
    const figs = c.viz.map((v, i) => ({
      motif: pickMotif(v.prompt, v.type), key: `${id}-${c.key}-${i}`, type: v.type, prompt: v.prompt,
    }));
    if (!figs.length) {
      const m = c.key === "Т" ? motif : FALLBACK[c.key];
      if (m) figs.push({ motif: m, key: `${id}-${c.key}-fb`, type: "Схема", prompt: lesson.title });
    }
    return (
      <div key={c.key} className={figs.length ? "grid md:grid-cols-[1fr_340px] gap-6 items-start" : ""}>
        <div>
          <div className="font-mono text-[11px] text-muted mb-1">[{c.key}] {CARD_NAMES[c.key].toUpperCase()}</div>
          {c.text ? <Md>{c.text}</Md> : <p className="text-muted">Вопросы — в карточке решения. Ключ — после ответа.</p>}
        </div>
        {figs.length > 0 && (
          <div className="space-y-4">
            {figs.map((f) => {
              figNo++;
              return (
                <figure key={f.key} className="m-0">
                  <div className="art-frame border border-line"><Art motif={f.motif} seedKey={f.key} accent={lesson.accent} tag={`${id} · РИС.${figNo}`} caption={`${f.type} · ${CARD_NAMES[c.key]}`} mascot={f.type === "Иллюстрация"} /></div>
                  <figcaption className="sr-only">{f.prompt}</figcaption>
                </figure>
              );
            })}
          </div>
        )}
      </div>
    );
  });

  // число вопросов
  const qSource = lesson.isExam ? lesson.cards[2].text : lesson.cards[4].text;
  const nums = [...qSource.matchAll(/(\d{1,2})\)/g)].map((m) => +m[1]);
  const qCount = Math.max(1, Math.min(30, nums.length ? Math.max(...nums) : lesson.isExam ? 10 : 1));
  const e = lesson.cards[4];

  return (
    <div>
      <nav className="text-xs font-mono text-muted flex flex-wrap gap-2 mb-5">
        <Link href="/" className="hover:text-white">АКАДЕМИЯ</Link>/<Link href={`/module/${mod.id}`} className="hover:text-white">МОДУЛЬ {mod.id}</Link>/<span className="text-lime">{lesson.id}</span>
      </nav>

      <section className="grid md:grid-cols-[minmax(0,420px)_1fr] gap-8 items-center">
        <div className="art-frame border border-line w-full max-w-[420px] mx-auto md:mx-0 -rotate-1">
          <Art motif={motif} seedKey={id} accent={lesson.accent} tag={`УРОВЕНЬ ${id}`} caption={lesson.title} mascot={lesson.num % 3 === 0} mood={lesson.isExam ? "worried" : "tired"} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <IconBadge name={mod.icon} color={lesson.accent} />
            <div className="font-mono text-xs text-muted leading-tight">{mod.dept.toUpperCase()}<br />МОДУЛЬ {mod.id} · УРОВЕНЬ {lesson.num}{lesson.isExam ? " · ЭКЗАМЕН ГЛАВЫ" : ""}</div>
          </div>
          <h1 className="font-head text-4xl sm:text-5xl leading-[1.02] mt-4" style={{ color: lesson.accent }}>{lesson.headline}</h1>
          <p className="text-lg text-[#d1d6dc] mt-3 leading-snug max-w-xl">{lesson.teaser}</p>
          <p className="font-mono text-xs text-muted mt-4">ПРОТОКОЛ: {lesson.id} · {lesson.title}</p>
          <div className="flex gap-2 mt-4 text-[11px] font-mono">
            {["Т", "П", "Р", "Д", "Э"].map((k) => <span key={k} className="px-2 py-1 rounded-md border border-line bg-panel text-muted">[{k}]</span>)}
            <span className="px-2 py-1 rounded-md border border-line bg-panel" style={{ color: lesson.accent }}>порог {lesson.passPct}%</span>
          </div>
        </div>
      </section>

      <LessonRunner lessonId={id} isExam={lesson.isExam} passPct={lesson.passPct} qCount={lesson.isExam ? qCount : Math.min(qCount, 5)} accent={lesson.accent}
        panels={panels} keyLabel={e.keyLabel ?? "Ключ"} keyMd={<Md>{e.answer ?? ""}</Md>} afterMd={e.after ? <Md>{e.after}</Md> : null}
        nextHref={next ? `/lesson/${next.id}` : null} nextLabel={next ? `Дальше: ${next.id}` : ""} />

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        {prev ? <Link href={`/lesson/${prev.id}`} className="card p-4 hover:border-lime transition"><div className="font-mono text-[11px] text-muted">← ПРЕДЫДУЩИЙ</div><div className="font-head text-xl">{prev.id} · {prev.title}</div></Link> : <span />}
        {next && <Link href={`/lesson/${next.id}`} className="card p-4 hover:border-lime transition sm:text-right"><div className="font-mono text-[11px] text-muted">СЛЕДУЮЩИЙ →</div><div className="font-head text-xl">{next.id} · {next.title}</div></Link>}
      </div>
    </div>
  );
}
