import type { ReactNode } from "react";

export const C = {
  bg0: "#070C1F",
  bg1: "#111B45",
  green: "#22E0A1",
  red: "#FF5470",
  gold: "#F5C451",
  cyan: "#4CC9F0",
  violet: "#8B7BFF",
  text: "#EAF0FF",
  muted: "#8F9CCB",
  grid: "rgba(148,163,255,0.13)",
};

export type Area = { x: number; y: number; w: number; h: number };
export type Candle = { o: number; h: number; l: number; c: number; v: number };
export type SceneProps = {
  uid: string;
  r: () => number;
  A: Area;
  variant: string;
  accent: string;
};

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const g = (t: number, m: number, s: number) => Math.exp(-0.5 * ((t - m) / s) ** 2);
export const sm = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export function series(r: () => number, n: number, shape: (t: number) => number, vol = 2): Candle[] {
  const out: Candle[] = [];
  let prev = shape(0);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const c = shape(t) + (r() - 0.5) * vol * 2;
    const o = prev;
    const h = Math.max(o, c) + r() * vol * 0.9;
    const l = Math.min(o, c) - r() * vol * 0.9;
    const v = 0.25 + Math.min(0.75, Math.abs(c - o) / (vol * 3) + r() * 0.3);
    out.push({ o, h, l, c, v });
    prev = c;
  }
  return out;
}

export function makeScale(cs: Candle[], A: Area, pad = 10) {
  const hi = Math.max(...cs.map((c) => c.h));
  const lo = Math.min(...cs.map((c) => c.l));
  const step = A.w / cs.length;
  return {
    X: (i: number) => A.x + step * (i + 0.5),
    Y: (p: number) => A.y + pad + (1 - (p - lo) / (hi - lo || 1)) * (A.h - pad * 2),
    bw: Math.max(3, step * 0.62),
    hi,
    lo,
    step,
  };
}
export type Scale = ReturnType<typeof makeScale>;

export function CandleLayer({ cs, sc, hollow = false, dim = 1 }: { cs: Candle[]; sc: Scale; hollow?: boolean; dim?: number }) {
  return (
    <g opacity={dim}>
      {cs.map((c, i) => {
        const up = c.c >= c.o;
        const col = up ? C.green : C.red;
        const x = sc.X(i);
        const yb = Math.min(sc.Y(c.o), sc.Y(c.c));
        const hb = Math.max(2, Math.abs(sc.Y(c.o) - sc.Y(c.c)));
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={sc.Y(c.h)} y2={sc.Y(c.l)} stroke={col} strokeWidth={1.6} strokeLinecap="round" />
            <rect x={x - sc.bw / 2} y={yb} width={sc.bw} height={hb} rx={1.5} fill={hollow && up ? C.bg0 : col} stroke={col} strokeWidth={hollow ? 1.4 : 0} />
          </g>
        );
      })}
    </g>
  );
}

export function Poly({ pts, color, w = 2.4, glow, uid, dash, fill }: { pts: [number, number][]; color: string; w?: number; glow?: boolean; uid?: string; dash?: string; fill?: string }) {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return <path d={d} fill={fill ?? "none"} stroke={color} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} filter={glow && uid ? `url(#${uid}g)` : undefined} />;
}

export function Tag({ x, y, text, color = C.gold, anchor = "start", size = 11 }: { x: number; y: number; text: string; color?: string; anchor?: "start" | "middle" | "end"; size?: number }) {
  const w = text.length * size * 0.62 + 14;
  const x0 = anchor === "start" ? x : anchor === "middle" ? x - w / 2 : x - w;
  return (
    <g>
      <rect x={x0} y={y - size - 3} width={w} height={size + 9} rx={(size + 9) / 2} fill="rgba(7,12,31,0.85)" stroke={color} strokeWidth={1.2} />
      <text x={x0 + w / 2} y={y + 2} textAnchor="middle" fontSize={size} fontWeight={700} fill={color}>
        {text}
      </text>
    </g>
  );
}

export function wrap(s: string, max: number, lines: number): string[] {
  const words = s.split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  if (out.length > lines) {
    const cut = out.slice(0, lines);
    cut[lines - 1] = cut[lines - 1].replace(/[\s,.:;—-]*$/, "") + "…";
    return cut;
  }
  return out;
}

export function Logo({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M12 0 L24 4 V14 C24 22 18 27 12 30 C6 27 0 22 0 14 V4 Z" fill="#1A2656" stroke={C.gold} strokeWidth={1.6} />
      <line x1={8} x2={8} y1={8} y2={20} stroke={C.green} strokeWidth={1.4} />
      <rect x={6} y={11} width={4} height={6} fill={C.green} rx={0.8} />
      <line x1={16} x2={16} y1={7} y2={19} stroke={C.red} strokeWidth={1.4} />
      <rect x={14} y={9} width={4} height={6} fill={C.red} rx={0.8} />
    </g>
  );
}

export function Frame({
  uid,
  accent,
  tag,
  title,
  caption,
  cover,
  children,
}: {
  uid: string;
  accent: string;
  tag: string;
  title: string;
  caption: string;
  cover?: boolean;
  children: ReactNode;
}) {
  const r = rng(hash(uid));
  const dots = Array.from({ length: 26 }, () => ({ x: r() * 500, y: r() * 500, s: r() * 1.4 + 0.4 }));
  const tl = wrap(title, cover ? 26 : 34, 2);
  const tagW = tag.length * 7.4 + 22;
  return (
    <svg viewBox="0 0 500 500" width="100%" role="img" aria-label={title} style={{ display: "block", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <defs>
        <linearGradient id={`${uid}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A1130" />
          <stop offset="0.55" stopColor="#14214F" />
          <stop offset="1" stopColor="#080D26" />
        </linearGradient>
        <radialGradient id={`${uid}gl`} cx="0.85" cy="0.08" r="0.75">
          <stop offset="0" stopColor={accent} stopOpacity="0.38" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}gl2`} cx="0.05" cy="0.95" r="0.6">
          <stop offset="0" stopColor={C.violet} stopOpacity="0.25" />
          <stop offset="1" stopColor={C.violet} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}pn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.09" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={`${uid}ar`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity="0.45" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}g`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={`${uid}cl`}>
          <rect x="24" y="64" width="452" height="322" rx="20" />
        </clipPath>
      </defs>
      <rect width="500" height="500" rx="28" fill={`url(#${uid}bg)`} />
      <rect width="500" height="500" rx="28" fill={`url(#${uid}gl)`} />
      <rect width="500" height="500" rx="28" fill={`url(#${uid}gl2)`} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s} fill="#fff" opacity={0.25} />
      ))}
      <rect x="1" y="1" width="498" height="498" rx="27" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      {/* header */}
      <rect x="24" y="22" width={tagW} height="26" rx="13" fill="rgba(255,255,255,0.06)" stroke={accent} strokeWidth="1.4" />
      <circle cx="38" cy="35" r="3.5" fill={accent} />
      <text x="48" y="39.5" fontSize="11.5" fontWeight={800} letterSpacing="1.2" fill={C.text}>
        {tag}
      </text>
      <Logo x={448} y={18} s={1.05} />
      {/* panel */}
      <rect x="24" y="64" width="452" height="322" rx="20" fill={`url(#${uid}pn)`} stroke="rgba(255,255,255,0.12)" />
      <g clipPath={`url(#${uid}cl)`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1="24" x2="476" y1={64 + i * 53.6} y2={64 + i * 53.6} stroke={C.grid} strokeDasharray="2 6" />
        ))}
        {children}
      </g>
      {/* footer */}
      {tl.map((l, i) => (
        <text key={i} x="26" y={(cover ? 421 : 415) + i * (cover ? 28 : 22)} fontSize={cover ? 24 : 18} fontWeight={800} fill={C.text}>
          {l}
        </text>
      ))}
      <text x="26" y="485" fontSize="11.5" fontWeight={600} fill={C.muted} letterSpacing="0.3">
        {caption}
      </text>
      <text x="474" y="485" textAnchor="end" fontSize="10" fontWeight={800} letterSpacing="2" fill={accent}>
        SIGNAL ARENA
      </text>
    </svg>
  );
}

/* ---------- chart scene ---------- */

const shapes: Record<string, (t: number) => number> = {
  trend: (t) => 28 + 52 * t + 5 * Math.sin(t * 13),
  down: (t) => 82 - 46 * t + 5 * Math.sin(t * 12),
  range: (t) => 50 + 11 * Math.sin(t * 19),
  hs: (t) => 40 + 6 * t + 16 * g(t, 0.2, 0.07) + 29 * g(t, 0.5, 0.07) + 16 * g(t, 0.8, 0.07) - 34 * sm(0.83, 1, t),
  dtop: (t) => 38 + 27 * g(t, 0.3, 0.08) + 27 * g(t, 0.7, 0.08) - 30 * sm(0.78, 1, t),
  dbottom: (t) => 70 - 27 * g(t, 0.3, 0.08) - 27 * g(t, 0.7, 0.08) + 28 * sm(0.78, 1, t),
  triangle: (t) => 50 + 22 * (1 - Math.min(t, 0.85) / 0.9) * Math.sin(t * 15) + 34 * sm(0.82, 1, t),
  breakout: (t) => 46 + 6 * Math.sin(t * 21) * (1 - sm(0.55, 0.7, t)) + 30 * sm(0.62, 0.74, t) - 11 * g(t, 0.83, 0.05) + 6 * sm(0.88, 1, t),
  vshape: (t) => 78 - 56 * sm(0, 0.5, t) + 52 * sm(0.5, 1, t),
  flag: (t) => 28 + 48 * sm(0.05, 0.4, t) - 10 * sm(0.4, 0.8, t) + 26 * sm(0.8, 1, t) + 2 * Math.sin(t * 40),
};

function sma(cs: Candle[], n: number): number[] {
  return cs.map((_, i) => {
    const s = cs.slice(Math.max(0, i - n + 1), i + 1);
    return s.reduce((a, c) => a + c.c, 0) / s.length;
  });
}

export function ChartScene({ uid, r, A, variant, accent }: SceneProps) {
  const vmap: Record<string, string> = { ma: "trend", bands: "range", structure: "trend", levels: "range", volume: "trend", candles: "trend", heikin: "trend", reversal: "vshape", dtop: "dtop", dbottom: "dbottom" };
  const shape = shapes[variant] ?? shapes[vmap[variant] ?? "trend"];
  const n = 30;
  const cs = series(r, n, shape, variant === "triangle" ? 1.4 : 2.1);
  const main: Area = { x: A.x, y: A.y, w: A.w, h: A.h * 0.78 };
  const sc = makeScale(cs, main, 14);
  const vh = A.h * 0.17;
  const vy = A.y + A.h;
  const out: ReactNode[] = [];

  // volume
  out.push(
    <g key="vol" opacity={0.75}>
      {cs.map((c, i) => (
        <rect key={i} x={sc.X(i) - sc.bw / 2} y={vy - c.v * vh} width={sc.bw} height={c.v * vh} rx={1.5} fill={c.c >= c.o ? C.green : C.red} opacity={0.45} />
      ))}
    </g>,
  );

  if (variant === "heikin") {
    // heikin ashi transformation
    const ha: Candle[] = [];
    cs.forEach((c, i) => {
      const hc = (c.o + c.h + c.l + c.c) / 4;
      const ho = i ? (ha[i - 1].o + ha[i - 1].c) / 2 : (c.o + c.c) / 2;
      ha.push({ o: ho, c: hc, h: Math.max(c.h, ho, hc), l: Math.min(c.l, ho, hc), v: c.v });
    });
    out.push(<CandleLayer key="raw" cs={cs} sc={sc} dim={0.28} />);
    out.push(<CandleLayer key="ha" cs={ha} sc={sc} />);
    out.push(<Tag key="t" x={A.x + 6} y={A.y + 20} text="Heikin Ashi" color={accent} />);
  } else {
    out.push(<CandleLayer key="c" cs={cs} sc={sc} />);
  }

  if (variant === "ma") {
    const a = sma(cs, 5);
    const b = sma(cs, 12);
    out.push(<Poly key="a" uid={uid} glow pts={a.map((v, i) => [sc.X(i), sc.Y(v)])} color={C.gold} />);
    out.push(<Poly key="b" uid={uid} glow pts={b.map((v, i) => [sc.X(i), sc.Y(v)])} color={C.cyan} />);
    for (let i = 2; i < n; i++) {
      if ((a[i] - b[i]) * (a[i - 1] - b[i - 1]) < 0) out.push(<circle key={`x${i}`} cx={sc.X(i)} cy={sc.Y(a[i])} r={6} fill="none" stroke="#fff" strokeWidth={2} />);
    }
    out.push(<Tag key="l1" x={A.x + 6} y={A.y + 20} text="EMA 5" color={C.gold} />, <Tag key="l2" x={A.x + 72} y={A.y + 20} text="EMA 12" color={C.cyan} />);
  }
  if (variant === "bands") {
    const m = sma(cs, 8);
    const sd = cs.map((_, i) => {
      const s = cs.slice(Math.max(0, i - 7), i + 1).map((c) => c.c);
      const mean = s.reduce((x, y) => x + y, 0) / s.length;
      return Math.sqrt(s.reduce((x, y) => x + (y - mean) ** 2, 0) / s.length) + 1.5;
    });
    const up = m.map((v, i) => [sc.X(i), sc.Y(v + 2 * sd[i])] as [number, number]);
    const lo = m.map((v, i) => [sc.X(i), sc.Y(v - 2 * sd[i])] as [number, number]);
    out.unshift(<path key="fill" d={`M${up.map((p) => p.join(" ")).join(" L")} L${[...lo].reverse().map((p) => p.join(" ")).join(" L")}Z`} fill={accent} opacity={0.14} />);
    out.push(<Poly key="u" pts={up} color={accent} w={1.8} />, <Poly key="l" pts={lo} color={accent} w={1.8} />, <Poly key="m" pts={m.map((v, i) => [sc.X(i), sc.Y(v)])} color={C.gold} w={1.6} dash="5 4" />);
  }
  if (variant === "levels") {
    const res = sc.Y(sc.hi - (sc.hi - sc.lo) * 0.12);
    const sup = sc.Y(sc.lo + (sc.hi - sc.lo) * 0.12);
    out.unshift(
      <rect key="rz" x={A.x} y={res - 7} width={A.w} height={14} fill={C.red} opacity={0.16} />,
      <rect key="sz" x={A.x} y={sup - 7} width={A.w} height={14} fill={C.green} opacity={0.16} />,
    );
    out.push(<line key="rl" x1={A.x} x2={A.x + A.w} y1={res} y2={res} stroke={C.red} strokeDasharray="6 5" strokeWidth={1.6} />, <line key="sl" x1={A.x} x2={A.x + A.w} y1={sup} y2={sup} stroke={C.green} strokeDasharray="6 5" strokeWidth={1.6} />);
    out.push(<Tag key="rt" x={A.x + A.w - 6} y={res - 12} anchor="end" text="Сопротивление" color={C.red} />, <Tag key="st" x={A.x + A.w - 6} y={sup + 26} anchor="end" text="Поддержка" color={C.green} />);
  }
  if (variant === "structure") {
    const piv: { i: number; p: number; hi: boolean }[] = [];
    for (let i = 2; i < n - 2; i++) {
      const isH = cs[i].h >= Math.max(...cs.slice(i - 2, i + 3).map((c) => c.h));
      const isL = cs[i].l <= Math.min(...cs.slice(i - 2, i + 3).map((c) => c.l));
      if (isH) piv.push({ i, p: cs[i].h, hi: true });
      else if (isL) piv.push({ i, p: cs[i].l, hi: false });
    }
    out.push(<Poly key="z" uid={uid} glow pts={piv.map((p) => [sc.X(p.i), sc.Y(p.p)])} color={C.gold} w={2} dash="6 4" />);
    let lastH = -1e9;
    let lastL = 1e9;
    piv.forEach((p, k) => {
      let lab: string;
      if (p.hi) {
        lab = p.p > lastH ? "HH" : "LH";
        lastH = p.p;
      } else {
        lab = p.p > lastL ? "HL" : "LL";
        lastL = p.p;
      }
      out.push(<Tag key={`p${k}`} x={sc.X(p.i)} y={sc.Y(p.p) + (p.hi ? -10 : 24)} anchor="middle" size={9} text={lab} color={lab[1] === "H" && lab[0] === "H" ? C.green : lab[0] === "L" && lab[1] === "L" ? C.red : C.gold} />);
    });
  }
  if (variant === "hs") {
    const y = sc.Y(46);
    out.push(<line key="nl" x1={A.x} x2={A.x + A.w} y1={y} y2={y} stroke={C.gold} strokeWidth={2} strokeDasharray="7 5" />);
    out.push(<Tag key="n" x={A.x + 6} y={y - 10} text="Линия шеи" />, <Tag key="h" x={sc.X(15)} y={sc.Y(76) - 10} anchor="middle" text="Голова" color={C.red} />);
    out.push(<Tag key="s1" x={sc.X(6)} y={sc.Y(62) - 10} anchor="middle" text="Плечо" color={C.muted} />, <Tag key="s2" x={sc.X(24)} y={sc.Y(62) - 10} anchor="middle" text="Плечо" color={C.muted} />);
  }
  if (variant === "dtop" || variant === "dbottom") {
    const y = sc.Y(variant === "dtop" ? 39 : 69);
    out.push(<line key="nl" x1={A.x} x2={A.x + A.w} y1={y} y2={y} stroke={C.gold} strokeWidth={2} strokeDasharray="7 5" />);
    out.push(<Tag key="n" x={A.x + 6} y={y - 10} text="Подтверждение" />);
  }
  if (variant === "triangle") {
    const up: [number, number][] = [];
    const lo: [number, number][] = [];
    for (let i = 0; i <= 25; i++) {
      const t = i / (n - 1);
      const a = 22 * (1 - Math.min(t, 0.85) / 0.9);
      up.push([sc.X(i), sc.Y(50 + a)]);
      lo.push([sc.X(i), sc.Y(50 - a)]);
    }
    out.push(<Poly key="u" pts={up} color={C.gold} w={2} dash="6 4" />, <Poly key="l" pts={lo} color={C.gold} w={2} dash="6 4" />);
    out.push(<Tag key="t" x={sc.X(27)} y={sc.Y(70) - 6} anchor="middle" text="Пробой" color={C.green} />);
  }
  if (variant === "breakout") {
    const top = sc.Y(53);
    out.push(<line key="lv" x1={A.x} x2={A.x + A.w} y1={top} y2={top} stroke={C.gold} strokeDasharray="6 5" strokeWidth={1.8} />);
    out.push(<Tag key="b" x={sc.X(19)} y={sc.Y(78) - 12} anchor="middle" text="Пробой" color={C.green} />, <Tag key="r" x={sc.X(25)} y={top + 34} anchor="middle" text="Ретест" color={C.cyan} />);
    out.push(<circle key="rc" cx={sc.X(25)} cy={top} r={9} fill="none" stroke={C.cyan} strokeWidth={2} />);
  }
  if (variant === "flag") {
    out.push(<Tag key="f" x={sc.X(17)} y={sc.Y(58) - 14} anchor="middle" text="Флаг" color={C.gold} />, <Tag key="m" x={sc.X(6)} y={sc.Y(78) - 10} anchor="middle" text="Древко" color={C.green} />);
  }
  if (variant === "volume") {
    let acc = 0;
    const obv = cs.map((c) => (acc += c.c >= c.o ? c.v : -c.v));
    const mn = Math.min(...obv);
    const mx = Math.max(...obv);
    out.push(<Poly key="o" uid={uid} glow pts={obv.map((v, i) => [sc.X(i), main.y + 10 + (1 - (v - mn) / (mx - mn || 1)) * (main.h * 0.4)])} color={C.cyan} w={2} />);
    out.push(<Tag key="t" x={A.x + 6} y={A.y + 20} text="OBV" color={C.cyan} />);
  }
  return <g>{out}</g>;
}
