import { O, INK, FONT, esc } from "./base";

type M = (ac: string) => string;

const T = (s: string, x: number, y: number, fs: number, fill = "#111", extra = "") =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs}" fill="${fill}" ${FONT} font-weight="900" ${extra}>${esc(s)}</text>`;

export const MOTIFS: Record<string, M> = {
  whale: () => `<path d="M-56 -28 Q-50 -62 0 -58 Q48 -56 58 -30 Q62 -14 40 -8 Q0 2 -40 -8 Q-58 -14 -56 -28Z" fill="#3b7193" ${O}/>
<path d="M-40 -14 Q0 -2 40 -12 Q20 -6 -40 -14Z" fill="#b9d8e6"/>
<path d="M56 -30 Q78 -50 84 -72 Q70 -58 60 -56 Q70 -76 90 -84 Q62 -78 52 -50Z" fill="#2d5a78" ${O}/>
<circle cx="-30" cy="-34" r="4.5" fill="#fff" ${O}/><circle cx="-29" cy="-34" r="2" fill="#000"/>
<path d="M-34 -58 Q-34 -80 -24 -92 M-34 -60 Q-46 -78 -52 -86" stroke="#9fe0ff" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M-74 -2 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#6fb7dc" stroke-width="3"/>`,
  bull: () => `<ellipse cx="6" cy="-42" rx="40" ry="25" fill="#8a4b2a" ${O}/>
<rect x="-24" y="-28" width="10" height="28" rx="3" fill="#6c3a20" ${O}/><rect x="26" y="-28" width="10" height="28" rx="3" fill="#6c3a20" ${O}/>
<path d="M44 -52 q18 6 14 28" stroke="${INK}" stroke-width="3" fill="none"/>
<ellipse cx="-36" cy="-52" rx="18" ry="15" fill="#9c5a34" ${O}/>
<path d="M-48 -62 q-14 -6 -10 -22 q6 10 14 14 M-26 -64 q8 -10 2 -24 q-2 12 -10 16" fill="#efe3c0" ${O}/>
<circle cx="-42" cy="-54" r="3" fill="#ff3b3b"/><circle cx="-50" cy="-44" r="2" fill="#000"/><circle cx="-44" cy="-42" r="5" fill="none" stroke="#d8b94a" stroke-width="2"/>`,
  bear: () => `<ellipse cx="0" cy="-40" rx="36" ry="28" fill="#6a5140" ${O}/>
<rect x="-26" y="-22" width="14" height="22" rx="4" fill="#574130" ${O}/><rect x="12" y="-22" width="14" height="22" rx="4" fill="#574130" ${O}/>
<circle cx="0" cy="-78" r="20" fill="#7a5c48" ${O}/><circle cx="-16" cy="-94" r="7" fill="#7a5c48" ${O}/><circle cx="16" cy="-94" r="7" fill="#7a5c48" ${O}/>
<ellipse cx="0" cy="-72" rx="9" ry="7" fill="#c9a98a" ${O} stroke-width="1.6"/><circle cx="0" cy="-74" r="2.5" fill="#000"/>
<circle cx="-8" cy="-82" r="2.4" fill="#000"/><circle cx="8" cy="-82" r="2.4" fill="#000"/>`,
  swan: () => `<ellipse cx="0" cy="-22" rx="40" ry="20" fill="#0e0e14" ${O}/>
<path d="M22 -30 Q46 -40 34 -62 Q22 -84 -2 -82 Q-16 -80 -12 -68" fill="none" stroke="#0e0e14" stroke-width="12" stroke-linecap="round"/>
<path d="M22 -30 Q46 -40 34 -62 Q22 -84 -2 -82 Q-16 -80 -12 -68" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" opacity=".35"/>
<path d="M-12 -72 l-20 6 l18 6z" fill="#ff8a1f" ${O}/><circle cx="-8" cy="-72" r="2" fill="#fff"/>
<path d="M-30 -22 Q-50 -34 -58 -14 Q-40 -16 -30 -10z" fill="#1b1b26" ${O}/>
<path d="M-56 0 q12 -8 24 0 t24 0 t24 0 t24 0" fill="none" stroke="#3b4a66" stroke-width="3"/>`,
  raven: (ac) => `<ellipse cx="0" cy="-70" rx="34" ry="30" fill="${ac}" opacity=".18"/>
<path d="M-26 -34 Q-30 -66 4 -70 Q34 -70 36 -44 L56 -30 L30 -34 Q10 -14 -14 -24Z" fill="#0a2a35" stroke="${ac}" stroke-width="2.4" stroke-linejoin="round"/>
<circle cx="-14" cy="-60" r="10" fill="#0a2a35" stroke="${ac}" stroke-width="2.4"/><path d="M-22 -60 l-16 4 l16 4z" fill="#ffb454" ${O}/>
<circle cx="-14" cy="-61" r="2.5" fill="${ac}"/><path d="M-4 -44 Q14 -60 34 -40" fill="none" stroke="${ac}" stroke-width="2"/>
<path d="M-6 -14 v14 M8 -14 v14" stroke="${ac}" stroke-width="3"/>`,
  hamster: () => `<circle cx="0" cy="-48" r="44" fill="none" stroke="#5b5f6e" stroke-width="6"/><circle cx="0" cy="-48" r="44" fill="none" stroke="${INK}" stroke-width="1.5"/>
<path d="M0 -92 V-4 M-44 -48 H44 M-31 -79 L31 -17 M31 -79 L-31 -17" stroke="#5b5f6e" stroke-width="2"/>
<ellipse cx="4" cy="-22" rx="17" ry="13" fill="#e89a4c" ${O}/><circle cx="-8" cy="-30" r="9" fill="#f0b474" ${O}/>
<circle cx="-11" cy="-32" r="1.8" fill="#000"/><circle cx="-16" cy="-28" r="1.6" fill="#000"/><circle cx="-6" cy="-40" r="4" fill="#e89a4c" ${O}/>
<path d="M-50 0 h100" stroke="#3a3f4f" stroke-width="5"/>`,
  skeleton: () => `<circle cx="0" cy="-84" r="15" fill="#efe9d6" ${O}/><rect x="-8" y="-72" width="16" height="8" fill="#efe9d6" ${O} stroke-width="1.8"/>
<circle cx="-5.5" cy="-86" r="4" fill="#0b0b10"/><circle cx="5.5" cy="-86" r="4" fill="#0b0b10"/><path d="M-1 -80 l2 0 l-1 -3z" fill="#0b0b10"/>
<path d="M0 -62 V-28" stroke="#efe9d6" stroke-width="6"/><path d="M-16 -58 h32 M-14 -50 h28 M-12 -42 h24 M-10 -34 h20" stroke="#efe9d6" stroke-width="4"/>
<path d="M-16 -58 L-34 -38 L-26 -20 M16 -58 L32 -44 L44 -66" fill="none" stroke="#efe9d6" stroke-width="4"/>
<path d="M-8 -28 L-18 0 M8 -28 L20 0" stroke="#efe9d6" stroke-width="5"/><path d="M-26 0 h16 M14 0 h16" stroke="#efe9d6" stroke-width="4"/>
<rect x="36" y="-90" width="34" height="22" fill="#e8dcc0" ${O}/><path d="M40 -82h26M40 -76h18" stroke="#111" stroke-width="1.6"/>`,
  coffin: () => `<path d="M-34 -84 L34 -84 L48 -58 L34 -4 L-34 -4 L-48 -58Z" fill="#6b5a45" ${O}/><path d="M-26 -74 L26 -74 L38 -56 L26 -14 L-26 -14 L-38 -56Z" fill="none" stroke="#2d241a" stroke-width="2"/>
<path d="M0 -68 v36 M-10 -58 h20" stroke="#d9c38a" stroke-width="4"/>${T("0.87", 0, -20, 12, "#d9c38a")}`,
  rocket: (ac) => `<path d="M0 -100 Q22 -74 18 -28 H-18 Q-22 -74 0 -100Z" fill="#e9e9ef" ${O}/><path d="M-18 -28 L-34 -8 L-18 -14Z M18 -28 L34 -8 L18 -14Z" fill="#d9413f" ${O}/>
<circle cx="0" cy="-66" r="8" fill="${ac}" ${O}/><path d="M-10 -28 Q0 18 10 -28Z" fill="#ffb02e" ${O}/><path d="M-5 -28 Q0 0 5 -28Z" fill="#fff3a8"/>
<path d="M-18 -44 H18" stroke="#c4c4cf" stroke-width="3"/>`,
  candles: () => {
    const cs: [number, number, number, string][] = [
      [-46, 36, 70, "#35e08a"],
      [-26, 50, 82, "#ff4d5e"],
      [-6, 40, 88, "#35e08a"],
      [14, 26, 66, "#ff4d5e"],
      [34, 44, 96, "#35e08a"],
    ];
    return cs
      .map(([x, a, b, c]) => `<line x1="${x}" y1="${-b}" x2="${x}" y2="${-a + 14}" stroke="${c}" stroke-width="3"/><rect x="${x - 8}" y="${-b + 12}" width="16" height="${b - a - 6}" fill="${c}" ${O}/>`)
      .join("") + `<path d="M-58 0 h104" stroke="#4a4f5f" stroke-width="4"/>`;
  },
  anchor: () => `<circle cx="0" cy="-92" r="7" fill="none" stroke="#7d8597" stroke-width="5"/><path d="M0 -86 V-14 M-16 -68 H16" stroke="#7d8597" stroke-width="7" stroke-linecap="round"/>
<path d="M-40 -34 Q-36 -4 0 -6 Q36 -4 40 -34" fill="none" stroke="#7d8597" stroke-width="7" stroke-linecap="round"/><path d="M-40 -34 l-10 10 M40 -34 l10 10" stroke="#7d8597" stroke-width="7" stroke-linecap="round"/>
<path d="M0 -92 q-20 0 -22 -14" stroke="#5a5f70" stroke-width="3" fill="none"/>`,
  umbrella: (ac) => `<path d="M-56 -58 Q-50 -100 0 -102 Q50 -100 56 -58 Q42 -68 28 -58 Q14 -68 0 -58 Q-14 -68 -28 -58 Q-42 -68 -56 -58Z" fill="#c9393f" ${O}/>
<path d="M-28 -58 Q-22 -98 0 -102 M28 -58 Q22 -98 0 -102 M0 -58 V-102" stroke="#f2e6c9" stroke-width="3" fill="none"/>
<path d="M0 -58 V-10 Q0 0 -10 -2" fill="none" stroke="#3a2a1a" stroke-width="5" stroke-linecap="round"/>
<path d="M-50 -90 l-4 10 M50 -92 l4 10 M-30 -110 l-3 9" stroke="${ac}" stroke-width="2"/>`,
  flag: () => `<path d="M-6 0 V-104" stroke="#2a2016" stroke-width="6" stroke-linecap="round"/><path d="M0 -102 Q30 -112 60 -98 Q44 -82 62 -68 Q30 -80 0 -66Z" fill="#ff5c3a" ${O}/>
${T("STOP", 30, -84, 14, "#140a06", 'transform="rotate(-8 30 -84)"')}`,
  scroll: () => `<rect x="-36" y="-84" width="72" height="70" fill="#eadcb5" ${O}/><ellipse cx="0" cy="-84" rx="36" ry="7" fill="#d7c48f" ${O}/><ellipse cx="0" cy="-14" rx="36" ry="7" fill="#d7c48f" ${O}/>
<path d="M-24 -66 h48 M-24 -56 h40 M-24 -46 h46 M-24 -36 h30" stroke="#4a3b1f" stroke-width="2.4"/><circle cx="22" cy="-30" r="8" fill="#b3261e" ${O}/>`,
  key: () => `<circle cx="0" cy="-78" r="18" fill="none" stroke="#e5b93a" stroke-width="9"/><circle cx="0" cy="-78" r="18" fill="none" stroke="${INK}" stroke-width="1.5"/><path d="M0 -60 V-8 M0 -24 h14 M0 -14 h10" stroke="#e5b93a" stroke-width="8" stroke-linecap="round"/>`,
  vault: (ac) => `<rect x="-50" y="-96" width="100" height="92" rx="6" fill="#586071" ${O}/><circle cx="0" cy="-50" r="34" fill="#3e4554" ${O}/><circle cx="0" cy="-50" r="22" fill="#6d7689" ${O}/>
<path d="M0 -72 V-28 M-22 -50 H22 M-16 -66 L16 -34 M16 -66 L-16 -34" stroke="#20242d" stroke-width="4"/><circle cx="0" cy="-50" r="5" fill="${ac}" ${O}/>`,
  hourglass: () => `<path d="M-28 -98 H28 M-28 -6 H28" stroke="#6b4a1f" stroke-width="8" stroke-linecap="round"/><path d="M-22 -94 Q-22 -60 0 -52 Q22 -60 22 -94Z M-22 -10 Q-22 -42 0 -52 Q22 -42 22 -10Z" fill="#bfe8ff" fill-opacity=".35" ${O}/>
<path d="M-14 -16 Q0 -30 14 -16Z" fill="#f0c24a"/><path d="M0 -50 V-32" stroke="#f0c24a" stroke-width="2"/><path d="M-12 -92 Q0 -76 12 -92Z" fill="#f0c24a"/>`,
  lens: (ac) => `<circle cx="-8" cy="-66" r="30" fill="${ac}" fill-opacity=".2" stroke="#b98a3e" stroke-width="8"/><circle cx="-8" cy="-66" r="30" fill="none" stroke="${INK}" stroke-width="1.5"/><path d="M14 -44 L42 -10" stroke="#5b3a1a" stroke-width="10" stroke-linecap="round"/><path d="M-22 -80 q6 -8 14 -8" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`,
  clock: (ac) => `<circle cx="0" cy="-54" r="44" fill="#e9dcc0" ${O}/><circle cx="0" cy="-54" r="36" fill="none" stroke="#2a2016" stroke-width="1.5"/>
${Array.from({ length: 12 }, (_, i) => `<path d="M${(Math.sin((i * Math.PI) / 6) * 32).toFixed(1)} ${(-54 - Math.cos((i * Math.PI) / 6) * 32).toFixed(1)} L${(Math.sin((i * Math.PI) / 6) * 36).toFixed(1)} ${(-54 - Math.cos((i * Math.PI) / 6) * 36).toFixed(1)}" stroke="#2a2016" stroke-width="2"/>`).join("")}
<path d="M0 -54 L0 -82 M0 -54 L22 -46" stroke="#14100a" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="-54" r="4" fill="${ac}" ${O}/>`,
  gavel: () => `<rect x="-36" y="-92" width="48" height="26" rx="4" fill="#7a4a24" ${O} transform="rotate(-24 -12 -80)"/><path d="M-6 -72 L30 -18" stroke="#8c5a2c" stroke-width="10" stroke-linecap="round"/><path d="M-6 -72 L30 -18" stroke="${INK}" stroke-width="1.5"/><ellipse cx="20" cy="-6" rx="40" ry="6" fill="#4a2d16" ${O}/>`,
  bag: () => `<path d="M-14 -88 Q0 -80 14 -88 L8 -72 Q44 -56 40 -24 Q36 -4 0 -4 Q-36 -4 -40 -24 Q-44 -56 -8 -72Z" fill="#c2a15a" ${O}/><path d="M-14 -88 Q0 -96 14 -88" fill="none" stroke="${INK}" stroke-width="3"/>${T("$", 0, -30, 34, "#3a2a10")}`,
  chest: (ac) => `<rect x="-50" y="-52" width="100" height="48" rx="4" fill="#7a4a24" ${O}/><path d="M-50 -52 Q-50 -92 0 -92 Q50 -92 50 -52Z" fill="#8c5a2c" ${O}/><path d="M-50 -52 H50" stroke="#d9b24a" stroke-width="6"/><rect x="-8" y="-62" width="16" height="22" fill="#d9b24a" ${O}/>
<circle cx="-20" cy="-96" r="6" fill="#ffd34d" ${O}/><circle cx="8" cy="-100" r="6" fill="#ffd34d" ${O}/><path d="M-40 -68 l4 -8 M38 -70 l6 -6" stroke="${ac}" stroke-width="2"/>`,
  mirror: () => `<rect x="-34" y="-100" width="68" height="92" rx="34" fill="#9fc0d6" fill-opacity=".45" stroke="#b98a3e" stroke-width="8"/><rect x="-34" y="-100" width="68" height="92" rx="34" fill="none" stroke="${INK}" stroke-width="1.4"/><path d="M-16 -80 L4 -96 M-20 -60 L14 -92" stroke="#fff" stroke-width="3" opacity=".6"/><path d="M-20 -8 L-30 2 M20 -8 L30 2" stroke="#5b3a1a" stroke-width="5"/>`,
  bell: () => `<path d="M-34 -10 Q-34 -54 -22 -70 Q-8 -92 0 -92 Q8 -92 22 -70 Q34 -54 34 -10Z" fill="#d9a83a" ${O}/><ellipse cx="0" cy="-10" rx="38" ry="6" fill="#b98a2a" ${O}/><circle cx="0" cy="0" r="7" fill="#8c5a1e" ${O}/><path d="M-18 -44 H18" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`,
  ticker: (ac) => `<rect x="-62" y="-70" width="124" height="44" rx="4" fill="#06120f" ${O}/><rect x="-58" y="-66" width="116" height="36" rx="2" fill="none" stroke="${ac}" stroke-opacity=".7"/>
<path d="M-50 -38 L-34 -48 L-22 -40 L-4 -58 L12 -44 L30 -52 L50 -40" fill="none" stroke="${ac}" stroke-width="3"/><text x="-54" y="-33" font-size="0" fill="${ac}">.</text><path d="M-8 -26 v26 M8 -26 v26" stroke="#3a3f4f" stroke-width="5"/>`,
  scales: () => `<path d="M0 -96 V-6 M-16 -6 H16" stroke="#b98a3e" stroke-width="6" stroke-linecap="round"/><path d="M-56 -80 H56" stroke="#b98a3e" stroke-width="5"/><path d="M-56 -80 L-70 -44 H-42Z M56 -80 L42 -44 H70Z" fill="none" stroke="#b98a3e" stroke-width="2.4"/>
<path d="M-72 -44 Q-56 -30 -40 -44Z M40 -44 Q56 -30 72 -44Z" fill="#d9b24a" ${O}/><circle cx="0" cy="-96" r="6" fill="#ffd34d" ${O}/>`,
  shield: (ac) => `<path d="M0 -98 Q30 -88 46 -90 Q46 -40 0 -4 Q-46 -40 -46 -90 Q-30 -88 0 -98Z" fill="#3e5a8a" ${O}/><path d="M0 -84 Q22 -78 34 -80 Q34 -44 0 -16 Q-34 -44 -34 -80 Q-22 -78 0 -84Z" fill="none" stroke="${ac}" stroke-width="3"/>${T("1%", 0, -44, 26, "#f4f0da")}`,
  dice: () => `<g transform="rotate(-12 -12 -30)"><rect x="-48" y="-56" width="46" height="46" rx="8" fill="#f2ecd6" ${O}/><circle cx="-36" cy="-44" r="4" fill="#111"/><circle cx="-14" cy="-22" r="4" fill="#111"/><circle cx="-25" cy="-33" r="4" fill="#111"/></g><g transform="rotate(14 24 -40)"><rect x="4" y="-66" width="46" height="46" rx="8" fill="#f2ecd6" ${O}/><circle cx="16" cy="-54" r="4.2" fill="#c21f2a"/><circle cx="38" cy="-32" r="4.2" fill="#c21f2a"/></g>`,
  cards: () => `<g transform="rotate(-22 0 -10)"><rect x="-34" y="-96" width="48" height="70" rx="6" fill="#f3efe0" ${O}/>${T("♠", -10, -52, 34, "#111")}</g><g transform="rotate(0 0 -10)"><rect x="-22" y="-100" width="48" height="70" rx="6" fill="#f3efe0" ${O}/>${T("♥", 2, -54, 34, "#c21f2a")}</g><g transform="rotate(22 0 -10)"><rect x="-8" y="-96" width="48" height="70" rx="6" fill="#f3efe0" ${O}/>${T("♦", 16, -52, 34, "#c21f2a")}</g>`,
  lock: (ac) => `<path d="M-22 -58 V-74 Q-22 -98 0 -98 Q22 -98 22 -74 V-58" fill="none" stroke="#9aa3b5" stroke-width="9" stroke-linecap="round"/><rect x="-38" y="-62" width="76" height="58" rx="8" fill="#d9a83a" ${O}/><circle cx="0" cy="-40" r="8" fill="#20242d" ${O}/><path d="M0 -40 V-22" stroke="#20242d" stroke-width="6"/><path d="M-30 -56 h60" stroke="${ac}" stroke-opacity=".6" stroke-width="2"/>`,
  cup: () => `<path d="M-30 -96 H30 Q32 -56 0 -48 Q-32 -56 -30 -96Z" fill="#e5b93a" ${O}/><path d="M-30 -88 Q-56 -84 -44 -62 Q-38 -56 -28 -60 M30 -88 Q56 -84 44 -62 Q38 -56 28 -60" fill="none" stroke="#e5b93a" stroke-width="6"/><rect x="-6" y="-50" width="12" height="28" fill="#c79a2a" ${O}/><rect x="-26" y="-24" width="52" height="20" rx="3" fill="#3b2a15" ${O}/>${T("1", 0, -62, 20, "#6b4a10")}`,
  crown: () => `<path d="M-46 -30 L-52 -80 L-26 -56 L0 -92 L26 -56 L52 -80 L46 -30Z" fill="#f0c24a" ${O}/><rect x="-46" y="-32" width="92" height="14" fill="#d9a82a" ${O}/><circle cx="-52" cy="-82" r="5" fill="#ff4d5e" ${O}/><circle cx="0" cy="-94" r="5" fill="#35e08a" ${O}/><circle cx="52" cy="-82" r="5" fill="#ff4d5e" ${O}/>`,
  fire: (ac) => `<ellipse cx="0" cy="-10" rx="34" ry="8" fill="#20242d" ${O}/><path d="M-22 -10 Q-34 -40 -8 -62 Q-14 -40 4 -46 Q-4 -74 18 -96 Q16 -66 34 -44 Q40 -24 22 -10Z" fill="#ff8a1f" ${O}/><path d="M-10 -10 Q-18 -28 0 -42 Q4 -30 12 -34 Q20 -22 10 -10Z" fill="#ffd34d"/><path d="M-30 -96 q6 -10 0 -20" stroke="${ac}" stroke-opacity=".0"/>`,
  ice: () => `<path d="M-40 -6 L-44 -70 L-20 -96 L26 -92 L44 -66 L40 -6Z" fill="#b9e6ff" fill-opacity=".6" ${O}/><path d="M-30 -20 L-32 -62 M-6 -24 L-2 -84 M22 -18 L30 -60" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><circle cx="0" cy="-48" r="9" fill="#ffd34d" ${O} fill-opacity=".9"/>`,
  guillotine: () => `<rect x="-40" y="-100" width="10" height="96" fill="#5b3a1a" ${O}/><rect x="30" y="-100" width="10" height="96" fill="#5b3a1a" ${O}/><rect x="-44" y="-104" width="88" height="10" fill="#6b4a1f" ${O}/><path d="M-28 -70 H28 L28 -50 Z" fill="#cfd6e4" ${O}/><path d="M0 -94 V-72" stroke="#2a2016" stroke-width="3"/><rect x="-44" y="-10" width="88" height="8" fill="#3b2a15" ${O}/>`,
  bomb: (ac) => `<circle cx="0" cy="-36" r="30" fill="#1a1c24" ${O}/><path d="M14 -62 Q24 -80 36 -78" stroke="#8a6a3a" stroke-width="5" fill="none"/><path d="M36 -78 l8 -8 M36 -78 l10 4 M36 -78 l-2 -10" stroke="#ffb02e" stroke-width="3"/><path d="M-14 -50 Q-8 -58 2 -58" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none"/>${T("BOOM", 0, -30, 13, ac)}`,
  calendar: (ac) => `<rect x="-46" y="-92" width="92" height="84" rx="6" fill="#efe8d2" ${O}/><rect x="-46" y="-92" width="92" height="22" rx="6" fill="#c9393f" ${O}/><path d="M-26 -100 v14 M26 -100 v14" stroke="#2a2016" stroke-width="5"/>
${Array.from({ length: 12 }, (_, i) => `<rect x="${-38 + (i % 4) * 20}" y="${-64 + Math.floor(i / 4) * 18}" width="14" height="12" fill="${i === 7 ? ac : "#d9d0b2"}" ${O} stroke-width="1"/>`).join("")}`,
  pie: (ac) => `<circle cx="0" cy="-52" r="44" fill="#e5b93a" ${O}/><path d="M0 -52 V-96 A44 44 0 0 1 42 -38Z" fill="#c9393f" ${O}/><path d="M0 -52 L42 -38 A44 44 0 0 1 -10 -8Z" fill="${ac}" ${O}/><path d="M0 -52 L-10 -8 A44 44 0 0 1 -44 -60Z" fill="#3e5a8a" ${O}/>`,
  pipe: () => `<path d="M-60 -30 H-10 V-80 H40 V-40 H70" fill="none" stroke="#5e3b2b" stroke-width="18" stroke-linejoin="round"/><path d="M-60 -30 H-10 V-80 H40 V-40 H70" fill="none" stroke="${INK}" stroke-width="21" stroke-linejoin="round" opacity=".3"/><path d="M-60 -30 H-10 V-80 H40 V-40 H70" fill="none" stroke="#8c5a3a" stroke-width="8" stroke-linejoin="round"/><rect x="-22" y="-92" width="24" height="10" fill="#3a3f4f" ${O}/>`,
  clip: () => `<path d="M-14 -96 V-30 Q-14 -8 4 -8 Q22 -8 22 -30 V-80 Q22 -92 10 -92 Q-2 -92 -2 -80 V-34" fill="none" stroke="#8a8f9c" stroke-width="7" stroke-linecap="round"/><path d="M-14 -96 V-30 Q-14 -8 4 -8 Q22 -8 22 -30 V-80 Q22 -92 10 -92 Q-2 -92 -2 -80 V-34" fill="none" stroke="#b15a2a" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>
<circle cx="-2" cy="-70" r="2" fill="#fff"/><path d="M-8 -64 q8 6 16 0" fill="#9a9a8a" stroke="#4a4a40" stroke-width="2"/><path d="M-12 -62 Q-2 -34 10 -60Z" fill="#a39b88" ${O} stroke-width="1.6"/>
<ellipse cx="-2" cy="-79" rx="14" ry="4" fill="#e0e0e0" stroke="${INK}" stroke-width="1.6"/><path d="M-12 -82 q10 -8 20 0" stroke="#8c7a52" stroke-width="5" fill="none"/>`,
  lamp: (ac) => `<path d="M0 -6 V-82" stroke="#20242d" stroke-width="6"/><rect x="-14" y="-104" width="28" height="24" rx="4" fill="${ac}" fill-opacity=".9" ${O}/><path d="M-18 -104 L0 -116 L18 -104Z" fill="#20242d" ${O}/><circle cx="0" cy="-92" r="26" fill="${ac}" opacity=".18"/><rect x="-10" y="-8" width="20" height="8" fill="#20242d" ${O}/>`,
  chartframe: () => `<rect x="-58" y="-98" width="116" height="84" fill="#3a2d10" ${O}/><rect x="-50" y="-90" width="100" height="68" fill="#070a10" stroke="#d9b24a" stroke-width="2"/><path d="M-42 -40 L-28 -52 L-18 -44 L-4 -70 L10 -58 L24 -62 L42 -78" fill="none" stroke="#35e08a" stroke-width="3"/><path d="M-34 -36 v-6 M-18 -44 v8 M-4 -70 v12 M24 -62 v10" stroke="#ff4d5e" stroke-width="3"/><path d="M-8 -14 v14 M8 -14 v14" stroke="#3a3f4f" stroke-width="5"/>`,
};

export function motif(key: string, x: number, y: number, s: number, ac: string, flip = false) {
  const f = MOTIFS[key] ?? MOTIFS.bag;
  return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${(flip ? -s : s).toFixed(2)} ${s.toFixed(2)})">${f(ac)}</g>`;
}

export const MOTIF_KEYS = Object.keys(MOTIFS);
