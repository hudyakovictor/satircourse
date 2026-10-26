import Link from "next/link";
import { getModules, allLessons } from "@/lib/content";
import { MODULES, CARD_META } from "@/lib/course-meta";
import { ModuleGrid, HeroCard, type ModInfo } from "@/components/Dashboard";
import { ModuleCover } from "@/components/ModuleCover";
import { Illustration } from "@/components/art/Illustration";

export default function Home() {
  const mods = getModules();
  const lessons = allLessons();
  const modInfo: ModInfo[] = MODULES.map((m) => ({
    id: m.id, title: m.title, outcome: m.outcome, from: m.from, to: m.to, color: m.color, examCode: `${m.id}${m.to}`, firstCode: `${m.id}${m.from}`,
  }));
  const showcase = ["A0", "B11", "C24", "D34", "E43", "F56", "G67", "H71", "I81", "J93", "H76", "D36"].map((c) => lessons.find((l) => l.code === c)!);
  const colorOf = (id: string) => MODULES.find((m) => m.id === id)!.color;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1333]/60 via-[#0b1333]/70 to-[#0b1333]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 lg:grid-cols-[1.1fr_1fr]">
          <div className="slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e9b949]/60 bg-[#0b1333]/70 px-4 py-1.5 text-xs font-black tracking-[0.2em] text-[#e9b949]">
              ИНТЕРАКТИВНЫЙ КУРС · 2026
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Анализ и торговля <span className="bg-gradient-to-r from-[#22e0a1] to-[#4cc9f0] bg-clip-text text-transparent">криптоактивами</span> без магии
            </h1>
            <p className="mt-5 max-w-xl text-lg font-medium text-[#c6d0f5]">
              100 уровней от чтения цены до собственного исследования и проекта из 100 сделок paper trading. В каждом уроке — теория, пример, карточка решения, разбор в R и мини-экзамен. И по две 500×500 иллюстрации на урок.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-extrabold">
              {[["100", "уровней"], ["500", "карточек"], ["210+", "иллюстраций"], ["10", "модулей"]].map(([n, t]) => (
                <div key={t} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 backdrop-blur">
                  <span className="text-2xl font-black text-white">{n}</span> <span className="text-[#9fb0e6]">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="slide-up" style={{ animationDelay: "0.1s" }}>
            <HeroCard lessons={lessons.map((l) => ({ code: l.code, title: l.title, moduleId: l.moduleId }))} mods={modInfo} />
          </div>
        </div>
      </section>

      {/* ROUTE */}
      <section className="mx-auto max-w-6xl px-4 py-10" id="route">
        <SectionTitle kicker="МАРШРУТ" title="Десять модулей — один путь" sub="Главы открываются по порядку: экзамен 9, 19, … 89 (≥80%, на H79 — ≥85%) пускает в следующую. Кнопка «Все главы» сверху снимает замки." />
        <div className="mt-9">
          <ModuleGrid mods={modInfo} />
        </div>
      </section>

      {/* LESSON ANATOMY */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle kicker="КАК УСТРОЕН УРОК" title="Пять карточек: Т · П · Р · Д · Э" sub="Сначала решение — потом разбор. Уровень закрывается корректным решением, стопом и записью в журнал, а не случайной прибылью." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CARD_META.map((c, i) => (
            <div key={c.key} className="card3d p-5">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.emoji}</span>
                <span className="rounded-full bg-[#141d45] px-2.5 py-1 text-xs font-black text-[#e9b949]">[{["Т", "П", "Р", "Д", "Э"][i]}]</span>
              </div>
              <div className="mt-3 text-lg font-black">{c.name}</div>
              <div className="mt-1 text-sm font-semibold opacity-70">{c.hint}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COVERS */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle kicker="ОБЛОЖКИ ГЛАВ" title="Десять глав — десять миров" sub="Каждая глава и каждый параграф имеют собственную иллюстрацию 500×500: графики, стаканы, таблицы, инфографика." />
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {mods.map((m) => (
            <Link key={m.id} href={`/module/${m.id}`} className="block transition hover:-translate-y-1">
              <ModuleCover mod={m} />
            </Link>
          ))}
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle kicker="ВИТРИНА ИЛЛЮСТРАЦИЙ" title="Схемы, которые не нужно расшифровывать" sub="Все изображения — векторные, собираются из параметров урока и остаются чёткими на любом экране." />
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {showcase.map((l) => (
            <Link key={l.code} href={`/lesson/${l.code}`} className="illus block transition hover:-translate-y-1">
              <Illustration seed={l.code} prompt={l.visuals.find((v) => v.type !== "Таблица")?.prompt ?? l.visuals[0].prompt} moduleId={l.moduleId} accent={colorOf(l.moduleId)} cover code={l.code} title={l.title} />
            </Link>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
        {[
          { href: "/tools", t: "Калькуляторы риска", d: "Размер позиции от стопа, R, expectancy, break-even win rate, funding и цена ликвидации.", e: "🧮" },
          { href: "/journal", t: "Журнал сделок в R", d: "Ведите paper-журнал, смотрите кривую капитала, просадку и прогресс к 100 сделкам capstone.", e: "📒" },
          { href: "/materials", t: "Шаблоны и приложения", d: "Глоссарий, рабочая тетрадь, рубрики 100 уровней, карточка стратегии и CSV-шаблоны.", e: "🗂️" },
        ].map((x) => (
          <Link key={x.href} href={x.href} className="card3d block p-6 transition hover:-translate-y-1">
            <div className="text-4xl">{x.e}</div>
            <div className="mt-3 text-xl font-black">{x.t}</div>
            <p className="mt-1 text-sm font-semibold opacity-75">{x.d}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="max-w-3xl">
      <div className="text-xs font-black tracking-[0.25em] text-[#e9b949]">{kicker}</div>
      <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-2 font-medium text-[#9fb0e6]">{sub}</p>
    </div>
  );
}
