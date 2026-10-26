"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Big, CandleChart, Dots, Hearts, Hud, Pill, TimeBar, clamp, fx, genCandles, pick, rand, seg, useCountdown, useFeedback, useLoop, type MechProps } from "../kit";

// ---------------- Б01 Candle Catcher ----------------
type Drop = { id: number; x: number; y: number; good: boolean; vol: boolean; sp: number };
export function Catcher({ onEnd, paused }: MechProps) {
  const [x, setX] = useState(50); const [drops, setDrops] = useState<Drop[]>([]); const [score, setScore] = useState(0); const [lives, setLives] = useState(3);
  const id = useRef(0); const box = useRef<HTMLDivElement>(null); const fb = useFeedback(); const ended = useRef(false);
  const end = (s: number, l: number) => { if (ended.current) return; ended.current = true; onEnd({ score: clamp(s * 4, 0, 100), lesson: "Зелёная свеча без объёма — ловушка.", stats: [["Поймано", `${s}`], ["Жизни", `${l}`]] }); };
  const [t] = useCountdown(35, !paused, () => end(score, lives));
  useLoop((dt) => {
    let s = score, l = lives;
    const next: Drop[] = [];
    for (const d of drops) {
      const ny = d.y + d.sp * dt * 60;
      if (ny >= 86 && ny <= 94 && Math.abs(d.x - x) < 12) { if (d.good && d.vol) { s++; fx.coin(); } else { l--; fb.show("bad", d.good ? "Без объёма!" : "🩸"); } continue; }
      if (ny < 105) next.push({ ...d, y: ny });
    }
    if (Math.random() < 0.06 + (35 - t) * 0.002) { id.current++; const good = Math.random() < 0.6; next.push({ id: id.current, x: rand(8, 92), y: -8, good, vol: good ? Math.random() < 0.7 : Math.random() < 0.5, sp: rand(0.8, 1.6) }); }
    setDrops(next); if (s !== score) setScore(s); if (l !== lives) setLives(l); if (l <= 0) end(s, l);
  }, !paused);
  const move = (cx: number) => { const b = box.current!.getBoundingClientRect(); setX(clamp(((cx - b.left) / b.width) * 100, 6, 94)); };
  return (
    <div className="flex flex-col h-full gap-2">
      {fb.node}
      <Hud left={<Hearts n={lives} />} center={<span className="text-2xl tabular-nums">{Math.ceil(t)}</span>} right={<Pill tone="bg-amber-300/20 text-amber-200">🕯️ {score}</Pill>} />
      <div ref={box} className="relative flex-1 rounded-3xl bg-gradient-to-b from-[#0b1222] to-[#140a2a] overflow-hidden touch-none" onPointerDown={(e) => move(e.clientX)} onPointerMove={(e) => move(e.clientX)}>
        {drops.map((d) => (
          <div key={d.id} className="absolute -translate-x-1/2 flex items-end gap-0.5" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
            <div className={`w-4 h-10 rounded ${d.good ? "bg-emerald-400" : "bg-rose-500"}`} />
            {d.vol && <div className="w-2 h-5 rounded bg-sky-300/80" />}
          </div>
        ))}
        <div className="absolute bottom-[4%] -translate-x-1/2 text-5xl" style={{ left: `${x}%` }}>🧺</div>
      </div>
      <div className="text-center text-xs opacity-60">🟩 + 🟦 объём = лови</div>
    </div>
  );
}

// ---------------- Б02 Spin (EV) ----------------
const WHEELS = [
  { sure: 40, seg: [100, 0, 50, 0, 100, 0] }, { sure: 30, seg: [60, 20, 60, 20, 60, 20] }, { sure: 70, seg: [200, 0, 0, 0, 100, 0] },
  { sure: 25, seg: [0, 0, 0, 0, 0, 300] }, { sure: 55, seg: [80, 40, 80, 40, 80, 40] },
];
const COLORS = ["#ff7ad9", "#7c5cff", "#00c2ff", "#2ee6a6", "#ffb020", "#ff4d6d"];
export function Spin({ onEnd }: MechProps) {
  const [i, setI] = useState(0); const [rot, setRot] = useState(0); const [res, setRes] = useState<string | null>(null); const [pts, setPts] = useState(0); const fb = useFeedback();
  const w = WHEELS[i]; const ev = w.seg.reduce((a, b) => a + b, 0) / w.seg.length;
  const decide = (spin: boolean) => {
    if (res) return; const good = spin ? ev >= w.sure : w.sure >= ev; const p = pts + (good ? 20 : 0); setPts(p);
    if (spin) { const k = Math.floor(Math.random() * 6); setRot(rot + 360 * 5 + (360 - k * 60 - 30)); fx.tap(); setTimeout(() => { setRes(`${w.seg[k]}`); fb.show(good ? "good" : "bad", `EV ${ev.toFixed(0)}`); }, 2200); }
    else { setRes(`${w.sure}`); fb.show(good ? "good" : "bad", `EV ${ev.toFixed(0)}`); }
    setTimeout(() => { if (i + 1 >= WHEELS.length) onEnd({ score: p, lesson: "Решай по матожиданию, а не по одному исходу.", stats: [["Верных решений", `${p / 20}/5`]] }); else { setI(i + 1); setRes(null); } }, spin ? 3300 : 1200);
  };
  const grad = w.seg.map((_, k) => `${COLORS[k]} ${k * 60}deg ${(k + 1) * 60}deg`).join(",");
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={i} n={WHEELS.length} />} right={<Pill tone="bg-amber-300/20 text-amber-200">{pts}</Pill>} />
      <div className="flex-1 grid place-items-center">
        <div className="relative w-72 h-72">
          <div className="absolute left-1/2 -top-2 -translate-x-1/2 z-10 text-3xl">🔻</div>
          <div className="w-full h-full rounded-full border-8 border-white/20 transition-transform duration-[2200ms] ease-out" style={{ background: `conic-gradient(${grad})`, transform: `rotate(${rot}deg)` }}>
            {w.seg.map((v, k) => <div key={k} className="absolute left-1/2 top-1/2 font-black text-xl text-white drop-shadow" style={{ transform: `rotate(${k * 60 + 30}deg) translateY(-105px) rotate(${-(k * 60 + 30)}deg) translate(-50%,-50%)` }}>{v}</div>)}
          </div>
          {res && <div className="absolute inset-0 grid place-items-center"><div className="w-24 h-24 rounded-full bg-white text-[#05080f] grid place-items-center text-3xl font-black anim-pop">{res}</div></div>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3"><Big tone="gold" onClick={() => decide(false)}>💵 Забрать {w.sure}</Big><Big tone="primary" onClick={() => decide(true)}>🎡 Крутить</Big></div>
    </div>
  );
}

// ---------------- Б03 Scratch ----------------
export function Scratch({ onEnd }: MechProps) {
  const make = () => { const dir = pick([1, -1]); const base = genCandles(seg(26, dir * 0.005), { vol: 0.014 }); const fut = genCandles(seg(10, (Math.random() < 0.65 ? dir : -dir) * 0.008), { start: base[base.length - 1].c }); return { base, fut }; };
  const [r, setR] = useState(0); const [s, setS] = useState(make); const [guess, setGuess] = useState<boolean | null>(null); const [scratched, setScratched] = useState(0); const [pts, setPts] = useState(0);
  const cv = useRef<HTMLCanvasElement>(null); const fb = useFeedback(); const done = useRef(false);
  useEffect(() => { const c = cv.current; if (!c) return; const g = c.getContext("2d")!; c.width = 300; c.height = 200; const gr = g.createLinearGradient(0, 0, 300, 200); gr.addColorStop(0, "#c0c0c0"); gr.addColorStop(1, "#8a8a9a"); g.globalCompositeOperation = "source-over"; g.fillStyle = gr; g.fillRect(0, 0, 300, 200); g.fillStyle = "#555"; g.font = "bold 28px sans-serif"; g.textAlign = "center"; g.fillText("🪙 СОТРИ", 150, 110); done.current = false; setScratched(0); }, [r, guess]);
  const scratch = (e: React.PointerEvent) => {
    if (guess === null || done.current) return; const c = cv.current!; const b = c.getBoundingClientRect(); const g = c.getContext("2d")!;
    g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(((e.clientX - b.left) / b.width) * 300, ((e.clientY - b.top) / b.height) * 200, 22, 0, Math.PI * 2); g.fill();
    const n = scratched + 1; setScratched(n);
    if (n > 40) { done.current = true; const up = s.fut[s.fut.length - 1].c > s.base[s.base.length - 1].c; const ok = up === guess; const p = pts + (ok ? 34 : 0); setPts(p); fb.show(ok ? "good" : "bad"); g.clearRect(0, 0, 300, 200);
      setTimeout(() => { if (r + 1 >= 3) onEnd({ score: Math.min(100, p), lesson: "Сначала решение — потом будущее. Никогда наоборот.", stats: [["Угадано", `${Math.round(p / 34)}/3`]] }); else { setR(r + 1); setS(make()); setGuess(null); } }, 1200); }
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={r} n={3} />} right={<Pill tone="bg-amber-300/20 text-amber-200">{pts}</Pill>} />
      <div className="flex-1 flex flex-col justify-center gap-2">
        <CandleChart candles={s.base} height={170} volume={false} />
        <div className="relative rounded-2xl overflow-hidden">
          <CandleChart candles={s.fut} height={200} volume={false} domain={[Math.min(...s.base.map((c) => c.l), ...s.fut.map((c) => c.l)), Math.max(...s.base.map((c) => c.h), ...s.fut.map((c) => c.h))]} />
          <canvas ref={cv} className={`absolute inset-0 w-full h-full touch-none ${guess === null ? "opacity-100" : ""}`} onPointerMove={(e) => e.buttons && scratch(e)} onPointerDown={scratch} />
        </div>
      </div>
      {guess === null ? <div className="grid grid-cols-2 gap-3"><Big tone="red" onClick={() => setGuess(false)}>▼</Big><Big tone="green" onClick={() => setGuess(true)}>▲</Big></div> : <div className="text-center font-black h-14 grid place-items-center">{guess ? "▲" : "▼"} → 👆 стирай</div>}
    </div>
  );
}

// ---------------- Б04 Runner ----------------
type Ob = { x: number; kind: "fomo" | "shield" };
export function Runner({ onEnd, paused }: MechProps) {
  const [y, setY] = useState(0); const vy = useRef(0); const [obs, setObs] = useState<Ob[]>([]); const [dist, setDist] = useState(0); const [shield, setShield] = useState(0); const [lives, setLives] = useState(3);
  const fb = useFeedback(); const ended = useRef(false);
  const end = (d: number) => { if (ended.current) return; ended.current = true; onEnd({ score: clamp(Math.round(d / 6), 0, 100), lesson: "Прыгай через FOMO-свечи — не догоняй их.", stats: [["Дистанция", `${Math.round(d)}`]] }); };
  useLoop((dt) => {
    vy.current -= 90 * dt; let ny = Math.max(0, y + vy.current * dt); if (ny === 0) vy.current = 0; setY(ny);
    const sp = 38 + dist / 20; let l = lives, sh = shield; const next: Ob[] = [];
    for (const o of obs) { const nx = o.x - sp * dt; if (nx < 16 && nx > 8 && ny < 12) { if (o.kind === "shield") { sh++; fx.coin(); continue; } if (sh > 0) { sh--; fx.hit(); continue; } l--; fb.show("bad", "FOMO!"); continue; } if (nx > -10) next.push({ ...o, x: nx }); }
    if ((next.length === 0 || next[next.length - 1].x < 60) && Math.random() < 0.04) next.push({ x: 110, kind: Math.random() < 0.2 ? "shield" : "fomo" });
    setObs(next); setDist(dist + sp * dt); if (l !== lives) setLives(l); if (sh !== shield) setShield(sh); if (l <= 0 || dist > 600) end(dist);
  }, !paused);
  const jump = () => { if (y < 1) { vy.current = 42; fx.tap(); } };
  return (
    <div className="flex flex-col h-full gap-2" onPointerDown={jump}>
      {fb.node}
      <Hud left={<Hearts n={lives} />} center={<span className="text-2xl tabular-nums">{Math.round(dist)}</span>} right={<Pill tone="bg-sky-400/20 text-sky-200">🛡️ {shield}</Pill>} />
      <div className="relative flex-1 rounded-3xl bg-gradient-to-b from-[#1a0f3a] to-[#0b1222] overflow-hidden">
        <div className="absolute inset-x-0 bottom-[20%] h-0.5 bg-emerald-400/60" />
        {obs.map((o, k) => <div key={k} className="absolute bottom-[20%]" style={{ left: `${o.x}%` }}>{o.kind === "fomo" ? <div className="w-6 h-16 rounded bg-emerald-400 shadow-[0_0_20px_#2ee6a6] relative"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg">🚀</span></div> : <span className="text-3xl">🛡️</span>}</div>)}
        <div className="absolute left-[10%] text-5xl" style={{ bottom: `calc(20% + ${y * 3}px)` }}>🏃</div>
      </div>
      <div className="text-center text-xs opacity-60">тап = прыжок</div>
    </div>
  );
}

// ---------------- Б05 Snake ----------------
const G = 14;
export function Snake({ onEnd, paused }: MechProps) {
  const [snake, setSnake] = useState([[7, 7], [6, 7], [5, 7]]); const dir = useRef([1, 0]); const [food, setFood] = useState({ x: 10, y: 4, good: true }); const [score, setScore] = useState(0); const [risk, setRisk] = useState(0);
  const acc = useRef(0); const st = useRef<{ x: number; y: number } | null>(null); const fb = useFeedback(); const ended = useRef(false);
  const end = (s: number) => { if (ended.current) return; ended.current = true; onEnd({ score: clamp(s * 8, 0, 100), lesson: "Каждый убыток съедает лимит риска. Лимит — стена.", stats: [["Профит", `${s}`]] }); };
  const place = () => ({ x: Math.floor(Math.random() * G), y: Math.floor(Math.random() * G), good: Math.random() < 0.72 });
  useLoop((dt) => {
    acc.current += dt; if (acc.current < 0.16) return; acc.current = 0;
    const h = snake[0]; const nh = [h[0] + dir.current[0], h[1] + dir.current[1]];
    if (nh[0] < 0 || nh[1] < 0 || nh[0] >= G || nh[1] >= G || snake.some((s) => s[0] === nh[0] && s[1] === nh[1])) { fx.bad(); return end(score); }
    let ns = [nh, ...snake];
    if (nh[0] === food.x && nh[1] === food.y) { if (food.good) { setScore(score + 1); fx.coin(); } else { const r2 = risk + 1; setRisk(r2); fb.show("bad", "−1%"); ns = ns.slice(0, Math.max(3, ns.length - 2)); if (r2 >= 3) return end(score); } setFood(place()); } else ns.pop();
    setSnake(ns);
  }, !paused);
  const turn = (dx: number, dy: number) => { if (dir.current[0] === -dx && dir.current[1] === -dy) return; dir.current = [dx, dy]; fx.tap(); };
  return (
    <div className="flex flex-col h-full gap-2">
      {fb.node}
      <Hud left={<Pill tone="bg-emerald-400/20 text-emerald-200">💚 {score}</Pill>} center={<Pill tone="bg-rose-500/20 text-rose-200">Риск {risk}/3%</Pill>} />
      <div className="relative aspect-square w-full rounded-3xl bg-[#0b1222] border-2 border-rose-500/40 touch-none" onPointerDown={(e) => (st.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => { if (!st.current) return; const dx = e.clientX - st.current.x, dy = e.clientY - st.current.y; if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) turn(Math.sign(dx), 0); else if (Math.abs(dy) > 20) turn(0, Math.sign(dy)); st.current = null; }}>
        {snake.map((s, k) => <div key={k} className={`absolute rounded-md ${k === 0 ? "bg-white" : "bg-emerald-400"}`} style={{ left: `${(s[0] / G) * 100}%`, top: `${(s[1] / G) * 100}%`, width: `${100 / G}%`, height: `${100 / G}%`, transform: "scale(.9)" }} />)}
        <div className="absolute grid place-items-center text-lg" style={{ left: `${(food.x / G) * 100}%`, top: `${(food.y / G) * 100}%`, width: `${100 / G}%`, height: `${100 / G}%` }}>{food.good ? "🟩" : "🟥"}</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <div /><Big tone="ghost" onClick={() => turn(0, -1)}>▲</Big><div />
        <Big tone="ghost" onClick={() => turn(-1, 0)}>◀</Big><Big tone="ghost" onClick={() => turn(0, 1)}>▼</Big><Big tone="ghost" onClick={() => turn(1, 0)}>▶</Big>
      </div>
    </div>
  );
}

// ---------------- Б06 Aim ----------------
type Tg = { id: number; x: number; y: number; real: boolean; born: number; icon: string };
const REAL = ["📊", "🧱", "🔭", "🐋"]; const NOISE = ["📣", "🐸", "🕶️", "💬"];
export function Aim({ onEnd, paused }: MechProps) {
  const [tg, setTg] = useState<Tg[]>([]); const [hit, setHit] = useState(0); const [miss, setMiss] = useState(0); const id = useRef(0); const clock = useRef(0); const fb = useFeedback();
  const [t] = useCountdown(30, !paused, () => onEnd({ score: clamp(Math.round(hit * 5 - miss * 5), 0, 100), lesson: "Данные — стреляй. Шум — на карантин.", stats: [["Сигналов", `${hit}`], ["Ошибок", `${miss}`]] }));
  useLoop((dt) => {
    clock.current += dt; const now = clock.current;
    let next = tg.filter((x) => now - x.born < 1.6);
    if (Math.random() < 0.07 && next.length < 5) { id.current++; const real = Math.random() < 0.5; next = [...next, { id: id.current, x: rand(10, 85), y: rand(8, 80), real, born: now, icon: pick(real ? REAL : NOISE) }]; }
    setTg(next);
  }, !paused);
  const shoot = (x: Tg) => { setTg(tg.filter((y) => y.id !== x.id)); if (x.real) { setHit(hit + 1); fx.coin(); } else { setMiss(miss + 1); fb.show("bad", "Шум!"); } };
  return (
    <div className="flex flex-col h-full gap-2">
      {fb.node}
      <Hud left={<Pill tone="bg-emerald-400/20 text-emerald-200">🎯 {hit}</Pill>} center={<span className="text-2xl tabular-nums">{Math.ceil(t)}</span>} right={<Pill tone="bg-rose-500/20 text-rose-200">✗ {miss}</Pill>} />
      <TimeBar t={t} max={30} />
      <div className="relative flex-1 rounded-3xl bg-[radial-gradient(circle_at_center,#1a2340,#070b14)] overflow-hidden">
        {tg.map((x) => <button key={x.id} onClick={() => shoot(x)} className={`absolute w-16 h-16 rounded-full grid place-items-center text-3xl anim-pop ${x.real ? "bg-emerald-400/25 ring-2 ring-emerald-300" : "bg-pink-500/25 ring-2 ring-pink-400"}`} style={{ left: `${x.x}%`, top: `${x.y}%` }}>{x.icon}</button>)}
      </div>
      <div className="flex justify-center gap-4 text-2xl"><span>🎯 {REAL.join("")}</span><span className="opacity-50">🚫 {NOISE.join("")}</span></div>
    </div>
  );
}

// ---------------- Б07 Loot (transparent odds) ----------------
export function Loot({ onEnd }: MechProps) {
  const rounds = useMemo(() => Array.from({ length: 5 }, () => [0, 1, 2].map(() => { const p = pick([10, 25, 40, 60, 80]); const prize = pick([50, 100, 150, 200, 400]); return { p, prize, ev: (p / 100) * prize }; })), []);
  const [i, setI] = useState(0); const [open, setOpen] = useState<number | null>(null); const [win, setWin] = useState<boolean | null>(null); const [pts, setPts] = useState(0); const fb = useFeedback();
  const chests = rounds[i]; const bestEv = Math.max(...chests.map((c) => c.ev));
  const choose = (k: number) => {
    if (open !== null) return; setOpen(k); const c = chests[k]; const w = Math.random() * 100 < c.p; setWin(w); const good = c.ev === bestEv; const p = pts + (good ? 20 : 0); setPts(p);
    setTimeout(() => fb.show(good ? "good" : "bad", `EV ${c.ev.toFixed(0)}`), 700);
    setTimeout(() => { if (i + 1 >= 5) onEnd({ score: p, lesson: "Шанс × приз = ценность. Смотри на оба числа.", stats: [["Лучший EV", `${p / 20}/5`]] }); else { setI(i + 1); setOpen(null); setWin(null); } }, 1800);
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={i} n={5} />} right={<Pill tone="bg-amber-300/20 text-amber-200">{pts}</Pill>} />
      <div className="flex-1 grid grid-cols-3 gap-2 content-center">
        {chests.map((c, k) => (
          <button key={k} onClick={() => choose(k)} className={`rounded-3xl p-3 flex flex-col items-center gap-2 transition ${open === k ? "bg-amber-300/25 scale-105" : open !== null ? "opacity-40" : "bg-white/5 active:scale-95"}`}>
            <div className={`text-6xl ${open === k ? "anim-shake" : ""}`}>{open === k && win !== null ? (win ? "💎" : "💨") : "🎁"}</div>
            <div className="text-2xl font-black">{c.prize}</div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${c.p}%` }} /></div>
            <div className="text-sm font-black text-emerald-300">{c.p}%</div>
          </button>
        ))}
      </div>
    </div>
  );
}
