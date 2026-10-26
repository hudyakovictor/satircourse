import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonPlate } from "@/components/Plate";
import { Reveal } from "@/components/Reveal";
import { chapters, getChapter } from "@/content/course";

export const dynamicParams = false;

export function generateStaticParams() {
  return chapters.map((c) => ({ chapter: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const found = getChapter(chapter);
  return {
    title: found ? `${found.title} — Департамент управляемой паники` : "Глава",
    description: found?.brief,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const found = getChapter(chapter);
  if (!found) notFound();

  return (
    <div>
      <section className="relative border-b-[3px] border-[var(--paper)]">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/${found.cover}`}
            alt={`Обложка главы ${found.title}`}
            className="h-full w-full object-cover"
            style={{ filter: "saturate(0.8) contrast(1.12)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(95deg, #12100F 14%, rgba(18,16,15,0.9) 46%, rgba(18,16,15,0.4) 100%)",
            }}
          />
        </div>
        <div className="wrap relative py-[64px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="sticker">ГЛАВА {String(found.number).padStart(2, "0")}</span>
            <span className="sticker sticker--paper">{found.lessons.length} УРОКА</span>
          </div>
          <h1 className="mt-6" style={{ fontSize: "clamp(38px, 7vw, 96px)", maxWidth: "16ch" }}>
            {found.title}
          </h1>
          <p className="lead mt-6 max-w-[42ch]">{found.subtitle.toUpperCase()}</p>
          <p className="max-w-[58ch]" style={{ color: "var(--paper-2)" }}>
            {found.brief}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/course/${found.slug}/${found.lessons[0].slug}`}
              className="btn"
            >
              НАЧАТЬ ГЛАВУ →
            </Link>
            <Link href="/course" className="btn btn--ghost">
              ← ВСЯ ПРОГРАММА
            </Link>
          </div>
        </div>
      </section>

      <section className="wrap py-[64px]">
        <div className="section-head">
          <h2>СОДЕРЖАНИЕ ГЛАВЫ</h2>
          <div className="kicker">КАЖДЫЙ УРОК — ОТЧЁТ. КАЖДЫЙ ОТЧЁТ — УЛИКА.</div>
        </div>

        <div className="grid gap-7 md:grid-cols-2">
          {found.lessons.map((l, i) => (
            <Reveal key={l.slug} delay={i * 0.05} rotate={i % 2 ? 0.5 : -0.5}>
              <Link
                href={`/course/${found.slug}/${l.slug}`}
                className="group grid gap-5 border border-[var(--line)] bg-[var(--panel)] p-5 sm:grid-cols-[190px_1fr]"
              >
                <div>
                  <LessonPlate
                    uid={`${found.slug}-${l.slug}`}
                    code={`${found.number}.${i + 1}`}
                    title={l.title}
                    motif={found.number as 1 | 2 | 3 | 4 | 5 | 6 | 7}
                    ink={found.ink}
                  />
                </div>
                <div>
                  <div className="kicker">{l.kicker}</div>
                  <h3 className="mt-3" style={{ fontSize: 23 }}>
                    {l.title}
                  </h3>
                  <p className="mt-3" style={{ color: "var(--paper-2)", fontSize: 15.5 }}>
                    {l.tagline}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-3">
                    <span className="sticker sticker--paper">{l.level}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                      {l.minutes} МИН · {l.quiz.length} ВОПРОСА
                    </span>
                    <span
                      className="mono ml-auto group-hover:text-[var(--lime)]"
                      style={{ fontSize: 11 }}
                    >
                      ЧИТАТЬ →
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="memo mt-14">
          <h4>ЗАМЕТКА УЧЕБНОГО ОТДЕЛА</h4>
          <p>
            Материал главы {found.number} носит образовательный характер и не отменяет
            главного правила: рынок не падает, он пересматривает реальность. Ваши выводы
            остаются за вами, как и всё, что останется на счёте.
          </p>
          <div className="stamp">ПРИНЯТО К СВЕДЕНИЮ</div>
        </div>
      </section>
    </div>
  );
}
