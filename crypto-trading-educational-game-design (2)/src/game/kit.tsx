"use client";
import { useEffect, useRef, useState, type ReactNode, type PointerEvent as RPE } from "react";
import { haptic } from "@/tma/tg";
import { sfx } from "@/tma/sfx";

export interface Result { score: number; lesson: string; stats?: [string, string][] }
export interface MechProps { onEnd: (r: Result) => void; paused: boolean }
export type Candle = { o: number; h: number; l: number; c: number; v: number };

export const fx = {
  tap: () => { sfx.tap(); haptic.tap(); },
  good: () => { sfx.good(); haptic.ok(); },
  bad: () => { sfx.bad(); haptic.bad(); },
  coin: () => { sfx.coin(); haptic.select(); },
  hit: () => { sfx.hit(); haptic.hit(); },
};

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const ri = (a: number, b: number) => Math.floor(rand(a, b + 1));
export const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
export function shuffle<T>(a: readonly T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

// Procedural candles from a drift profile
export function genCandles(drifts: number[], opts: { start?: number; vol?: number; vols?: number[] } = {}): Candle[] {
  let p = opts.start ?? 100; const vol = opts.vol ?? 0.012; const out: Candle[] = [];
  drifts.forEach((d, i) => {
    const o = p; const c = o * (1 + d + (Math.random() - 0.5) * vol);
    const h = Math.max(o, c) * (1 + Math.random() * vol * 0.7); const l = Math.min(o, c) * (1 - Math.random() * vol * 0.7);
    out.push({ o, h, l, c, v: (opts.vols?.[i] ?? 1) * rand(0.7, 1.3) }); p = c;
  });
  return out;
}
export const seg = (n: number, d: number) => Array(n).fill(d) as number[];
export const trend = (n: number, dir: 1 | -1 | 0) => genCandles(dir === 0 ? Array.from({ length: n }, (_, i) => (i % 6 < 3 ? 0.008 : -0.008)) : seg(n, dir * 0.006));
export function rsi(cs: Candle[], n = 14) {
  let g = 0, l = 0; const s = cs.slice(-n - 1);
  for (let i = 1; i < s.length; i++) { const d = s[i].c - s[i - 1].c; if (d > 0) g += d; else l -= d; }
  return l === 0 ? 100 : 100 - 100 / (1 + g / l);
}
export const sma = (cs: Candle[], n: number) => cs.map((_, i) => (i < n - 1 ? null : cs.slice(i - n + 1, i + 1).reduce((a, c) => a + c.c, 0) / n));
export const atr = (cs: Candle[], n = 14) => cs.slice(-n).reduce((a, c) => a + (c.h - c.l), 0) / Math.min(n, cs.length);

// ---------- Candle chart (SVG) ----------
export interface ChartProps {
  candles: Candle[]; ghost?: Candle[]; height?: number; volume?: boolean; lines?: { y: number; color: string; dash?: boolean; label?: string }[];
  bands?: { y1: number; y2: number; color: string }[]; overlay?: (number | null)[][]; highlight?: number[]; hideFrom?: number;
  onTapCandle?: (i: number) => void; onDragY?: (price: number) => void; domain?: [number, number]; className?: string;
}
export function CandleChart({ candles, ghost = [], height = 220, volume = true, lines = [], bands = [], overlay = [], highlight = [], hideFrom, onTapCandle, onDragY, domain, className = "" }: ChartProps) {
  const W = 360; const H = height; const vh = volume ? 34 : 0; const pad = 8;
  const all = [...candles, ...ghost];
  const ps = all.flatMap((c) => [c.h, c.l]);
  const [mn, mx] = domain ?? [Math.min(...ps, ...lines.map((l) => l.y)), Math.max(...ps, ...lines.map((l) => l.y))];
  const r = mx - mn || 1; const cw = W / Math.max(all.length, 1);
  const y = (p: number) => pad + ((mx - p) / r) * (H - vh - pad * 2);
  const inv = (py: number) => mx - ((py - pad) / (H - vh - pad * 2)) * r;
  const vmax = Math.max(...all.map((c) => c.v), 1);
  const ref = useRef<SVGSVGElement>(null); const drag = useRef(false);
  const toLocal = (e: RPE) => { const b = ref.current!.getBoundingClientRect(); return { x: ((e.clientX - b.left) / b.width) * W, y: ((e.clientY - b.top) / b.height) * H }; };
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className={`w-full block touch-none select-none ${className}`}
      onPointerDown={(e) => { const p = toLocal(e); if (onDragY) { drag.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); onDragY(inv(p.y)); } if (onTapCandle) onTapCandle(clamp(Math.floor(p.x / cw), 0, all.length - 1)); }}
      onPointerMove={(e) => { if (drag.current && onDragY) onDragY(inv(toLocal(e).y)); }}
      onPointerUp={() => { drag.current = false; }}>
      <defs><linearGradient id="cbg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0c1424" /><stop offset="1" stopColor="#070b14" /></linearGradient></defs>
      <rect width={W} height={H} rx={14} fill="url(#cbg)" />
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="#ffffff08" />)}
      {bands.map((b, i) => <rect key={i} x={0} width={W} y={Math.min(y(b.y1), y(b.y2))} height={Math.abs(y(b.y1) - y(b.y2))} fill={b.color} />)}
      {highlight.map((i) => <rect key={"h" + i} x={i * cw} width={cw} y={0} height={H} fill="#ffd16622" />)}
      {all.map((c, i) => {
        if (hideFrom != null && i >= hideFrom) return null;
        const x = i * cw + cw / 2; const up = c.c >= c.o; const col = up ? "#2ee6a6" : "#ff5c7a"; const g = i >= candles.length;
        return (
          <g key={i} opacity={g ? 0.9 : 1} className={g ? "anim-pop" : undefined}>
            <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1.2} />
            <rect x={x - cw * 0.34} width={cw * 0.68} y={y(Math.max(c.o, c.c))} height={Math.max(1.2, Math.abs(y(c.o) - y(c.c)))} rx={1} fill={col} />
            {volume && <rect x={x - cw * 0.34} width={cw * 0.68} y={H - (c.v / vmax) * vh} height={(c.v / vmax) * vh} fill={col} opacity={0.35} />}
          </g>
        );
      })}
      {overlay.map((ln, k) => (
        <polyline key={k} fill="none" stroke={["#ffd166", "#7aa2ff", "#c792ea"][k % 3]} strokeWidth={2} strokeLinejoin="round"
          points={ln.map((v, i) => (v == null ? "" : `${i * cw + cw / 2},${y(v)}`)).filter(Boolean).join(" ")} />
      ))}
      {lines.map((l, i) => (
        <g key={i}>
          <line x1={0} x2={W} y1={y(l.y)} y2={y(l.y)} stroke={l.color} strokeWidth={2} strokeDasharray={l.dash ? "6 5" : undefined} />
          {l.label && <g><rect x={W - 44} y={y(l.y) - 9} width={42} height={18} rx={9} fill={l.color} /><text x={W - 23} y={y(l.y) + 4} fontSize={10} fontWeight={800} textAnchor="middle" fill="#05080f">{l.label}</text></g>}
        </g>
      ))}
    </svg>
  );
}

// ---------- HUD pieces ----------
export function Hud({ left, center, right }: { left?: ReactNode; center?: ReactNode; right?: ReactNode }) {
  return <div className="flex items-center justify-between gap-2 h-10 text-sm font-bold"><div className="min-w-16">{left}</div><div className="flex-1 flex justify-center">{center}</div><div className="min-w-16 text-right">{right}</div></div>;
}
export const Hearts = ({ n, max = 3 }: { n: number; max?: number }) => <span className="tracking-tight">{Array.from({ length: max }, (_, i) => <span key={i} className={i < n ? "" : "opacity-20 grayscale"}>❤️</span>)}</span>;
export const Pill = ({ children, tone = "bg-white/10" }: { children: ReactNode; tone?: string }) => <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${tone}`}>{children}</span>;
export function Dots({ i, n }: { i: number; n: number }) {
  return <div className="flex gap-1">{Array.from({ length: n }, (_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k < i ? "w-4 bg-emerald-400" : k === i ? "w-6 bg-white" : "w-3 bg-white/15"}`} />)}</div>;
}
export function TimeBar({ t, max }: { t: number; max: number }) {
  const f = clamp(t / max, 0, 1);
  return <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full rounded-full transition-[width] duration-200 ease-linear" style={{ width: `${f * 100}%`, background: f > 0.35 ? "#2ee6a6" : "#ff5c7a" }} /></div>;
}
export function Big({ children, onClick, tone = "primary", disabled, className = "" }: { children: ReactNode; onClick?: () => void; tone?: "primary" | "ghost" | "green" | "red" | "blue" | "gold"; disabled?: boolean; className?: string }) {
  const tones = { primary: "bg-white text-[#05080f]", ghost: "bg-white/10 text-white", green: "bg-emerald-400 text-[#05080f]", red: "bg-rose-500 text-white", blue: "bg-sky-400 text-[#05080f]", gold: "bg-amber-300 text-[#05080f]" };
  return <button disabled={disabled} onClick={() => { fx.tap(); onClick?.(); }} className={`min-h-14 rounded-2xl px-4 font-black text-base active:scale-95 transition disabled:opacity-30 ${tones[tone]} ${className}`}>{children}</button>;
}
export function Flash({ kind }: { kind: "good" | "bad" | null }) {
  if (!kind) return null;
  return <div key={Math.random()} className={`pointer-events-none fixed inset-0 z-40 anim-flash ${kind === "good" ? "bg-emerald-400/25" : "bg-rose-500/30"}`} />;
}
export function Toast({ text, kind }: { text: string | null; kind?: "good" | "bad" }) {
  if (!text) return null;
  return <div className={`pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 z-30 anim-toast text-3xl font-black drop-shadow ${kind === "bad" ? "text-rose-400" : "text-emerald-300"}`}>{text}</div>;
}

// ---------- hooks ----------
export function useCountdown(seconds: number, running: boolean, onDone: () => void) {
  const [t, setT] = useState(seconds);
  const done = useRef(onDone); done.current = onDone;
  useEffect(() => { setT(seconds); }, [seconds]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((x) => { const n = Math.max(0, x - 0.1); if (n === 0 && x > 0) setTimeout(() => done.current(), 0); return n; }), 100);
    return () => clearInterval(id);
  }, [running]);
  return [t, setT] as const;
}
export function useFeedback() {
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [toast, setToast] = useState<{ text: string; kind: "good" | "bad" } | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (kind: "good" | "bad", text?: string) => {
    (kind === "good" ? fx.good : fx.bad)(); setFlash(kind); if (text) setToast({ text, kind });
    if (t.current) clearTimeout(t.current); t.current = setTimeout(() => { setFlash(null); setToast(null); }, 650);
  };
  return { show, node: <><Flash kind={flash} /><Toast text={toast?.text ?? null} kind={toast?.kind} /></> };
}
// Game loop at ~30fps (mobile battery skill), paused when hidden
export function useLoop(cb: (dt: number) => void, running: boolean) {
  const ref = useRef(cb); ref.current = cb;
  useEffect(() => {
    if (!running) return;
    let raf = 0; let last = performance.now(); let acc = 0;
    const f = (now: number) => { const dt = Math.min(0.1, (now - last) / 1000); last = now; acc += dt; if (acc >= 1 / 30) { ref.current(acc); acc = 0; } raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}
export const pct = (n: number) => `${Math.round(n)}%`;
