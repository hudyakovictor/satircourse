import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/Blocks";
import { LessonPlate } from "@/components/Plate";
import { Quiz } from "@/components/Quiz";
import { allLessons, chapters, getLesson } from "@/content/course";

export const dynamicParams = false;

export function generateStaticParams() {
  return chapters.flatMap((c) =>
    c.lessons.map((l) => ({ chapter: c.slug, lesson: l.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string }>;
}): Promise<Metadata> {
  const { chapter, lesson } = await params;
  const found = getLesson(chapter, lesson);
  return {
    title: found ? `${found.lesson.title} — Департамент управляемой паники` : "Урок",
    description: found?.lesson.tagline,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string }>;
}) {
  const { chapter, lesson } = await params;
  const found = getLesson(chapter, lesson);
  if (!found) notFound();

  const { chapter: ch, lesson: l, index, prev, next } = found;
  const flatIndex = allLessons.findIndex(
    (r) => r.chapter.slug === ch.slug && r.lesson.slug === l.slug
  );
  const nextAnywhere = allLessons[flatIndex + 1];

  return (
    <div className="wrap py-[56px]">
      <nav className="kicker mb-8 flex flex-wrap items-center gap-2">
        <Link href="/course" className="hover:text-[var(--paper)]">
          ПРОГРАММА
        </Link>
        <span>/</span>
        <Link href={`/course/${ch.slug}`} className="hover:text-[var(--paper)]">
          {ch.title}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--magenta)" }}>
          {ch.number}.{index + 1}
        </span>
      </nav>

      <header className="grid gap-9 lg:grid-cols-[500px_1fr]">
        <div className="plate-frame">
          <LessonPlate
            uid={`lesson-${ch.slug}-${l.slug}`}
            code={`${ch.number}.${index + 1}`}
            title={l.title}
            motif={ch.number as 1 | 2 | 3 | 4 | 5 | 6 | 7}
            ink={ch.ink}
          />
          <div className="kicker mt-3">
            ИЛЛЮСТРАЦИЯ {ch.number}.{index + 1} · 500×500 · ОТДЕЛ ГРАФИЧЕСКОЙ ПРОПАГАНДЫ
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="sticker sticker--magenta">{l.level}</span>
            <span className="sticker sticker--paper">{l.minutes} МИНУТ</span>
            <span className="sticker sticker--cyan">
              {l.quiz.length} ВОПРОСА ДОПРОСА
            </span>
          </div>
          <div className="kicker mt-6">{l.kicker}</div>
          <h1 className="mt-4" style={{ fontSize: "clamp(34px, 5.4vw, 68px)" }}>
            {l.title}
          </h1>
          <p className="lead mt-6 max-w-[36ch]">{l.tagline.toUpperCase()}</p>
          <div className="table-scroll">
            <table className="ledger">
              <thead>
                <tr>
                  <th>ПАРАМЕТР</th>
                  <th>ЗНАЧЕНИЕ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ГЛАВА</td>
                  <td>
                    {ch.number}. {ch.title}
                  </td>
                </tr>
                <tr>
                  <td>УРОВЕНЬ РИСКА ДЛЯ МОЗГА</td>
                  <td>{l.level}</td>
                </tr>
                <tr>
                  <td>ВРЕМЯ В СТАТУСЕ «УЧУСЬ»</td>
                  <td>{l.minutes} МИНУТ</td>
                </tr>
                <tr>
                  <td>ГАРАНТИИ</td>
                  <td>ОТСУТСТВУЮТ. РЫНОК ПРИНЯЛ ТВОЁ РЕШЕНИЕ УЧИТЬСЯ.</td>
                </tr>
              </tbody>
            </table>
            <div className="table-caption">ТАБЛИЦА 00 — КАРТОЧКА УРОКА</div>
          </div>
        </div>
      </header>

      <div className="hr" />

      <article className="mx-auto max-w-[74ch]">
        <BlockRenderer blocks={l.blocks} />
      </article>

      <section className="relative mt-16 overflow-hidden border-y-[3px] border-[var(--paper)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/${ch.cover}`}
          alt={`Обложка главы ${ch.title}`}
          className="h-full w-full object-cover"
          style={{ minHeight: 320, filter: "saturate(0.8) contrast(1.12)" }}
        />
        <div
          className="absolute inset-0 flex flex-col justify-center p-8"
          style={{
            background:
              "linear-gradient(95deg, #12100F 18%, rgba(18,16,15,0.86) 52%, rgba(18,16,15,0.35) 100%)",
          }}
        >
          <div className="kicker">
            ГЛАВА {String(ch.number).padStart(2, "0")} · {ch.subtitle.toUpperCase()}
          </div>
          <h2 className="mt-4 max-w-[18ch]" style={{ fontSize: "clamp(28px, 4.4vw, 56px)" }}>
            {ch.title}
          </h2>
          <p className="mt-4 max-w-[46ch]" style={{ color: "var(--paper-2)" }}>
            {ch.brief}
          </p>
          <Link href={`/course/${ch.slug}`} className="btn btn--sm mt-6 self-start">
            ВСЕ УРОКИ ГЛАВЫ →
          </Link>
        </div>
      </section>

      <Quiz
        chapterSlug={ch.slug}
        lessonSlug={l.slug}
        questions={l.quiz}
      />

      <div className="mt-10 grid gap-5 border-t-[3px] border-[var(--paper)] pt-8 md:grid-cols-2">
        <div>
          <div className="kicker">ПРЕДЫДУЩИЙ ОТЧЁТ</div>
          {prev ? (
            <Link href={`/course/${ch.slug}/${prev.slug}`} className="btn btn--ghost mt-4">
              ← {prev.title}
            </Link>
          ) : (
            <Link href={`/course/${ch.slug}`} className="btn btn--ghost mt-4">
              ← СОДЕРЖАНИЕ ГЛАВЫ
            </Link>
          )}
        </div>
        <div className="text-right">
          <div className="kicker">СЛЕДУЮЩИЙ ОТЧЁТ</div>
          {next ? (
            <Link href={`/course/${ch.slug}/${next.slug}`} className="btn mt-4">
              {next.title} →
            </Link>
          ) : nextAnywhere ? (
            <Link
              href={`/course/${nextAnywhere.chapter.slug}/${nextAnywhere.lesson.slug}`}
              className="btn mt-4"
            >
              ГЛАВА {nextAnywhere.chapter.number}: {nextAnywhere.lesson.title} →
            </Link>
          ) : (
            <Link href="/dashboard" className="btn btn--lime mt-4">
              ОФОРМИТЬ ЛИЧНОЕ ДЕЛО →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
