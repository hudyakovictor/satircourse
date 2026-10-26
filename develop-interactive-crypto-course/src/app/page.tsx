import Link from "next/link";
import { modules, MODSAT, SAT, glitches, CARD_KINDS, factorRegistry } from "@/lib/course";
import { NextUp, ModuleProgress } from "@/components/Bits";
import { lessonsOf } from "@/lib/course";

export default function Home() {
  const reg = factorRegistry();
  const heads = SAT.map((s, i) => ({ h: s.h, i }));
  const stats = [
    ["100", "уровней"],
    ["500", "карточек"],
    ["777", "факторов"],
    ["10", "модулей"],
    ["100", "сделок paper"],
  ];
  return (
    <div>
      {/* ticker */}
      <div className="overflow-hidden border-b-2 border-black bg-blood py-1.5 text-black">
        <div className="marquee flex gap-10 whitespace-nowrap font-display text-sm uppercase">
          {[...heads, ...heads].map((x, k) => (
            <Link key={k} href={`/lesson/${x.i}`} className="hover:underline">
              ● {x.h}
            </Link>
          ))}
        </div>
      </div>

      {/* hero */}
      <section className="relative overflow-hidden border-b-2 border-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="Город Signal Arena" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 md:pt-28">
          <div className="stamp text-toxic">Срочный выпуск · №777</div>
          <h1 className="mt-4 font-display text-6xl uppercase leading-[0.9] text-paper drop-shadow-[4px_4px_0_#000] md:text-8xl">
            Signal
            <br />
            <span className="text-toxic flicker">Arena</span>
          </h1>
          <p className="mt-5 max-w-2xl font-display text-2xl uppercase leading-tight text-paper md:text-3xl">
            Курс по анализу и торговле криптоактивами. <span className="text-blood">Система хочет тебя съесть.</span>
          </p>
          <p className="mt-3 max-w-2xl text-lg text-zinc-300">
            Ты пришёл ради денег. Именно поэтому ты уже в опасности. Сто уровней: от чтения цены до защиты проекта на сто сделок. Без прогнозов, без гарантий, с честным предупреждением на каждой странице.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <NextUp total={100} />
            <Link href="/course" className="border-2 border-black bg-paper px-6 py-3 font-display text-lg uppercase text-black shadow-[5px_5px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#000]">
              Карта курса
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {stats.map(([n, t]) => (
              <div key={t} className="border-2 border-black bg-black/70 px-4 py-2 backdrop-blur">
                <div className="font-display text-3xl text-toxic">{n}</div>
                <div className="font-mono text-xs uppercase text-zinc-300">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* mascot */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid items-center gap-8 md:grid-cols-[320px_1fr]">
          <div className="relative mx-auto w-64 md:w-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/mascot.png" alt="Скрепка — преподаватель курса" className="w-full rounded-lg border-2 border-black bg-[#15161d] shadow-[8px_8px_0_#000]" />
            <div className="stamp absolute -right-3 -top-3 bg-black text-xs text-amber-300">Преподаватель</div>
          </div>
          <div>
            <div className="paper relative p-6">
              <div className="font-display text-3xl uppercase">Скрепка объясняет правила</div>
              <p className="mt-3 text-lg leading-relaxed">
                Я — Скрепка. Я видела три цикла, два делистинга и одного «гуру», который шортил собственный курс. Я не обещаю тебе прибыль. Я обещаю, что ты будешь знать, где стоит твой стоп, когда рынок придёт за ним.
              </p>
              <p className="mt-2 text-lg leading-relaxed">
                <b>1R</b> — заранее заданный риск сделки. Стоп = −1R. Прибыль вдвое больше риска = +2R. Отказ от сделки = 0R и лучший результат этого квартала.
              </p>
              <div className="absolute -bottom-3 left-10 h-6 w-6 rotate-45 border-b-2 border-l-2 border-black bg-paper" />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-5">
              {CARD_KINDS.map((c) => (
                <div key={c.k} className="ink-panel overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/art/card/${c.k}.svg`} alt={c.name} width={500} height={500} loading="lazy" className="aspect-square w-full object-cover" />
                  <div className="p-2">
                    <div className="font-display uppercase text-paper">
                      [{c.k}] {c.name}
                    </div>
                    <div className="text-xs text-zinc-400">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* modules */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase text-toxic">Десять районов города</div>
            <h2 className="font-display text-4xl uppercase text-paper md:text-5xl">Маршрут</h2>
          </div>
          <Link href="/course" className="font-display uppercase text-toxic underline">
            вся карта →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const ms = MODSAT[m.letter];
            return (
              <Link key={m.letter} href={`/module/${m.letter}`} className="group block overflow-hidden border-2 border-black bg-[#0d0e15] shadow-[6px_6px_0_#000] transition hover:-translate-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/art/module/${m.letter}.svg`} alt={m.title} width={500} height={500} loading="lazy" className="aspect-square w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                    <span className="border border-black px-1.5 font-display text-sm text-black" style={{ background: ms.color }}>
                      {m.letter}
                    </span>
                    уровни {m.range}
                  </div>
                  <div className="mt-1 font-display text-2xl uppercase text-paper group-hover:text-toxic">{m.title}</div>
                  <div className="text-sm italic text-zinc-400">{ms.dept}</div>
                  <p className="mt-2 text-sm text-zinc-300">{ms.teaser}</p>
                  <p className="mt-2 font-mono text-xs text-amber-300">» {ms.tag}</p>
                  <ModuleProgress ids={lessonsOf(m.letter).map((l) => l.id)} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* rules */}
      <section className="mx-auto mt-20 max-w-7xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="paper p-6">
            <h2 className="font-display text-3xl uppercase">Правила прохождения</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-lg">
              <li>Решение в [Р] фиксируется <b>до</b> просмотра [Д]. Подглядывание — налог на надежду.</li>
              <li>Все суммы условны. Журнал — сначала в R, не в деньгах.</li>
              <li>Экзамены 9, 19 … 89: минимум 80% и ни одного тройного фейла. H79 — 85%.</li>
              <li>Уровни 90–99 — медленно: 1–2 недели на уровень. Capstone — 100 сделок, максимум 3 в день.</li>
              <li>Уровень закрывает не прибыльная случайность, а корректное решение, стоп и запись в журнал.</li>
            </ol>
          </div>
          <div className="ink-panel p-6">
            <div className="font-mono text-xs uppercase text-blood">Инвентаризация</div>
            <h2 className="font-display text-3xl uppercase text-paper">Реестр факторов</h2>
            <ul className="mt-3 space-y-1 font-mono text-sm text-zinc-300">
              {reg.rows.map((r) => (
                <li key={r.name} className="flex justify-between gap-4 border-b border-white/10 py-1">
                  <span>{r.name}</span>
                  <b className="text-toxic">{r.n}</b>
                </li>
              ))}
              <li className="flex justify-between gap-4 pt-2 font-display text-xl uppercase text-paper">
                <span>Итого факторов</span>
                <b className="text-toxic">{reg.total}</b>
              </li>
            </ul>
            <Link href="/factors" className="mt-4 inline-block font-display uppercase text-toxic underline">
              смотреть все 777 →
            </Link>
          </div>
        </div>
      </section>

      {/* glitches */}
      <section className="mx-auto mt-20 max-w-7xl px-4">
        <div className="font-mono text-xs uppercase text-cyanx">Необязательно. Не даёт право увеличить размер.</div>
        <h2 className="font-display text-4xl uppercase text-paper">Secret-glitch · награды Скрепки</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {glitches.map((g) => (
            <div key={g.n} className="paper p-4">
              <div className="font-mono text-xs">GLITCH {g.n}</div>
              <div className="font-display text-xl uppercase leading-tight">{g.title}</div>
              <p className="mt-2 text-sm">{g.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* finale */}
      <section className="relative mx-auto mt-20 max-w-7xl overflow-hidden border-2 border-black px-4 shadow-[8px_8px_0_#000]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/finale.jpg" alt="Выпускной" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative py-16 text-center">
          <h2 className="font-display text-5xl uppercase text-paper drop-shadow-[3px_3px_0_#000]">Поздравляем. Рынок всё ещё считает тебя обучающим материалом.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-zinc-200">Диплом выдаётся за процесс, а не за прибыль. Гарантий нет. Скрепка тоже не гарантирует, но записывает.</p>
          <div className="mt-6">
            <NextUp total={100} />
          </div>
        </div>
      </section>
    </div>
  );
}
