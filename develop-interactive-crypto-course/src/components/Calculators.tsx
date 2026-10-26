"use client";

import { useState } from "react";

const inp = "w-full border-2 border-black bg-[#0b0c13] px-3 py-2 font-mono text-zinc-100 outline-none focus:border-toxic";

function Field({ label, value, set, step = "any" }: { label: string; value: string; set: (v: string) => void; step?: string }) {
  return (
    <label className="block">
      <span className="font-mono text-xs uppercase text-zinc-400">{label}</span>
      <input className={inp} type="number" step={step} value={value} onChange={(e) => set(e.target.value)} />
    </label>
  );
}

const f = (n: number, d = 2) => (Number.isFinite(n) ? n.toLocaleString("ru-RU", { maximumFractionDigits: d }) : "—");

export function Calculators() {
  // position size
  const [acc, setAcc] = useState("3000");
  const [rp, setRp] = useState("1");
  const [entry, setEntry] = useState("60000");
  const [stop, setStop] = useState("59400");
  const [fee, setFee] = useState("0.1");
  const [rr, setRr] = useState("2");
  const a = +acc, r = +rp / 100, e = +entry, s = +stop, fe = +fee / 100;
  const risk$ = a * r;
  const dist = Math.abs(e - s);
  const distPct = dist / e;
  const nominal = distPct > 0 ? (risk$ / (distPct + fe * 2)) : NaN; // fees on both sides reduce size
  const units = nominal / e;
  const long = e > s;
  const target = long ? e + dist * +rr : e - dist * +rr;

  // expectancy
  const [wr, setWr] = useState("40");
  const [aw, setAw] = useState("2.5");
  const [al, setAl] = useState("1");
  const exp = (+wr / 100) * +aw - (1 - +wr / 100) * +al;
  const be = (+al / (+al + +aw)) * 100;

  // funding
  const [nom, setNom] = useState("3000");
  const [fr, setFr] = useState("0.01");
  const [days, setDays] = useState("3");
  const fund = +nom * (+fr / 100) * 3 * +days;

  const card = "ink-panel p-5";
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className={card}>
        <div className="font-display text-2xl uppercase text-paper">Размер позиции</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Счёт, $" value={acc} set={setAcc} />
          <Field label="Риск, %" value={rp} set={setRp} />
          <Field label="Вход" value={entry} set={setEntry} />
          <Field label="Стоп" value={stop} set={setStop} />
          <Field label="Комиссия, % / сторона" value={fee} set={setFee} />
          <Field label="Цель, RR" value={rr} set={setRr} />
        </div>
        <div className="paper mt-4 space-y-1 p-3 font-mono text-sm">
          <div>1R = <b>${f(risk$)}</b></div>
          <div>Дистанция до стопа: <b>{f(distPct * 100)}%</b> ({f(dist)})</div>
          <div>Номинал: <b>${f(nominal, 0)}</b> ≈ {f(units, 5)} ед.</div>
          <div>Сторона: <b>{long ? "LONG" : "SHORT"}</b> · цель {f(target, 0)} (+{rr}R)</div>
          <div className="pt-1 text-xs opacity-70">Издержки вычтены из размера: round-trip = 2 × комиссия.</div>
        </div>
      </div>
      <div className={card}>
        <div className="font-display text-2xl uppercase text-paper">Expectancy и безубыточность</div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Field label="Win rate, %" value={wr} set={setWr} />
          <Field label="Ср. прибыль, R" value={aw} set={setAw} />
          <Field label="Ср. убыток, R" value={al} set={setAl} />
        </div>
        <div className="paper mt-4 space-y-1 p-3 font-mono text-sm">
          <div>Expectancy: <b className={exp >= 0 ? "text-emerald-700" : "text-red-700"}>{f(exp)}R</b> на сделку</div>
          <div>Безубыточный win rate: <b>{f(be, 1)}%</b></div>
          <div>На 100 сделок: <b>{f(exp * 100, 0)}R</b></div>
          <div className="pt-1 text-xs opacity-70">
            {exp >= 0 ? "Ожидание положительное. Пока рынок не передумает." : "Ожидание отрицательное. Стратегия работает, но против тебя."}
          </div>
        </div>
      </div>
      <div className={card}>
        <div className="font-display text-2xl uppercase text-paper">Funding-аренда оптимизма</div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Field label="Номинал, $" value={nom} set={setNom} />
          <Field label="Funding, % / 8ч" value={fr} set={setFr} />
          <Field label="Дней" value={days} set={setDays} />
        </div>
        <div className="paper mt-4 space-y-1 p-3 font-mono text-sm">
          <div>Платёж за период: <b>${f(fund)}</b></div>
          <div>В сутки: <b>${f(+nom * (+fr / 100) * 3)}</b></div>
          <div className="pt-1 text-xs opacity-70">Удержание perpetual-позиции имеет цену. Счёт приходит тихо. Как кот.</div>
        </div>
      </div>
    </div>
  );
}
