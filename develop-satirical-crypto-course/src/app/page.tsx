import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import {
  chapters,
  factions,
  seasons,
  stats,
  totalMinutes,
  totalQuizQuestions,
} from "@/content/course";

const FORCE_MARKS: Record<string, React.ReactNode> = {
  СТРОИТЕЛИ: (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
      <path d="M6 34 L20 6 L34 34 Z" fill="none" stroke="#C7F52B" strokeWidth="3" />
      <path d="M13 26 L27 26" stroke="#C7F52B" strokeWidth="3" />
    </svg>
  ),
  СПЕКУЛЯНТЫ: (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
      <path d="M4 30 L14 18 L22 24 L36 8" fill="none" stroke="#FF2E7E" strokeWidth="3" />
      <path d="M28 8 L36 8 L36 16" fill="none" stroke="#FF2E7E" strokeWidth="3" />
    </svg>
  ),
  АРХИВИСТЫ: (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
      <rect x="6" y="8" width="28" height="26" fill="none" stroke="#2FD9E0" strokeWidth="3" />
      <path d="M12 16 L28 16 M12 22 L28 22 M12 28 L22 28" stroke="#2FD9E0" strokeWidth="2.5" />
    </svg>
  ),
  РЕЙДЕРЫ: (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
      <circle cx="20" cy="20" r="13" fill="none" stroke="#E9E1D1" strokeWidth="3" />
      <path d="M12 12 L28 28 M28 12 L12 28" stroke="#E9E1D1" strokeWidth="3" />
    </svg>
  ),
};

export default function HomePage() {
  return (
    <div>
      {/* ——— HERO ——— */}
      <section className="relative overflow-hidden border-b-[3px] border-[var(--paper)]">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero.jpg"
            alt="Плакат: торговый зал упавшей криптоцивилизации"
            className="h-full w-full object-cover object-right"
            style={{ filter: "saturate(0.85) contrast(1.1)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, #12100F 8%, rgba(18,16,15,0.92) 38%, rgba(18,16,15,0.35) 72%, rgba(18,16,15,0.7) 100%)",
            }}
          />
        </div>

        <div className="wrap relative py-[72px]">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="sticker">ВЫПУСК №01 · ОТДЕЛ ОБУЧЕНИЯ</span>
              <span className="sticker sticker--magenta">НЕ ФИНАНСОВЫЙ СОВЕТ</span>
              <span className="sticker sticker--cyan">28 УРОКОВ · 7 ГЛАВ</span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1
              className="mt-7 max-w-[16ch]"
              style={{
                fontSize: "clamp(46px, 9vw, 132px)",
                lineHeight: 0.86,
                letterSpacing: "-0.01em",
              }}
            >
              ДЕПАРТАМЕНТ
              <br />
              <span style={{ color: "var(--magenta)" }}>УПРАВЛЯЕМОЙ</span>
              <br />
              ПАНИКИ
            </h1>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="lead mt-8 max-w-[34ch]">
              КУРС ПО АНАЛИЗУ И ТОРГОВЛЕ КРИПТОВАЛЮТАМИ. ТЫ УЧИШЬСЯ. СИСТЕМА ВСЁ РАВНО ХОЧЕТ
              ТЕБЯ СЪЕСТЬ. РАЗНИЦА — В ПОДГОТОВКЕ.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/course" className="btn">
                НАЧАТЬ ОБУЧЕНИЕ →
              </Link>
              <Link href="/simulator" className="btn btn--ghost">
                ТРЕНАЖЁР ПАНИКИ
              </Link>
              <span className="marquee-note">
                {totalMinutes} МИНУТ · {totalQuizQuestions} ВОПРОСОВ · 0 ОБЕЩАНИЙ
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-14 grid max-w-[760px] grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-[var(--panel)] p-5">
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 46,
                      lineHeight: 1,
                      color: "var(--lime)",
                    }}
                  >
                    {s.value}
                  </div>
                  <div className="kicker mt-2">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ——— ЧЕТЫРЕ СИЛЫ ——— */}
      <section className="wrap py-[70px]">
        <div className="section-head">
          <h2>
            ЧЕТЫРЕ СИЛЫ <span style={{ color: "var(--magenta)" }}>ХАОСА</span>
          </h2>
          <div className="kicker max-w-[28ch] text-right">
            ВСЕ ФРАКЦИИ НЕНАВИДЯТ ДРУГ ДРУГА И НЕ МОГУТ СУЩЕСТВОВАТЬ ДРУГ БЕЗ ДРУГА
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {factions.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.06} rotate={i % 2 === 0 ? -0.8 : 0.8}>
              <div className="panel h-full">
                <div className="flex items-start justify-between">
                  {FORCE_MARKS[f.name]}
                  <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5" style={{ fontSize: 26 }}>
                  {f.name}
                </h3>
                <p className="mt-3" style={{ color: "var(--paper-2)" }}>
                  {f.line}
                </p>
                <div className="kicker mt-4 border-t border-[var(--line)] pt-3">{f.detail}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ——— СЕЗОНЫ ——— */}
      <section className="wrap pb-[70px]">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <Reveal rotate={-0.5}>
            <div className="panel panel--paper">
              <div className="flex items-center justify-between">
                <h2 style={{ fontSize: 34 }}>СЕЗОНЫ ХАОСА</h2>
                <span className="sticker sticker--magenta">КАЛЕНДАРЬ ЗАДНИМ ЧИСЛОМ</span>
              </div>
              <div className="mt-6 space-y-4">
                {seasons.map((s) => (
                  <div
                    key={s.name}
                    className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-[var(--ink)] pb-3"
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 25,
                          textTransform: "uppercase",
                        }}
                      >
                        {s.name}
                      </div>
                      <div style={{ fontStyle: "italic", opacity: 0.8 }}>{s.line}</div>
                    </div>
                    <div
                      className="mono"
                      style={{ fontSize: 11, maxWidth: "24ch", textAlign: "right" }}
                    >
                      {s.task}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} rotate={0.7}>
            <div className="panel h-full">
              <div className="kicker">ПАМЯТКА НОВИЧКУ</div>
              <h3 className="mt-4" style={{ fontSize: 30 }}>
                ЧЕТЫРЕ ПРАВИЛА, КОТОРЫЕ НЕ ИЗМЕНЯТСЯ
              </h3>
              <ul className="bullets bullets--magenta mt-5">
                <li>Рынок не падает. Он пересматривает реальность.</li>
                <li>Риск рассчитывается до входа. После входа начинается литература.</li>
                <li>Паника бесплатна. Вход — нет.</li>
                <li>Если текст можно напечатать на кружке — он недостаточно конкретный.</li>
              </ul>
              <div className="truth">
                ТЫ ПРИШЁЛ РАДИ ДЕНЕГ. ИМЕННО ПОЭТОМУ ТЫ УЖЕ В ОПАСНОСТИ.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ——— ПРОГРАММА ——— */}
      <section className="wrap pb-[70px]">
        <div className="section-head">
          <h2>ПРОГРАММА КУРСА</h2>
          <Link href="/course" className="btn btn--sm">
            ВСЯ ПРОГРАММА →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {chapters.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 0.06} rotate={i % 2 ? 0.6 : -0.6}>
              <Link href={`/course/${c.slug}`} className="group block">
                <div className="plate-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/${c.cover}`} alt={`Обложка главы: ${c.title}`} className="img-plate" />
                  <div className="absolute left-0 top-0 flex items-center gap-2">
                    <span className="sticker sticker--paper">
                      ГЛАВА {String(c.number).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <div className="panel mt-[-1px]">
                  <h3 style={{ fontSize: 25 }}>{c.title}</h3>
                  <div className="kicker mt-2">{c.subtitle}</div>
                  <p className="mt-4" style={{ color: "var(--paper-2)", fontSize: 15.5 }}>
                    {c.brief}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-3">
                    <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                      {c.lessons.length} УРОКА
                    </span>
                    <span
                      className="mono group-hover:text-[var(--lime)]"
                      style={{ fontSize: 11 }}
                    >
                      ОТКРЫТЬ →
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ——— НАСТАВНИК ——— */}
      <section className="border-y-[3px] border-[var(--paper)] bg-[var(--panel)]">
        <div className="wrap grid items-center gap-10 py-[70px] lg:grid-cols-[420px_1fr]">
          <Reveal rotate={-1}>
            <div className="plate-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/mentor.png"
                alt="Наставник курса — ржавая труба с бородой"
                className="img-plate"
              />
            </div>
          </Reveal>
          <div>
            <div className="kicker">ВЕДУЩИЙ КУРСА · ОТДЕЛ РАЗЪЯСНЕНИЙ</div>
            <h2 className="mt-4" style={{ fontSize: "clamp(32px, 5vw, 62px)" }}>
              МАСТЕР ТРУБА
            </h2>
            <p className="mt-5 max-w-[62ch]">
              Сорок лет в трубе, три цикла в убытке, ни одного вебинара. Он не обещает
              прибыль и не произносит слово «сигнал». Он объясняет механику так, что после
              этого шутки про рынок перестают быть шутками.
            </p>
            <div className="slogan slogan--magenta mt-8">
              <span>«РЫНОК НЕ НАКАЗАЛ ТЕБЯ.</span>
              <span>ОН ПРОСТО ВОСПОЛЬЗОВАЛСЯ ТЕМ,</span>
              <span>ЧТО ТЫ САМ ПРИШЁЛ С ОТКРЫТЫМ КОШЕЛЬКОМ».</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/course/protocol-vhoda" className="btn btn--lime">
                ПЕРВЫЙ УРОК →
              </Link>
              <Link href="/glossary" className="btn btn--ghost">
                СЛОВАРЬ ДЕПАРТАМЕНТА
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— ФИНАЛ ——— */}
      <section className="wrap py-[70px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal rotate={-0.6}>
            <div className="panel h-full">
              <div className="kicker">ПРАКТИЧЕСКИЙ БЛОК</div>
              <h3 className="mt-3" style={{ fontSize: 32 }}>
                ТРЕНАЖЁР ПАНИКИ
              </h3>
              <p className="mt-4">
                Десять раундов, живой график, три кнопки: ЛОНГ, ШОРТ, ЖДАТЬ. Рынок отвечает
                тебе тем же, чем отвечает всем. Результат сохраняется в твоё личное дело.
              </p>
              <Link href="/simulator" className="btn mt-4">
                ПРОЙТИ ТРЕНАЖЁР →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1} rotate={0.6}>
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/finale.jpg"
                alt="Свидетельство о прохождении курса на потёртом столе"
                className="h-full w-full object-cover"
                style={{ minHeight: 320, filter: "saturate(0.8) contrast(1.1)" }}
              />
              <div
                className="absolute inset-0 flex flex-col justify-end p-7"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(18,16,15,0.2), rgba(18,16,15,0.92))",
                }}
              >
                <h3 style={{ fontSize: 30 }}>ЛИЧНОЕ ДЕЛО УЧАСТНИКА</h3>
                <p className="mt-2" style={{ maxWidth: "42ch" }}>
                  Прогресс по урокам, результаты допросов и журнал жертвоприношений. Всё
                  хранится. Всё напоминает о себе.
                </p>
                <Link href="/dashboard" className="btn btn--lime mt-4 self-start">
                  ОТКРЫТЬ ДЕЛО →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
