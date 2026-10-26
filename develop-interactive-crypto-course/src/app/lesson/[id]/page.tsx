import { notFound } from "next/navigation";
import Link from "next/link";
import { lessons, getLesson, satOf, moduleOf, MODSAT } from "@/lib/course";
import { Md } from "@/components/Md";
import { DecisionCard, ExamCard } from "@/components/LessonInteractive";
import type { Visual } from "@/lib/types";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: String(l.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = getLesson(parseInt(id, 10));
  return { title: l ? `${l.code} · ${l.title} — SIGNAL ARENA` : "Уровень" };
}

const KIND_RU: Record<string, string> = { "График": "График", "Таблица": "Таблица", "Инфографика": "Инфографика", "Схема": "Схема", "Иллюстрация": "Иллюстрация", "Матрица": "Матрица" };

function Figure({ lessonId, index, v, caption }: { lessonId: number; index: number; v: Visual; caption: string }) {
  return (
    <figure className="mx-auto my-6 max-w-[500px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/art/visual/${lessonId}-${index}.svg`} alt={`${v.kind}: ${caption}`} width={500} height={500} loading="lazy" className="w-full border-2 border-black shadow-[6px_6px_0_#000]" />
      <figcaption className="mt-2 font-mono text-xs text-zinc-400">
        <span className="text-toxic">{KIND_RU[v.kind] ?? v.kind}.</span> {caption}
      </figcaption>
    </figure>
  );
}

function CardHead({ k, name, note }: { k: string; name: string; note?: string }) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/art/card/${k}.svg`} alt={name} width={64} height={64} className="h-14 w-14 border-2 border-black" />
      <div>
        <div className="font-display text-2xl uppercase text-paper">
          <span className="text-toxic">[{k}]</span> {name}
        </div>
        {note && <div className="font-mono text-xs text-zinc-500">{note}</div>}
      </div>
    </div>
  );
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = parseInt(id, 10);
  const l = getLesson(n);
  if (!l) notFound();
  const s = satOf(n);
  const m = moduleOf(l.module)!;
  const ms = MODSAT[l.module];
  const prev = n > 0 ? lessons[n - 1] : null;
  const next = n < 99 ? lessons[n + 1] : null;
  const vis = (before: string) =>
    l.visuals
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => (before === "Т" ? !["П", "Д"].includes(v.before) : v.before === before));
  const cap = (i: number) => (i === 0 ? s.l[0] + " · " + s.s : s.l[1] + " · " + s.s);

  return (
    <article className="mx-auto max-w-7xl px-4 py-8">
      <nav className="font-mono text-xs text-zinc-500">
        <Link href="/course" className="hover:text-toxic">Карта</Link> / <Link href={`/module/${l.module}`} className="hover:text-toxic">Модуль {l.module} · {m.title}</Link> / <span className="text-zinc-300">{l.code}</span>
      </nav>

      {/* hero */}
      <header className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,500px)_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/art/lesson/${n}.svg`} alt={s.s} width={500} height={500} className="w-full border-2 border-black shadow-[8px_8px_0_#000]" />
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="border-2 border-black px-3 py-1 font-display text-2xl text-black" style={{ background: ms.color }}>{l.code}</span>
            <span className="font-mono text-xs uppercase text-zinc-400">{ms.dept}</span>
            {l.isExam && <span className="stamp text-blood">Экзамен модуля</span>}
          </div>
          <h1 className="mt-3 font-display text-4xl uppercase leading-none text-paper md:text-6xl">{l.title}</h1>
          <div className="paper mt-5 p-4">
            <div className="font-mono text-[11px] uppercase tracking-widest">Департамент управляемой паники · срочный выпуск</div>
            <div className="mt-1 font-display text-2xl uppercase leading-tight md:text-3xl">{s.h}</div>
            <p className="mt-3 text-lg leading-relaxed">{s.c}</p>
          </div>
          <div className="mt-5 grid items-center gap-4 sm:grid-cols-[110px_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/mascot.png" alt="Скрепка" className="h-28 w-28 rounded-lg border-2 border-black bg-[#15161d] object-cover object-top" />
            <div className="relative border-2 border-black bg-[#151722] p-3 font-mono text-sm text-zinc-200">
              <div className="mb-1 text-xs uppercase text-amber-300">Скрепка (циничный преподаватель)</div>
              «{s.m}»
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs">
            {["Т Теория", "П Пример", "Р Решение", "Д Разбор", "Э Проверка"].map((x) => (
              <a key={x} href={`#c-${x[0]}`} className="border border-white/20 px-2 py-1 text-zinc-300 hover:border-toxic hover:text-toxic">
                [{x[0]}] {x.slice(2)}
              </a>
            ))}
            <a href="#dossier" className="border border-white/20 px-2 py-1 text-zinc-300 hover:border-toxic hover:text-toxic">Досье</a>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-12 max-w-3xl space-y-14">
        {/* T */}
        <section id="c-Т" className="scroll-mt-24">
          <CardHead k="T" name="Теория" note="короткое правило и схема" />
          <div className="ink-panel mt-4 p-5">
            <Md className="text-lg text-zinc-100">{l.theory}</Md>
            {l.schema && <pre className="mt-3 overflow-x-auto border-2 border-black bg-[#05070b] p-3 font-mono text-sm text-toxic">{l.schema}</pre>}
          </div>
          {vis("Т").map(({ v, i }) => (
            <Figure key={i} lessonId={n} index={i} v={v} caption={cap(i)} />
          ))}
        </section>

        {/* P */}
        <section id="c-П" className="scroll-mt-24">
          <CardHead k="P" name="Пример" note="реконструкция; цифры округлены; это не сигнал" />
          {vis("П").map(({ v, i }) => (
            <Figure key={i} lessonId={n} index={i} v={v} caption={cap(i)} />
          ))}
          <div className="ink-panel mt-4 p-5">
            <Md className="text-lg text-zinc-100">{l.example}</Md>
          </div>
          <div className="paper mt-4 p-4">
            <div className="font-mono text-xs uppercase">Хроника Департамента</div>
            <p className="mt-1 italic">«{s.p}»</p>
          </div>
        </section>

        {/* R + D */}
        <section id="c-Р" className="scroll-mt-24">
          <CardHead k="R" name="Решение" note="сначала выбери — потом открывай разбор" />
          <div className="ink-panel mt-4 p-5">
            <Md className="text-lg text-zinc-100">{l.decision}</Md>
          </div>
          <div id="c-Д" className="scroll-mt-24" />
          <DecisionCard
            lessonId={n}
            debrief={
              <div>
                <CardHead k="D" name="Разбор" note="логика в R, а не случайный PnL" />
                {vis("Д").map(({ v, i }) => (
                  <Figure key={i} lessonId={n} index={i} v={v} caption={cap(i)} />
                ))}
                <div className="ink-panel mt-4 p-5">
                  <Md className="text-lg text-zinc-100">{l.debrief}</Md>
                </div>
              </div>
            }
          />
        </section>

        {/* E */}
        <section id="c-Э" className="scroll-mt-24">
          <CardHead k="E" name={l.isExam ? "Экзамен модуля" : "Проверка"} note={l.isExam ? "порог — 80% (H79: 85%)" : "мини-экзамен: 4 из 5"} />
          <div className="ink-panel mt-4 p-5">
            <Md className="text-lg text-zinc-100">{l.examQ || "Ответьте на вопросы ниже и сверьтесь с ключом."}</Md>
          </div>
          <ExamCard lessonId={n} isExam={l.isExam} keyText={l.examKey || "Ключ в самом решении: стоп, размер, журнал."} />
          {l.footer && (
            <div className="mt-4 border-2 border-dashed border-toxic/50 p-3 text-sm text-toxic">
              <Md>{l.footer.replace(/\(\d\d?-[a-z-]+\.md\)/g, "(/course)")}</Md>
            </div>
          )}
        </section>

        {/* dossier */}
        <section id="dossier" className="scroll-mt-24">
          <div className="flex items-center gap-3">
            <span className="stamp text-blood">Досье</span>
            <h2 className="font-display text-2xl uppercase text-paper">Миф · правда · цена в R</h2>
          </div>
          <div className="paper mt-4 overflow-x-auto p-2">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="font-display uppercase">
                  <th className="border-2 border-black bg-blood/30 p-2">Миф</th>
                  <th className="border-2 border-black bg-toxic/40 p-2">Правда</th>
                  <th className="border-2 border-black bg-black/10 p-2">Цена ошибки</th>
                </tr>
              </thead>
              <tbody>
                {s.t.map((r, i) => (
                  <tr key={i}>
                    <td className="border-2 border-black p-2 line-through decoration-blood decoration-2">{r[0]}</td>
                    <td className="border-2 border-black p-2 font-bold">{r[1]}</td>
                    <td className="border-2 border-black p-2 font-mono text-sm">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center font-display text-2xl uppercase leading-tight text-paper">
            «{s.p}»
          </p>
        </section>

        <nav className="grid gap-4 border-t-2 border-dashed border-white/20 pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/lesson/${prev.id}`} className="ink-panel p-4 hover:-translate-y-0.5">
              <div className="font-mono text-xs text-zinc-500">← предыдущий</div>
              <div className="font-display uppercase text-paper">{prev.code} · {prev.title}</div>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/lesson/${next.id}`} className="ink-panel p-4 text-right hover:-translate-y-0.5">
              <div className="font-mono text-xs text-zinc-500">следующий →</div>
              <div className="font-display uppercase text-toxic">{next.code} · {next.title}</div>
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
