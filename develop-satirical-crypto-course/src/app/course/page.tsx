import type { Metadata } from "next";
import Link from "next/link";
import { CourseProgress } from "@/components/CourseProgress";
import { Reveal } from "@/components/Reveal";
import { chapters, totalMinutes, totalQuizQuestions } from "@/content/course";

export const metadata: Metadata = {
  title: "Программа курса — Департамент управляемой паники",
  description:
    "7 глав и 28 уроков по анализу и торговле криптовалютами: рынок, технический анализ, риск-менеджмент, психология, DeFi, нарративы и личный протокол.",
};

export default function CoursePage() {
  return (
    <div className="wrap py-[64px]">
      <div className="section-head">
        <div>
          <div className="kicker">ОТДЕЛ ОБУЧЕНИЯ · УЧЕБНЫЙ ПЛАН НА ТЕКУЩИЙ ЦИКЛ</div>
          <h1 className="mt-4" style={{ fontSize: "clamp(38px, 7vw, 92px)" }}>
            ПРОГРАММА
            <br />
            <span style={{ color: "var(--magenta)" }}>ВЫЖИВАНИЯ</span>
          </h1>
        </div>
        <div className="kicker max-w-[30ch] text-right">
          {chapters.length} ГЛАВ · {chapters.reduce((s, c) => s + c.lessons.length, 0)} УРОКОВ ·{" "}
          {totalQuizQuestions} ВОПРОСОВ · {totalMinutes} МИНУТ
        </div>
      </div>

      <CourseProgress />

      <div className="mt-14 space-y-12">
        {chapters.map((c) => (
          <Reveal key={c.slug} rotate={c.number % 2 ? -0.4 : 0.4}>
            <section className="border border-[var(--line)] bg-[var(--panel)]">
              <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
                <Link href={`/course/${c.slug}`} className="relative block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/${c.cover}`} alt={`Обложка главы ${c.title}`} className="img-plate h-full" />
                  <span className="sticker absolute left-4 top-4">
                    ГЛАВА {String(c.number).padStart(2, "0")}
                  </span>
                </Link>
                <div className="p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 style={{ fontSize: "clamp(26px, 3.4vw, 44px)" }}>{c.title}</h2>
                      <div className="kicker mt-2">{c.subtitle}</div>
                    </div>
                    <Link href={`/course/${c.slug}`} className="btn btn--sm">
                      ОТКРЫТЬ ГЛАВУ →
                    </Link>
                  </div>
                  <p className="mt-5 max-w-[70ch]">{c.brief}</p>

                  <div className="table-scroll mt-6">
                    <table className="ledger">
                      <thead>
                        <tr>
                          <th>КОД</th>
                          <th>УРОК</th>
                          <th>УРОВЕНЬ</th>
                          <th>МИНУТ</th>
                          <th>СУТЬ ОДНОЙ ФРАЗОЙ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {c.lessons.map((l, i) => (
                          <tr key={l.slug}>
                            <td>
                              {c.number}.{i + 1}
                            </td>
                            <td>
                              <Link
                                href={`/course/${c.slug}/${l.slug}`}
                                className="hover:text-[var(--lime)]"
                              >
                                {l.title}
                              </Link>
                            </td>
                            <td>{l.level}</td>
                            <td>{l.minutes}</td>
                            <td style={{ color: "var(--paper-2)" }}>{l.tagline}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="table-caption">
                      ТАБЛИЦА {String(c.number).padStart(2, "0")} — СОДЕРЖАНИЕ ГЛАВЫ
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
