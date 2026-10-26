import type { ReactNode } from "react";

export type Ctx = { r: () => number; a: string; seed: number };

export const UP = "#9dff3a";
export const DOWN = "#ff4d5a";
export const INK = "#0b0d10";
export const PANEL = "#13161a";
export const LINE = "#2b3139";
export const MUTED = "#7d8590";
export const TXT = "#e8eaed";
export const MONO = "'JetBrains Mono', ui-monospace, monospace";
export const HEAD = "'Oswald', Impact, sans-serif";

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Candle = { o: number; h: number; l: number; c: number; v: number };

/** Случайное блуждание в свечи, нормировано в 0..1 (0 = низ). */
export function genCandles(r: () => number, n: number, drift = 0, vol = 0.12, start = 0.5): Candle[] {
  const out: Candle[] = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = o + drift + (r() - 0.5) * vol * 2;
    const h = Math.max(o, c) + r() * vol * 0.8;
    const l = Math.min(o, c) - r() * vol * 0.8;
    out.push({ o, h, l, c, v: 0.2 + r() * 0.8 });
    p = c;
  }
  let mn = Infinity, mx = -Infinity;
  for (const k of out) { mn = Math.min(mn, k.l); mx = Math.max(mx, k.h); }
  const s = mx - mn || 1;
  return out.map((k) => ({ o: (k.o - mn) / s, h: (k.h - mn) / s, l: (k.l - mn) / s, c: (k.c - mn) / s, v: k.v }));
}

export function series(r: () => number, n: number, drift = 0, vol = 0.1, smooth = 0): number[] {
  let p = 0.5;
  const raw: number[] = [];
  for (let i = 0; i < n; i++) { p += drift + (r() - 0.5) * vol * 2; raw.push(p); }
  let sm = raw;
  for (let k = 0; k < smooth; k++) sm = sm.map((v, i) => (v + (sm[i - 1] ?? v) + (sm[i + 1] ?? v)) / 3);
  const mn = Math.min(...sm), mx = Math.max(...sm), s = mx - mn || 1;
  return sm.map((v) => (v - mn) / s);
}

export const pts = (vals: number[], x: number, y: number, w: number, h: number): [number, number][] =>
  vals.map((v, i) => [x + (i / Math.max(1, vals.length - 1)) * w, y + h - v * h]);

export const d = (p: [number, number][]) => p.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");

export function sma(v: number[], n: number): number[] {
  return v.map((_, i) => {
    const s = v.slice(Math.max(0, i - n + 1), i + 1);
    return s.reduce((a, b) => a + b, 0) / s.length;
  });
}

export function Txt({ x, y, children, size = 12, fill = TXT, anchor = "start", weight = 600, mono = true, rotate, opacity = 1, ls = 0 }: {
  x: number; y: number; children: ReactNode; size?: number; fill?: string; anchor?: "start" | "middle" | "end"; weight?: number; mono?: boolean; rotate?: number; opacity?: number; ls?: number;
}) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight} fontFamily={mono ? MONO : HEAD} opacity={opacity} letterSpacing={ls}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>{children}</text>
  );
}

export function Panel({ x, y, w, h, title, a, children }: { x: number; y: number; w: number; h: number; title?: string; a: string; children?: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={PANEL} stroke={LINE} strokeWidth={1.5} />
      {title && (
        <>
          <circle cx={x + 16} cy={y + 15} r={4} fill={DOWN} />
          <circle cx={x + 30} cy={y + 15} r={4} fill="#ffb020" />
          <circle cx={x + 44} cy={y + 15} r={4} fill={UP} />
          <Txt x={x + w - 14} y={y + 19} size={10} fill={a} anchor="end" ls={1}>{title}</Txt>
          <line x1={x} x2={x + w} y1={y + 30} y2={y + 30} stroke={LINE} />
        </>
      )}
      {children}
    </g>
  );
}

export function Grid({ x, y, w, h, nx = 6, ny = 5 }: { x: number; y: number; w: number; h: number; nx?: number; ny?: number }) {
  const els: ReactNode[] = [];
  for (let i = 0; i <= nx; i++) els.push(<line key={"v" + i} x1={x + (i / nx) * w} x2={x + (i / nx) * w} y1={y} y2={y + h} stroke={LINE} strokeWidth={0.7} opacity={0.7} />);
  for (let i = 0; i <= ny; i++) els.push(<line key={"h" + i} x1={x} x2={x + w} y1={y + (i / ny) * h} y2={y + (i / ny) * h} stroke={LINE} strokeWidth={0.7} opacity={0.7} />);
  return <g>{els}</g>;
}

export function Candles({ data, x, y, w, h, wick = 1.5 }: { data: Candle[]; x: number; y: number; w: number; h: number; wick?: number }) {
  const step = w / data.length;
  const bw = Math.max(2, step * 0.62);
  return (
    <g>
      {data.map((k, i) => {
        const cx = x + step * i + step / 2;
        const up = k.c >= k.o;
        const col = up ? UP : DOWN;
        const yo = y + h - k.o * h, yc = y + h - k.c * h;
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={y + h - k.h * h} y2={y + h - k.l * h} stroke={col} strokeWidth={wick} />
            <rect x={cx - bw / 2} y={Math.min(yo, yc)} width={bw} height={Math.max(2, Math.abs(yo - yc))} fill={col} rx={1} />
          </g>
        );
      })}
    </g>
  );
}

export function Chip({ x, y, children, fill, color = INK, size = 11, pad = 8, rotate = 0 }: { x: number; y: number; children: string; fill: string; color?: string; size?: number; pad?: number; rotate?: number }) {
  const w = children.length * size * 0.62 + pad * 2;
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <rect x={x} y={y - size - 2} width={w} height={size + 10} rx={4} fill={fill} />
      <Txt x={x + pad} y={y + 3} size={size} fill={color} weight={800}>{children}</Txt>
    </g>
  );
}

export function Arrow({ x1, y1, x2, y2, color, w = 3 }: { x1: number; y1: number; x2: number; y2: number; color: string; w?: number }) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = (k: number) => x2 - Math.cos(ang + k) * 11;
  const hy = (k: number) => y2 - Math.sin(ang + k) * 11;
  return (
    <g stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path d={`M${hx(0.5)} ${hy(0.5)} L${x2} ${y2} L${hx(-0.5)} ${hy(-0.5)}`} />
    </g>
  );
}

export function Clippy({ x, y, s = 1, mood = "tired", rotate = 0 }: { x: number; y: number; s?: number; mood?: "tired" | "smug" | "worried" | "dead"; rotate?: number }) {
  const eyeY = mood === "worried" ? -4 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
      <path d="M-18 40 C-34 40 -34 -46 -6 -46 C22 -46 22 30 6 30 C-8 30 -8 -26 -2 -26" fill="none" stroke="#2a2018" strokeWidth={13} strokeLinecap="round" />
      <path d="M-18 40 C-34 40 -34 -46 -6 -46 C22 -46 22 30 6 30 C-8 30 -8 -26 -2 -26" fill="none" stroke="#b9bec6" strokeWidth={8} strokeLinecap="round" />
      <path d="M-18 40 C-34 40 -34 -46 -6 -46" fill="none" stroke="#d9a35b" strokeWidth={3} strokeLinecap="round" strokeDasharray="4 10" opacity={0.8} />
      <g transform="translate(-14 -12)">
        <ellipse cx={0} cy={0} rx={9} ry={11} fill="#f4f4ee" stroke="#2a2018" strokeWidth={2} />
        <ellipse cx={18} cy={0} rx={9} ry={11} fill="#f4f4ee" stroke="#2a2018" strokeWidth={2} />
        <circle cx={mood === "smug" ? 3 : 1} cy={eyeY + (mood === "tired" ? 4 : 0)} r={3.4} fill="#1b130c" />
        <circle cx={mood === "smug" ? 21 : 19} cy={eyeY + (mood === "tired" ? 4 : 0)} r={3.4} fill="#1b130c" />
        {mood === "dead" && (<g stroke="#1b130c" strokeWidth={2}><path d="M-3 -3 L3 3 M3 -3 L-3 3" /><path d="M15 -3 L21 3 M21 -3 L15 3" /></g>)}
        <path d="M-10 -9 L8 -12" stroke="#2a2018" strokeWidth={3} strokeLinecap="round" transform={mood === "worried" ? "rotate(-12)" : mood === "smug" ? "translate(0 3)" : ""} />
        <path d="M10 -12 L28 -9" stroke="#2a2018" strokeWidth={3} strokeLinecap="round" transform={mood === "worried" ? "rotate(12 18 -10)" : ""} />
        <path d="M-7 12 q7 6 14 0 M11 12 q7 6 14 0" stroke="#7a5a3a" strokeWidth={1.5} fill="none" opacity={0.7} />
      </g>
    </g>
  );
}

/** Скелет иллюстрации 500x500. */
export function Shell({ id, accent, tag, caption, children, mascot, mood = "tired", seed }: {
  id: string; accent: string; tag: string; caption: string; children: ReactNode; mascot?: boolean; mood?: "tired" | "smug" | "worried" | "dead"; seed: number;
}) {
  const r = rng(seed ^ 0x9e3779b1);
  const drips = Array.from({ length: 5 }, () => ({ x: 40 + r() * 400, h: 14 + r() * 34 }));
  const cap = caption.length > 34 ? caption.slice(0, 33) + "…" : caption;
  return (
    <svg viewBox="0 0 500 500" width="100%" height="100%" role="img" aria-label={caption} xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <radialGradient id={`bg${id}`} cx="30%" cy="20%" r="95%">
          <stop offset="0" stopColor={accent} stopOpacity="0.20" />
          <stop offset="0.45" stopColor="#12151a" />
          <stop offset="1" stopColor="#07080a" />
        </radialGradient>
        <filter id={`gl${id}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id={`gr${id}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed % 97} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 -0.2" /></filter>
        <pattern id={`ht${id}`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3" cy="3" r="1.5" fill={accent} opacity="0.35" /></pattern>
        <linearGradient id={`fade${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.85" /></linearGradient>
        <clipPath id={`cp${id}`}><rect x="0" y="0" width="500" height="500" rx="26" /></clipPath>
      </defs>
      <g clipPath={`url(#cp${id})`}>
        <rect width="500" height="500" fill={`url(#bg${id})`} />
        <circle cx="440" cy="60" r="150" fill={`url(#ht${id})`} />
        <path d="M0 470 L500 440 L500 500 L0 500Z" fill={accent} opacity="0.08" />
        <g transform="translate(0 0)">{children}</g>
        <rect width="500" height="500" fill={`url(#fade${id})`} opacity="0.55" />
        {/* лента-подпись */}
        <g transform="rotate(-1.4 250 452)">
          <rect x="18" y="428" width="464" height="46" rx="6" fill={accent} />
          <rect x="18" y="428" width="464" height="46" rx="6" fill="none" stroke="#000" strokeOpacity="0.35" strokeDasharray="3 5" />
          <Txt x={34} y={459} size={21} fill={INK} weight={700} mono={false} ls={0.6}>{cap.toUpperCase()}</Txt>
          {drips.map((p, i) => (
            <g key={i}><rect x={p.x} y={474} width={5} height={p.h} rx={2.5} fill={accent} /><circle cx={p.x + 2.5} cy={474 + p.h} r={4.2} fill={accent} /></g>
          ))}
        </g>
        <g>
          <rect x="18" y="16" width={tag.length * 9 + 22} height="26" rx="5" fill={INK} stroke={accent} strokeWidth="1.5" />
          <Txt x={29} y={34} size={13} fill={accent} weight={800}>{tag}</Txt>
        </g>
        {mascot && <Clippy x={462} y={36} s={0.5} mood={mood} rotate={12} />}
        <rect width="500" height="500" filter={`url(#gr${id})`} opacity="0.16" style={{ mixBlendMode: "overlay" }} />
      </g>
      <rect x="1" y="1" width="498" height="498" rx="25" fill="none" stroke={accent} strokeOpacity="0.55" strokeWidth="2" />
    </svg>
  );
}
