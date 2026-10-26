import { C, Card, Pill, T, makeRand, type K, type Rand, n1 } from "./primitives";

type Shape = "up" | "down" | "pull" | "range" | "hs" | "dbl" | "flag" | "fake" | "breakout" | "sweep" | "para" | "div" | "rev";

const ANCH: Record<Shape, [number, number][]> = {
  up: [[0, 0.15], [1, 0.88]],
  down: [[0, 0.88], [1, 0.12]],
  pull: [[0, 0.1], [0.35, 0.62], [0.55, 0.4], [0.75, 0.58], [1, 0.95]],
  range: [[0, 0.5], [0.15, 0.78], [0.3, 0.28], [0.5, 0.78], [0.7, 0.28], [0.85, 0.74], [1, 0.5]],
  hs: [[0, 0.15], [0.15, 0.58], [0.25, 0.4], [0.4, 0.88], [0.55, 0.4], [0.66, 0.58], [0.8, 0.36], [1, 0.1]],
  dbl: [[0, 0.15], [0.25, 0.85], [0.45, 0.5], [0.65, 0.85], [1, 0.12]],
  flag: [[0, 0.12], [0.32, 0.82], [0.5, 0.68], [0.7, 0.74], [0.82, 0.62], [1, 0.98]],
  fake: [[0, 0.4], [0.3, 0.55], [0.5, 0.55], [0.6, 0.8], [0.75, 0.48], [1, 0.25]],
  breakout: [[0, 0.4], [0.15, 0.56], [0.3, 0.4], [0.45, 0.56], [0.6, 0.45], [0.7, 0.6], [1, 0.96]],
  sweep: [[0, 0.4], [0.3, 0.66], [0.5, 0.56], [0.65, 0.88], [0.72, 0.5], [1, 0.12]],
  para: [[0, 0.1], [0.4, 0.2], [0.7, 0.5], [0.85, 0.96], [1, 0.3]],
  div: [[0, 0.2], [0.3, 0.72], [0.5, 0.5], [0.75, 0.88], [1, 0.32]],
  rev: [[0, 0.9], [0.5, 0.14], [0.6, 0.1], [1, 0.62]],
};

function makePath(r: Rand, shape: Shape, n: number) {
  const a = ANCH[shape];
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let j = 0;
    while (j < a.length - 2 && t > a[j + 1][0]) j++;
    const [x0, y0] = a[j];
    const [x1, y1] = a[j + 1];
    const f = Math.min(1, Math.max(0, (t - x0) / (x1 - x0 || 1)));
    out.push(Math.min(0.97, Math.max(0.03, y0 + (y1 - y0) * f + (r() - 0.5) * 0.1)));
  }
  return out;
}

export function pickShape(s: string, r: Rand): Shape {
  if (/head and shoulders/.test(s)) return "hs";
  if (/double/.test(s)) return "dbl";
  if (/flag/.test(s)) return "flag";
  if (/false breakout|failure|reclaim/.test(s)) return "fake";
  if (/sweep/.test(s)) return "sweep";
  if (/breakout|squeeze|neckline/.test(s)) return "breakout";
  if (/parabolic|fomo|listing pump/.test(s)) return "para";
  if (/divergence|without obv/.test(s)) return "div";
  if (/hammer|star|engulfing|support versus/.test(s)) return "rev";
  if (/range|ranging|midpoint/.test(s)) return "range";
  if (/decline|selloff|reversal|loss/.test(s)) return "down";
  if (/uptrend|pullback|impulse|trend|higher highs|moving average/.test(s)) return "pull";
  return (["up", "pull", "range", "breakout", "flag"] as Shape[])[Math.floor(r() * 5)];
}

const sma = (a: number[], n: number) => a.map((_, i) => { const s = a.slice(Math.max(0, i - n + 1), i + 1); return s.reduce((x, y) => x + y, 0) / s.length; });

export function isEquity(s: string) {
  return /equity|capital survival|drawdown|monte carlo|survival|in sample|walk forward|funding cost|losing streak|overfitted|trades gross|compound/.test(s);
}
export function isHist(s: string) {
  return /distribution|histogram|sample size|confidence|r multiple distribution/.test(s);
}
export function isBook(s: string) {
  return /order book|depth|wall/.test(s);
}
export function isTwin(s: string) {
  return /funding|open interest|unlock|active addresses|exchange flows|sentiment|spread|utc|frequency|liquidation|listing|cost/.test(s);
}

/* ---------------- candlestick chart ---------------- */
export function CandleScene({ k, r, prompt }: { k: K; r: Rand; prompt: string }) {
  const s = prompt.toLowerCase();
  const shape = pickShape(s, r);
  const N = 26;
  const closes = makePath(r, shape, N);
  const hasVol = /volume|obv|thin market/.test(s);
  const hasSub = /rsi|macd|oscillator|stochastic|divergence|sentiment/.test(s);
  const hasMA = /moving average|crossover|\bma\b|trend following|mean reversion/.test(s);
  const hasBand = /bollinger|squeeze|band/.test(s);
  const hasLevel = /support|resistance|level|breakout|neckline|range|retest|structure|sweep|wall|reclaim|midpoint/.test(s);
  const hasStop = /stop|invalidation|atr|risk|noise|outcomes/.test(s);
  const dual = /two scales|same crypto history/.test(s);

  const px = 58, py = 94, pw = 384;
  const sub = hasVol || hasSub;
  const ph = sub ? 196 : 280;

  const cs = closes.map((c, i) => {
    const o = i === 0 ? c - 0.05 : closes[i - 1];
    return { o, c, h: Math.min(1, Math.max(o, c) + r() * 0.06), l: Math.max(0, Math.min(o, c) - r() * 0.06) };
  });
  const lo = Math.min(...cs.map((c) => c.l));
  const hi = Math.max(...cs.map((c) => c.h));
  const Y = (v: number) => py + ph - 12 - ((v - lo) / (hi - lo || 1)) * (ph - 24);
  const step = pw / N;
  const X = (i: number) => px + step * i + step / 2;
  const cw = step * 0.56;

  const ma1 = sma(closes, 5);
  const ma2 = sma(closes, 11);
  const bandPts = (() => {
    const up: string[] = [], dn: string[] = [];
    closes.forEach((_, i) => {
      const w = closes.slice(Math.max(0, i - 4), i + 1);
      const m = w.reduce((a, b) => a + b, 0) / w.length;
      const sd = Math.sqrt(w.reduce((a, b) => a + (b - m) ** 2, 0) / w.length) * (shape === "breakout" && i > N * 0.6 ? 2.6 : 1.5) + 0.03;
      up.push(`${n1(X(i))},${n1(Y(m + sd))}`);
      dn.unshift(`${n1(X(i))},${n1(Y(m - sd))}`);
    });
    return [...up, ...dn].join(" ");
  })();

  const entryIdx = shape === "rev" ? 13 : shape === "hs" || shape === "dbl" ? 19 : shape === "breakout" || shape === "flag" ? 21 : shape === "down" ? 10 : 15;
  const levelV = shape === "rev" ? Math.min(...cs.map((c) => c.l)) : shape === "down" || shape === "hs" || shape === "dbl" ? cs[8].l : Math.max(...cs.slice(0, Math.floor(N * 0.65)).map((c) => c.h));
  const stopV = Math.max(lo, (shape === "down" ? Math.max(...cs.map((c) => c.h)) : Math.min(...cs.slice(entryIdx - 3, entryIdx + 1).map((c) => c.l))) - (shape === "down" ? -0.08 : 0.08));

  // sub panel
  const sy = py + ph + 12, sh = 58;
  const vols = cs.map((c, i) => {
    let v = 0.25 + r() * 0.35;
    if (shape === "breakout" && i > N * 0.68) v = 0.75 + r() * 0.25;
    if (shape === "fake" && i > N * 0.58 && i < N * 0.66) v = 0.2;
    if (/low volume/.test(s) && i > N * 0.68) v = 0.15;
    return v;
  });
  const rsi = closes.map((c, i) => {
    const amp = shape === "div" && i > N * 0.6 ? 0.45 : 1;
    return Math.min(0.96, Math.max(0.05, 0.5 + (sma(closes, 3)[i] - 0.5) * 0.95 * amp));
  });

  return (
    <g>
      <Card k={k} x={34} y={46} w={432} h={362} r={32} />
      <Card k={k} x={px - 12} y={py - 12} w={pw + 24} h={ph + 24} r={22} kind="inset" />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={px} x2={px + pw} y1={py + ph * f} y2={py + ph * f} stroke="#d5dcec" strokeWidth="1.5" strokeDasharray="3 6" />
      ))}
      {hasBand && <polygon points={bandPts} fill={C.violet} opacity=".16" stroke={C.violet} strokeOpacity=".4" strokeWidth="1.5" />}
      {hasLevel && (
        <g>
          <line x1={px} x2={px + pw} y1={Y(levelV)} y2={Y(levelV)} stroke={C.amber} strokeWidth="3" strokeDasharray="10 7" strokeLinecap="round" />
          <Pill k={k} x={px + pw - 76} y={Y(levelV) - 34} w={72} h={24} text="УРОВЕНЬ" size={10} color="#b9791a" />
        </g>
      )}
      {cs.map((c, i) => {
        const up = c.c >= c.o;
        const t = Y(Math.max(c.o, c.c)), b = Y(Math.min(c.o, c.c));
        return (
          <g key={i}>
            <line x1={X(i)} x2={X(i)} y1={Y(c.h)} y2={Y(c.l)} stroke={up ? C.up : C.down} strokeWidth="2.4" strokeLinecap="round" />
            <rect x={X(i) - cw / 2} y={t} width={cw} height={Math.max(4, b - t)} rx="3" fill={up ? k.up : k.down} />
          </g>
        );
      })}
      {hasMA && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={ma1.map((v, i) => `${n1(X(i))},${n1(Y(v))}`).join(" ")} stroke={C.amber} strokeWidth="4" />
          <polyline points={ma2.map((v, i) => `${n1(X(i))},${n1(Y(v))}`).join(" ")} stroke={C.blue} strokeWidth="4" />
        </g>
      )}
      {hasStop && (
        <g>
          <line x1={X(entryIdx)} x2={px + pw} y1={Y(stopV)} y2={Y(stopV)} stroke={C.down} strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" />
          <Pill k={k} x={px + pw - 58} y={Y(stopV) + 6} w={54} h={22} text="СТОП" size={10} color={C.down} />
        </g>
      )}
      {/* entry marker */}
      <g>
        <circle cx={X(entryIdx)} cy={Y(cs[entryIdx].c) + (shape === "down" || shape === "hs" || shape === "dbl" ? -22 : 24)} r="13" fill={k.blueG} filter={k.raiseS} />
        <path d={shape === "down" || shape === "hs" || shape === "dbl" ? `M${X(entryIdx) - 5} ${Y(cs[entryIdx].c) - 25}L${X(entryIdx)} ${Y(cs[entryIdx].c) - 18}L${X(entryIdx) + 5} ${Y(cs[entryIdx].c) - 25}` : `M${X(entryIdx) - 5} ${Y(cs[entryIdx].c) + 27}L${X(entryIdx)} ${Y(cs[entryIdx].c) + 20}L${X(entryIdx) + 5} ${Y(cs[entryIdx].c) + 27}`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {hasVol && (
        <g>
          <Card k={k} x={px - 12} y={sy - 6} w={pw + 24} h={sh + 12} r={16} kind="inset" />
          {vols.map((v, i) => (
            <rect key={i} x={X(i) - cw / 2} y={sy + sh - v * sh} width={cw} height={v * sh} rx="3" fill={cs[i].c >= cs[i].o ? C.up : C.down} opacity=".75" />
          ))}
        </g>
      )}
      {hasSub && !hasVol && (
        <g>
          <Card k={k} x={px - 12} y={sy - 6} w={pw + 24} h={sh + 12} r={16} kind="inset" />
          <line x1={px} x2={px + pw} y1={sy + sh * 0.3} y2={sy + sh * 0.3} stroke={C.down} strokeOpacity=".5" strokeDasharray="4 5" />
          <line x1={px} x2={px + pw} y1={sy + sh * 0.7} y2={sy + sh * 0.7} stroke={C.up} strokeOpacity=".5" strokeDasharray="4 5" />
          <polyline points={rsi.map((v, i) => `${n1(X(i))},${n1(sy + sh - v * sh)}`).join(" ")} fill="none" stroke={C.violet} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {dual && (
        <g>
          <Pill k={k} x={px + 6} y={py + 4} w={46} h={22} text="ЛИН" size={10} color={C.blue} />
          <Pill k={k} x={px + 58} y={py + 4} w={46} h={22} text="ЛОГ" size={10} color={C.teal} />
        </g>
      )}
    </g>
  );
}

/* ---------------- equity / curves ---------------- */
function walk(r: Rand, n: number, drift: number, vol: number, start = 0.5) {
  const out = [start];
  for (let i = 1; i < n; i++) out.push(out[i - 1] + drift + (r() - 0.5) * vol);
  return out;
}

export function EquityScene({ k, r, prompt }: { k: K; r: Rand; prompt: string }) {
  const s = prompt.toLowerCase();
  const px = 58, py = 94, pw = 384, ph = 282, N = 40;
  const mc = /monte carlo|one percent versus/.test(s);
  const oos = /in sample|walk forward|overfitted/.test(s);
  const fund = /funding/.test(s);
  const dd = /drawdown|survival|losing streak/.test(s);
  const curves: { pts: number[]; col: string }[] = [];
  if (mc) {
    for (let i = 0; i < 5; i++) curves.push({ pts: walk(r, N, 0.012, 0.09), col: C.up });
    for (let i = 0; i < 4; i++) curves.push({ pts: walk(r, N, -0.012, 0.35), col: C.down });
  } else if (oos) {
    const a = walk(r, N / 2, 0.03, 0.05, 0.2);
    const b = walk(r, N / 2, -0.012, 0.09, a[a.length - 1]);
    curves.push({ pts: [...a, ...b], col: C.blue });
    curves.push({ pts: walk(r, N, 0.012, 0.06, 0.2), col: C.teal });
  } else if (fund) {
    curves.push({ pts: Array.from({ length: N }, () => 0.6), col: C.mute });
    curves.push({ pts: walk(r, N, -0.012, 0.03, 0.62), col: C.down });
  } else if (dd) {
    const a = walk(r, N, 0.012, 0.11, 0.4);
    for (let i = 14; i < 26; i++) a[i] = a[i - 1] - 0.035 - r() * 0.02;
    for (let i = 26; i < N; i++) a[i] = a[i - 1] + 0.03 + r() * 0.02;
    curves.push({ pts: a, col: C.blue });
  } else {
    curves.push({ pts: walk(r, N, 0.02, 0.12, 0.3), col: C.blue });
    curves.push({ pts: walk(r, N, -0.004, 0.1, 0.3), col: C.amber });
  }
  const all = curves.flatMap((c) => c.pts);
  const lo = Math.min(...all), hi = Math.max(...all);
  const X = (i: number) => px + (i / (N - 1)) * pw;
  const Y = (v: number) => py + ph - 14 - ((v - lo) / (hi - lo || 1)) * (ph - 28);
  const main = curves[0];
  const pkI = main.pts.indexOf(Math.max(...main.pts));
  const tr = main.pts.indexOf(Math.min(...main.pts.slice(pkI)));
  return (
    <g>
      <Card k={k} x={34} y={46} w={432} h={362} r={32} />
      <Card k={k} x={px - 12} y={py - 12} w={pw + 24} h={ph + 24} r={22} kind="inset" />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={px} x2={px + pw} y1={py + ph * f} y2={py + ph * f} stroke="#d5dcec" strokeWidth="1.5" strokeDasharray="3 6" />
      ))}
      {oos && (
        <g>
          <rect x={px + pw / 2} y={py} width={pw / 2} height={ph} fill={C.down} opacity=".07" />
          <line x1={px + pw / 2} x2={px + pw / 2} y1={py} y2={py + ph} stroke={C.ink} strokeDasharray="6 6" strokeOpacity=".5" />
          <T x={px + pw * 0.25} y={py + 22} size={11} fill={C.mute}>IN-SAMPLE</T>
          <T x={px + pw * 0.75} y={py + 22} size={11} fill={C.down}>OUT-OF-SAMPLE</T>
        </g>
      )}
      {!mc && (
        <polygon points={`${px},${py + ph} ${main.pts.map((v, i) => `${n1(X(i))},${n1(Y(v))}`).join(" ")} ${px + pw},${py + ph}`} fill={main.col} opacity=".13" />
      )}
      {curves.map((c, i) => (
        <polyline key={i} points={c.pts.map((v, j) => `${n1(X(j))},${n1(Y(v))}`).join(" ")} fill="none" stroke={c.col} strokeWidth={i === 0 || !mc ? 4.5 : 3} opacity={mc ? 0.85 : 1} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={fund && i === 0 ? "8 7" : undefined} />
      ))}
      {dd && !mc && (
        <g>
          <line x1={X(pkI)} x2={X(tr)} y1={Y(main.pts[pkI])} y2={Y(main.pts[pkI])} stroke={C.ink} strokeDasharray="5 5" strokeOpacity=".5" />
          <line x1={X(tr)} x2={X(tr)} y1={Y(main.pts[pkI])} y2={Y(main.pts[tr])} stroke={C.down} strokeWidth="3" strokeLinecap="round" />
          <Pill k={k} x={X(tr) + 8} y={(Y(main.pts[pkI]) + Y(main.pts[tr])) / 2 - 12} w={64} h={24} text="DD −18%" size={10} color={C.down} />
        </g>
      )}
      {mc && (
        <g>
          <Pill k={k} x={px + 8} y={py + 8} w={58} h={24} text="1%" size={12} color={C.up} />
          <Pill k={k} x={px + 72} y={py + 8} w={58} h={24} text="5%" size={12} color={C.down} />
        </g>
      )}
    </g>
  );
}

/* ---------------- histogram ---------------- */
export function HistScene({ k, r, prompt }: { k: K; r: Rand; prompt: string }) {
  const bins = 13;
  const mu = 5 + Math.floor(r() * 2);
  const vals = Array.from({ length: bins }, (_, i) => Math.exp(-((i - mu) ** 2) / (2 * 3.1)) * (0.75 + r() * 0.25));
  const px = 62, py = 100, pw = 376, ph = 250;
  const bw = pw / bins;
  return (
    <g>
      <Card k={k} x={34} y={46} w={432} h={362} r={32} />
      <Card k={k} x={px - 14} y={py - 14} w={pw + 28} h={ph + 34} r={22} kind="inset" />
      {vals.map((v, i) => (
        <rect key={i} x={px + i * bw + 4} y={py + ph - v * (ph - 30)} width={bw - 8} height={v * (ph - 30)} rx="6" fill={i < 4 ? k.down : i < 6 ? C.amber : k.up} opacity={i < 4 ? 0.9 : 0.95} />
      ))}
      <line x1={px + (mu + 0.5) * bw} x2={px + (mu + 0.5) * bw} y1={py - 4} y2={py + ph} stroke={C.ink} strokeWidth="3" strokeDasharray="8 6" />
      <line x1={px} x2={px + pw} y1={py + ph} y2={py + ph} stroke={C.mute} strokeWidth="2" />
      <T x={px + 22} y={py + ph + 18} size={11} fill={C.down}>−3R</T>
      <T x={px + 4 * bw + 6} y={py + ph + 18} size={11} fill={C.mute}>0R</T>
      <T x={px + pw - 20} y={py + ph + 18} size={11} fill={C.up}>+5R</T>
      <Pill k={k} x={px + (mu + 0.5) * bw + 10} y={py + 6} w={78} h={26} text={/sample/.test(prompt) ? "±1.96·SE" : "E = +0.3R"} size={11} color={C.ink} />
    </g>
  );
}

/* ---------------- order book depth ---------------- */
export function BookScene({ k, r, prompt }: { k: K; r: Rand; prompt: string }) {
  const px = 58, py = 98, pw = 384, ph = 260;
  const mid = px + pw / 2;
  const levels = 9;
  const bids: number[] = [], asks: number[] = [];
  let a = 0.12, b = 0.12;
  for (let i = 0; i < levels; i++) {
    a += 0.04 + r() * 0.06;
    b += 0.04 + r() * 0.06;
    bids.push(a);
    asks.push(b);
  }
  const wall = /wall|removed|visible/.test(prompt.toLowerCase());
  const wi = 4;
  if (wall) bids[wi] += 0.22;
  const sw = (pw / 2 - 18) / levels;
  const buildPath = (vals: number[], dir: 1 | -1) => {
    const sx = mid + dir * 18;
    let d = `M${sx} ${py + ph}`;
    vals.forEach((v, i) => {
      const x0 = sx + dir * i * sw, x1 = sx + dir * (i + 1) * sw;
      const y = py + ph - v * ph * 0.95;
      d += ` L${x0} ${y} L${x1} ${y}`;
    });
    d += ` L${sx + dir * levels * sw} ${py + ph} Z`;
    return d;
  };
  return (
    <g>
      <Card k={k} x={34} y={46} w={432} h={362} r={32} />
      <Card k={k} x={px - 12} y={py - 12} w={pw + 24} h={ph + 24} r={22} kind="inset" />
      <path d={buildPath(bids, -1)} fill={C.up} opacity=".5" stroke={C.up} strokeWidth="3" strokeLinejoin="round" />
      <path d={buildPath(asks, 1)} fill={C.down} opacity=".5" stroke={C.down} strokeWidth="3" strokeLinejoin="round" />
      <line x1={mid} x2={mid} y1={py} y2={py + ph} stroke={C.ink} strokeDasharray="6 6" strokeOpacity=".5" />
      <Pill k={k} x={mid - 34} y={py + 6} w={68} h={24} text="СПРЕД" size={10} color={C.ink} />
      {wall && (
        <g>
          <rect x={mid - 18 - (wi + 1) * sw + 3} y={py + ph - bids[wi] * ph * 0.95} width={sw - 6} height={0.22 * ph * 0.95} rx="6" fill="none" stroke={C.ink} strokeWidth="3" strokeDasharray="5 5" />
          <Pill k={k} x={mid - 18 - (wi + 1) * sw - 34} y={py + ph - bids[wi] * ph * 0.95 - 34} w={88} h={24} text="СТЕНА?" size={10} color={C.amber} />
        </g>
      )}
      <T x={px + 44} y={py + ph + 30} size={12} fill={C.up}>BID</T>
      <T x={px + pw - 44} y={py + ph + 30} size={12} fill={C.down}>ASK</T>
    </g>
  );
}

/* ---------------- twin panel: line + bars ---------------- */
export function TwinScene({ k, r, prompt }: { k: K; r: Rand; prompt: string }) {
  const s = prompt.toLowerCase();
  const px = 58, pw = 384, N = 26;
  const line = walk(r, N, /decline|unwind|cascade|liquidation/.test(s) ? -0.02 : 0.02, 0.12, 0.4);
  const lo = Math.min(...line), hi = Math.max(...line);
  const ly = 100, lh = 150;
  const X = (i: number) => px + (i / (N - 1)) * pw;
  const Y = (v: number) => ly + lh - 10 - ((v - lo) / (hi - lo || 1)) * (lh - 20);
  const by = 290, bh = 88;
  const bars = Array.from({ length: N }, (_, i) => {
    const t = i / N;
    let v = 0.3 + r() * 0.4;
    if (/unlock/.test(s) && (i === 8 || i === 18)) v = 1;
    if (/funding/.test(s)) v = Math.sin(t * 6) * 0.45;
    if (/liquidation|listing/.test(s) && i > N * 0.6 && i < N * 0.8) v = 0.95;
    return v;
  });
  const fundingMode = /funding/.test(s);
  return (
    <g>
      <Card k={k} x={34} y={46} w={432} h={362} r={32} />
      <Card k={k} x={px - 12} y={ly - 12} w={pw + 24} h={lh + 24} r={20} kind="inset" />
      <polygon points={`${px},${ly + lh} ${line.map((v, i) => `${n1(X(i))},${n1(Y(v))}`).join(" ")} ${px + pw},${ly + lh}`} fill={C.blue} opacity=".14" />
      <polyline points={line.map((v, i) => `${n1(X(i))},${n1(Y(v))}`).join(" ")} fill="none" stroke={C.blue} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <Card k={k} x={px - 12} y={by - 12} w={pw + 24} h={bh + 24} r={20} kind="inset" />
      {bars.map((v, i) => {
        const w = pw / N - 4;
        const pos = v >= 0;
        const base = fundingMode ? by + bh / 2 : by + bh;
        const h = Math.abs(v) * (fundingMode ? bh / 2 : bh);
        return <rect key={i} x={px + i * (pw / N) + 2} y={pos ? base - h : base} width={w} height={h} rx="3" fill={pos ? (/unlock|liquidation|listing/.test(s) && v > 0.9 ? C.down : C.teal) : C.down} opacity=".9" />;
      })}
      {fundingMode && <line x1={px} x2={px + pw} y1={by + bh / 2} y2={by + bh / 2} stroke={C.mute} strokeDasharray="4 5" />}
      <Pill k={k} x={px + pw - 92} y={ly + 4} w={88} h={24} text={/unlock/.test(s) ? "UNLOCK" : /funding/.test(s) ? "FUNDING" : /sentiment/.test(s) ? "FEAR 22" : "ФАКТОР"} size={10} color={C.violet} />
    </g>
  );
}
export { makeRand };
