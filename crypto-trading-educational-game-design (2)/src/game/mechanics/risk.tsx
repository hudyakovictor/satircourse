"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Big, CandleChart, Dots, Hud, Pill, TimeBar, atr, clamp, fx, genCandles, pick, rand, seg, shuffle, useCountdown, useFeedback, useLoop, type Candle, type MechProps } from "../kit";

// ---------------- M12 Risk manager ----------------
export function RiskManager({ onEnd, paused }: MechProps) {
  const make = () => {
    const base = genCandles([...seg(20, 0.006), ...seg(8, -0.004), ...seg(8, 0.005)], { vol: 0.012 });
    const hl = Math.min(...base.slice(20, 28).map((c) => c.l)); const entry = base[base.length - 1].c; const a = atr(base);
    const win = Math.random() < 0.7;
    const fut = genCandles(win ? [...seg(5, -0.004), ...seg(19, 0.007)] : [...seg(8, -0.009), ...seg(16, 0.002)], { start: entry, vol: 0.012 });
    return { base, fut, hl, entry, a };
  };
  const N = 3;
  const [r, setR] = useState(0); const [s, setS] = useState(make); const [mode, setMode] = useState<"sl" | "tp">("sl");
  const [sl, setSl] = useState(() => s.entry * 0.99); const [tp, setTp] = useState(() => s.entry * 1.02);
  const [play, setPlay] = useState(-1); const [pts, setPts] = useState(0); const [verdict, setVerdict] = useState<string | null>(null);
  const fb = useFeedback();
  useEffect(() => { setSl(s.entry * 0.99); setTp(s.entry * 1.02); }, [s]);
  const rr = (tp - s.entry) / Math.max(1e-9, s.entry - sl);
  const structOk = sl < s.hl && sl > s.hl - s.a * 1.5;
  const run = () => { setPlay(0); };
  useLoop(() => {
    if (play < 0 || verdict) return;
    const i = Math.floor(play); const c = s.fut[i];
    if (!c) return finish("⏱", 0);
    if (c.l <= sl) return finish("SL", -1);
    if (c.h >= tp) return finish("TP", rr);
    setPlay(play + 0.25);
  }, play >= 0 && !paused && !verdict);
  function finish(tag: string, R: number) {
    const q = (structOk ? 50 : 10) + (rr >= 2 ? 40 : rr >= 1.5 ? 20 : 0) + (R > 0 ? 10 : 0);
    const p = Math.round(q / N); const tot = pts + p; setPts(tot); setVerdict(tag);
    fb.show(q >= 60 ? "good" : "bad", `${tag} ${R > 0 ? "+" : ""}${R.toFixed(1)}R`);
    setTimeout(() => { if (r + 1 >= N) onEnd({ score: Math.min(100, tot + 1), lesson: "Стоп — за структурой. Цель — минимум 2R.", stats: [["Структурный стоп", structOk ? "✓" : "✗"], ["Последний R:R", rr.toFixed(1)]] }); else { setR(r + 1); setS(make()); setPlay(-1); setVerdict(null); setMode("sl"); } }, 1500);
  }
  const shown = play >= 0 ? s.fut.slice(0, Math.floor(play) + 1) : [];
  const setY = (y: number) => (mode === "sl" ? setSl(Math.min(y, s.entry * 0.999)) : setTp(Math.max(y, s.entry * 1.001)));
  const ps = [...s.base, ...s.fut].flatMap((c) => [c.h, c.l]);
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={r} n={N} />} center={<Pill tone={rr >= 2 ? "bg-emerald-400/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"}>R:R 1:{rr.toFixed(1)}</Pill>} right={<Pill tone={structOk ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10"}>🧱 {structOk ? "✓" : "?"}</Pill>} />
      <div className="flex-1 grid place-items-center">
        <CandleChart candles={s.base} ghost={shown} height={320} onDragY={play >= 0 ? undefined : setY} domain={[Math.min(...ps, sl) * 0.995, Math.max(...ps, tp) * 1.005]}
          bands={[{ y1: s.entry, y2: sl, color: "#ff5c7a22" }, { y1: s.entry, y2: tp, color: "#2ee6a622" }]}
          lines={[{ y: s.entry, color: "#ffffff", label: "IN" }, { y: sl, color: "#ff5c7a", label: "SL" }, { y: tp, color: "#2ee6a6", label: "TP" }, { y: s.hl, color: "#7aa2ff", dash: true }]} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Big tone={mode === "sl" ? "red" : "ghost"} disabled={play >= 0} onClick={() => setMode("sl")}>✋ Стоп</Big>
        <Big tone={mode === "tp" ? "green" : "ghost"} disabled={play >= 0} onClick={() => setMode("tp")}>🎯 Тейк</Big>
      </div>
      <Big disabled={play >= 0} onClick={run}>▶ Прогнать рынок</Big>
    </div>
  );
}

// ---------------- M13 PnL sprint ----------------
export function PnlSprint({ onEnd, paused }: MechProps) {
  const make = () => {
    const dep = pick([1000, 2000, 5000, 10000, 20000]); const risk = pick([0.5, 1, 2]); const stop = pick([1, 2, 2.5, 4, 5]);
    const ans = (dep * risk) / 100 / (stop / 100);
    const opts = shuffle([ans, ans * 2, ans / 2, dep * risk / 100].map((x) => Math.round(x)).filter((x, i, a) => a.indexOf(x) === i)).slice(0, 4);
    if (!opts.includes(Math.round(ans))) opts[0] = Math.round(ans);
    return { dep, risk, stop, ans: Math.round(ans), opts: shuffle(opts) };
  };
  const [q, setQ] = useState(make); const [ok, setOk] = useState(0); const [bad, setBad] = useState(0); const fb = useFeedback();
  const [t] = useCountdown(45, !paused, () => onEnd({ score: Math.round(clamp(ok * 10 - bad * 5, 0, 100)), lesson: "Размер = риск$ ÷ стоп%. Не наоборот.", stats: [["Верно", `${ok}`], ["Ошибок", `${bad}`]] }));
  const pick_ = (x: number) => { const good = x === q.ans; if (good) setOk(ok + 1); else setBad(bad + 1); fb.show(good ? "good" : "bad", good ? "+10" : `$${q.ans.toLocaleString("ru")}`); setQ(make()); };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Pill tone="bg-emerald-400/20 text-emerald-200">✓ {ok}</Pill>} center={<span className="text-2xl tabular-nums">{Math.ceil(t)}</span>} right={<Pill tone="bg-rose-500/20 text-rose-200">✗ {bad}</Pill>} />
      <TimeBar t={t} max={45} />
      <div className="flex-1 flex flex-col justify-center gap-3" key={ok + bad}>
        {[["💰", "Депозит", `$${q.dep.toLocaleString("ru")}`], ["🎯", "Риск", `${q.risk}%`], ["🧯", "Стоп", `${q.stop}%`]].map(([i, k, v]) => (
          <div key={k} className="flex items-center justify-between rounded-2xl bg-white/5 px-5 h-16 anim-in"><span className="text-lg opacity-70">{i} {k}</span><span className="text-3xl font-black tabular-nums">{v}</span></div>
        ))}
        <div className="text-center text-sm opacity-60 mt-2">Размер позиции = ?</div>
      </div>
      <div className="grid grid-cols-2 gap-2">{q.opts.map((o) => <Big key={o} tone="ghost" onClick={() => pick_(o)}>${o.toLocaleString("ru")}</Big>)}</div>
    </div>
  );
}

// ---------------- M14 Limit ladder ----------------
export function LimitLadder({ onEnd }: MechProps) {
  const rounds = useMemo(() => shuffle([{ trend: "up" }, { trend: "up" }, { trend: "down" }] as const), []);
  const [r, setR] = useState(0); const [sel, setSel] = useState<number[]>([]); const [pts, setPts] = useState(0); const [shown, setShown] = useState(false);
  const fb = useFeedback(); const rd = rounds[r];
  const rungs = Array.from({ length: 10 }, (_, i) => 110 - i * 2); // 110..92
  const zone = [100, 96]; const stop = 93;
  const mini = useMemo(() => genCandles(seg(24, rd.trend === "up" ? 0.005 : -0.007), { start: rd.trend === "up" ? 90 : 125, vol: 0.01 }), [rd]);
  const toggle = (p: number) => { if (shown) return; fx.tap(); setSel(sel.includes(p) ? sel.filter((x) => x !== p) : sel.length < 3 ? [...sel, p] : sel); };
  const submit = (none = false) => {
    let q: number;
    if (rd.trend === "down") q = none || sel.length === 0 ? 34 : 0;
    else { const inZone = sel.filter((p) => p <= zone[0] && p >= zone[1]).length; const below = sel.some((p) => p <= stop); q = none ? 5 : below ? 0 : Math.round((inZone / 3) * 33); }
    const tot = pts + q; setPts(tot); setShown(true); fb.show(q >= 25 ? "good" : "bad", rd.trend === "down" ? (q ? "Не ловим нож ✓" : "Сетка против тренда!") : `${q}/33`);
    setTimeout(() => { if (r + 1 >= rounds.length) onEnd({ score: Math.min(100, tot + 1), lesson: "Лимитки — в зоне и над стопом. Против тренда — никаких сеток.", stats: [["Очки", `${tot}`]] }); else { setR(r + 1); setSel([]); setShown(false); } }, 1300);
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={r} n={rounds.length} />} center={<Pill tone={rd.trend === "up" ? "bg-emerald-400/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"}>{rd.trend === "up" ? "📈 Тренд вверх" : "📉 Тренд вниз"}</Pill>} right={<Pill>{sel.length}/3</Pill>} />
      <div className="h-24"><CandleChart candles={mini} height={90} volume={false} /></div>
      <div className="flex-1 flex flex-col gap-1 justify-center">
        {rungs.map((p) => {
          const inZone = p <= zone[0] && p >= zone[1]; const isStop = p <= stop + 1 && p >= stop - 1;
          return (
            <button key={p} onClick={() => toggle(p)} className={`h-9 rounded-xl flex items-center justify-between px-4 font-black tabular-nums transition ${sel.includes(p) ? "bg-sky-400 text-[#05080f] scale-[1.02]" : inZone ? "bg-emerald-400/15" : "bg-white/5"}`}>
              <span>{p}</span><span className="text-xs">{isStop ? "🧯 STOP" : inZone ? "ZONE" : ""}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2"><Big tone="ghost" disabled={shown} onClick={() => submit(true)}>🚫 Не ставить</Big><Big disabled={shown || sel.length === 0} onClick={() => submit()}>Разместить</Big></div>
    </div>
  );
}

// ---------------- M15 Leverage ladder ----------------
const LEV = [1, 2, 3, 5, 10, 20, 50];
export function LeverageLadder({ onEnd, paused }: MechProps) {
  const [run, setRun] = useState(0); const [lev, setLev] = useState(1); const [price, setPrice] = useState(100); const [hist, setHist] = useState<number[]>([100]);
  const [state, setState] = useState<"idle" | "live" | "liq" | "out">("idle"); const [pnl, setPnl] = useState(0); const [bank, setBank] = useState<number[]>([]); const [fund, setFund] = useState(0);
  const tick = useRef(0); const fb = useFeedback(); const N = 3;
  const liq = 100 * (1 - 1 / lev * 0.9);
  useLoop(() => {
    if (state !== "live") return; tick.current++;
    if (tick.current % 3 !== 0) return;
    const shock = Math.random() < 0.035 ? -rand(4, 9) : 0;
    const np = price * (1 + rand(-0.006, 0.0075)) + shock; const f = fund + lev * 0.004;
    setPrice(np); setHist((h) => [...h.slice(-60), np]); setFund(f);
    const p = ((np - 100) / 100) * lev * 100 - f; setPnl(p);
    if (np <= liq) { setState("liq"); fb.show("bad", "💥 LIQ"); endRun(-100); }
  }, state === "live" && !paused);
  function endRun(v: number) { const b = [...bank, v]; setBank(b); setTimeout(() => { if (b.length >= N) { const avg = b.reduce((a, x) => a + x, 0) / N; const liqs = b.filter((x) => x <= -100).length; onEnd({ score: Math.round(clamp(60 + avg * 2, 0, 100) * (liqs ? 0.5 : 1)), lesson: "Плечо не меняет рынок — оно приближает ликвидацию.", stats: [["Средний PnL", `${avg.toFixed(1)}%`], ["Ликвидаций", `${liqs}`]] }); } else { setRun(run + 1); setState("idle"); setPrice(100); setHist([100]); setPnl(0); setFund(0); setLev(1); tick.current = 0; } }, 1400); }
  const cash = () => { if (state !== "live") return; setState("out"); fx.coin(); fb.show(pnl >= 0 ? "good" : "bad", `${pnl >= 0 ? "+" : ""}${pnl.toFixed(1)}%`); endRun(pnl); };
  const mn = Math.min(...hist, liq) * 0.99; const mx = Math.max(...hist) * 1.01;
  const Y = (p: number) => 200 - ((p - mn) / (mx - mn)) * 190;
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={run} n={N} />} center={<Pill tone="bg-amber-300/20 text-amber-200">⏳ funding −{fund.toFixed(2)}%</Pill>} right={<Pill>x{lev}</Pill>} />
      <div className={`text-center text-6xl font-black tabular-nums ${pnl >= 0 ? "text-emerald-300" : "text-rose-400"}`}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(1)}%</div>
      <svg viewBox="0 0 360 210" className="w-full flex-1 rounded-3xl bg-[#0b1222]">
        <rect x={0} y={Y(liq)} width={360} height={210 - Y(liq)} fill="#ff5c7a22" />
        <line x1={0} x2={360} y1={Y(liq)} y2={Y(liq)} stroke="#ff5c7a" strokeDasharray="6 4" strokeWidth={2} />
        <text x={8} y={Y(liq) - 6} fill="#ff5c7a" fontSize={12} fontWeight={800}>LIQ {liq.toFixed(1)}</text>
        <polyline fill="none" stroke="#2ee6a6" strokeWidth={2.5} points={hist.map((p, i) => `${(i / Math.max(60, hist.length - 1)) * 360},${Y(p)}`).join(" ")} />
      </svg>
      {state === "idle" ? (
        <>
          <div className="grid grid-cols-7 gap-1">{LEV.map((l) => <button key={l} onClick={() => { fx.tap(); setLev(l); }} className={`h-12 rounded-xl font-black ${lev === l ? "bg-amber-300 text-[#05080f]" : "bg-white/10"}`}>x{l}</button>)}</div>
          <Big tone="green" onClick={() => setState("live")}>▶ Открыть лонг</Big>
        </>
      ) : <Big tone="gold" disabled={state !== "live"} onClick={cash}>💰 Забрать</Big>}
    </div>
  );
}
export type { Candle };
