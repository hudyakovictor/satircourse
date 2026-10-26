import Link from "next/link";
import { notFound } from "next/navigation";
import { Illustration } from "@/components/Illustration";
import { Rich } from "@/components/Rich";
import { SectionCard } from "@/components/SectionCard";
import { DecisionCard, ExamCard } from "@/components/LessonInteractive";
import { StatusDot } from "@/components/ProgressBits";
import { allLessons, isExam, lessonById, lessonIndex, moduleById, satireOf, splitOptions, splitQuestions } from "@/lib/course";
import { MODULE_COLORS } from "@/lib/art/primitives";
import { CARD_META, COMMON_DEBRIEF_HOOK } from "@/data/satire";
import type { Lesson } from "@/lib/course";

export function generateStaticParams() {
  return allLessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = lessonById(id);
  return { title: l ? `${l.id} · ${l.title} — Signal Arena` : "Уровень не найден" };
}

function art(l: Lesson, slot: string, color: string) {
  const vs = l.visuals.filter((v) => v.before === slot);
  if (!vs.length) return undefined;
  return (
    <div className="grid gap-3">
      {vs.map((v, i) => (
        <Illustration key={i} seed={`${l.id}-${slot}-${i}`} type={v.type} prompt={v.prompt} code={l.id} accent={color} />
      ))}
    </div>
  );
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = lessonById(id);
  if (!l) notFound();
  const mod = moduleById(l.letter)!;
  const color = MODULE_COLORS[l.letter];
  const idx = lessonIndex(l.id);
  const prev = allLessons[idx - 1];
  const next = allLessons[idx + 1];
  const [headline, deck] = satireOf(l.id);
  const exam = isExam(l);
  const { stem, options } = splitOptions(l.r);
  const pct = Number(l.cert.match(/(\d{2,3})\s*%/)?.[1] ?? (l.id === "H79" ? 85 : 80)) / 100;
  const examQuestions = exam && !l.e ? splitQuestions(l.r) : splitQuestions(l.e);
  const examStem = exam && !l.e ? l.r.split(/\b1\)/)[0].trim() : "";
  const hook = COMMON_DEBRIEF_HOOK[idx % COMMON_DEBRIEF_HOOK.length];
  const steps = (["t", "p", "r", "d", "e"] as const).map((k) => ({ k, ...CARD_META[k] }));

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--mute)]">
        <Link href="/course" className="hover:text-[var(--ink)]">Курс</Link>/
        <Link href={`/module/${mod.id}`} className="hover:text-[var(--ink)]">Модуль {mod.id} · {mod.title}</Link>/
        <span className="text-[var(--ink)]">{l.id}</span>
        <span className="ml-2"><StatusDot id={l.id} /></span>
      </nav>

      {/* HERO */}
      <header className="neo overflow-hidden p-5 md:p-8">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,380px)_1fr]">
          <div className="neo-s overflow-hidden p-2" style={{ borderRadius: 36 }}>
            <Illustration seed={`cover-${l.id}`} variant="cover" title={l.title} code={l.id} accent={color} />
          </div>
          <div>
            <div className="kicker" style={{ color }}>
              Уровень {l.id} · Модуль {mod.id}
              {exam && <span className="ml-2 rounded-full bg-[var(--down)] px-2 py-0.5 text-[10px] text-white">Экзамен</span>}
            </div>
            <h1 className="headline mt-2 text-3xl md:text-5xl">{l.title}</h1>
            <div className="mt-5 neo-in p-5">
              <div className="flex items-center gap-2">
                <span className="stamp">Срочно</span>
                <span className="kicker">Редакция Департамента управляемой паники</span>
              </div>
              <h2 className="headline mt-3 text-xl md:text-2xl"><span className="marker">{headline}</span></h2>
              <p className="mt-2 text-sm font-semibold leading-relaxed md:text-base">{deck}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {steps.map((s) => (
                <a key={s.k} href={`#${s.k}`} className="neo-btn flex items-center gap-2 px-4 py-2 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black text-white" style={{ background: color }}>{s.tag}</span>
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* T */}
      <SectionCard id="t" k="t" color={color} art={art(l, "t", color)}>
        <div className="rich text-base leading-relaxed md:text-lg"><Rich text={l.t} /></div>
        {l.diagram && (
          <div className="neo-in mt-5 p-4">
            <div className="kicker mb-1">Схема</div>
            <pre className="diagram">{l.diagram}</pre>
          </div>
        )}
      </SectionCard>

      {/* P */}
      <SectionCard id="p" k="p" color={color} art={art(l, "p", color)}>
        <Rich text={l.p} className="text-base leading-relaxed md:text-lg" />
        <div className="neo-in mt-5 flex items-start gap-3 p-4 text-sm font-semibold">
          <span className="stamp shrink-0">Приобщено</span>
          <span>Цифры учебных кейсов округлены и не являются сигналом. Рынок принимает твои решения без округления.</span>
        </div>
      </SectionCard>

      {/* R + D */}
      <SectionCard id="r" k="r" color={color} art={art(l, "r", color)}>
        {exam ? (
          <div>
            <Rich text={l.r} className="text-base leading-relaxed" />
            <p className="neo-in mt-4 p-4 text-sm font-bold">Экзамен не принимает пять строк решения. Он принимает ответы — вниз, в карточку [Э].</p>
          </div>
        ) : (
          <>
            <Rich text={stem} className="mb-4 text-base leading-relaxed md:text-lg" />
            <DecisionCard
              lessonId={l.id}
              options={options}
              visual={art(l, "d", color) && <div className="mb-4 max-w-md">{art(l, "d", color)}</div>}
              debrief={
                <div className="neo-s p-5" id="d">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ background: color }}>Д</span>
                    <div>
                      <div className="kicker">{CARD_META.d.alias}</div>
                      <div className="headline text-lg">{CARD_META.d.name}</div>
                    </div>
                  </div>
                  <Rich text={l.d} className="text-base leading-relaxed" />
                  <p className="mt-3 text-sm font-black italic text-[var(--mute)]">«{hook}»</p>
                </div>
              }
            />
          </>
        )}
      </SectionCard>

      {exam && (
        <SectionCard id="d" k="d" color={color} art={art(l, "d", color)}>
          <Rich text={l.d} className="text-base leading-relaxed md:text-lg" />
          <p className="mt-3 text-sm font-black italic text-[var(--mute)]">«{hook}»</p>
        </SectionCard>
      )}

      {/* E */}
      <SectionCard id="e" k="e" color={color} art={art(l, "e", color)}>
        {examStem && <Rich text={examStem} className="mb-4 font-semibold" />}
        <ExamCard
          lessonId={l.id}
          questions={examQuestions}
          keyLabel={l.keyLabel || "Ключ"}
          keyNode={<Rich text={l.key} />}
          threshold={pct}
          needsDecision={!exam}
          isExam={exam}
          nextHref={next ? `/lesson/${next.id}` : null}
        />
        {l.cert && <p className="mt-5 text-sm font-black text-[var(--up)]">🏅 {l.cert}</p>}
      </SectionCard>

      {/* NAV */}
      <div className="grid gap-4 md:grid-cols-2">
        {prev ? (
          <Link href={`/lesson/${prev.id}`} className="neo-s p-4 transition hover:-translate-y-0.5">
            <div className="kicker">← Назад</div>
            <div className="mt-1 font-black">{prev.id} · {prev.title}</div>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/lesson/${next.id}`} className="neo-s p-4 text-right transition hover:-translate-y-0.5">
            <div className="kicker">Дальше →</div>
            <div className="mt-1 font-black">{next.id} · {next.title}</div>
          </Link>
        ) : (
          <Link href="/glitches" className="neo-s p-4 text-right transition hover:-translate-y-0.5">
            <div className="kicker">Бонус →</div>
            <div className="mt-1 font-black">Secret-glitch награды Скрепки</div>
          </Link>
        )}
      </div>
    </div>
  );
}
