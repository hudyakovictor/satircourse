import { O, INK, FONT, MONO, PALETTES, defs, plaque, banner, stars, skyline, crowd, candleChart, rng, esc, wrap } from "./base";
import { motif } from "./motifs";
import type { Sat } from "@/lib/types";

const ID = "s";

type SetFn = (ac: string, r: () => number) => string;

const windowsRow = (xs: number[], y: number, fill: string) => xs.map((x) => `<path d="M${x} ${y} v-18 q8 -10 16 0 v18z" fill="${fill}" ${O} stroke-width="1.6"/>`).join("");

const SETS: Record<string, SetFn> = {
  // A — exchange gate
  A: (ac) => `<rect x="92" y="120" width="44" height="250" fill="#1b2438" ${O}/><polygon points="88,120 114,62 140,120" fill="#10182a" ${O}/>
<rect x="364" y="120" width="44" height="250" fill="#1b2438" ${O}/><polygon points="360,120 386,62 412,120" fill="#10182a" ${O}/>
<rect x="130" y="170" width="240" height="200" fill="#222d45" ${O}/>
<path d="M160 370 V236 Q160 168 250 168 Q340 168 340 236 V370Z" fill="#04060a" ${O}/>
<path d="M146 370 V232 Q146 152 250 152 Q354 152 354 232 V370" fill="none" stroke="#3f4f73" stroke-width="12"/>
<rect x="172" y="108" width="156" height="34" rx="3" fill="#04110e" ${O}/>
<text x="250" y="132" text-anchor="middle" font-size="19" fill="${ac}" ${MONO} font-weight="bold">BTC 62 010 ▲</text>
<circle cx="114" cy="134" r="7" fill="${ac}"/><circle cx="386" cy="134" r="7" fill="${ac}"/>${windowsRow([104, 104, 374, 374], 190, "#ffcf70")}${windowsRow([104, 374], 240, "#ffcf70")}
<path d="M176 370 h148 M170 380 h160" stroke="#3a4560" stroke-width="6"/>`,
  // B — candle gallery
  B: (ac, r) => `<rect x="100" y="104" width="300" height="240" fill="#3a2d10" ${O}/><rect x="114" y="118" width="272" height="212" fill="#070a12" stroke="#d9b24a" stroke-width="3"/>
<path d="M114 160 H386 M114 200 H386 M114 240 H386 M114 280 H386" stroke="#1d2436" stroke-width="1"/>${candleChart(r, 124, 128, 252, 190, 22, 1, true).svg}
<path d="M100 104 L100 70 L136 104Z M400 104 L400 70 L364 104Z" fill="${ac}" ${O}/><circle cx="250" cy="94" r="10" fill="${ac}" ${O}/><path d="M220 344 h60 v26 h-60z" fill="#2a2016" ${O}/>`,
  // C — indicator temple
  C: (ac) => `<polygon points="96,150 250,70 404,150" fill="#143847" ${O}/><rect x="104" y="150" width="292" height="220" fill="#1a4a5c" ${O}/>
<circle cx="250" cy="128" r="42" fill="#06161c" ${O}/><circle cx="250" cy="128" r="34" fill="none" stroke="${ac}" stroke-width="2"/>
${Array.from({ length: 12 }, (_, i) => `<path d="M${(250 + Math.sin((i * Math.PI) / 6) * 28).toFixed(0)} ${(128 - Math.cos((i * Math.PI) / 6) * 28).toFixed(0)} L${(250 + Math.sin((i * Math.PI) / 6) * 34).toFixed(0)} ${(128 - Math.cos((i * Math.PI) / 6) * 34).toFixed(0)}" stroke="${ac}" stroke-width="2"/>`).join("")}
<path d="M250 128 L268 106" stroke="#ff4d5e" stroke-width="3"/><circle cx="250" cy="128" r="4" fill="${ac}"/>
${[130, 210, 290].map((x, i) => `<rect x="${x}" y="196" width="80" height="84" rx="4" fill="#041016" ${O}/><path d="M${x + 6} ${240 + (i % 2) * 6} q10 -34 20 0 t20 0 t20 0 t10 0" fill="none" stroke="${ac}" stroke-width="2.4"/><path d="M${x + 6} 268 h68" stroke="${ac}" stroke-opacity=".4"/>`).join("")}
<rect x="104" y="150" width="14" height="220" fill="#0e2d39" ${O}/><rect x="382" y="150" width="14" height="220" fill="#0e2d39" ${O}/>
${[150, 350].map((x) => `<rect x="${x - 4}" y="326" width="8" height="26" fill="#eadcb5" ${O}/><path d="M${x} 326 q-7 -12 0 -22 q7 10 0 22z" fill="#ffb454"/>`).join("")}`,
  // D — circus tent
  D: (ac) => `${Array.from({ length: 8 }, (_, i) => `<polygon points="250,82 ${100 + i * 37.5},310 ${137.5 + i * 37.5},310" fill="${i % 2 ? "#efe3c0" : "#c9393f"}" ${O}/>`).join("")}
<path d="M100 310 q18.75 26 37.5 0 q18.75 26 37.5 0 q18.75 26 37.5 0 q18.75 26 37.5 0 q18.75 26 37.5 0 q18.75 26 37.5 0 q18.75 26 37.5 0 q18.75 26 37.5 0" fill="#c9393f" ${O}/>
<path d="M250 82 V44" stroke="#2a2016" stroke-width="4"/><path d="M250 44 l34 10 l-34 10z" fill="${ac}" ${O}/>
<path d="M196 372 V286 Q196 236 250 236 Q304 236 304 286 V372Z" fill="#0a0508" ${O}/>
<rect x="212" y="256" width="76" height="50" fill="#e8dcc0" ${O}/><path d="M220 294 L232 280 L240 288 L250 266 L260 288 L268 280 L280 294" fill="none" stroke="#c9393f" stroke-width="3"/>
<rect x="120" y="340" width="260" height="30" fill="#3a1a24" ${O}/>`,
  // E — harbor / depth staircase
  E: (ac) => `<rect x="60" y="300" width="380" height="80" fill="#0a2a3a" ${O}/>
${[0, 1, 2, 3, 4].map((i) => `<rect x="${110 + i * 28}" y="${330 - (4 - i) * 26 - 10}" width="28" height="${(4 - i) * 26 + 60}" fill="#1f9d63" ${O}/>`).join("")}
${[0, 1, 2, 3, 4].map((i) => `<rect x="${250 + i * 28}" y="${330 - i * 26 - 10}" width="28" height="${i * 26 + 60}" fill="#c93a4a" ${O}/>`).join("")}
<path d="M380 200 V120 H300 M300 120 V150" stroke="#d9a83a" stroke-width="7" fill="none"/><rect x="376" y="196" width="14" height="110" fill="#d9a83a" ${O}/><path d="M300 150 l-8 14 h16z" fill="#8a8f9c" ${O}/>
<path d="M90 300 q15 -10 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" fill="none" stroke="${ac}" stroke-width="3"/>
<path d="M130 290 V200 L190 290Z" fill="#efe3c0" ${O}/><path d="M130 290 h70" stroke="#5a3a1a" stroke-width="6"/>`,
  // F — cathedral of vault
  F: (ac) => `<rect x="170" y="130" width="160" height="240" fill="#3b3b1c" ${O}/><polygon points="160,130 250,50 340,130" fill="#2a2a12" ${O}/>
<rect x="110" y="170" width="60" height="200" fill="#343418" ${O}/><polygon points="104,170 140,100 176,170" fill="#24240e" ${O}/>
<rect x="330" y="170" width="60" height="200" fill="#343418" ${O}/><polygon points="324,170 360,100 396,170" fill="#24240e" ${O}/>
<circle cx="250" cy="178" r="38" fill="#0b0b04" ${O}/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M250 178 L${(250 + Math.sin((i * Math.PI) / 3) * 34).toFixed(0)} ${(178 - Math.cos((i * Math.PI) / 3) * 34).toFixed(0)} A34 34 0 0 1 ${(250 + Math.sin(((i + 1) * Math.PI) / 3) * 34).toFixed(0)} ${(178 - Math.cos(((i + 1) * Math.PI) / 3) * 34).toFixed(0)}Z" fill="${["#ffd34d", "#c9393f", "#3e5a8a", "#35e08a", "#ff9f43", "#b48cff"][i]}" stroke="${INK}" stroke-width="1.6"/>`).join("")}
<path d="M210 370 V280 Q210 240 250 240 Q290 240 290 280 V370Z" fill="#20242d" ${O}/><circle cx="250" cy="300" r="22" fill="#586071" ${O}/><circle cx="250" cy="300" r="6" fill="${ac}"/>
<rect x="60" y="332" width="130" height="14" rx="6" fill="#5e3b2b" ${O}/><rect x="310" y="340" width="130" height="14" rx="6" fill="#5e3b2b" ${O}/>
${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${100 + i * 18}" cy="368" rx="14" ry="5" fill="#ffd34d" ${O} stroke-width="1.6"/>`).join("")}`,
  // G — casino
  G: (ac) => `<rect x="104" y="140" width="292" height="230" fill="#2a1d44" ${O}/><rect x="120" y="100" width="260" height="46" rx="6" fill="#140c24" ${O}/>
${Array.from({ length: 13 }, (_, i) => `<circle cx="${132 + i * 19.5}" cy="${i % 2 ? 108 : 138}" r="4.2" fill="${i % 3 ? ac : "#ffd166"}"/>`).join("")}
<text x="250" y="132" text-anchor="middle" font-size="26" fill="${ac}" ${FONT}>КАЗИНО «ПЛЕЧО»</text>
<path d="M104 160 H396 l-14 26 H118z" fill="#c9393f" ${O}/>
${[138, 208, 278].map((x, i) => `<rect x="${x}" y="216" width="60" height="110" rx="6" fill="${["#8a1f2a", "#1f5a8a", "#2a7a3a"][i]}" ${O}/><rect x="${x + 8}" y="228" width="44" height="30" fill="#0b0b10" ${O}/><text x="${x + 30}" y="250" text-anchor="middle" font-size="20" fill="#ffd166" ${FONT}>777</text><path d="M${x + 64} 236 l12 -14" stroke="#ddd" stroke-width="4"/><circle cx="${x + 78}" cy="220" r="5" fill="#ff4d5e" ${O}/>`).join("")}
<rect x="350" y="240" width="36" height="130" fill="#140c24" ${O}/>`,
  // H — bunker
  H: (ac) => `<polygon points="90,370 130,186 370,186 410,370" fill="#4a4f58" ${O}/><rect x="130" y="150" width="240" height="38" fill="#3c4048" ${O}/>
<rect x="170" y="206" width="160" height="14" fill="#06070a" ${O}/><rect x="200" y="240" width="100" height="10" fill="#06070a" ${O}/>
${Array.from({ length: 12 }, (_, i) => `<polygon points="${96 + i * 26},330 ${108 + i * 26},330 ${122 + i * 26},350 ${110 + i * 26},350" fill="${i % 2 ? "#ffd166" : "#15110a"}"/>`).join("")}
<path d="M250 150 V90" stroke="#2a2016" stroke-width="4"/><path d="M250 90 l-14 -14 M250 90 l14 -14 M250 100 l-10 -10 M250 100 l10 -10" stroke="${ac}" stroke-width="3"/>
${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${80 + i * 42}" cy="${366 + (i % 2) * 4}" rx="24" ry="10" fill="#b39b6a" ${O}/>`).join("")}
<path d="M40 300 H460" stroke="${ac}" stroke-width="3" stroke-dasharray="10 8"/><text x="250" y="294" text-anchor="middle" font-size="15" fill="${ac}" ${MONO} font-weight="bold">STOP-LOSS LINE −1R</text>`,
  // I — tavern
  I: (ac) => `<polygon points="100,190 250,106 400,190" fill="#4a2a1c" ${O}/><rect x="116" y="190" width="268" height="180" fill="#6b4a32" ${O}/>
<path d="M116 230 H384 M116 300 H384 M190 190 V370 M310 190 V370" stroke="#2a1a10" stroke-width="6"/>
<rect x="132" y="206" width="44" height="60" fill="#ffb454" ${O}/><rect x="324" y="206" width="44" height="60" fill="#ffb454" ${O}/><path d="M154 206 V266 M132 236 H176 M346 206 V266 M324 236 H368" stroke="#2a1a10" stroke-width="3"/>
<path d="M214 370 V296 Q214 266 250 266 Q286 266 286 296 V370Z" fill="#150c06" ${O}/>
<rect x="210" y="122" width="80" height="34" rx="3" fill="#e8dcc0" ${O}/><text x="250" y="146" text-anchor="middle" font-size="18" fill="#14100a" ${FONT}>ТАВЕРНА «ВСЁ»</text>
<path d="M60 130 H116" stroke="#2a1a10" stroke-width="5"/>
<ellipse cx="136" cy="358" rx="22" ry="12" fill="#5a3a1a" ${O}/><ellipse cx="376" cy="358" rx="22" ry="12" fill="#5a3a1a" ${O}/>
<circle cx="250" cy="322" r="3" fill="${ac}"/>`,
  // J — observatory
  J: (ac) => `<rect x="130" y="240" width="240" height="130" fill="#26305e" ${O}/><path d="M130 240 A120 120 0 0 1 370 240Z" fill="#324074" ${O}/>
<path d="M238 122 L262 122 L268 240 L232 240Z" fill="#05081a" ${O}/>
<rect x="240" y="96" width="22" height="100" rx="4" fill="#cfd6e4" ${O} transform="rotate(28 250 180)"/>
<circle cx="250" cy="180" r="6" fill="${ac}"/>
<rect x="210" y="296" width="80" height="74" rx="36" fill="#0a0d1e" ${O}/>
<rect x="70" y="316" width="70" height="10" fill="#5a3a1a" ${O}/><path d="M84 316 V290 h16 v26 M112 316 l8 -34 l8 34" fill="#9fe0ff" fill-opacity=".5" ${O}/>
<rect x="360" y="330" width="80" height="12" fill="#5a3a1a" ${O}/><rect x="372" y="306" width="56" height="24" fill="#eadcb5" ${O}/><circle cx="400" cy="318" r="7" fill="#c9393f" ${O}/>`,
};

function wraith(x: number, y: number, s: number, ac: string, jokeSeed: number) {
  const r = rng(jokeSeed);
  const syms = ["+9%", "−40%", "LONG", "SL", "OI", "FDV", "RSI", "x50", "ATR"];
  let sy = "";
  for (let i = 0; i < 9; i++) sy += `<text x="${(-34 + r() * 68).toFixed(0)}" y="${(-96 + r() * 84).toFixed(0)}" font-size="${(8 + r() * 4).toFixed(0)}" fill="${r() < 0.5 ? "#35e08a" : "#ff4d5e"}" ${MONO} opacity=".85" font-weight="bold">${syms[i]}</text>`;
  const flame = (fx: number, fy: number, k: number) => `<path d="M${fx - 10 * k} ${fy} Q${fx - 14 * k} ${fy - 20 * k} ${fx} ${fy - 38 * k} Q${fx + 2 * k} ${fy - 20 * k} ${fx + 8 * k} ${fy - 28 * k} Q${fx + 16 * k} ${fy - 12 * k} ${fx + 10 * k} ${fy}Z" fill="${ac}" stroke="#04140c" stroke-width="2"/><path d="M${fx - 4 * k} ${fy} Q${fx - 6 * k} ${fy - 12 * k} ${fx} ${fy - 22 * k} Q${fx + 6 * k} ${fy - 10 * k} ${fx + 4 * k} ${fy}Z" fill="#eafff3" opacity=".75"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">
<circle cx="0" cy="-140" r="82" fill="url(#glow${ID})" opacity=".55"/>
${flame(-24, -166, 1)}${flame(0, -172, 1.3)}${flame(24, -166, 1)}
<path d="M-54 0 Q-66 -92 -34 -146 Q0 -190 34 -146 Q66 -92 54 0 Q30 -10 0 -4 Q-30 -10 -54 0Z" fill="url(#cloak${ID})" ${O}/>
<ellipse cx="0" cy="-138" rx="24" ry="28" fill="#010303" ${O}/>
<ellipse cx="-9" cy="-142" rx="4.5" ry="3" fill="${ac}"/><ellipse cx="9" cy="-142" rx="4.5" ry="3" fill="${ac}"/>
<path d="M-11 -126 Q0 -116 11 -126" fill="none" stroke="${ac}" stroke-width="2.4" stroke-linecap="round"/>
${sy}
<path d="M-46 -104 Q-82 -118 -98 -88" fill="none" stroke="#0d1f1b" stroke-width="14" stroke-linecap="round"/><path d="M46 -104 Q82 -118 98 -88" fill="none" stroke="#0d1f1b" stroke-width="14" stroke-linecap="round"/>
<path d="M-98 -88 l-8 -10 M-98 -88 l-12 -2 M-98 -88 l-6 8 M98 -88 l8 -10 M98 -88 l12 -2 M98 -88 l6 8" stroke="#c9d6cf" stroke-width="3" stroke-linecap="round"/>
${flame(-104, -94, 0.7)}${flame(104, -94, 0.7)}
</g>`;
}

export type SceneArgs = {
  letter: string;
  seed: number;
  slogan: string;
  labels: [string, string];
  motifs: string[];
  badge: string;
  rainy?: boolean;
};

function dedupe(svg: string) {
  return svg.replace(/<([a-zA-Z]+)((?:\s+[\w:-]+="[^"]*")+)\s*(\/?)>/g, (_m, tag: string, attrs: string, close: string) => {
    const map = new Map<string, string>();
    for (const m of attrs.matchAll(/([\w:-]+)="([^"]*)"/g)) map.set(m[1], m[2]);
    return `<${tag} ${[...map].map(([k, v]) => `${k}="${v}"`).join(" ")}${close}>`;
  });
}

function root(body: string, p: { top: string; bot: string; ac: string }) {
  return dedupe(rootRaw(body, p));
}

function rootRaw(body: string, p: { top: string; bot: string; ac: string }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">${defs(ID, p)}<g clip-path="url(#clip${ID})">${body}<rect width="500" height="500" fill="url(#vig${ID})"/><rect width="500" height="500" filter="url(#grain${ID})" opacity=".28"/></g><rect x="3" y="3" width="494" height="494" rx="16" fill="none" stroke="${p.ac}" stroke-opacity=".55" stroke-width="2"/><rect x="0" y="0" width="500" height="500" rx="18" fill="none" stroke="#000" stroke-width="3"/></svg>`;
}

export function renderScene(a: SceneArgs) {
  const p = PALETTES[a.letter] ?? PALETTES.A;
  const r = rng(a.seed * 7919 + 13);
  const moonX = 60 + r() * 380;
  const cheese = r() < 0.3;
  let body = `<rect width="500" height="500" fill="url(#sky${ID})"/>`;
  body += stars(r, 46, 170);
  body += `<circle cx="${moonX.toFixed(0)}" cy="64" r="44" fill="${p.ac}" opacity=".12"/><circle cx="${moonX.toFixed(0)}" cy="64" r="26" fill="${cheese ? "#f3d36b" : "#efe6c8"}" ${O}/>`;
  body += cheese
    ? `<circle cx="${(moonX - 8).toFixed(0)}" cy="58" r="5" fill="#c79a2a"/><circle cx="${(moonX + 9).toFixed(0)}" cy="70" r="4" fill="#c79a2a"/>`
    : `<circle cx="${(moonX - 8).toFixed(0)}" cy="58" r="5" fill="#cfc6a8"/><circle cx="${(moonX + 9).toFixed(0)}" cy="70" r="3.5" fill="#cfc6a8"/>`;
  body += `<g filter="url(#rough${ID})">`;
  body += skyline(r, 330, "#0c0f1c", 60, 150, p.warm, true);
  body += `<ellipse cx="250" cy="250" rx="220" ry="150" fill="url(#glow${ID})" opacity=".22"/>`;
  body += SETS[a.letter]?.(p.ac, r) ?? "";
  body += `<path d="M0 368 Q250 352 500 368 V500 H0Z" fill="url(#gnd${ID})" ${O}/>`;
  for (let i = 0; i < 26; i++) {
    const y = 376 + i * 5;
    body += `<path d="M0 ${y} Q250 ${y - 10 + i * 0.2} 500 ${y}" stroke="#000" stroke-opacity=".3" fill="none"/>`;
  }
  // signboards on posts
  body += `<path d="M42 330 V384 M186 330 V384 M322 318 V384 M468 318 V384" stroke="#2a2016" stroke-width="5"/>`;
  body += plaque(18, 306, 192, 40, a.labels[0], 15, "#e2d3a8", "#15110a", -2);
  body += plaque(300, 294, 192, 40, a.labels[1], 15, "#d9c7a0", "#15110a", 2);
  body += crowd(r, 26, 392, 438, ["#20273a", "#2b2230", "#1d2d2b", "#33293a", "#26262e"], p.ac);
  // motifs
  const ms = a.motifs.length ? a.motifs : ["bag"];
  body += motif(ms[0], 66, 432, 1.05, p.ac);
  body += motif(ms[1 % ms.length], 436, 436, 1.05, p.ac, true);
  body += motif(ms[2 % ms.length], r() < 0.5 ? 150 : 352, 410, 0.68, p.ac);
  body += wraith(250, 428, 1.0, p.ac === "#ff4d5e" ? "#2dff8a" : p.ac, a.seed);
  body += crowd(r, 18, 448, 492, ["#151823", "#1d1620", "#10201e", "#22192a"], p.ac);
  body += `</g>`;
  if (a.rainy) for (let i = 0; i < 70; i++) body += `<path d="M${(r() * 500).toFixed(0)} ${(r() * 500).toFixed(0)} l-5 14" stroke="#cfe" stroke-opacity=".22"/>`;
  body += banner(250, 34, a.slogan, p.ac);
  // badge
  body += `<g transform="translate(44 452)"><circle r="31" fill="${p.ac}" ${O}/><circle r="25" fill="#0b0d14" ${O} stroke-width="1.6"/><text y="11" text-anchor="middle" font-size="${a.badge.length > 2 ? 22 : 28}" fill="${p.ac}" ${FONT}>${esc(a.badge)}</text></g>`;
  return root(body, p);
}

// ---------- paragraph visuals ----------
type VisArgs = { kind: string; prompt: string; seed: number; letter: string; sat: Sat; code: string };

export function renderVisual(v: VisArgs) {
  const p = PALETTES[v.letter] ?? PALETTES.A;
  const r = rng(v.seed * 104729 + 7);
  let body = `<rect width="500" height="500" fill="url(#sky${ID})"/>${stars(r, 30, 120)}`;
  body += `<g filter="url(#rough${ID})">`;
  body += skyline(r, 500, "#0a0c18", 60, 160, p.warm, false);
  const k = v.kind.toLowerCase();
  const pr = v.prompt.toLowerCase();
  const s = v.sat;
  if (k.startsWith("граф")) {
    const trend = /declin|drop|fall|crash|down|bear|loss/.test(pr) ? -1 : /range|side|flat|chop|mean/.test(pr) ? 0 : /spike|cascade|liquidat|squeeze|gap|stress/.test(pr) ? 2 : 1;
    const vol = /volume|flow|tape|depth/.test(pr) || r() < 0.5;
    const ch = candleChart(r, 52, 112, 396, 236, 26, trend, vol);
    body += `<rect x="30" y="96" width="440" height="268" rx="8" fill="#05080f" ${O}/><path d="M30 140 H470 M30 190 H470 M30 240 H470 M30 290 H470" stroke="#1b2233"/>${ch.svg}`;
    const last = ch.data[ch.data.length - 1];
    const ly = 112 + ch.hh - last.c * ch.hh;
    body += `<path d="M52 ${ly.toFixed(0)} H448" stroke="${p.ac}" stroke-dasharray="6 5" stroke-width="1.6"/><rect x="396" y="${(ly - 10).toFixed(0)}" width="74" height="20" fill="${p.ac}" ${O} stroke-width="1.6"/><text x="433" y="${(ly + 5).toFixed(0)}" text-anchor="middle" font-size="13" fill="#05080f" ${MONO} font-weight="bold">${(60000 + Math.floor(last.c * 4000)).toLocaleString("en-US")}</text>`;
    body += `<path d="M112 392 L150 ${(112 + ch.hh * 0.5).toFixed(0)}" stroke="#ffd34d" stroke-width="2.4" marker-end="none"/><path d="M388 392 L330 ${(112 + ch.hh * 0.35).toFixed(0)}" stroke="#ffd34d" stroke-width="2.4"/>`;
    body += plaque(24, 386, 176, 50, s.l[0], 15, "#e2d3a8", "#15110a", -2) + plaque(300, 386, 176, 50, s.l[1], 15, "#d9c7a0", "#15110a", 2);
    body += motif(s.k[0] ?? "candles", 250, 494, 0.72, p.ac);
    body += `<g transform="rotate(-10 420 130)"><rect x="366" y="114" width="98" height="30" fill="none" stroke="#ff4d5e" stroke-width="3"/><text x="415" y="137" text-anchor="middle" font-size="20" fill="#ff4d5e" ${FONT}>ВНИМАНИЕ</text></g>`;
  } else if (k.startsWith("табл")) {
    body += `<path d="M36 120 Q140 96 250 122 Q360 96 464 120 V384 Q360 362 250 388 Q140 362 36 384Z" fill="#e9dcb8" ${O}/><path d="M250 122 V388" stroke="#15110a" stroke-width="3"/>`;
    body += `<text x="143" y="152" text-anchor="middle" font-size="17" fill="#8a1f2a" ${FONT}>МИФ</text><text x="357" y="152" text-anchor="middle" font-size="17" fill="#1f6a3a" ${FONT}>ПРАВДА</text><path d="M52 160 H236 M264 160 H448" stroke="#15110a" stroke-width="2"/>`;
    s.t.slice(0, 3).forEach((row, i) => {
      const y = 186 + i * 66;
      wrap(row[0], 19).slice(0, 3).forEach((l, j) => (body += `<text x="56" y="${y + j * 16}" font-size="13.5" fill="#3a2a1a" ${FONT} opacity=".85">${esc(l)}</text>`));
      body += `<path d="M52 ${y - 4} H236" stroke="#c9393f" stroke-width="2.6" opacity=".8"/>`;
      wrap(row[1], 19).slice(0, 3).forEach((l, j) => (body += `<text x="270" y="${y + j * 16}" font-size="14" fill="#10301c" ${FONT}>${esc(l)}</text>`));
      body += `<text x="436" y="${y + 6}" text-anchor="end" font-size="11" fill="#6a1f1f" ${MONO} font-weight="bold">${esc(row[2].slice(0, 16))}</text>`;
      body += `<path d="M52 ${y + 40} H448" stroke="#15110a" stroke-opacity=".3" stroke-dasharray="3 4"/>`;
    });
    body += `<g transform="rotate(-14 380 360)"><rect x="318" y="336" width="130" height="38" rx="4" fill="none" stroke="#c9393f" stroke-width="4"/><text x="383" y="363" text-anchor="middle" font-size="22" fill="#c9393f" ${FONT}>РЫНОК ПРИНЯЛ</text></g>`;
    body += motif(s.k[1] ?? "bag", 60, 492, 0.8, p.ac) + motif(s.k[2] ?? "chest", 440, 492, 0.8, p.ac, true);
  } else {
    // infographic / scheme / illustration / matrix
    const nodes = [
      { x: 22, y: 118 },
      { x: 308, y: 118 },
      { x: 165, y: 368 },
    ];
    body += `<circle cx="250" cy="260" r="100" fill="url(#glow${ID})" opacity=".5"/>`;
    nodes.forEach((n) => (body += `<path d="M250 260 L${n.x + 85} ${n.y + 35}" stroke="${p.ac}" stroke-width="3" stroke-dasharray="8 6"/>`));
    body += `<circle cx="250" cy="260" r="64" fill="#0a0d16" ${O}/><circle cx="250" cy="260" r="56" fill="none" stroke="${p.ac}" stroke-width="2" stroke-dasharray="4 5"/>${motif(s.k[2] ?? s.k[0] ?? "lens", 250, 300, 0.78, p.ac)}`;
    nodes.forEach((n, i) => {
      const row = s.t[i] ?? s.t[0];
      body += plaque(n.x, n.y, 170, 70, row[1], 14.5, "#e2d3a8", "#15110a", i === 1 ? 2 : -2);
      body += `<circle cx="${n.x + 4}" cy="${n.y + 2}" r="14" fill="${p.ac}" ${O}/><text x="${n.x + 4}" y="${n.y + 8}" text-anchor="middle" font-size="18" fill="#0b0d14" ${FONT}>${i + 1}</text>`;
    });
    body += `<text x="420" y="430" text-anchor="middle" font-size="11" fill="${p.ac}" ${MONO} opacity=".9">${esc(v.kind.toUpperCase())} · ${esc(v.code)}</text>`;
    body += motif(s.k[0] ?? "lens", 440, 480, 0.6, p.ac, true);
  }
  body += `</g>`;
  body += banner(250, 24, s.s, p.ac);
  return root(body, p);
}

// ---------- card icons ----------
export function renderCard(kind: string) {
  const defsP = PALETTES[{ T: "C", P: "A", R: "G", D: "H", E: "J" }[kind] ?? "A"];
  const ac = defsP.ac;
  const label = { T: "ТЕОРИЯ", P: "ПРИМЕР", R: "РЕШЕНИЕ", D: "РАЗБОР", E: "ПРОВЕРКА" }[kind] ?? kind;
  let body = `<rect width="500" height="500" fill="url(#sky${ID})"/><circle cx="250" cy="240" r="210" fill="url(#glow${ID})" opacity=".55"/>`;
  body += `<g filter="url(#rough${ID})">`;
  body += `<circle cx="250" cy="236" r="178" fill="#080a12" ${O}/><circle cx="250" cy="236" r="166" fill="none" stroke="${ac}" stroke-width="3" stroke-dasharray="3 9"/>`;
  if (kind === "R") {
    body += `<rect x="242" y="110" width="16" height="250" fill="#5a3a1a" ${O}/>`;
    [["ЛОНГ", 140, "#1f9d63", 1], ["ШОРТ", 196, "#c93a4a", -1], ["НЕТ СДЕЛКИ", 252, "#6d7689", 1]].forEach(([t, y, c, d]) => {
      const dd = d as number;
      body += `<path d="M${250 - dd * 100} ${y} h${dd * 190} l${dd * 26} 20 l${-dd * 26} 20 h${-dd * 190}z" fill="${c}" ${O}/><text x="${250 + dd * -2}" y="${(y as number) + 28}" text-anchor="middle" font-size="22" fill="#fff" ${FONT}>${t}</text>`;
    });
    body += motif("dice", 250, 356, 0.9, ac);
  } else {
    const key = { T: "scroll", P: "chartframe", D: "lens", E: "bell" }[kind] ?? "scroll";
    body += motif(key, 250, 340, 2.6, ac);
  }
  body += `</g>`;
  body += `<g transform="translate(250 452)"><path d="M-130 -34 h260 l-16 34 l16 34 h-260 l16 -34z" fill="#e8dcc0" ${O}/><text y="12" text-anchor="middle" font-size="38" fill="#14100a" ${FONT} letter-spacing="2">${label}</text></g>`;
  body += `<g transform="translate(62 62)"><circle r="34" fill="${ac}" ${O}/><text y="13" text-anchor="middle" font-size="36" fill="#0b0d14" ${FONT}>${kind}</text></g>`;
  return root(body, defsP);
}
