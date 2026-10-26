import Link from "next/link";
import { DOCS, CSV_FILES } from "@/lib/course-meta";

export const metadata = { title: "Материалы и шаблоны — Signal Arena" };

const CSV_INFO: Record<string, string> = {
  "trade-journal.csv": "Журнал paper-сделок: 28 обязательных полей",
  "backtest-log.csv": "Лог бэктеста с версиями правил",
  "capstone-log.csv": "Лог 100 сделок выпускного проекта",
};

export default function Materials() {
  const groups = ["Методика", "Приложения", "Шаблоны"] as const;
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-xs font-black tracking-[0.25em] text-[#e9b949]">БИБЛИОТЕКА</div>
      <h1 className="mt-2 text-4xl font-black">Материалы, приложения и шаблоны</h1>
      <p className="mt-2 max-w-2xl font-medium text-[#9fb0e6]">Всё, что усиливает уроки: глоссарий, рабочая тетрадь расчётов, рубрики освоения всех 100 уровней, протокол источников и рабочие шаблоны.</p>
      {groups.map((g) => (
        <section key={g} className="mt-10">
          <h2 className="text-2xl font-black">{g}</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {DOCS.filter((d) => d.group === g).map((d) => (
              <Link key={d.slug} href={`/docs/${d.slug}`} className="card3d block p-5 transition hover:-translate-y-1">
                <div className="text-4xl">{d.emoji}</div>
                <div className="mt-2 text-lg font-black leading-snug">{d.title}</div>
                <p className="mt-1 text-sm font-semibold opacity-70">{d.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <section className="mt-10">
        <h2 className="text-2xl font-black">CSV-шаблоны</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {CSV_FILES.map((f) => (
            <a key={f} href={`/api/download/${f}`} className="card3d block p-5 transition hover:-translate-y-1">
              <div className="text-4xl">⬇️</div>
              <div className="mt-2 font-mono text-lg font-black">{f}</div>
              <p className="mt-1 text-sm font-semibold opacity-70">{CSV_INFO[f]}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
