// Shared helpers for procedural SVG illustration engine (punk-tabloid gothic style)
export const INK = "#07070c";
export const O = `stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
export const FONT = `font-family="Impact,'Arial Black','Helvetica Neue',Arial,sans-serif"`;
export const MONO = `font-family="'Courier New',ui-monospace,monospace"`;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

export const PALETTES: Record<string, { top: string; bot: string; ac: string; warm: string }> = {
  A: { top: "#0a1224", bot: "#2b3d5c", ac: "#3ee6c1", warm: "#ffb454" },
  B: { top: "#160d27", bot: "#3b2b5e", ac: "#b48cff", warm: "#ffb454" },
  C: { top: "#07202c", bot: "#1f4d5e", ac: "#39f0ff", warm: "#ffd166" },
  D: { top: "#240d1c", bot: "#5c2b3d", ac: "#ff6b8a", warm: "#ffc46b" },
  E: { top: "#0a1b26", bot: "#21414f", ac: "#6bf0a2", warm: "#ffb454" },
  F: { top: "#1a1c0c", bot: "#4a4a22", ac: "#ffd34d", warm: "#ff9f43" },
  G: { top: "#170f26", bot: "#3a2a52", ac: "#ff9a3c", warm: "#ffd166" },
  H: { top: "#1c0c0c", bot: "#4a1f1f", ac: "#ff4d4d", warm: "#ffb454" },
  I: { top: "#0b181d", bot: "#2a3f3a", ac: "#8dff6b", warm: "#ff9f43" },
  J: { top: "#0a0d1e", bot: "#1f2a59", ac: "#7aa2ff", warm: "#ffd166" },
};

export function defs(id: string, p: { top: string; bot: string; ac: string }) {
  return `<defs>
<linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.top}"/><stop offset="1" stop-color="${p.bot}"/></linearGradient>
<linearGradient id="gnd${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#20242f"/><stop offset="1" stop-color="#090a10"/></linearGradient>
<radialGradient id="vig${id}" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.78"/></radialGradient>
<radialGradient id="glow${id}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${p.ac}" stop-opacity="0.85"/><stop offset="1" stop-color="${p.ac}" stop-opacity="0"/></radialGradient>
<linearGradient id="cloak${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14332c"/><stop offset="1" stop-color="#050a0a"/></linearGradient>
<filter id="rough${id}" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter>
<filter id="grain${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"/></filter>
<filter id="blur${id}"><feGaussianBlur stdDeviation="6"/></filter>
<clipPath id="clip${id}"><rect width="500" height="500" rx="18"/></clipPath>
</defs>`;
}

export function plaque(x: number, y: number, w: number, h: number, text: string, fs: number, fill = "#e9dcb8", color = "#15110a", rot = 0) {
  const lines = wrap(text, Math.max(6, Math.floor(w / (fs * 0.55))));
  const ty = y + h / 2 - ((lines.length - 1) * fs * 0.55) + fs * 0.35;
  return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" ${O}/>
<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="2" fill="none" stroke="${color}" stroke-opacity=".35" stroke-width="1"/>
${lines
  .slice(0, 3)
  .map((l, i) => `<text x="${x + w / 2}" y="${ty + i * fs * 1.1}" text-anchor="middle" font-size="${fs}" fill="${color}" ${FONT} font-weight="900">${esc(l)}</text>`)
  .join("")}</g>`;
}

export function banner(cx: number, y: number, text: string, ac: string) {
  const words = text.split(" ");
  let lines = wrap(text, 14);
  if (lines.length > 2) lines = [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")];
  const longest = Math.max(...lines.map((l) => l.length));
  const fs = Math.max(17, Math.min(38, 330 / Math.max(longest, 8) * 1.45));
  const w = Math.min(380, longest * fs * 0.56 + 40);
  const h = lines.length * fs * 1.08 + 18;
  const x = cx - w / 2;
  return `<g>
<path d="M${x - 6} ${y - 18} L${x + 10} ${y} M${x + w + 6} ${y - 18} L${x + w - 10} ${y}" stroke="#2a2016" stroke-width="3"/>
<path d="M${x} ${y} h${w} l-6 ${h / 2} l6 ${h / 2} h-${w} l6 -${h / 2} z" fill="#e8dcc0" ${O}/>
<path d="M${x + 6} ${y + 5} h${w - 12}" stroke="#15110a" stroke-opacity=".25" stroke-width="1"/>
${lines
  .map((l, i) => `<text x="${cx}" y="${y + 10 + fs * 0.88 + i * fs * 1.06}" text-anchor="middle" font-size="${fs.toFixed(1)}" fill="#14100a" ${FONT} font-weight="900" letter-spacing="0.5">${esc(l)}</text>`)
  .join("")}
<rect x="${x + w / 2 - 22}" y="${y + h + 2}" width="44" height="3" fill="${ac}" opacity=".9"/></g>`;
}

export function stars(r: () => number, n: number, ymax = 200) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = r() * 500,
      y = r() * ymax,
      q = r() * 1.6 + 0.4;
    s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${q.toFixed(1)}" fill="#fff" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`;
  }
  // constellation
  const cx = 40 + r() * 300,
    cy = 20 + r() * 60;
  let d = `M${cx} ${cy}`;
  let px = cx,
    py = cy;
  for (let i = 0; i < 4; i++) {
    px += 18 + r() * 26;
    py += (r() - 0.5) * 34;
    d += ` L${px.toFixed(0)} ${py.toFixed(0)}`;
    s += `<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="2.2" fill="#9ff"/>`;
  }
  s += `<path d="${d}" stroke="#7ff" stroke-opacity=".5" stroke-width="1" fill="none" stroke-dasharray="3 3"/>`;
  return s;
}

export function skyline(r: () => number, base: number, color: string, hmin: number, hmax: number, lit: string, windows = true) {
  let s = "";
  let x = -20;
  while (x < 520) {
    const w = 26 + r() * 40;
    const h = hmin + r() * (hmax - hmin);
    const kind = r();
    s += `<g fill="${color}" ${O} stroke-opacity=".9">`;
    s += `<rect x="${x.toFixed(0)}" y="${(base - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}"/>`;
    if (kind < 0.55) s += `<polygon points="${x - 3},${base - h} ${x + w / 2},${base - h - w * (0.9 + r())} ${x + w + 3},${base - h}"/>`;
    else if (kind < 0.8) s += `<rect x="${(x + w * 0.3).toFixed(0)}" y="${(base - h - 14).toFixed(0)}" width="${(w * 0.4).toFixed(0)}" height="14"/><polygon points="${x + w * 0.3},${base - h - 14} ${x + w / 2},${base - h - 34} ${x + w * 0.7},${base - h - 14}"/>`;
    else s += `<path d="M${x} ${base - h} h${w} v-6 h-6 v6 h-6 v-6 h-6 v6 h-6 v-6 h-6 v6 h-${w - 30}z"/>`;
    s += `</g>`;
    if (windows) {
      const rows = Math.floor(h / 22);
      for (let i = 0; i < rows; i++)
        for (let j = 0; j < Math.floor(w / 14); j++)
          if (r() < 0.28) s += `<path d="M${(x + 6 + j * 13).toFixed(0)} ${(base - 14 - i * 20).toFixed(0)} v-8 q3 -5 6 0 v8z" fill="${lit}" opacity=".85"/>`;
    }
    x += w + r() * 6;
  }
  return s;
}

export function crowd(r: () => number, n: number, y0: number, y1: number, tone: string[], ac: string) {
  const figs: { x: number; y: number; s: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = r();
    figs.push({ x: r() * 500, y: y0 + t * (y1 - y0), s: 0.55 + t * 0.75 });
  }
  figs.sort((a, b) => a.y - b.y);
  return figs
    .map((f) => {
      const c = tone[Math.floor(r() * tone.length)];
      const sign = r() < 0.12;
      const phone = !sign && r() < 0.15;
      return `<g transform="translate(${f.x.toFixed(0)} ${f.y.toFixed(0)}) scale(${f.s.toFixed(2)})">
<path d="M-9 0 q-3 -26 3 -32 h12 q6 6 3 32z" fill="${c}" ${O}/>
<circle cx="0" cy="-40" r="7.5" fill="${["#d9b38c", "#b98b68", "#8f6a4d", "#e8c9a6"][Math.floor(r() * 4)]}" ${O}/>
<path d="M-8 -42 q8 -10 16 0 q-8 -3 -16 0z" fill="#1a1412"/>
${sign ? `<path d="M9 -30 l8 -34" stroke="#2a2016" stroke-width="2.4"/><rect x="6" y="-82" width="26" height="18" fill="#e8dcc0" ${O}/><path d="M10 -76h18M10 -70h12" stroke="#111" stroke-width="1.6"/>` : ""}
${phone ? `<rect x="6" y="-36" width="6" height="10" fill="${ac}" ${O} stroke-width="1.4"/>` : ""}
</g>`;
    })
    .join("");
}

export function candleChart(r: () => number, x: number, y: number, w: number, h: number, n: number, trend: number, vol = false) {
  // trend: -1 down, 0 range, 1 up, 2 spike
  const data: { o: number; c: number; hi: number; lo: number }[] = [];
  let p = 0.5 - trend * 0.25;
  for (let i = 0; i < n; i++) {
    const drift = trend === 2 ? (i > n * 0.7 ? 0.05 : 0.002) : trend === 0 ? (0.5 - p) * 0.25 : trend * 0.03;
    const o = p;
    const c = Math.max(0.05, Math.min(0.95, o + drift + (r() - 0.5) * 0.14));
    const hi = Math.min(0.98, Math.max(o, c) + r() * 0.06);
    const lo = Math.max(0.02, Math.min(o, c) - r() * 0.06);
    data.push({ o, c, hi, lo });
    p = c;
  }
  const cw = w / n;
  const hh = vol ? h * 0.78 : h;
  let s = "";
  data.forEach((d, i) => {
    const cx = x + i * cw + cw / 2;
    const up = d.c >= d.o;
    const col = up ? "#35e08a" : "#ff4d5e";
    const Y = (v: number) => y + hh - v * hh;
    s += `<line x1="${cx.toFixed(1)}" y1="${Y(d.hi).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${Y(d.lo).toFixed(1)}" stroke="${col}" stroke-width="2"/>`;
    s += `<rect x="${(cx - cw * 0.32).toFixed(1)}" y="${Y(Math.max(d.o, d.c)).toFixed(1)}" width="${(cw * 0.64).toFixed(1)}" height="${Math.max(2, Math.abs(d.c - d.o) * hh).toFixed(1)}" fill="${col}" stroke="${INK}" stroke-width="1.2"/>`;
    if (vol) {
      const vh = (0.15 + r() * 0.85) * h * 0.2;
      s += `<rect x="${(cx - cw * 0.32).toFixed(1)}" y="${(y + h - vh).toFixed(1)}" width="${(cw * 0.64).toFixed(1)}" height="${vh.toFixed(1)}" fill="${col}" opacity=".55"/>`;
    }
  });
  return { svg: s, data, cw, hh };
}
