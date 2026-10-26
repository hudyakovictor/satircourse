"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useProgress } from "./ProgressProvider";

const num = (s: string) => {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) ? v : NaN;
};
const f = (n: number, d = 2) => (Number.isFinite(n) ? n.toLocaleString("ru-RU", { maximumFractionDigits: d }) : "—");

function Panel({ title, kicker, children, color }: { title: string; kicker: string; children: ReactNode; color: string }) {
  return (
    <section className="neo p-5 md:p-7">
      <div className="kicker" style={{ color }}>{kicker}</div>
      <h2 className="headline mb-4 mt-1 text-2xl">{title}</h2>
      {children}
    </section>
  );
}
function In({ label, v, set, suffix }: { label: string; v: string; set: (s: string) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <div className="relative mt-1">
        <input className="field" inputMode="decimal" value={v} onChange={(e) => set(e.target.value)} />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[var(--mute)]">{suffix}</span>}
      </div>
    </label>
  );
}
function Out({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" | "amber" }) {
  const c = tone === "up" ? "var(--up)" : tone === "down" ? "var(--down)" : tone === "amber" ? "#d9921a" : "var(--ink)";
  return (
    <div className="neo-s p-3 text-center">
      <div className="kicker">{label}</div>
      <div className="headline mt-1 text-xl" style={{ color: c }}>{value}</div>
    </div>
  );
}

function SizeCalc() {
  const [acc, setAcc] = useState("5000");
  const [risk, setRisk] = useState("0.75");
  const [entry, setEntry] = useState("100");
  const [stop, setStop] = useState("97.7");
  const [fee, setFee] = useState("0.2");
  const r = useMemo(() => {
    const a = num(acc), p = num(risk), e = num(entry), s = num(stop), fe = num(fee) || 0;
    const riskUsd = (a * p) / 100;
    const dist = Math.abs(e - s);
    const size = riskUsd / (dist + (e * fe) / 100);
    return { riskUsd, dist, size: Math.floor(size * 100) / 100, notional: Math.floor(size * 100) / 100 * e, pct: (dist / e) * 100, p };
  }, [acc, risk, entry, stop, fee]);
  return (
    <Panel title="Размер позиции от стопа" kicker="H71 · налог на надежду включён" color="#ef6f55">
      <div className="grid grid-cols-2 gap-3">
        <In label="Счёт" v={acc} set={setAcc} suffix="$" />
        <In label="Риск" v={risk} set={setRisk} suffix="%" />
        <In label="Вход" v={entry} set={setEntry} />
        <In label="Стоп" v={stop} set={setStop} />
        <In label="Издержки round-trip" v={fee} set={setFee} suffix="%" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Out label="Риск $" value={`$${f(r.riskUsd)}`} tone="down" />
        <Out label="Дистанция" value={`${f(r.dist, 4)} (${f(r.pct)}%)`} />
        <Out label="Размер" value={f(r.size, 4)} tone="up" />
        <Out label="Номинал" value={`$${f(r.notional)}`} />
      </div>
      <p className="mt-3 text-sm font-bold">
        {r.p > 1 ? "РИСК ВЫШЕ 1%. Комитет по выживанию просит не называть это стратегией." : "Размер — следствие стопа. Не «купить на $1 630», а получить $1 630 из риска."}
      </p>
    </Panel>
  );
}

function ExpectancyCalc() {
  const [wr, setWr] = useState("40");
  const [win, setWin] = useState("2.5");
  const [loss, setLoss] = useState("1");
  const r = useMemo(() => {
    const w = num(wr) / 100, a = num(win), l = num(loss);
    return { e: w * a - (1 - w) * l, be: (l / (a + l)) * 100 };
  }, [wr, win, loss]);
  return (
    <Panel title="Матожидание в R" kicker="G60 · WR × прибыль − (1−WR) × убыток" color="#e8a317">
      <div className="grid grid-cols-3 gap-3">
        <In label="Win rate" v={wr} set={setWr} suffix="%" />
        <In label="Ср. прибыль" v={win} set={setWin} suffix="R" />
        <In label="Ср. убыток" v={loss} set={setLoss} suffix="R" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Out label="Матожидание" value={`${r.e >= 0 ? "+" : ""}${f(r.e)}R`} tone={r.e > 0 ? "up" : "down"} />
        <Out label="Безубыточный WR" value={`${f(r.be, 1)}%`} tone="amber" />
      </div>
      <p className="mt-3 text-sm font-bold">{r.e > 0 ? "Плюс на бумаге. Вычти комиссии и проскальзывание — рынок уже вычел." : "Минус. Твоя стратегия работает. Жаль, что против тебя."}</p>
    </Panel>
  );
}

function FundingCalc() {
  const [notional, setNotional] = useState("3000");
  const [rate, setRate] = useState("0.01");
  const [hours, setHours] = useState("72");
  const [riskUsd, setRiskUsd] = useState("30");
  const r = useMemo(() => {
    const cost = num(notional) * (num(rate) / 100) * (num(hours) / 8);
    return { cost, inR: cost / num(riskUsd) };
  }, [notional, rate, hours, riskUsd]);
  return (
    <Panel title="Funding: арендная плата за уверенность" kicker="H76 · perpetual не бывает бесплатным" color="#f2647a">
      <div className="grid grid-cols-2 gap-3">
        <In label="Номинал" v={notional} set={setNotional} suffix="$" />
        <In label="Funding за 8ч" v={rate} set={setRate} suffix="%" />
        <In label="Удержание" v={hours} set={setHours} suffix="ч" />
        <In label="Риск 1R" v={riskUsd} set={setRiskUsd} suffix="$" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Out label="Стоимость" value={`$${f(r.cost)}`} tone="down" />
        <Out label="В R" value={`${f(r.inR)}R`} tone="amber" />
      </div>
      <p className="mt-3 text-sm font-bold">Позиция стоит на месте. Счётчик — нет.</p>
    </Panel>
  );
}

function RuinSim() {
  const [risk, setRisk] = useState("1");
  const [wr, setWr] = useState("40");
  const [rr, setRr] = useState("2");
  const [trades, setTrades] = useState("100");
  const [res, setRes] = useState<{ ruin: number; dd30: number; median: number; paths: number[][] } | null>(null);
  const run = () => {
    const p = num(risk) / 100, w = num(wr) / 100, R = num(rr), n = Math.min(500, Math.max(10, Math.round(num(trades))));
    const runs = 400;
    let ruin = 0, dd30 = 0;
    const finals: number[] = [];
    const paths: number[][] = [];
    for (let i = 0; i < runs; i++) {
      let eq = 1, peak = 1, maxdd = 0, dead = false;
      const path = [1];
      for (let t = 0; t < n; t++) {
        eq *= Math.random() < w ? 1 + p * R : 1 - p;
        peak = Math.max(peak, eq);
        maxdd = Math.max(maxdd, 1 - eq / peak);
        if (eq < 0.5) dead = true;
        path.push(eq);
      }
      if (dead) ruin++;
      if (maxdd > 0.3) dd30++;
      finals.push(eq);
      if (i < 14) paths.push(path);
    }
    finals.sort((a, b) => a - b);
    setRes({ ruin: (ruin / runs) * 100, dd30: (dd30 / runs) * 100, median: finals[Math.floor(runs / 2)], paths });
  };
  const maxY = res ? Math.min(3, Math.max(1.2, ...res.paths.flat())) : 1;
  return (
    <Panel title="Симулятор разорения" kicker="H70 · 400 параллельных реальностей" color="#8b6cf6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <In label="Риск/сделка" v={risk} set={setRisk} suffix="%" />
        <In label="Win rate" v={wr} set={setWr} suffix="%" />
        <In label="R:R" v={rr} set={setRr} />
        <In label="Сделок" v={trades} set={setTrades} />
      </div>
      <button onClick={run} className="neo-btn btn-primary mt-4 px-6 py-3 text-sm">Запустить симуляцию</button>
      {res && (
        <div className="pop mt-4">
          <div className="neo-in p-3">
            <svg viewBox="0 0 400 140" className="w-full">
              <line x1="0" x2="400" y1={140 - (1 / maxY) * 130} y2={140 - (1 / maxY) * 130} stroke="#9aa6c4" strokeDasharray="4 5" />
              {res.paths.map((p, i) => (
                <polyline key={i} fill="none" strokeWidth="2" strokeLinejoin="round" stroke={p[p.length - 1] >= 1 ? "#2fbf86" : "#f2647a"} opacity=".75" points={p.map((v, j) => `${(j / (p.length - 1)) * 400},${140 - (Math.min(v, maxY) / maxY) * 130}`).join(" ")} />
              ))}
            </svg>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Out label="Счёт упал ниже 50%" value={`${f(res.ruin, 1)}%`} tone="down" />
            <Out label="Просадка > 30%" value={`${f(res.dd30, 1)}%`} tone="amber" />
            <Out label="Медианный счёт" value={`${f(res.median * 100, 0)}%`} tone={res.median >= 1 ? "up" : "down"} />
          </div>
          <p className="mt-3 text-sm font-bold">{res.ruin > 5 ? "Часть реальностей уже приняла твоё решение. Не в твою пользу." : "Выжил в большинстве реальностей. Рынок отмечает это как подозрительное."}</p>
        </div>
      )}
    </Panel>
  );
}

type Entry = { id: number; pair: string; side: string; entry: number | null; stop: number | null; exit: number | null; riskUsd: number | null; rMultiple: number; note: string; createdAt: string };

function Journal() {
  const { learnerId, ready } = useProgress();
  const [list, setList] = useState<Entry[]>([]);
  const [form, setForm] = useState({ pair: "BTC/USDT", side: "long", entry: "", stop: "", exit: "", note: "" });
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!learnerId) return;
    const r = await fetch(`/api/journal?learner=${learnerId}`);
    if (r.ok) setList((await r.json()).entries);
  }, [learnerId]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) load();
  }, [ready, load]);

  const preview = useMemo(() => {
    const e = num(form.entry), s = num(form.stop), x = num(form.exit);
    if ([e, s, x].some(Number.isNaN) || e === s) return null;
    const move = form.side === "long" ? x - e : e - x;
    return move / Math.abs(e - s);
  }, [form]);

  const add = async () => {
    if (preview === null) return;
    setBusy(true);
    await fetch("/api/journal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ learnerId, pair: form.pair, side: form.side, entry: num(form.entry), stop: num(form.stop), exit: num(form.exit), note: form.note }),
    });
    setForm({ ...form, entry: "", stop: "", exit: "", note: "" });
    await load();
    setBusy(false);
  };
  const del = async (id: number) => {
    await fetch(`/api/journal?learner=${learnerId}&id=${id}`, { method: "DELETE" });
    load();
  };

  const stats = useMemo(() => {
    const rs = list.map((e) => e.rMultiple);
    const n = rs.length;
    const sum = rs.reduce((a, b) => a + b, 0);
    const wins = rs.filter((r) => r > 0).length;
    const cum: number[] = [];
    [...rs].reverse().reduce((a, b) => (cum.push(a + b), a + b), 0);
    return { n, sum, wr: n ? (wins / n) * 100 : 0, exp: n ? sum / n : 0, cum };
  }, [list]);

  const maxC = Math.max(1, ...stats.cum.map(Math.abs));
  return (
    <Panel title="Журнал сделок в R" kicker="I84 · единственный свидетель, который не врёт" color="#2fbf86">
      <div className="grid gap-3 md:grid-cols-6">
        <label className="md:col-span-2"><span className="kicker">Пара</span><input className="field mt-1" value={form.pair} onChange={(e) => setForm({ ...form, pair: e.target.value })} /></label>
        <div>
          <span className="kicker">Сторона</span>
          <div className="mt-1 flex gap-2">
            {["long", "short"].map((s) => (
              <button key={s} data-on={form.side === s} onClick={() => setForm({ ...form, side: s })} className="neo-btn flex-1 px-3 py-2.5 text-xs uppercase">{s}</button>
            ))}
          </div>
        </div>
        <In label="Вход" v={form.entry} set={(v) => setForm({ ...form, entry: v })} />
        <In label="Стоп" v={form.stop} set={(v) => setForm({ ...form, stop: v })} />
        <In label="Выход" v={form.exit} set={(v) => setForm({ ...form, exit: v })} />
        <label className="md:col-span-6"><span className="kicker">Заметка: триггер и инвалидация — до входа, не после оправданий</span><input className="field mt-1" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button disabled={preview === null || busy || !ready} onClick={add} className="neo-btn btn-primary px-6 py-3 text-sm">Записать сделку</button>
        {preview !== null && <span className="stamp" style={{ color: preview >= 0 ? "var(--up)" : "var(--down)", borderColor: preview >= 0 ? "var(--up)" : "var(--down)" }}>{preview >= 0 ? "+" : ""}{f(preview)}R</span>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Out label="Сделок" value={String(stats.n)} />
        <Out label="Сумма R" value={`${stats.sum >= 0 ? "+" : ""}${f(stats.sum)}R`} tone={stats.sum >= 0 ? "up" : "down"} />
        <Out label="Win rate" value={`${f(stats.wr, 0)}%`} />
        <Out label="Матожидание" value={`${f(stats.exp)}R`} tone={stats.exp >= 0 ? "up" : "down"} />
      </div>
      {stats.cum.length > 1 && (
        <div className="neo-in mt-4 p-3">
          <svg viewBox="0 0 400 100" className="w-full">
            <line x1="0" x2="400" y1="50" y2="50" stroke="#9aa6c4" strokeDasharray="4 5" />
            <polyline fill="none" stroke="#5b7cfa" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={stats.cum.map((v, i) => `${(i / (stats.cum.length - 1)) * 400},${50 - (v / maxC) * 44}`).join(" ")} />
          </svg>
        </div>
      )}
      <div className="mt-4 space-y-2">
        {list.map((e) => (
          <div key={e.id} className="neo-s flex flex-wrap items-center gap-3 p-3 text-sm">
            <span className="font-black">{e.pair}</span>
            <span className="rounded-full bg-[#dfe6f4] px-2 text-[11px] font-black uppercase">{e.side}</span>
            <span className="font-semibold text-[var(--mute)]">{e.entry} → {e.exit} · стоп {e.stop}</span>
            <span className="flex-1 truncate font-semibold">{e.note}</span>
            <span className="headline" style={{ color: e.rMultiple >= 0 ? "var(--up)" : "var(--down)" }}>{e.rMultiple >= 0 ? "+" : ""}{f(e.rMultiple)}R</span>
            <button className="neo-btn px-3 py-1 text-xs" onClick={() => del(e.id)}>✕</button>
          </div>
        ))}
        {!list.length && <p className="neo-in p-4 text-center text-sm font-bold">Журнал пуст. Значит, система пока не знает, насколько ты предсказуем.</p>}
      </div>
    </Panel>
  );
}

export function Tools() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <SizeCalc />
      <ExpectancyCalc />
      <FundingCalc />
      <RuinSim />
      <div className="lg:col-span-2"><Journal /></div>
    </div>
  );
}
