"use client";
import { useEffect, useMemo, useState } from "react";
import { Big, CandleChart, Dots, Hud, Pill, atr, clamp, fx, genCandles, pick, rand, ri, rsi, seg, shuffle, sma, useFeedback, useLoop, type Candle, type MechProps } from "../kit";

// ---------------- M18 Analyst Desk (server-authoritative, hidden future) ----------------
interface Scn { id: string; futureHash: string; asset: string; timeframe: string; candles: Candle[]; entry: number; atr: number; levels: { price: number; label: string }[]; signals: { key: string; label: string; value: string; stance: string; hidden?: boolean }[]; suggestedStop: { long: number; short: number } | null }
interface Res { future: Candle[]; futureHash: string; quality: number; archetypeRu: string; bestRu: string; sim: { r: number; exit: string } }
const SIG_ICON: Record<string, string> = { volume: "📊", htf: "🔭", structure: "🧱", funding: "🎈", distance: "📏", rsi: "🌡️", atr: "〰️", news: "📰", liq: "💧", tokenomics: "🪙", unlock: "🔐", infra: "🌉", corr: "🕸️", social: "📣", source: "🕵️", onchain: "🐋", rsi2: "🌡️", news2: "📰", whale: "🐳" };
const STANCE: Record<string, string> = { bull: "border-emerald-400/60 bg-emerald-400/10", bear: "border-rose-400/60 bg-rose-500/10", risk: "border-amber-300/60 bg-amber-300/10", neutral: "border-white/10 bg-white/5" };
async function sha(t: string) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join(""); }

export function AnalystDesk({ onEnd }: MechProps) {
  const N = 3;
  const [r, setR] = useState(0); const [s, setS] = useState<Scn | null>(null); const [res, setRes] = useState<Res | null>(null); const [ok, setOk] = useState<boolean | null>(null);
  const [qs, setQs] = useState<number[]>([]); const [err, setErr] = useState(""); const [open, setOpen] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const fb = useFeedback();
  const load = async () => { setS(null); setRes(null); setOk(null); setOpen(null); try { const x = await fetch("/api/scenario", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "practice" }) }); const j = await x.json(); if (!x.ok) throw new Error(j.error); setS(j); } catch (e) { setErr((e as Error).message); } };
  useEffect(() => { load(); }, []);
  const decide = async (option: string) => {
    if (!s || busy) return; setBusy(true);
    const stop = option === "short" ? s.suggestedStop?.short : s.suggestedStop?.long;
    const stopPct = clamp(stop ?? ((s.atr * 1.5) / s.entry) * 100, 0.3, 12);
    const x = await fetch("/api/commit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ scenarioId: s.id, option, stopPct, targetR: 2.5, riskPct: 1, confidence: 75 }) });
    const j = (await x.json()) as Res; setRes(j); setBusy(false);
    const q = [...qs, j.quality]; setQs(q); fb.show(j.quality >= 60 ? "good" : "bad", `Q ${j.quality}`);
    setOk((await sha(JSON.stringify({ id: s.id, future: j.future }))) === j.futureHash);
  };
  const next = () => { if (r + 1 >= N) { const avg = qs.reduce((a, b) => a + b, 0) / qs.length; onEnd({ score: Math.round(avg), lesson: "Решение оценивается по процессу, а не по исходу.", stats: [["Средний Q", `${Math.round(avg)}`], ["Будущее", "🔒 на сервере"]] }); } else { setR(r + 1); load(); } };
  if (err) return <div className="h-full grid place-items-center text-rose-300">{err}</div>;
  if (!s) return <div className="h-full grid place-items-center"><div className="text-5xl anim-spin">🧭</div></div>;
  return (
    <div className="flex flex-col h-full gap-2">
      {fb.node}
      <Hud left={<Dots i={r} n={N} />} center={<span>{s.asset} · {s.timeframe}</span>} right={<Pill tone={ok ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10"}>{ok ? "🔏 ✓" : "🔒"}</Pill>} />
      <CandleChart candles={s.candles} ghost={res?.future} height={230} lines={s.levels.map((l) => ({ y: l.price, color: "#7aa2ff", dash: true }))} />
      <div className="grid grid-cols-4 gap-1.5">
        {s.signals.map((g) => (
          <button key={g.key + g.label} onClick={() => { fx.tap(); setOpen(open === g.label ? null : g.label); }} className={`aspect-square rounded-2xl border-2 grid place-items-center text-3xl ${g.hidden ? "opacity-30" : STANCE[g.stance]}`}>{g.hidden ? "❔" : SIG_ICON[g.key] ?? "•"}</button>
        ))}
      </div>
      <div className="min-h-12 rounded-2xl bg-white/5 px-3 py-2 text-sm">{open ? (() => { const g = s.signals.find((x) => x.label === open)!; return <><b>{g.label}:</b> {g.value}</>; })() : <span className="opacity-40">Тапни источник</span>}</div>
      <div className="flex-1" />
      {!res ? (
        <div className="grid grid-cols-4 gap-2">
          <Big tone="green" disabled={busy} onClick={() => decide("long_now")}>▲</Big>
          <Big tone="blue" disabled={busy} onClick={() => decide("long_retest")}>↩︎▲</Big>
          <Big tone="red" disabled={busy} onClick={() => decide("short")}>▼</Big>
          <Big tone="ghost" disabled={busy} onClick={() => decide("no_trade")}>⏸</Big>
        </div>
      ) : (
        <div className="space-y-2 anim-in">
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"><span className="font-black">{res.archetypeRu}</span><span className="text-sm opacity-70">лучше: {res.bestRu}</span></div>
          <Big onClick={next}>Дальше</Big>
        </div>
      )}
    </div>
  );
}

// ---------------- Lenses (indicator cards) ----------------
const LENSES = [{ id: "trend", icon: "〽️", name: "SMA 20" }, { id: "trig", icon: "🌡️", name: "RSI" }, { id: "risk", icon: "📐", name: "ATR" }] as const;
export function Lenses({ onEnd }: MechProps) {
  const rounds = useMemo(() => shuffle([0, 1, 2, 3, 4]).map((k) => { const dir = pick([1, -1]); const degraded = k === 0; const c = genCandles([...seg(30, dir * 0.006), ...seg(6, degraded ? -dir * 0.004 : dir * 0.004)], { vol: 0.012 }); return { dir, degraded, c }; }), []);
  const [i, setI] = useState(0); const [on, setOn] = useState<string[]>([]); const [pts, setPts] = useState(0); const [done, setDone] = useState(false);
  const fb = useFeedback(); const rd = rounds[i];
  const R = rsi(rd.c); const A = atr(rd.c); const last = rd.c[rd.c.length - 1].c;
  const decide = (d: 1 | -1 | 0) => {
    const correct = d === rd.dir; const conf = on.length >= 2; const p = (correct ? 14 : 0) + (conf ? 6 : 0); const tot = pts + p; setPts(tot); setDone(true);
    fb.show(correct ? "good" : "bad", rd.degraded && correct ? "Структура > линза" : !conf ? "Нужны 2 линзы" : undefined);
    setTimeout(() => { if (i + 1 >= rounds.length) onEnd({ score: tot, lesson: "Индикатор — линза, а не кнопка. Структура главнее.", stats: [["Очки", `${tot}`]] }); else { setI(i + 1); setOn([]); setDone(false); } }, 1200);
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={i} n={rounds.length} />} center={<Pill>🔭 {on.length}/3</Pill>} right={<Pill tone="bg-amber-300/20 text-amber-200">{pts}</Pill>} />
      <CandleChart key={i} candles={rd.c} height={250} overlay={on.includes("trend") ? [sma(rd.c, 20)] : []} bands={on.includes("risk") ? [{ y1: last - A, y2: last + A, color: "#c792ea22" }] : []} />
      <div className="h-14 rounded-2xl bg-white/5 relative overflow-hidden">
        {on.includes("trig") ? (<><div className="absolute inset-y-0 left-[70%] right-0 bg-rose-500/15" /><div className="absolute inset-y-0 left-0 w-[30%] bg-emerald-400/15" /><div className="absolute top-2 bottom-2 w-1.5 rounded bg-white transition-all" style={{ left: `${R}%` }} /><span className="absolute right-3 top-4 font-black">RSI {R.toFixed(0)}</span></>) : <div className="h-full grid place-items-center opacity-30 text-sm">слот триггера пуст</div>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {LENSES.map((l) => (
          <button key={l.id} disabled={done} onClick={() => { fx.coin(); setOn(on.includes(l.id) ? on.filter((x) => x !== l.id) : [...on, l.id]); }}
            className={`h-24 rounded-3xl flex flex-col items-center justify-center font-black transition ${on.includes(l.id) ? "bg-gradient-to-br from-amber-300 to-pink-400 text-[#05080f] -translate-y-1 shadow-lg shadow-amber-300/30" : "bg-white/10"}`}>
            <span className="text-3xl">{l.icon}</span><span className="text-xs">{l.name}</span>
          </button>
        ))}
      </div>
      <div className="flex-1" />
      <div className="grid grid-cols-3 gap-2"><Big tone="red" disabled={done} onClick={() => decide(-1)}>▼</Big><Big tone="ghost" disabled={done} onClick={() => decide(0)}>⏸</Big><Big tone="green" disabled={done} onClick={() => decide(1)}>▲</Big></div>
    </div>
  );
}

// ---------------- M19 Market replay ----------------
export function Replay({ onEnd, paused }: MechProps) {
  const all = useMemo(() => genCandles(Array.from({ length: 90 }, (_, i) => (Math.floor(i / 18) % 2 === 0 ? 0.004 : -0.004) + rand(-0.006, 0.006)), { vol: 0.012 }), []);
  const [idx, setIdx] = useState(30); const [pos, setPos] = useState<null | { side: 1 | -1; entry: number; stop: number }>(null);
  const [eq, setEq] = useState(0); const [trades, setTrades] = useState(0); const [acc, setAcc] = useState(0); const fb = useFeedback();
  const fee = 0.1; const cur = all[Math.min(idx, all.length - 1)];
  const close = (price: number, why?: string) => { if (!pos) return; const riskD = Math.abs(pos.entry - pos.stop); const R = ((price - pos.entry) * pos.side) / riskD - (fee * 2 * pos.entry) / 100 / riskD; setEq((e) => e + R); setPos(null); fb.show(R > 0 ? "good" : "bad", `${why ?? ""}${R > 0 ? "+" : ""}${R.toFixed(1)}R`); };
  useLoop(() => {
    if (acc + 1 < 10) { setAcc(acc + 1); return; }
    setAcc(0);
    const n = idx + 1; const c = all[n];
    if (c && pos && ((pos.side === 1 && c.l <= pos.stop) || (pos.side === -1 && c.h >= pos.stop))) close(pos.stop, "SL ");
    if (n >= all.length) { const score = clamp(50 + eq * 12 - Math.max(0, trades - 6) * 6, 0, 100); onEnd({ score: Math.round(score), lesson: "Каждая сделка стоит комиссию. Меньше, но лучше.", stats: [["Итог", `${eq >= 0 ? "+" : ""}${eq.toFixed(1)}R`], ["Сделок", `${trades}`]] }); }
    setIdx(Math.min(n, all.length));
  }, !paused && idx < all.length);
  const open = (side: 1 | -1) => { if (pos) return; const a = atr(all.slice(0, idx)); setPos({ side, entry: cur.c, stop: cur.c - side * a * 1.5 }); setTrades(trades + 1); fx.coin(); };
  const unreal = pos ? ((cur.c - pos.entry) * pos.side) / Math.abs(pos.entry - pos.stop) : 0;
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Pill>🔁 {trades}</Pill>} center={<span className={`text-2xl font-black tabular-nums ${eq >= 0 ? "text-emerald-300" : "text-rose-400"}`}>{eq >= 0 ? "+" : ""}{eq.toFixed(1)}R</span>} right={<Pill>{Math.round((idx / all.length) * 100)}%</Pill>} />
      <div className="h-1.5 bg-white/10 rounded-full"><div className="h-full bg-white rounded-full" style={{ width: `${(idx / all.length) * 100}%` }} /></div>
      <div className="flex-1 grid place-items-center"><CandleChart candles={all.slice(Math.max(0, idx - 40), idx)} height={320} lines={pos ? [{ y: pos.entry, color: "#fff", label: pos.side === 1 ? "L" : "S" }, { y: pos.stop, color: "#ff5c7a", label: "SL" }] : []} /></div>
      {pos && <div className={`text-center text-xl font-black ${unreal >= 0 ? "text-emerald-300" : "text-rose-400"}`}>{unreal >= 0 ? "+" : ""}{unreal.toFixed(2)}R</div>}
      {!pos ? <div className="grid grid-cols-2 gap-3"><Big tone="red" onClick={() => open(-1)}>▼ Шорт</Big><Big tone="green" onClick={() => open(1)}>▲ Лонг</Big></div> : <Big tone="gold" onClick={() => close(cur.c)}>✋ Закрыть</Big>}
    </div>
  );
}

// ---------------- M20 Order book ----------------
type Book = { asks: { p: number; q: number }[]; bids: { p: number; q: number }[]; wall: { side: "ask" | "bid"; p: number } };
function makeBook(): Book {
  const mid = ri(640, 660) * 100; const tick = 10;
  const asks = Array.from({ length: 6 }, (_, i) => ({ p: mid + tick * (i + 1), q: +rand(0.2, 3).toFixed(2) }));
  const bids = Array.from({ length: 6 }, (_, i) => ({ p: mid - tick * i, q: +rand(0.2, 3).toFixed(2) }));
  const side = pick(["ask", "bid"] as const); const k = ri(2, 5); const arr = side === "ask" ? asks : bids; arr[k].q = +rand(18, 30).toFixed(1);
  return { asks, bids, wall: { side, p: arr[k].p } };
}
const TASKS = [{ t: "Лучший BID", k: "bid" }, { t: "Лучший ASK", k: "ask" }, { t: "Стена", k: "wall" }, { t: "Лучший ASK", k: "ask" }, { t: "Стена", k: "wall" }, { t: "Стена = гарантия?", k: "spoof" }] as const;
export function OrderBook({ onEnd }: MechProps) {
  const [i, setI] = useState(0); const [book, setBook] = useState(makeBook); const [ok, setOk] = useState(0); const [vanish, setVanish] = useState(false); const fb = useFeedback();
  const task = TASKS[i];
  useEffect(() => { if (task.k === "spoof") { const t = setTimeout(() => setVanish(true), 1200); return () => clearTimeout(t); } }, [task.k]);
  const answer = (good: boolean) => {
    const o = ok + (good ? 1 : 0); setOk(o); fb.show(good ? "good" : "bad");
    setTimeout(() => { if (i + 1 >= TASKS.length) onEnd({ score: Math.round((o / TASKS.length) * 100), lesson: "Стена в стакане может исчезнуть. Это не гарантия.", stats: [["Верно", `${o}/${TASKS.length}`]] }); else { setI(i + 1); if (i % 2 === 1) setBook(makeBook()); setVanish(false); } }, 600);
  };
  const tap = (side: "ask" | "bid", p: number) => {
    if (task.k === "spoof") return;
    if (task.k === "bid") answer(side === "bid" && p === book.bids[0].p);
    else if (task.k === "ask") answer(side === "ask" && p === book.asks[0].p);
    else answer(side === book.wall.side && p === book.wall.p);
  };
  const maxQ = Math.max(...book.asks.map((a) => a.q), ...book.bids.map((b) => b.q));
  const Row = ({ side, p, q }: { side: "ask" | "bid"; p: number; q: number }) => {
    const isWall = side === book.wall.side && p === book.wall.p; const qq = isWall && vanish ? 0.3 : q;
    return (
      <button onClick={() => tap(side, p)} className="relative h-10 w-full rounded-lg overflow-hidden flex items-center justify-between px-3 font-black tabular-nums active:scale-[.98]">
        <div className={`absolute inset-y-0 right-0 transition-all duration-700 ${side === "ask" ? "bg-rose-500/35" : "bg-emerald-400/35"}`} style={{ width: `${(qq / maxQ) * 100}%` }} />
        <span className={`relative ${side === "ask" ? "text-rose-300" : "text-emerald-300"}`}>{p.toLocaleString("ru")}</span><span className="relative">{qq.toFixed(1)}</span>
      </button>
    );
  };
  return (
    <div className="flex flex-col h-full gap-2">
      {fb.node}
      <Hud left={<Dots i={i} n={TASKS.length} />} center={<Pill tone="bg-sky-400/20 text-sky-200">👉 {task.t}</Pill>} right={<Pill tone="bg-emerald-400/20 text-emerald-200">✓ {ok}</Pill>} />
      <div className="flex-1 flex flex-col justify-center gap-1">
        {[...book.asks].reverse().map((a) => <Row key={"a" + a.p} side="ask" p={a.p} q={a.q} />)}
        <div className="text-center text-xs opacity-50 py-1">спред {book.asks[0].p - book.bids[0].p}</div>
        {book.bids.map((b) => <Row key={"b" + b.p} side="bid" p={b.p} q={b.q} />)}
      </div>
      {task.k === "spoof" && <div className="grid grid-cols-2 gap-3"><Big tone="ghost" onClick={() => answer(false)}>Да</Big><Big onClick={() => answer(true)}>Нет</Big></div>}
    </div>
  );
}

// ---------------- M21 Scenario drill ----------------
const DRILLS: { title: string; steps: { icon: string; ev: string; opts: [string, string, number][] }[] }[] = [
  { title: "Анлок", steps: [
    { icon: "🔐", ev: "Через 5 дней анлок 15%", opts: [["Держать", "🤲", 20], ["Сократить", "✂️", 100], ["Докупить", "➕", 0]] },
    { icon: "📉", ev: "Цена −8% за 2 дня", opts: [["Усреднить", "➕", 0], ["По стопу", "🧯", 100], ["Убрать стоп", "🙈", 0]] },
    { icon: "🌫️", ev: "Анлок прошёл, боковик", opts: [["Ждать структуру", "⏳", 100], ["Войти сразу", "🚀", 20], ["Шорт x20", "💣", 0]] },
  ] },
  { title: "Каскад", steps: [
    { icon: "🎈", ev: "Funding 0.12%, OI +40%", opts: [["Лонг x10", "🚀", 0], ["Вне рынка", "⏸", 100], ["Лонг x2", "📈", 20]] },
    { icon: "💥", ev: "−15%: ликвидации лонгов", opts: [["Ловить нож", "🔪", 0], ["Ждать стабилизации", "⏳", 100], ["Шорт на дне", "📉", 20]] },
    { icon: "🧱", ev: "HL сформирован, объём растёт", opts: [["Лонг от ретеста", "↩︎", 100], ["Игнор", "🙈", 20], ["Шорт", "📉", 0]] },
  ] },
];
export function Drill({ onEnd }: MechProps) {
  const [d, setD] = useState(0); const [s, setS] = useState(0); const [pts, setPts] = useState<number[]>([]); const [chosen, setChosen] = useState<number | null>(null); const fb = useFeedback();
  const dr = DRILLS[d]; const st = dr.steps[s];
  const choose = (k: number) => {
    if (chosen !== null) return; setChosen(k); const p = st.opts[k][2]; const all = [...pts, p]; setPts(all); fb.show(p >= 60 ? "good" : "bad");
    setTimeout(() => { setChosen(null); if (s + 1 < dr.steps.length) setS(s + 1); else if (d + 1 < DRILLS.length) { setD(d + 1); setS(0); } else onEnd({ score: Math.round(all.reduce((a, b) => a + b, 0) / all.length), lesson: "Сценарий раскрывается постепенно — решай по плану, не по панике.", stats: [["Шагов", `${all.length}`]] }); }, 900);
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={d * 3 + s} n={6} />} center={<Pill>{dr.title}</Pill>} />
      <div className="flex items-center gap-2 px-2">{dr.steps.map((x, k) => <div key={k} className={`flex-1 h-12 rounded-xl grid place-items-center text-2xl ${k < s ? "bg-emerald-400/20" : k === s ? "bg-white/15 ring-2 ring-white" : "bg-white/5 opacity-40"}`}>{k <= s ? x.icon : "?"}</div>)}</div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 anim-in" key={`${d}${s}`}>
        <div className="text-8xl">{st.icon}</div><div className="text-2xl font-black text-center">{st.ev}</div>
      </div>
      <div className="grid gap-2">{st.opts.map(([t, ic, p], k) => <button key={t} onClick={() => choose(k)} className={`min-h-14 rounded-2xl px-4 flex items-center gap-3 font-black transition ${chosen === null ? "bg-white/10" : p >= 60 ? "bg-emerald-400 text-[#05080f]" : chosen === k ? "bg-rose-500" : "bg-white/5 opacity-50"}`}><span className="text-2xl">{ic}</span>{t}</button>)}</div>
    </div>
  );
}
