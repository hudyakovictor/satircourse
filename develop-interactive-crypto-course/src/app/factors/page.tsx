import Link from "next/link";
import { factorRegistry, lessons, SAT } from "@/lib/course";

export const metadata = { title: "777 факторов — SIGNAL ARENA" };

const COLORS = ["#35e08a", "#b48cff", "#ff9a3c", "#39f0ff"];

export default function FactorsPage() {
  const reg = factorRegistry();
  // build 777 dots: cards (500), illustrations (100), teasers (100), glossary (77)
  const dots: { c: string; t: string; href?: string }[] = [];
  lessons.forEach((l) => ["Т", "П", "Р", "Д", "Э"].forEach((k) => dots.push({ c: COLORS[0], t: `${l.code} [${k}]`, href: `/lesson/${l.id}` })));
  lessons.forEach((l) => dots.push({ c: COLORS[1], t: `${l.code} · иллюстрация`, href: `/lesson/${l.id}` }));
  lessons.forEach((l) => dots.push({ c: COLORS[2], t: `${l.code} · ${SAT[l.id].h}`, href: `/lesson/${l.id}` }));
  for (let i = 0; i < 77; i++) dots.push({ c: COLORS[3], t: `термин #${i + 1}`, href: "/glossary" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="stamp text-toxic">Инвентаризация системы</div>
      <h1 className="mt-3 font-display text-5xl uppercase text-paper md:text-7xl">
        {reg.total} <span className="text-toxic">фактора</span>
      </h1>
      <p className="mt-3 max-w-3xl text-lg text-zinc-300">
        Публичный комитет по учёту чужих иллюзий сосчитал всё, что содержит курс. Каждая точка ниже — отдельная единица контента. Нажми — попадёшь туда, где рынок тебя ждёт.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="paper p-5">
          <h2 className="font-display text-2xl uppercase">Основные факторы</h2>
          <ul className="mt-3 space-y-2">
            {reg.rows.map((r, i) => (
              <li key={r.name} className="flex items-center justify-between gap-3 border-b-2 border-black/30 pb-1">
                <span className="flex items-center gap-2">
                  <span className="pixel-dot inline-block" style={{ background: COLORS[i] }} />
                  {r.name}
                </span>
                <b className="font-display text-xl">{r.n}</b>
              </li>
            ))}
            <li className="flex justify-between pt-1 font-display text-2xl uppercase">
              <span>Итого</span>
              <span>{reg.total}</span>
            </li>
          </ul>
        </div>
        <div className="ink-panel p-5">
          <h2 className="font-display text-2xl uppercase text-paper">Бонусные материалы</h2>
          <ul className="mt-3 space-y-2 font-mono text-sm text-zinc-300">
            {reg.bonus.map((r) => (
              <li key={r.name} className="flex justify-between border-b border-white/10 pb-1">
                <span>{r.name}</span>
                <b className="text-toxic">+{r.n}</b>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm italic text-zinc-400">Бонусы не входят в 777. Система всегда даёт чуть больше, чем обещала — обычно в виде проблем.</p>
        </div>
      </div>

      <div className="ink-panel mt-8 p-5">
        <div className="flex flex-wrap gap-4 font-mono text-xs text-zinc-300">
          {reg.rows.map((r, i) => (
            <span key={r.name} className="flex items-center gap-1.5">
              <span className="pixel-dot inline-block" style={{ background: COLORS[i] }} /> {r.name}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-[3px]">
          {dots.map((d, i) => (
            <Link key={i} href={d.href ?? "/"} title={d.t} className="pixel-dot block transition hover:scale-150" style={{ background: d.c }} />
          ))}
        </div>
      </div>
    </div>
  );
}
