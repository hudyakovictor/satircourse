import Link from "next/link";
import { Illustration } from "@/components/Illustration";
import { ContinueCta, ModuleProgress } from "@/components/ProgressBits";
import { IconSvg, MODULE_COLORS, type IconName } from "@/lib/art/primitives";
import { allLessons, glossary, modules, moduleSatire } from "@/lib/course";
import { CARD_META } from "@/data/satire";

const CARD_ICONS: Record<string, IconName> = { t: "book", p: "search", r: "target", d: "flask", e: "cap" };
const CARD_COLORS: Record<string, string> = { t: "#5b7cfa", p: "#2bc0c4", r: "#ff9a5b", d: "#8b6cf6", e: "#2fbf86" };

export default function Home() {
  const ids = allLessons.map((l) => l.id);
  const visuals = allLessons.reduce((a, l) => a + l.visuals.length, 0);
  const stats = [
    { n: "100", t: "уровней" },
    { n: "500", t: "карточек" },
    { n: String(100 + visuals + 10), t: "иллюстраций" },
    { n: String(glossary.length), t: "терминов" },
  ];
  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="neo overflow-hidden p-6 md:p-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="stamp">Экстренный выпуск</span>
              <span className="kicker">Департамент управляемой паники представляет</span>
            </div>
            <h1 className="headline mt-5 text-5xl md:text-7xl">
              Курс <span className="text-[var(--blue)]">выживания</span> на крипторынке
            </h1>
            <p className="mt-5 text-xl font-black md:text-2xl">
              <span className="marker">Ты пришёл ради денег. Именно поэтому ты уже в опасности.</span>
            </p>
            <p className="mt-4 max-w-xl text-base font-semibold leading-relaxed text-[var(--ink)]/80">
              Сто уровней: от чтения цены до защиты собственного исследования. Пять карточек на каждый: теория, пример, решение, разбор, экзамен. Всё — с графикой, калькуляторами и лёгкой угрозой существованию.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <ContinueCta ids={ids} />
              <Link href="/course" className="neo-btn px-7 py-4 text-base">Весь маршрут</Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.t} className="neo-in p-4 text-center">
                  <div className="headline text-3xl text-[var(--blue)]">{s.n}</div>
                  <div className="kicker mt-1">{s.t}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="floaty">
            <div className="neo-s overflow-hidden p-2" style={{ borderRadius: 44 }}>
              <Illustration seed="hero" type="Иллюстрация" prompt="playful paperclip trading guide" code="СКРЕПКА" accent="#5b7cfa" />
            </div>
            <p className="mt-4 text-center text-sm font-black italic text-[var(--mute)]">«Я Скрепка. Я видела три цикла. Они были одинаковые».</p>
          </div>
        </div>
      </section>

      {/* FIVE CARDS */}
      <section>
        <div className="mb-6 max-w-2xl">
          <div className="kicker">Как устроен уровень</div>
          <h2 className="headline mt-1 text-3xl md:text-4xl">Пять карточек. Ни одной — без последствий</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(CARD_META) as (keyof typeof CARD_META)[]).map((k) => (
            <div key={k} className="neo p-5" style={{ borderRadius: 30 }}>
              <div className="flex items-center justify-between">
                <div className="neo-in flex h-14 w-14 items-center justify-center" style={{ borderRadius: 20 }}>
                  <IconSvg name={CARD_ICONS[k]} color={CARD_COLORS[k]} size={34} />
                </div>
                <span className="headline text-4xl" style={{ color: CARD_COLORS[k] }}>{CARD_META[k].tag}</span>
              </div>
              <h3 className="headline mt-4 text-lg">{CARD_META[k].name}</h3>
              <div className="kicker mt-1">{CARD_META[k].alias}</div>
              <p className="mt-2 text-sm font-semibold text-[var(--ink)]/75">{CARD_META[k].sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 1R */}
      <section className="neo overflow-hidden p-6 md:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,440px)_1fr]">
          <div className="neo-s overflow-hidden p-2" style={{ borderRadius: 40 }}>
            <Illustration seed="home-1r" type="Инфографика" prompt="position sizing from account risk and stop distance" code="1R" accent="#ef6f55" />
          </div>
          <div>
            <div className="kicker">Единственная валюта курса</div>
            <h2 className="headline mt-1 text-3xl md:text-5xl">1R. Заранее. Без торга</h2>
            <p className="mt-4 text-base font-semibold leading-relaxed">
              <code className="rounded-lg bg-[#dfe6f4] px-2 py-0.5 font-black text-[#4a57c9]">1R</code> — риск одной сделки, назначенный до входа. Риск $20: стоп = <b>−1R</b>, прибыль $40 = <b>+2R</b>, отказ от сделки = <b>0R</b>.
            </p>
            <p className="mt-3 text-base font-semibold leading-relaxed">
              Диверсификация снижает риск. Паника распределяет его между всеми активами. Поэтому сначала размер позиции, потом харизма.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tools" className="neo-btn btn-primary px-6 py-3 text-sm">Калькулятор позиции →</Link>
              <Link href="/lesson/H71" className="neo-btn px-6 py-3 text-sm">Урок H71</Link>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section>
        <div className="mb-6 max-w-2xl">
          <div className="kicker">Десять модулей</div>
          <h2 className="headline mt-1 text-3xl md:text-4xl">Выбери отдел, в котором тебя съедят</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((m) => {
            const color = MODULE_COLORS[m.id];
            const sat = moduleSatire(m.id);
            return (
              <article key={m.id} className="neo overflow-hidden p-3 transition hover:-translate-y-1" style={{ borderRadius: 38 }}>
                <Link href={`/module/${m.id}`} className="block">
                  <div className="relative overflow-hidden" style={{ borderRadius: 30 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/covers/${m.id}.jpg`} alt={`Обложка модуля ${m.id}: ${m.title}`} width={500} height={500} loading="lazy" className="aspect-square w-full object-cover" />
                    <span className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center text-xl font-black text-white" style={{ background: color, borderRadius: 14, boxShadow: "0 6px 16px rgba(0,0,0,.18)" }}>{m.id}</span>
                    <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-black">уровни {m.from}–{m.to}</span>
                  </div>
                </Link>
                <div className="p-4">
                  <div className="kicker" style={{ color }}>{sat.kicker}</div>
                  <Link href={`/module/${m.id}`}><h3 className="headline mt-1 text-xl">{m.title}</h3></Link>
                  <p className="mt-2 text-sm font-black leading-snug">{sat.headline}</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--mute)]">{sat.deck}</p>
                  <div className="mt-4"><ModuleProgress ids={m.lessons.map((l) => l.id)} color={color} /></div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* RULES */}
      <section className="neo p-6 md:p-10">
        <div className="kicker">Правила прохождения</div>
        <h2 className="headline mt-1 text-3xl md:text-4xl">Устав. Читать до первой потери</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Решение — до разбора.", "Карточка [Р] фиксируется до [Д]. Задний ум в курсе не зачитывается."],
            ["Считай в R, не в деньгах.", "Деньги — эмоции. R — статистика. Статистика не плачет."],
            ["Экзамены: 80%, H79 — 85%.", "Три одинаковые критические ошибки подряд — возвращение на уровень назад."],
            ["Уровни 90–99 — медленно.", "Один уровень — 1–2 недели. Capstone: 100 сделок paper trading, максимум 3 в день."],
            ["Прибыльная случайность не засчитывается.", "Уровень закрывается корректным решением, стопом и записью в журнал."],
            ["Только paper, пока не закончен capstone.", "Не занимай деньги для торговли. Система и так умеет занимать их у тебя."],
          ].map(([a, b], i) => (
            <li key={i} className="neo-in flex gap-4 p-4">
              <span className="headline text-3xl text-[var(--blue)]">{i + 1}</span>
              <div>
                <div className="font-black">{a}</div>
                <div className="text-sm font-semibold text-[var(--ink)]/75">{b}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
