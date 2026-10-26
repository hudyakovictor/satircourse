"use client";

import { useState, type ReactNode } from "react";

function Num({ label, value, set, step = "any", suffix }: { label: string; value: number; set: (n: number) => void; step?: string; suffix?: string }) {
  return (
    <label className="block text-sm font-extrabold">
      {label}
      <div className="mt-1 flex items-center rounded-xl border-2 border-[#b0bbdb] bg-white focus-within:border-[#2346d6]">
        <input type="number" step={step} value={Number.isFinite(value) ? value : ""} onChange={(e) => set(parseFloat(e.target.value))} className="w-full bg-transparent px-3 py-2 font-mono text-base font-bold outline-none" />
        {suffix && <span className="pr-3 text-xs font-black opacity-50">{suffix}</span>}
      </div>
    </label>
  );
}

function Out({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" | "warn" }) {
  const c = tone === "good" ? "text-[#15803d]" : tone === "bad" ? "text-[#b91c1c]" : tone === "warn" ? "text-[#a16207]" : "text-[#141d45]";
  return (
    <div className="rounded-xl bg-[#141d45]/[0.07] px-3 py-2">
      <div className="text-[11px] font-black tracking-widest opacity-60">{label}</div>
      <div className={`font-mono text-xl font-black ${c}`}>{value}</div>
    </div>
  );
}

function Panel({ emoji, title, lesson, children }: { emoji: string; title: string; lesson: string; children: ReactNode }) {
  return (
    <section className="card3d p-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <div className="text-xs font-bold opacity-60">Урок {lesson}</div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const f = (n: number, d = 2) => (Number.isFinite(n) ? n.toLocaleString("ru-RU", { maximumFractionDigits: d, minimumFractionDigits: d }) : "—");

export default function Tools() {
  const [acc, setAcc] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(60000);
  const [stop, setStop] = useState(59100);
  const [fee, setFee] = useState(0.12);
  const riskUsd = (acc * riskPct) / 100;
  const perUnit = Math.abs(entry - stop) + (entry * fee) / 100;
  const qty = riskUsd / perUnit;
  const notional = qty * entry;

  const [ex, setEx] = useState(61500);
  const rMult = (ex - entry) / (entry - stop);

  const [wr, setWr] = useState(40);
  const [aw, setAw] = useState(2);
  const [al, setAl] = useState(1);
  const exp = (wr / 100) * aw - (1 - wr / 100) * al;
  const be = (al / (aw + al)) * 100;

  const [nt, setNt] = useState(3000);
  const [fr, setFr] = useState(0.01);
  const [days, setDays] = useState(5);
  const fund = nt * (fr / 100) * 3 * days;

  const [lev, setLev] = useState(10);
  const [mmr, setMmr] = useState(0.5);
  const [dir, setDir] = useState<"long" | "short">("long");
  const liq = dir === "long" ? entry * (1 - 1 / lev + mmr / 100) : entry * (1 + 1 / lev - mmr / 100);
  const liqDist = (Math.abs(liq - entry) / entry) * 100;
  const stopDist = (Math.abs(entry - stop) / entry) * 100;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-xs font-black tracking-[0.25em] text-[#e9b949]">ИНСТРУМЕНТЫ</div>
      <h1 className="mt-2 text-4xl font-black">Калькуляторы риска</h1>
      <p className="mt-2 max-w-2xl font-medium text-[#9fb0e6]">Формулы из рабочей тетради курса. Расчёты оценочные: у бирж свои формулы маржи и ликвидации — сверяйтесь с документацией.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel emoji="⚖️" title="Размер позиции от стопа" lesson="H71 · A8">
          <div className="grid grid-cols-2 gap-3">
            <Num label="Счёт" value={acc} set={setAcc} suffix="$" />
            <Num label="Риск на сделку" value={riskPct} set={setRiskPct} suffix="%" step="0.1" />
            <Num label="Вход" value={entry} set={setEntry} suffix="$" />
            <Num label="Стоп" value={stop} set={setStop} suffix="$" />
            <Num label="Издержки round-trip" value={fee} set={setFee} suffix="%" step="0.01" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Out label="РИСК 1R" value={`$${f(riskUsd)}`} tone={riskPct > 1 ? "bad" : "good"} />
            <Out label="ДИСТАНЦИЯ СТОПА" value={`${f(stopDist)}%`} />
            <Out label="РАЗМЕР (ЕД.)" value={f(qty, 5)} />
            <Out label="НОМИНАЛ" value={`$${f(notional, 0)}`} />
          </div>
          {riskPct > 1 && <p className="mt-3 rounded-xl bg-[#fde3e6] p-3 text-sm font-bold text-[#9f1239]">Риск выше 1% — нарушение правила курса (A8).</p>}
          {Math.abs(entry - stop) === 0 && <p className="mt-3 text-sm font-bold text-[#9f1239]">Стоп не может совпадать со входом.</p>}
        </Panel>

        <Panel emoji="📐" title="Результат сделки в R" lesson="H72">
          <div className="grid grid-cols-2 gap-3">
            <Num label="Цена выхода" value={ex} set={setEx} suffix="$" />
            <Out label="РЕЗУЛЬТАТ" value={`${rMult >= 0 ? "+" : "−"}${f(Math.abs(rMult))}R`} tone={rMult >= 0 ? "good" : "bad"} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((k) => (
              <Out key={k} label={`ЦЕЛЬ +${k}R`} value={`$${f(entry + (entry - stop) * k, 0)}`} tone="good" />
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold opacity-70">Вход и стоп берутся из калькулятора слева. Стоп = −1R, прибыль вдвое больше риска = +2R, отказ от сделки = 0R.</p>
        </Panel>

        <Panel emoji="🎲" title="Expectancy и break-even win rate" lesson="G60 · H74">
          <div className="grid grid-cols-3 gap-3">
            <Num label="Win rate" value={wr} set={setWr} suffix="%" />
            <Num label="Средняя победа" value={aw} set={setAw} suffix="R" step="0.1" />
            <Num label="Средний убыток" value={al} set={setAl} suffix="R" step="0.1" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Out label="E НА СДЕЛКУ" value={`${exp >= 0 ? "+" : "−"}${f(Math.abs(exp))}R`} tone={exp > 0 ? "good" : "bad"} />
            <Out label="BREAK-EVEN WR" value={`${f(be, 1)}%`} tone={wr > be ? "good" : "warn"} />
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#b9c4e0]">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, wr))}%`, background: wr > be ? "#22c55e" : "#ef4444" }} />
          </div>
          <div className="mt-1 text-xs font-bold opacity-60">Win rate {wr}% против порога {f(be, 1)}% (до издержек)</div>
        </Panel>

        <Panel emoji="⏳" title="Стоимость funding rate" lesson="F56 · H76">
          <div className="grid grid-cols-3 gap-3">
            <Num label="Номинал" value={nt} set={setNt} suffix="$" />
            <Num label="Funding / 8ч" value={fr} set={setFr} suffix="%" step="0.001" />
            <Num label="Дней" value={days} set={setDays} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Out label="ПЛАТЁЖ ЗА УДЕРЖАНИЕ" value={`$${f(fund)}`} tone={fund > 0 ? "warn" : "good"} />
            <Out label="В % ОТ НОМИНАЛА" value={`${f(fr * 3 * days, 3)}%`} />
          </div>
          <p className="mt-3 text-sm font-semibold opacity-70">При положительной ставке лонги платят шортам. Удержание perpetual имеет цену, даже если цена стоит на месте.</p>
        </Panel>

        <Panel emoji="💥" title="Цена ликвидации (оценка)" lesson="H75 · H76">
          <div className="grid grid-cols-3 gap-3">
            <Num label="Плечо" value={lev} set={setLev} suffix="×" />
            <Num label="Maintenance margin" value={mmr} set={setMmr} suffix="%" step="0.1" />
            <label className="block text-sm font-extrabold">
              Направление
              <div className="mt-1 grid grid-cols-2 gap-1">
                {(["long", "short"] as const).map((d) => (
                  <button key={d} onClick={() => setDir(d)} className={`rounded-xl border-2 py-2 font-black ${dir === d ? "border-[#141d45] bg-[#141d45] text-white" : "border-[#b0bbdb] bg-white"}`}>{d}</button>
                ))}
              </div>
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Out label="ЛИКВИДАЦИЯ ≈" value={`$${f(liq, 0)}`} tone="bad" />
            <Out label="РАССТОЯНИЕ" value={`${f(liqDist)}%`} tone={liqDist < stopDist * 1.5 ? "bad" : "good"} />
          </div>
          <p className={`mt-3 rounded-xl p-3 text-sm font-bold ${liqDist < stopDist * 1.5 ? "bg-[#fde3e6] text-[#9f1239]" : "bg-[#dcf7e6] text-[#166534]"}`}>
            {liqDist < stopDist * 1.5 ? "Ликвидация слишком близка к стопу: стоп может не успеть сработать. Снизьте плечо." : "Стоп стоит заметно раньше ликвидации — это минимальное требование."}
          </p>
        </Panel>

        <Panel emoji="🧯" title="Лимиты серии убытков" lesson="H77 · I86">
          <SeriesBox />
        </Panel>
      </div>
    </div>
  );
}

function SeriesBox() {
  const [risk, setRisk] = useState(1);
  const [n, setN] = useState(8);
  const dd = (1 - Math.pow(1 - risk / 100, n)) * 100;
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Num label="Риск на сделку" value={risk} set={setRisk} suffix="%" step="0.1" />
        <Num label="Убытков подряд" value={n} set={setN} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Out label="ПРОСАДКА СЧЁТА" value={`${f(dd)}%`} tone={dd > 10 ? "bad" : "warn"} />
        <Out label="ДОХОДНОСТЬ ДЛЯ ВОЗВРАТА" value={`${f((1 / (1 - dd / 100) - 1) * 100)}%`} />
      </div>
      <p className="mt-3 text-sm font-semibold opacity-70">Просадка несимметрична: чем глубже яма, тем больший процент нужен, чтобы вернуться. Заранее задайте дневной лимит и паузу после серии.</p>
    </div>
  );
}
