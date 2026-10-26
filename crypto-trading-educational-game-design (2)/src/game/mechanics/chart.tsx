"use client";
import { useMemo, useRef, useState } from "react";
import { Big, CandleChart, Dots, Hud, Pill, TimeBar, atr, clamp, fx, genCandles, pick, rand, ri, rsi, seg, shuffle, useCountdown, useFeedback, type Candle, type MechProps } from "../kit";

// ---------------- M05 Bull / Bear swipe ----------------
const NEWS: { t: string; icon: string; a: "bull" | "bear" | "noise" }[] = [
  { t: "Фонд подал заявку на спотовый ETF", icon: "🏦", a: "bull" }, { t: "Биржа взломана, вывод остановлен", icon: "🔓", a: "bear" },
  { t: "Инфлюенсер: «100x скоро»", icon: "📣", a: "noise" }, { t: "Анлок 18% предложения через 3 дня", icon: "🔐", a: "bear" },
  { t: "3 недели отток BTC с бирж", icon: "🐋", a: "bull" }, { t: "Мем-токен в трендах Twitter", icon: "🐸", a: "noise" },
  { t: "ФРС неожиданно снизила ставку", icon: "🏛️", a: "bull" }, { t: "Регулятор подал иск к эмитенту", icon: "⚖️", a: "bear" },
  { t: "«Аналитики ждут обвала» — аноним", icon: "🕶️", a: "noise" }, { t: "Протокол сжигает 30% эмиссии", icon: "🔥", a: "bull" },
  { t: "Кит перевёл BTC между своими кошельками", icon: "🔁", a: "noise" }, { t: "Funding 0.15% — толпа в лонгах", icon: "🎈", a: "bear" },
];
export function Swipe({ onEnd }: MechProps) {
  const deck = useMemo(() => shuffle(NEWS).slice(0, 10), []);
  const [i, setI] = useState(0); const [ok, setOk] = useState(0); const [d, setD] = useState({ x: 0, y: 0 }); const st = useRef<{ x: number; y: number } | null>(null);
  const fb = useFeedback();
  const ans = (a: "bull" | "bear" | "noise") => {
    const r = deck[i].a === a; const o = ok + (r ? 1 : 0); setOk(o); fb.show(r ? "good" : "bad", r ? undefined : deck[i].a === "noise" ? "Шум" : deck[i].a === "bull" ? "Бык" : "Медведь"); setD({ x: 0, y: 0 });
    if (i + 1 >= deck.length) setTimeout(() => onEnd({ score: o * 10, lesson: "Заголовок — повод посмотреть, а не нажать.", stats: [["Верно", `${o}/10`]] }), 500); else setI(i + 1);
  };
  const c = deck[i];
  const tint = d.x > 40 ? "from-emerald-500/50" : d.x < -40 ? "from-rose-500/50" : d.y < -40 ? "from-amber-400/50" : "from-sky-500/30";
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={i} n={10} />} right={<Pill tone="bg-emerald-400/20 text-emerald-200">✓ {ok}</Pill>} />
      <div className="text-center text-amber-200 font-black text-sm">↑ ШУМ</div>
      <div className="flex-1 grid place-items-center relative">
        {deck[i + 1] && <div className="absolute w-[86%] aspect-[3/4] max-h-[50vh] rounded-[28px] bg-white/5 scale-95 translate-y-3" />}
        <div key={i} className={`relative w-[90%] aspect-[3/4] max-h-[52vh] rounded-[28px] bg-gradient-to-br ${tint} to-[#0b1222] border border-white/10 flex flex-col items-center justify-center gap-4 p-6 text-center touch-none anim-in`}
          style={{ transform: `translate(${d.x}px, ${Math.min(0, d.y)}px) rotate(${d.x / 16}deg)` }}
          onPointerDown={(e) => { st.current = { x: e.clientX, y: e.clientY }; }}
          onPointerMove={(e) => { if (st.current) setD({ x: e.clientX - st.current.x, y: e.clientY - st.current.y }); }}
          onPointerUp={() => { st.current = null; if (d.x > 80) ans("bull"); else if (d.x < -80) ans("bear"); else if (d.y < -80) ans("noise"); else setD({ x: 0, y: 0 }); }}>
          <div className="text-7xl">{c.icon}</div><div className="text-2xl font-black leading-tight">{c.t}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2"><Big tone="red" onClick={() => ans("bear")}>🐻</Big><Big tone="gold" onClick={() => ans("noise")}>🔇</Big><Big tone="green" onClick={() => ans("bull")}>🐂</Big></div>
    </div>
  );
}

// ---------------- M06 Baskets ----------------
const REGIMES = [{ id: "up", icon: "📈", name: "Тренд ↑" }, { id: "down", icon: "📉", name: "Тренд ↓" }, { id: "range", icon: "〰️", name: "Боковик" }] as const;
export function Baskets({ onEnd }: MechProps) {
  const items = useMemo(() => shuffle([...Array(3)].flatMap((_, k) => REGIMES.map((r) => ({ id: `${r.id}${k}`, r: r.id, c: r.id === "range" ? genCandles(Array.from({ length: 28 }, (_, i) => (i % 6 < 3 ? 0.009 : -0.009))) : genCandles(seg(28, (r.id === "up" ? 1 : -1) * rand(0.004, 0.008)), { vol: 0.02 }) })))), []);
  const [i, setI] = useState(0); const [ok, setOk] = useState(0); const [fly, setFly] = useState<string | null>(null);
  const fb = useFeedback();
  const drop = (r: string) => {
    const good = items[i].r === r; const o = ok + (good ? 1 : 0); setOk(o); fb.show(good ? "good" : "bad"); setFly(r);
    setTimeout(() => { setFly(null); if (i + 1 >= items.length) onEnd({ score: Math.round((o / items.length) * 100), lesson: "Сначала режим рынка — потом стратегия.", stats: [["Верно", `${o}/${items.length}`]] }); else setI(i + 1); }, 350);
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={i} n={items.length} />} right={<Pill tone="bg-emerald-400/20 text-emerald-200">✓ {ok}</Pill>} />
      <div className="flex-1 grid place-items-center">
        <div key={i} className={`w-full transition-all duration-300 ${fly ? "scale-50 opacity-0 translate-y-40" : "anim-in"}`}><CandleChart candles={items[i].c} height={240} volume={false} /></div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {REGIMES.map((r) => (
          <button key={r.id} onClick={() => drop(r.id)} className={`h-28 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-1 font-black active:scale-95 ${fly === r.id ? "border-white bg-white/15" : "border-white/20 bg-white/5"}`}>
            <span className="text-4xl">🧺</span><span className="text-sm">{r.icon} {r.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------- M07 Pattern hunt ----------------
export function PatternHunt({ onEnd }: MechProps) {
  const make = () => { const n = 36; const k = ri(8, n - 4); const vols = Array.from({ length: n }, (_, i) => (i === k ? 4.2 : 1)); const d = Array.from({ length: n }, (_, i) => (i === k ? pick([0.03, -0.03]) : (Math.random() - 0.5) * 0.01)); return { c: genCandles(d, { vols }), k }; };
  const [r, setR] = useState(0); const [s, setS] = useState(make); const [pts, setPts] = useState(0); const [tapped, setTapped] = useState<number | null>(null);
  const fb = useFeedback(); const N = 5;
  const [t, setT] = useCountdown(8, tapped === null, () => tap(-99));
  function tap(i: number) {
    if (tapped !== null) return; setTapped(i); const dist = Math.abs(i - s.k); const p = dist === 0 ? 20 : dist === 1 ? 12 : 0;
    const total = pts + p; setPts(total); fb.show(p ? "good" : "bad", p === 20 ? "🎯" : undefined);
    setTimeout(() => { if (r + 1 >= N) onEnd({ score: total, lesson: "Объём — след участия крупных денег.", stats: [["Точность", `${total}/100`]] }); else { setR(r + 1); setS(make()); setTapped(null); setT(8); } }, 900);
  }
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={r} n={N} />} center={<span className="text-base">Тапни аномальный объём</span>} right={<Pill tone="bg-amber-300/20 text-amber-200">{pts}</Pill>} />
      <TimeBar t={t} max={8} />
      <div className="flex-1 grid place-items-center"><CandleChart key={r} candles={s.c} height={300} onTapCandle={tap} highlight={tapped !== null ? [s.k] : []} /></div>
    </div>
  );
}

// ---------------- M08 Zones ----------------
export function Zones({ onEnd }: MechProps) {
  const make = () => {
    const lvl = 100; const out: Candle[] = []; let p = 92;
    for (let i = 0; i < 40; i++) { const o = p; const target = i % 10 < 5 ? lvl * rand(0.985, 0.998) : lvl * rand(0.9, 0.94); const c = o + (target - o) * 0.45; const h = i % 10 === 4 ? lvl * rand(1.0, 1.006) : Math.max(o, c) * rand(1, 1.008); out.push({ o, c, h, l: Math.min(o, c) * rand(0.992, 1), v: 1 }); p = c; }
    return { c: out, lvl };
  };
  const [r, setR] = useState(0); const [s, setS] = useState(make); const [y, setY] = useState(94); const [done, setDone] = useState(false); const [pts, setPts] = useState(0);
  const fb = useFeedback(); const N = 4;
  const lock = () => {
    const a = atr(s.c); const err = Math.abs(y - s.lvl) / a; const p = Math.round(clamp(25 - err * 12, 0, 25)); const total = pts + p; setPts(total); setDone(true);
    fb.show(p >= 15 ? "good" : "bad", `${(err).toFixed(1)} ATR`);
    setTimeout(() => { if (r + 1 >= N) onEnd({ score: total, lesson: "Уровень — зона касаний, а не одна цена.", stats: [["Точность", `${total}/100`]] }); else { setR(r + 1); setS(make()); setDone(false); setY(94); } }, 1100);
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={r} n={N} />} center={<span>Тяни линию к сопротивлению</span>} right={<Pill tone="bg-amber-300/20 text-amber-200">{pts}</Pill>} />
      <div className="flex-1 grid place-items-center"><CandleChart candles={s.c} height={320} volume={false} onDragY={done ? undefined : setY} domain={[88, 103]}
        lines={[{ y, color: "#ffd166", label: "LVL" }, ...(done ? [{ y: s.lvl, color: "#2ee6a6", dash: true }] : [])]} /></div>
      <Big disabled={done} onClick={lock}>Зафиксировать</Big>
    </div>
  );
}

// ---------------- M09 Candle builder ----------------
export function CandleBuilder({ onEnd }: MechProps) {
  const make = () => { const o = ri(20, 80); const c = clamp(o + ri(-30, 30), 10, 90); const h = Math.min(98, Math.max(o, c) + ri(2, 12)); const l = Math.max(2, Math.min(o, c) - ri(2, 12)); return { o, h, l, c }; };
  const [r, setR] = useState(0); const [tgt, setTgt] = useState(make); const [v, setV] = useState({ o: 50, h: 70, l: 30, c: 55 });
  const [sel, setSel] = useState<"o" | "h" | "l" | "c">("o"); const [pts, setPts] = useState(0); const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null); const fb = useFeedback(); const N = 3;
  const setFrom = (clientY: number) => { const b = ref.current!.getBoundingClientRect(); const val = Math.round(clamp(100 - ((clientY - b.top) / b.height) * 100, 0, 100)); setV((p) => ({ ...p, [sel]: val })); };
  const check = () => {
    const err = (["o", "h", "l", "c"] as const).reduce((a, k) => a + Math.abs(v[k] - tgt[k]), 0); const p = Math.round(clamp(33 - err * 0.8, 0, 33)); const tot = pts + p; setPts(tot); setDone(true); fb.show(p > 20 ? "good" : "bad", `±${err}`);
    setTimeout(() => { if (r + 1 >= N) onEnd({ score: Math.min(100, tot + 1), lesson: "Тело — кто победил. Тени — куда не пустили.", stats: [["Точность", `${tot}`]] }); else { setR(r + 1); setTgt(make()); setDone(false); } }, 1200);
  };
  const Cnd = ({ x, col, ghost }: { x: typeof v; col: string; ghost?: boolean }) => (
    <>
      <div className="absolute left-1/2 w-1 -translate-x-1/2 rounded" style={{ top: `${100 - x.h}%`, bottom: `${x.l}%`, background: col, opacity: ghost ? 0.5 : 1 }} />
      <div className="absolute left-1/2 w-16 -translate-x-1/2 rounded-md" style={{ top: `${100 - Math.max(x.o, x.c)}%`, bottom: `${Math.min(x.o, x.c)}%`, background: col, opacity: ghost ? 0.35 : 1, minHeight: 3 }} />
    </>
  );
  const up = v.c >= v.o;
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={r} n={N} />} right={<Pill tone="bg-amber-300/20 text-amber-200">{pts}</Pill>} />
      <div className="grid grid-cols-4 gap-2 text-center">
        {(["o", "h", "l", "c"] as const).map((k) => (
          <button key={k} onClick={() => { fx.tap(); setSel(k); }} className={`rounded-2xl py-2 font-black ${sel === k ? "bg-white text-[#05080f]" : "bg-white/10"}`}>
            <div className="text-xs opacity-60">{k.toUpperCase()}</div><div className="text-xl tabular-nums">{tgt[k]}</div>
          </button>
        ))}
      </div>
      <div ref={ref} className="relative flex-1 rounded-3xl bg-[#0b1222] touch-none" onPointerDown={(e) => { if (!done) { setFrom(e.clientY); (e.target as Element).setPointerCapture?.(e.pointerId); } }} onPointerMove={(e) => { if (e.buttons && !done) setFrom(e.clientY); }}>
        {[0, 25, 50, 75, 100].map((g) => <div key={g} className="absolute left-0 right-0 border-t border-white/5 text-[10px] text-white/30 pl-2" style={{ top: `${100 - g}%` }}>{g}</div>)}
        {done && <Cnd x={tgt} col="#ffffff" ghost />}
        <Cnd x={v} col={up ? "#2ee6a6" : "#ff5c7a"} />
        <div className="absolute right-2 h-0.5 w-10 bg-amber-300" style={{ top: `${100 - v[sel]}%` }} />
      </div>
      <Big disabled={done} onClick={check}>Готово</Big>
    </div>
  );
}

// ---------------- M10 Chart jigsaw ----------------
export function Jigsaw({ onEnd }: MechProps) {
  const make = (r: number) => {
    const dir = r % 2 === 0 ? 1 : -1; const full = genCandles(Array.from({ length: 32 }, (_, i) => dir * (i % 8 < 5 ? 0.009 : -0.006)), { vol: 0.006 });
    const pieces = [0, 1, 2, 3].map((k) => ({ k, c: full.slice(k * 8, k * 8 + 8) }));
    const decoy = r >= 1 ? [{ k: -1, c: genCandles(seg(8, -dir * 0.012), { start: full[16].c }) }] : [];
    return { pieces, pool: shuffle([...pieces, ...decoy]) };
  };
  const [r, setR] = useState(0); const [s, setS] = useState(() => make(0)); const [got, setGot] = useState<number[]>([]); const [err, setErr] = useState(0);
  const fb = useFeedback(); const N = 3;
  const tap = (k: number) => {
    if (k === got.length) { const g = [...got, k]; setGot(g); fx.coin(); if (g.length === 4) { fb.show("good", "✓"); setTimeout(() => { if (r + 1 >= N) onEnd({ score: Math.max(0, 100 - err * 15), lesson: "HH→HL→HH: тренд — это последовательность.", stats: [["Ошибок", `${err}`]] }); else { setR(r + 1); setS(make(r + 1)); setGot([]); } }, 700); } }
    else { setErr(err + 1); fb.show("bad", k === -1 ? "Обманка" : undefined); }
  };
  const assembled = got.flatMap((k) => s.pieces[k].c);
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={r} n={N} />} center={<span>Собери по времени</span>} right={<Pill tone="bg-rose-500/20 text-rose-200">✗ {err}</Pill>} />
      <div className="h-44 rounded-2xl border border-dashed border-white/15 overflow-hidden">{assembled.length > 0 && <CandleChart candles={assembled} height={170} volume={false} />}</div>
      <div className="flex-1 grid grid-cols-2 gap-2 content-center">
        {s.pool.filter((p) => !got.includes(p.k)).map((p) => (
          <button key={p.k} onClick={() => tap(p.k)} className="rounded-2xl bg-white/5 p-1 active:scale-95 anim-in"><CandleChart candles={p.c} height={110} volume={false} /></button>
        ))}
      </div>
    </div>
  );
}

// ---------------- M11 Estimate ----------------
export function Estimate({ onEnd }: MechProps) {
  const rounds = useMemo(() => shuffle(["rsi", "rsi", "rsi", "atr", "atr"] as const).map((kind) => {
    const c = genCandles(Array.from({ length: 30 }, () => rand(-0.012, 0.012) + pick([0.006, -0.006, 0])), { vol: rand(0.01, 0.04) });
    const truth = kind === "rsi" ? rsi(c) : (atr(c) / c[c.length - 1].c) * 100; return { kind, c, truth };
  }), []);
  const [i, setI] = useState(0); const [val, setVal] = useState(50); const [shown, setShown] = useState(false); const [pts, setPts] = useState(0);
  const fb = useFeedback(); const rd = rounds[i]; const max = rd.kind === "rsi" ? 100 : 6;
  const lock = () => {
    const err = Math.abs(val - rd.truth) / max; const p = Math.round(clamp(20 - err * 80, 0, 20)); const tot = pts + p; setPts(tot); setShown(true); fb.show(p >= 12 ? "good" : "bad", `${rd.truth.toFixed(rd.kind === "rsi" ? 0 : 1)}`);
    setTimeout(() => { if (i + 1 >= rounds.length) onEnd({ score: tot, lesson: "Глаз тоже калибруется — сверяй с числом.", stats: [["Точность", `${tot}/100`]] }); else { setI(i + 1); setShown(false); setVal(rounds[i + 1].kind === "rsi" ? 50 : 3); } }, 1100);
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={i} n={rounds.length} />} center={<Pill tone="bg-sky-400/20 text-sky-200">{rd.kind === "rsi" ? "RSI(14)" : "ATR % цены"}</Pill>} right={<Pill tone="bg-amber-300/20 text-amber-200">{pts}</Pill>} />
      <div className="flex-1 grid place-items-center"><CandleChart key={i} candles={rd.c} height={280} /></div>
      <div className="text-center text-6xl font-black tabular-nums">{val.toFixed(rd.kind === "rsi" ? 0 : 1)}{shown && <span className="text-2xl text-emerald-300"> / {rd.truth.toFixed(rd.kind === "rsi" ? 0 : 1)}</span>}</div>
      <input type="range" min={0} max={max} step={rd.kind === "rsi" ? 1 : 0.1} value={val} onChange={(e) => setVal(Number(e.target.value))} className="w-full h-10 accent-white" />
      <Big disabled={shown} onClick={lock}>Зафиксировать</Big>
    </div>
  );
}

// ---------------- M16 Prediction + confidence (Brier) ----------------
export function Predict({ onEnd }: MechProps) {
  const N = 6;
  const make = () => { const dir = pick([1, -1]); const base = genCandles(seg(34, dir * rand(0.002, 0.006)), { vol: 0.015 }); const fut = genCandles(seg(8, (Math.random() < 0.68 ? dir : -dir) * 0.007), { start: base[base.length - 1].c, vol: 0.012 }); return { base, fut }; };
  const [r, setR] = useState(0); const [s, setS] = useState(make); const [up, setUp] = useState<boolean | null>(null); const [conf, setConf] = useState(70);
  const [reveal, setReveal] = useState(false); const [bs, setBs] = useState<number[]>([]);
  const fb = useFeedback();
  const lock = () => {
    const actualUp = s.fut[s.fut.length - 1].c > s.base[s.base.length - 1].c; const pUp = up ? conf / 100 : 1 - conf / 100; const b = (pUp - (actualUp ? 1 : 0)) ** 2;
    const all = [...bs, b]; setBs(all); setReveal(true); fb.show(b < 0.25 ? "good" : "bad", b.toFixed(2));
    setTimeout(() => { if (r + 1 >= N) { const m = all.reduce((a, x) => a + x, 0) / all.length; onEnd({ score: Math.round(clamp((0.35 - m) / 0.35, 0, 1) * 100), lesson: "Уверенность 90% должна сбываться 9 из 10.", stats: [["Brier", m.toFixed(3)], ["Монетка", "0.250"]] }); } else { setR(r + 1); setS(make()); setUp(null); setConf(70); setReveal(false); } }, 1400);
  };
  const emoji = conf < 60 ? "🤷" : conf < 75 ? "🙂" : conf < 90 ? "😎" : "🤑";
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={r} n={N} />} right={<Pill>Brier {bs.length ? (bs.reduce((a, x) => a + x, 0) / bs.length).toFixed(2) : "—"}</Pill>} />
      <div className="flex-1 grid place-items-center"><CandleChart candles={s.base} ghost={reveal ? s.fut : []} height={260} /></div>
      <div className="grid grid-cols-2 gap-3"><Big tone={up === false ? "red" : "ghost"} onClick={() => setUp(false)}>▼</Big><Big tone={up === true ? "green" : "ghost"} onClick={() => setUp(true)}>▲</Big></div>
      <div className="flex items-center gap-3"><span className="text-4xl w-12 text-center">{emoji}</span><input type="range" min={50} max={100} step={5} value={conf} onChange={(e) => setConf(Number(e.target.value))} className="flex-1 h-10 accent-white" /><span className="w-14 text-right text-xl font-black">{conf}%</span></div>
      <Big disabled={up === null || reveal} onClick={lock}>Ставка</Big>
    </div>
  );
}
export { TimeBar };
