import Link from "next/link";
import { Art } from "@/components/art";
import { Mascot } from "@/components/Mascot";
import { Icon, IconBadge } from "@/components/Icon";
import { ModuleProgress } from "@/components/LessonTile";
import { LESSONS, MODULES } from "@/lib/course";

const CARDS = [
  { k: "Т", n: "Теория", t: "Правило до 400 знаков. Дольше — это уже реклама курса.", icon: "book", c: "#c6ff1a" },
  { k: "П", n: "Пример", t: "Исторический сценарий. Цифры округлены, память тоже.", icon: "candle", c: "#22d3ee" },
  { k: "Р", n: "Решение", t: "Выбери действие до разбора. Без стопа решение недействительно.", icon: "target", c: "#ff2d95" },
  { k: "Д", n: "Разбор", t: "Оценивается логика в R, а не везение. Рынок это тоже заметит.", icon: "lab", c: "#ffb020" },
  { k: "Э", n: "Проверка", t: "Мини-экзамен с ключом. Ключ — после ответа, не вместо.", icon: "shield", c: "#ff4d5a" },
];

const RULES = [
  ["Решение фиксируется ДО разбора.", "Задним числом все гении."],
  ["Журнал — в R, не в деньгах.", "R не плачет. Доллар — плачет."],
  ["Экзамены глав: от 80%.", "H79 — 85%. Рынок тоже поднимает планку."],
  ["Тройной фейл — стоп.", "Три одинаковые ошибки подряд называются характером."],
  ["Уровни 90–99 — медленно.", "Спешка — любимая стратегия ликвидатора."],
  ["Capstone: 100 сделок, максимум 3 в день.", "Скука — тоже риск-менеджмент."],
];

export default function Home() {
  const marquee = LESSONS.map((l) => l.headline);
  return (
    <div className="space-y-20">
      {/* HERO */}
      <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center pt-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-[11px] text-muted">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" /> СЕЗОН 2026 · 100 УРОВНЕЙ · 500 КАРТОЧЕК · ПАПЕРТРЕЙДИНГ
          </div>
          <h1 className="font-head text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mt-4 title-glow">
            Ты пришёл ради денег.
            <span className="block text-white">Именно поэтому ты уже в опасности.</span>
          </h1>
          <p className="mt-5 text-lg text-[#c9cfd6] max-w-xl leading-relaxed">
            Практический курс по анализу и торговле криптоактивами. Рынок — живой механизм с фракциями, культами и сезонами. Тебя научат читать его, считать риск и не называть панику стратегией.
          </p>
          <p className="mt-2 text-sm text-muted">Обучение слегка угрожает. Не волнуйся — это входит в стоимость (бесплатно).</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/lesson/A0" className="btn btn-solid drip">Открыть уровень A0 <Icon name="arrow" size={18} /></Link>
            <Link href="/module/A" className="btn">Карта департаментов</Link>
            <Link href="/journal" className="btn btn-ghost">Журнал сделок</Link>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-3 max-w-lg">
            {[["100", "уровней"], ["500", "карточек"], ["300+", "картинок"], ["10", "департаментов"]].map(([n, l]) => (
              <div key={l} className="card px-3 py-3"><div className="font-head text-3xl text-lime leading-none">{n}</div><div className="text-[11px] text-muted mt-1">{l}</div></div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="art-frame max-w-[520px] mx-auto rotate-1"><Art motif="mascotScene" seedKey="hero-paperclip" accent="#c6ff1a" tag="АНАЛОГ · 1997" caption="Скрепка. Не ИИ. Не обещает." mascot={false} /></div>
          <div className="absolute -bottom-6 -left-2 sm:left-2 flex items-end gap-2">
            <Mascot size={96} mood="smug" className="floaty" />
            <div className="bg-[#f1efe4] text-[#1b1710] rounded-2xl rounded-bl-sm border-2 border-[#1b1710] px-4 py-2.5 max-w-[240px] font-semibold text-sm shadow-xl">
              «Я пришёл из прошлого, чтобы помочь тебе в будущем.»
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="-mx-4 overflow-hidden border-y border-line py-3 bg-panel/60">
        <div className="marquee flex gap-10 font-head text-xl text-muted whitespace-nowrap">
          {[...marquee, ...marquee].map((m, i) => (<span key={i} className="flex items-center gap-10">{m}<span className="text-lime">✦</span></span>))}
        </div>
      </section>

      {/* CARDS */}
      <section>
        <SectionTitle kicker="КАК УСТРОЕН УРОВЕНЬ" title="Пять карточек. Ни одна не на твоей стороне." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          {CARDS.map((c) => (
            <div key={c.k} className="card p-5 relative overflow-hidden">
              <div className="absolute -right-3 -top-6 font-head text-[120px] leading-none opacity-[0.07]" style={{ color: c.c }}>{c.k}</div>
              <IconBadge name={c.icon} color={c.c} />
              <div className="font-head text-2xl mt-3" style={{ color: c.c }}>[{c.k}] {c.n}</div>
              <p className="text-sm text-[#b9c0c8] mt-1.5 leading-snug">{c.t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section id="map">
        <SectionTitle kicker="ДЕПАРТАМЕНТЫ СИСТЕМЫ" title="Десять модулей. Одна цель: не стать топливом." />
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {MODULES.map((m) => (
            <Link key={m.id} href={`/module/${m.id}`} className="group card overflow-hidden grid grid-cols-[150px_1fr] sm:grid-cols-[210px_1fr] hover:border-[var(--ac)] transition" style={{ ["--ac" as string]: m.accent }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/art/module-${m.id}.jpg`} alt={`Обложка модуля ${m.id}: ${m.title}`} width={500} height={500} className="w-full h-full object-cover aspect-square group-hover:scale-105 transition duration-500" loading="lazy" />
              <div className="p-4 sm:p-5 flex flex-col">
                <div className="flex items-center gap-2">
                  <IconBadge name={m.icon} color={m.accent} size={34} />
                  <span className="font-mono text-[11px] text-muted">МОДУЛЬ {m.id} · УРОВНИ {m.from}–{m.to}</span>
                </div>
                <h3 className="font-head text-xl sm:text-2xl mt-2 leading-tight" style={{ color: m.accent }}>{m.title}</h3>
                <div className="text-[11px] font-mono text-muted mt-0.5">{m.dept}</div>
                <p className="text-[13px] sm:text-sm text-[#b9c0c8] mt-2 leading-snug flex-1">{m.teaser}</p>
                <div className="mt-3"><ModuleProgress ids={m.lessons} accent={m.accent} /></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* СКРЕПКА */}
      <section className="card p-6 sm:p-8 grid md:grid-cols-[auto_1fr] gap-6 items-center border-[#f1efe4]/30">
        <Mascot size={150} mood="tired" className="floaty mx-auto" />
        <div>
          <div className="font-mono text-xs text-lime tracking-widest">ТВОЙ НАСТАВНИК · АНАЛОГОВЫЙ</div>
          <h2 className="font-head text-3xl sm:text-4xl mt-1">Скрепка. Пришла из прошлого. Видела три цикла.</h2>
          <p className="text-[#c9cfd6] mt-3 max-w-2xl leading-relaxed">
            Когда-то она предлагала помочь с письмом. Теперь предлагает помочь с ликвидацией. Она утверждает, что она не ИИ, а аналоговая: внутри пружина, ржавчина и бухгалтерия за 1997 год. Нейросетей не знает, облако не признаёт, на запросы не отвечает — только осуждает.
          </p>
          <p className="text-sm text-muted mt-3">Нажми на неё в углу экрана. Она скажет что-нибудь правдивое. Это не фича — это возраст.</p>
        </div>
      </section>

      {/* RULES */}
      <section className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
        <div>
          <SectionTitle kicker="ПРОТОКОЛ ПРОХОЖДЕНИЯ" title="Правила. Их придумали до тебя." />
          <p className="text-muted mt-4 text-sm leading-relaxed">Решение без пункта «инвалидация» — не решение. No-trade всегда допустимый и часто лучший ответ. Уровень закрывает не прибыльная случайность, а корректное решение, стоп и запись в журнал.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {RULES.map(([a, b], i) => (
            <div key={i} className="card p-4">
              <div className="font-mono text-xs text-lime">№ {i + 1}</div>
              <div className="font-head text-lg leading-tight mt-1">{a}</div>
              <div className="text-sm text-muted mt-1">{b}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <div className="font-mono text-xs text-lime tracking-widest">{kicker}</div>
      <h2 className="font-head text-3xl sm:text-4xl mt-1 leading-tight">{title}</h2>
    </div>
  );
}
