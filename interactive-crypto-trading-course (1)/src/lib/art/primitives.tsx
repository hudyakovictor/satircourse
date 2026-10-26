import type { ReactNode } from "react";

export type Rand = () => number;

export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeRand(seed: string): Rand {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T,>(r: Rand, arr: T[]): T => arr[Math.floor(r() * arr.length)];
export function shuffle<T>(r: Rand, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const n1 = (n: number) => Math.round(n * 10) / 10;

export const C = {
  bg: "#e9eef7",
  ink: "#39415f",
  mute: "#8d97b5",
  line: "#cfd7e8",
  up: "#2fbf86",
  down: "#f2647a",
  amber: "#ffb23f",
  blue: "#5b7cfa",
  violet: "#8b6cf6",
  teal: "#2bc0c4",
  pink: "#ff8fb1",
  white: "#ffffff",
};

export const MODULE_COLORS: Record<string, string> = {
  A: "#5b7cfa",
  B: "#2bc0c4",
  C: "#ff9a5b",
  D: "#8b6cf6",
  E: "#3aa0f0",
  F: "#f2647a",
  G: "#e8a317",
  H: "#ef6f55",
  I: "#c36bd8",
  J: "#2fbf86",
};

export function mkK(u: string) {
  const id = (n: string) => `url(#${u}${n})`;
  return {
    u,
    raise: id("raise"),
    raiseS: id("raiseS"),
    inset: id("inset"),
    bg: id("bg"),
    card: id("card"),
    up: id("up"),
    down: id("down"),
    accent: id("accent"),
    rust: id("rust"),
    beard: id("beard"),
    gold: id("gold"),
    blueG: id("blueG"),
  };
}
export type K = ReturnType<typeof mkK>;

function shadowFilter(id: string, d: number, b: number) {
  return (
    <filter id={id} x="-30%" y="-30%" width="170%" height="170%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation={b} result="b" />
      <feOffset in="b" dx={d} dy={d} result="d" />
      <feFlood floodColor="#9fb0cc" floodOpacity="0.62" />
      <feComposite in2="d" operator="in" result="ds" />
      <feOffset in="b" dx={-d} dy={-d} result="l" />
      <feFlood floodColor="#ffffff" floodOpacity="1" />
      <feComposite in2="l" operator="in" result="ls" />
      <feMerge>
        <feMergeNode in="ds" />
        <feMergeNode in="ls" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

export function Defs({ u, accent }: { u: string; accent: string }) {
  const grad = (n: string, a: string, b: string, x2 = 1, y2 = 1) => (
    <linearGradient id={`${u}${n}`} x1="0" y1="0" x2={x2} y2={y2}>
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  );
  return (
    <defs>
      {grad("bg", "#f7f9fe", "#e0e7f3")}
      {grad("card", "#fbfcff", "#e8edf7")}
      {grad("up", "#5fe0a9", "#20a874")}
      {grad("down", "#ff8fa0", "#e04662")}
      {grad("accent", accent, accent + "bb")}
      {grad("rust", "#b98c6a", "#7c5238")}
      {grad("beard", "#b8ad9d", "#7c7164", 0.3, 1)}
      {grad("gold", "#ffe08a", "#f2a81d")}
      {grad("blueG", "#8aa4ff", "#4e6ff0")}
      {shadowFilter(`${u}raise`, 9, 9)}
      {shadowFilter(`${u}raiseS`, 4, 4)}
      <filter id={`${u}inset`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
        <feComponentTransfer in="SourceAlpha">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="5" />
        <feOffset dx="5" dy="5" result="ob" />
        <feFlood floodColor="#8fa1c2" floodOpacity="0.75" />
        <feComposite in2="ob" operator="in" />
        <feComposite in2="SourceAlpha" operator="in" result="sh" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="sh" />
        </feMerge>
      </filter>
    </defs>
  );
}

/* ---------- basic shapes ---------- */
export function Card(p: { k: K; x: number; y: number; w: number; h: number; r?: number; kind?: "raise" | "raiseS" | "inset"; fill?: string }) {
  const { k, x, y, w, h, r = 26, kind = "raise", fill } = p;
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={fill ?? (kind === "inset" ? "#e6ebf6" : k.card)} filter={k[kind]} />;
}

export function Pill(p: { k: K; x: number; y: number; w: number; h?: number; text: string; fill?: string; color?: string; size?: number; kind?: "raise" | "raiseS" | "inset" }) {
  const { k, x, y, w, h = 28, text, fill, color = C.ink, size = 12, kind = "raiseS" } = p;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill ?? k.card} filter={k[kind]} />
      <text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={800} fill={color} fontFamily={FONT}>
        {text}
      </text>
    </g>
  );
}

export const FONT = "'Nunito','SF Pro Rounded','Segoe UI',system-ui,sans-serif";

export function T(p: { x: number; y: number; children: ReactNode; size?: number; fill?: string; w?: number; anchor?: "start" | "middle" | "end"; op?: number }) {
  const { x, y, children, size = 14, fill = C.ink, w = 800, anchor = "middle", op = 1 } = p;
  return (
    <text x={x} y={y} fontSize={size} fontWeight={w} fill={fill} textAnchor={anchor} fontFamily={FONT} opacity={op}>
      {children}
    </text>
  );
}

/* ---------- icons (48x48 box) ---------- */
export type IconName =
  | "candle" | "coin" | "scale" | "shield" | "clock" | "search" | "gauge" | "lock" | "rocket" | "flag"
  | "book" | "brain" | "target" | "calc" | "calendar" | "bolt" | "network" | "bars" | "bell" | "flask"
  | "cap" | "stop" | "check" | "wallet" | "fire" | "layers" | "pie" | "list";

export function iconShape(name: IconName, c: string) {
  const w = "#ffffffcc";
  switch (name) {
    case "candle":
      return (<g><line x1="13" y1="6" x2="13" y2="44" stroke={c} strokeWidth="3" strokeLinecap="round" /><rect x="7" y="15" width="12" height="20" rx="3.5" fill={c} /><line x1="34" y1="4" x2="34" y2="40" stroke={C.up} strokeWidth="3" strokeLinecap="round" /><rect x="28" y="9" width="12" height="22" rx="3.5" fill={C.up} /></g>);
    case "coin":
      return (<g><circle cx="24" cy="24" r="19" fill="#f5b22b" /><circle cx="24" cy="24" r="14" fill="none" stroke={w} strokeWidth="2.5" /><text x="24" y="31" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff" fontFamily={FONT}>₿</text></g>);
    case "scale":
      return (<g stroke={c} strokeWidth="3.4" strokeLinecap="round" fill="none"><path d="M24 7V40M14 41H34M8 14H40" /><path d="M8 14L3 27H13ZM40 14L35 27H45Z" fill={c} fillOpacity=".25" /></g>);
    case "shield":
      return (<g><path d="M24 3L41 9V24C41 34 33 41 24 45C15 41 7 34 7 24V9Z" fill={c} /><path d="M16 24L22 30L33 17" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>);
    case "clock":
      return (<g><circle cx="24" cy="24" r="18" fill="#fff" stroke={c} strokeWidth="4.5" /><path d="M24 13V25L32 30" stroke={c} strokeWidth="3.6" fill="none" strokeLinecap="round" /></g>);
    case "search":
      return (<g><circle cx="20" cy="20" r="13" fill="#ffffffaa" stroke={c} strokeWidth="4.5" /><path d="M30 30L43 43" stroke={c} strokeWidth="6" strokeLinecap="round" /></g>);
    case "gauge":
      return (<g><path d="M6 34A18 18 0 0 1 42 34" stroke={c} strokeWidth="6" fill="none" strokeLinecap="round" opacity=".35" /><path d="M6 34A18 18 0 0 1 28 16.5" stroke={c} strokeWidth="6" fill="none" strokeLinecap="round" /><path d="M24 34L33 21" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" /><circle cx="24" cy="34" r="4.5" fill={C.ink} /></g>);
    case "lock":
      return (<g><path d="M14 21V15A10 10 0 0 1 34 15V21" stroke={c} strokeWidth="5" fill="none" /><rect x="8" y="20" width="32" height="24" rx="7" fill={c} /><circle cx="24" cy="31" r="3.6" fill="#fff" /><rect x="22.6" y="32" width="2.8" height="7" rx="1.4" fill="#fff" /></g>);
    case "rocket":
      return (<g><path d="M24 3C33 11 35 24 31 35H17C13 24 15 11 24 3Z" fill={c} /><circle cx="24" cy="18" r="5" fill="#fff" /><path d="M17 27L8 37L17 35ZM31 27L40 37L31 35Z" fill={C.down} /><path d="M20 38Q24 47 28 38Z" fill={C.amber} /></g>);
    case "flag":
      return (<g><path d="M11 5V44" stroke={C.ink} strokeWidth="4" strokeLinecap="round" /><path d="M13 7H41L34 17L41 27H13Z" fill={c} /></g>);
    case "book":
      return (<g><path d="M4 9C12 6 19 7 24 11V42C19 38 12 37 4 40Z" fill={c} /><path d="M44 9C36 6 29 7 24 11V42C29 38 36 37 44 40Z" fill={c} fillOpacity=".6" /><path d="M9 16C14 15 18 16 20 18M9 23C14 22 18 23 20 25" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" /></g>);
    case "brain":
      return (<g fill={c}><circle cx="16" cy="18" r="9" /><circle cx="31" cy="17" r="9" /><circle cx="14" cy="30" r="8" /><circle cx="33" cy="30" r="8" /><circle cx="24" cy="25" r="10" /><path d="M24 12V38M17 21Q22 24 17 30M31 21Q26 24 31 30" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" /></g>);
    case "target":
      return (<g><circle cx="22" cy="26" r="17" fill="#fff" stroke={c} strokeWidth="3" /><circle cx="22" cy="26" r="10" fill={c} fillOpacity=".25" stroke={c} strokeWidth="3" /><circle cx="22" cy="26" r="3.6" fill={c} /><path d="M22 26L42 6M36 5L43 5L43 12" stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>);
    case "calc":
      return (<g><rect x="8" y="3" width="32" height="42" rx="7" fill={c} /><rect x="13" y="8" width="22" height="9" rx="3" fill="#fff" /><g fill="#fff">{[0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => <rect key={`${i}${j}`} x={13 + j * 8} y={22 + i * 8} width="6" height="5.5" rx="2" />))}</g></g>);
    case "calendar":
      return (<g><rect x="5" y="9" width="38" height="34" rx="8" fill="#fff" stroke={c} strokeWidth="3.5" /><path d="M5 19H43V17A8 8 0 0 0 35 9H13A8 8 0 0 0 5 17Z" fill={c} /><path d="M15 4V13M33 4V13" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" /><g fill={c}><circle cx="15" cy="27" r="2.6" /><circle cx="24" cy="27" r="2.6" /><circle cx="33" cy="27" r="2.6" /><circle cx="15" cy="36" r="2.6" /><circle cx="24" cy="36" r="2.6" fill={C.down} /></g></g>);
    case "bolt":
      return <path d="M28 2L9 26H22L18 46L39 20H26Z" fill={c} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />;
    case "network":
      return (<g><path d="M24 12L10 34M24 12L38 34M10 34H38" stroke={c} strokeWidth="3" /><circle cx="24" cy="11" r="7" fill={c} /><circle cx="10" cy="35" r="7" fill={C.teal} /><circle cx="38" cy="35" r="7" fill={C.amber} /></g>);
    case "bars":
      return (<g><rect x="5" y="26" width="10" height="17" rx="3.5" fill={c} fillOpacity=".55" /><rect x="19" y="14" width="10" height="29" rx="3.5" fill={c} /><rect x="33" y="5" width="10" height="38" rx="3.5" fill={c} fillOpacity=".8" /></g>);
    case "bell":
      return (<g><path d="M24 5C15 5 11 12 11 21C11 30 7 32 7 36H41C41 32 37 30 37 21C37 12 33 5 24 5Z" fill={c} /><circle cx="24" cy="41" r="4.5" fill={C.amber} /></g>);
    case "flask":
      return (<g><path d="M18 4H30M20 4V18L7 38C5 42 8 45 12 45H36C40 45 43 42 41 38L28 18V4" fill="#ffffffaa" stroke={c} strokeWidth="3.4" strokeLinejoin="round" /><path d="M13 33H35L39 40C40 43 38 44 36 44H12C10 44 8 43 9 40Z" fill={c} fillOpacity=".7" /></g>);
    case "cap":
      return (<g><path d="M24 7L45 17L24 27L3 17Z" fill={c} /><path d="M11 23V33C16 39 32 39 37 33V23L24 29Z" fill={c} fillOpacity=".7" /><path d="M42 18V33" stroke={C.amber} strokeWidth="3" strokeLinecap="round" /><circle cx="42" cy="35" r="3" fill={C.amber} /></g>);
    case "stop":
      return (<g><path d="M16 3H32L45 16V32L32 45H16L3 32V16Z" fill={c} /><rect x="12" y="21" width="24" height="6" rx="3" fill="#fff" /></g>);
    case "check":
      return (<g><circle cx="24" cy="24" r="20" fill={c} /><path d="M14 25L21 32L35 16" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>);
    case "wallet":
      return (<g><rect x="3" y="11" width="42" height="31" rx="8" fill={c} /><path d="M8 11L33 5V11Z" fill={c} fillOpacity=".55" /><rect x="29" y="22" width="16" height="11" rx="5" fill="#fff" /><circle cx="35" cy="27.5" r="2.4" fill={c} /></g>);
    case "fire":
      return <path d="M25 2C26 12 37 16 37 29C37 38 31 45 24 45C16 45 10 39 10 31C10 25 14 22 16 17C18 21 19 22 21 22C20 14 22 7 25 2Z" fill={c} />;
    case "layers":
      return (<g><path d="M24 4L44 14L24 24L4 14Z" fill={c} /><path d="M4 22L24 32L44 22" stroke={c} strokeWidth="4.5" fill="none" strokeLinejoin="round" opacity=".7" /><path d="M4 31L24 41L44 31" stroke={c} strokeWidth="4.5" fill="none" strokeLinejoin="round" opacity=".45" /></g>);
    case "pie":
      return (<g><circle cx="24" cy="24" r="19" fill={c} fillOpacity=".3" /><path d="M24 24V5A19 19 0 0 1 43 24Z" fill={c} /><path d="M24 24L43 24A19 19 0 0 1 14 40Z" fill={C.amber} /></g>);
    case "list":
      return (<g><rect x="6" y="4" width="36" height="41" rx="8" fill="#fff" stroke={c} strokeWidth="3.4" /><g stroke={c} strokeWidth="3.4" strokeLinecap="round"><path d="M14 16H16M21 16H34M14 25H16M21 25H34M14 34H16M21 34H30" /></g></g>);
  }
}

export function Icon({ name, x, y, s = 1, c = C.blue }: { name: IconName; x: number; y: number; s?: number; c?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{iconShape(name, c)}</g>;
}

export function IconSvg({ name, color = C.blue, size = 28 }: { name: IconName; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      {iconShape(name, color)}
    </svg>
  );
}

const ICON_RULES: [RegExp, IconName][] = [
  [/экзамен|защит|сертиф|выпускн/i, "cap"],
  [/стоп|инвалид|ошибки/i, "stop"],
  [/разорен|просадк|лимит|риск 1|риск/i, "shield"],
  [/плечо|маржа|ликвид|funding/i, "bolt"],
  [/размер|формул|r-единиц|ожидание|соотношение/i, "calc"],
  [/свеч|heikin|паттерн|модел|фигур|доджи/i, "candle"],
  [/пробой/i, "rocket"],
  [/индикатор|rsi|macd|стохаст|боллинджер|atr|sma|ema|пересечен|obv/i, "gauge"],
  [/журнал|чек-лист|дисциплин|карточк|playbook|метрики/i, "book"],
  [/неприятие|fomo|overtrading|tilt|серии|психолог|искажен/i, "brain"],
  [/токен|эмисси|капитализ|листинг|market sentiment/i, "coin"],
  [/on-chain|портфел|корреляц|проверять/i, "network"],
  [/календар|разблок|новости|макро|сессии|таймфрейм/i, "calendar"],
  [/бэктест|walk|выборк|edge|исследов|аудит|преимущество|capstone/i, "flask"],
  [/стакан|заявк|ордер|исполнен|oco|биржа|тикер/i, "layers"],
  [/спред|комисси|проскальз/i, "pie"],
  [/сценар|стратег|трендов|диапазон|режим/i, "target"],
  [/уровн|тренд|объём|график|масштаб|волатильн|структур/i, "bars"],
];
export function iconForTitle(title: string): IconName {
  for (const [re, ic] of ICON_RULES) if (re.test(title)) return ic;
  return "coin";
}

/* ---------- mascot: Скрепка ---------- */
export function Mascot({ k, x, y, s = 1, flip = false, mood = "point" }: { k: K; x: number; y: number; s?: number; flip?: boolean; mood?: "point" | "shrug" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="90" cy="318" rx="62" ry="9" fill="#8fa1c2" opacity=".28" />
      {/* legs */}
      <path d="M74 250L63 304M106 250L118 304" stroke="#7a4a36" strokeWidth="8" strokeLinecap="round" fill="none" />
      <ellipse cx="55" cy="309" rx="17" ry="7" fill="#7a4a36" />
      <ellipse cx="127" cy="309" rx="17" ry="7" fill="#7a4a36" />
      {/* arms */}
      {mood === "point" ? (
        <path d="M48 170L24 186L10 152" stroke="#8a5a44" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : (
        <path d="M48 170L26 150L20 128" stroke="#8a5a44" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
      <circle cx={mood === "point" ? 9 : 19} cy={mood === "point" ? 147 : 123} r="8.5" fill="#9a6a52" />
      <path d="M132 172L160 188L148 218" stroke="#8a5a44" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="147" cy="222" r="8" fill="#9a6a52" />
      {/* paperclip body */}
      <path d="M78 130V250A28 28 0 0 0 134 250V70A44 44 0 0 0 46 70V210" stroke={k.rust} strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M78 130V250A28 28 0 0 0 134 250V70" stroke="#d3ab8a" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55" transform="translate(-2 -2)" />
      {/* eyes */}
      <circle cx="68" cy="108" r="17" fill="#f3e9df" stroke="#7c5238" strokeWidth="4" />
      <circle cx="112" cy="108" r="17" fill="#f3e9df" stroke="#7c5238" strokeWidth="4" />
      <circle cx="71" cy="114" r="5.5" fill="#3b2a20" />
      <circle cx="115" cy="114" r="5.5" fill="#3b2a20" />
      <path d="M51 108A17 17 0 0 1 85 108Z" fill={k.rust} />
      <path d="M95 108A17 17 0 0 1 129 108Z" fill={k.rust} />
      <path d="M46 90Q60 78 82 88M98 88Q120 78 134 90" stroke="#8b8174" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* beard */}
      <path d="M50 130C44 172 58 218 90 256C122 218 136 172 130 130C112 146 68 146 50 130Z" fill={k.beard} />
      <path d="M62 150Q66 200 90 240M78 150Q82 205 90 246M104 150Q100 200 90 240M118 150Q112 195 96 236" stroke="#6d6358" strokeWidth="2" fill="none" opacity=".5" />
      <path d="M76 146Q90 138 104 146" stroke="#5a4438" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* tape */}
      <g transform="rotate(-7 90 50)">
        <rect x="34" y="34" width="112" height="32" rx="4" fill="#d3c598" />
        <rect x="34" y="34" width="112" height="6" fill="#e6dab0" opacity=".8" />
      </g>
      <g transform="rotate(32 90 50)">
        <rect x="50" y="42" width="84" height="22" rx="3" fill="#c9ba8a" opacity=".92" />
      </g>
      <path d="M142 52L160 44L156 62Z" fill="#d3c598" />
      <path d="M120 26Q130 6 142 18T166 6" stroke="#7a5a48" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  );
}

export function Sparkle({ x, y, s = 1, c = "#fff" }: { x: number; y: number; s?: number; c?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -9C1 -3 3 -1 9 0C3 1 1 3 0 9C-1 3 -3 1 -9 0C-3 -1 -1 -3 0 -9Z" fill={c} opacity=".9" />;
}
