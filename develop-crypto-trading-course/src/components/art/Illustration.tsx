import { Frame, hash, rng, C, type SceneProps } from "./engine";
import {
  ChartScene, OscScene, BookScene, DepthScene, TapeScene, TableScene, FlowScene, GaugeScene, EquityScene, RDistScene, RRScene,
  LiqScene, UnlockScene, HeatScene, OnchainScene, CheckScene, PsychScene, MascotScene, SessionScene, WaterfallScene, SpacedScene,
  ModelsScene, LineScene,
} from "./scenes";

type Kind =
  | "chart" | "osc" | "book" | "depth" | "tape" | "table" | "flow" | "gauge" | "equity" | "rdist" | "rr" | "liq" | "unlock"
  | "heat" | "onchain" | "check" | "psych" | "mascot" | "sessions" | "waterfall" | "spaced" | "models" | "line";

const RULES: [RegExp, Kind, string][] = [
  [/paperclip|glitch|playful/, "mascot", ""],
  [/queue|price time|order book|book/, "book", "queue"],
  [/depth|wall|liquidity map/, "depth", ""],
  [/tape|aggressor|trade flow/, "tape", ""],
  [/heikin/, "chart", "heikin"],
  [/head and shoulders|head-and-shoulders/, "chart", "hs"],
  [/double top/, "chart", "dtop"],
  [/double bottom/, "chart", "dbottom"],
  [/triangle|wedge|pennant/, "chart", "triangle"],
  [/flag|continuation/, "chart", "flag"],
  [/breakout|retest|fake|false/, "chart", "breakout"],
  [/doji|hammer|engulf|harami|morning|evening|candle pattern|single candle|two candle|three candle|candlestick|ohlc|candle anatomy/, "models", ""],
  [/macd/, "osc", "macd"],
  [/rsi|overbought|oversold/, "osc", "rsi"],
  [/stochastic/, "osc", "stoch"],
  [/\batr\b|volatility|stop distance/, "osc", "atr"],
  [/bollinger|band/, "chart", "bands"],
  [/moving average|crossover|ema|sma|\bma\b/, "chart", "ma"],
  [/obv|volume/, "chart", "volume"],
  [/session|utc|thin market|gap/, "sessions", ""],
  [/fee|slippage|cost|gross|net result|waterfall/, "waterfall", ""],
  [/leverage|margin|liquidat|cascade|funding|perpetual|open interest/, "liq", ""],
  [/tokenomics|supply|unlock|vesting|fdv|emission|market cap|token/, "unlock", ""],
  [/on-chain|onchain|inflow|outflow|tvl|wallet/, "onchain", ""],
  [/fear|greed|sentiment|gauge|news|macro|calendar|event/, "gauge", ""],
  [/correlation|portfolio|cluster|heat/, "heat", ""],
  [/ruin/, "equity", "ruin"],
  [/sample|variance|dispersion|walk-forward|walk forward|backtest|overfit|robust/, "equity", "fan"],
  [/streak|series|run of/, "equity", "streak"],
  [/drawdown|equity|curve/, "equity", "equity"],
  [/expectancy|distribution|r multiple|r-unit|outcome|win rate|edge/, "rdist", ""],
  [/position size|position sizing|stop|risk reward|risk\/reward|reward|1r|risk per trade/, "rr", ""],
  [/psych|emotion|tilt|fomo|revenge|loss aversion|bias|overtrading|cognitive/, "psych", ""],
  [/checklist|journal|audit|discipline|process|template|record/, "check", ""],
  [/repetition|spaced|recall/, "spaced", ""],
  [/scenario|plan|decision|route|pipeline|capstone|playbook|strategy|system|hypothesis|step/, "flow", ""],
  [/support|resistance|zone|level/, "chart", "levels"],
  [/structure|swing|regime|trend|momentum|reversal/, "chart", "structure"],
  [/line chart|area|bar chart|log|scale|timeframe/, "line", ""],
];

const MODULE_DEFAULT: Record<string, [Kind, string]> = {
  A: ["book", ""], B: ["chart", "trend"], C: ["osc", "rsi"], D: ["chart", "hs"], E: ["depth", ""],
  F: ["onchain", ""], G: ["flow", "branch"], H: ["rr", ""], I: ["psych", ""], J: ["check", ""],
};

const TITLE_RULES: [RegExp, Kind, string][] = [
  [/боллинджер/i, "chart", "bands"], [/стохастик/i, "osc", "stoch"], [/\brsi\b/i, "osc", "rsi"], [/macd/i, "osc", "macd"], [/\batr\b/i, "osc", "atr"],
  [/\b(sma|ema)\b|скользящ/i, "chart", "ma"], [/heikin/i, "chart", "heikin"], [/голова и плечи/i, "chart", "hs"], [/двойн/i, "chart", "dtop"],
  [/треугольник|вымпел|флаг/i, "chart", "triangle"], [/пробой|ретест/i, "chart", "breakout"], [/\bobv\b|объём/i, "chart", "volume"],
  [/поддержк|сопротивлен/i, "chart", "levels"], [/swing|hh|структур/i, "chart", "structure"],
  [/неприятие|fomo|revenge|tilt|overtrading|психолог|когнитив/i, "psych", ""], [/корреляц|портфел/i, "heat", ""],
  [/повторен|secret/i, "spaced", ""], [/серии/i, "equity", "streak"], [/ruin|разорен/i, "equity", "ruin"],
  [/выборк|walk-forward|бэктест/i, "equity", "fan"], [/просадк/i, "equity", "equity"],
  [/funding|ликвидац|плечо|маржа/i, "liq", ""], [/токеномик|разблокир|вестинг/i, "unlock", ""], [/on-chain/i, "onchain", ""],
  [/sentiment|новости|страх/i, "gauge", ""], [/журнал|чек-лист|аудит|метрики процесса|дисциплин/i, "check", ""],
  [/свеч/i, "models", ""], [/сесси|гэп/i, "sessions", ""], [/спред|комисс|проскальзыван/i, "waterfall", ""],
  [/r-единиц|размер позиции|стоп/i, "rr", ""], [/стакан|лента/i, "tape", ""],
];

export function pickScene(text: string, vtype: string | undefined, moduleId: string, allowTable: boolean, title?: string): [Kind, string] {
  if (title) for (const [re, k, v] of TITLE_RULES) if (re.test(title)) return [k, v];
  const t = text.toLowerCase();
  if (allowTable && (vtype === "Таблица" || vtype === "Матрица") && !/correlation|heat/.test(t)) return ["table", ""];
  for (const [re, k, v] of RULES) if (re.test(t)) return [k, v];
  if (vtype === "Инфографика" || vtype === "Схема") return ["flow", ""];
  return MODULE_DEFAULT[moduleId] ?? ["chart", "trend"];
}

const TYPE_TAG: Record<string, string> = {
  "График": "ГРАФИК", "Таблица": "ТАБЛИЦА", "Инфографика": "ИНФОГРАФИКА", "Схема": "СХЕМА", "Иллюстрация": "ИЛЛЮСТРАЦИЯ", "Матрица": "МАТРИЦА",
};

export type IllustrationProps = {
  seed: string;
  prompt: string;
  vtype?: string;
  title: string;
  caption?: string;
  code?: string;
  moduleId: string;
  accent: string;
  cover?: boolean;
  /** force kind by prompt text for cover (ignores table) */
};

export function Illustration({ seed, prompt, vtype, title, caption, code, moduleId, accent, cover }: IllustrationProps) {
  const [kind, variant] = pickScene(prompt, vtype, moduleId, !cover, cover ? title : undefined);
  const uid = "i" + hash(seed + (cover ? "c" : "v")).toString(36);
  const r = rng(hash(seed + prompt));
  const A = { x: 40, y: 80, w: 420, h: 290 };
  const p: SceneProps = { uid, r, A, variant, accent };
  let scene;
  switch (kind) {
    case "chart": scene = <ChartScene {...p} />; break;
    case "osc": scene = <OscScene {...p} />; break;
    case "book": scene = <BookScene {...p} />; break;
    case "depth": scene = <DepthScene {...p} />; break;
    case "tape": scene = <TapeScene {...p} />; break;
    case "table": scene = <TableScene {...p} prompt={prompt} />; break;
    case "flow": scene = <FlowScene {...p} />; break;
    case "gauge": scene = <GaugeScene {...p} />; break;
    case "equity": scene = <EquityScene {...p} />; break;
    case "rdist": scene = <RDistScene {...p} />; break;
    case "rr": scene = <RRScene {...p} />; break;
    case "liq": scene = <LiqScene {...p} />; break;
    case "unlock": scene = <UnlockScene {...p} />; break;
    case "heat": scene = <HeatScene {...p} />; break;
    case "onchain": scene = <OnchainScene {...p} />; break;
    case "check": scene = <CheckScene {...p} />; break;
    case "psych": scene = <PsychScene {...p} />; break;
    case "mascot": scene = <MascotScene {...p} />; break;
    case "sessions": scene = <SessionScene {...p} />; break;
    case "waterfall": scene = <WaterfallScene {...p} />; break;
    case "spaced": scene = <SpacedScene {...p} />; break;
    case "models": scene = <ModelsScene {...p} />; break;
    default: scene = <LineScene {...p} />;
  }
  const tag = cover ? `УРОВЕНЬ ${code ?? ""}` : `${code ? code + " · " : ""}${TYPE_TAG[vtype ?? ""] ?? "ГРАФИК"}`;
  return (
    <Frame uid={uid} accent={accent} tag={tag} title={title} cover={cover} caption={caption ?? (cover ? "Signal Arena · курс по торговле криптоактивами" : "Учебная реконструкция · не сигнал для сделки")}>
      {scene}
    </Frame>
  );
}

/* ---------- module icons (line style on light tile) ---------- */
const INK = "#1B2550";
export function ModuleIcon({ id, size = 96 }: { id: string; size?: number }) {
  const s = { stroke: INK, strokeWidth: 3.2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const green = "#19C37D";
  const red = "#E5484D";
  let body;
  switch (id) {
    case "A":
      body = (<g><path d="M14 80 L24 62 H76 L86 80 Z" fill="#AEB8D3" stroke={INK} strokeWidth={3.2} /><path d="M20 80 H80" {...s} /><line x1={50} x2={50} y1={10} y2={56} {...s} /><rect x={40} y={22} width={20} height={26} rx={3} fill={green} stroke={INK} strokeWidth={3.2} /></g>);
      break;
    case "B":
      body = (<g><path d="M16 12 V84 H88" {...s} /><path d="M80 78 l8 6 l-8 6" {...s} strokeWidth={2.6} /><line x1={32} x2={32} y1={34} y2={70} {...s} /><rect x={26} y={44} width={12} height={18} fill={green} stroke={INK} strokeWidth={2.8} /><line x1={50} x2={50} y1={22} y2={62} {...s} /><rect x={44} y={30} width={12} height={22} fill={green} stroke={INK} strokeWidth={2.8} /><line x1={68} x2={68} y1={28} y2={72} {...s} /><rect x={62} y={38} width={12} height={22} fill={red} stroke={INK} strokeWidth={2.8} /></g>);
      break;
    case "C":
      body = (<g><line x1={10} x2={90} y1={24} y2={24} {...s} strokeDasharray="6 6" /><line x1={10} x2={90} y1={76} y2={76} {...s} strokeDasharray="6 6" /><line x1={10} x2={90} y1={50} y2={50} {...s} /><path d="M10 50 C24 10 38 10 50 50 S76 90 90 50" stroke={green} strokeWidth={4} fill="none" strokeLinecap="round" /></g>);
      break;
    case "D":
      body = (<g><line x1={22} x2={22} y1={30} y2={78} {...s} /><rect x={15} y={40} width={14} height={28} fill={INK} /><line x1={42} x2={42} y1={18} y2={62} {...s} /><rect x={35} y={26} width={14} height={26} fill="#fff" stroke={INK} strokeWidth={3.2} /><line x1={62} x2={62} y1={34} y2={86} {...s} /><rect x={55} y={44} width={14} height={30} fill={INK} /><line x1={82} x2={82} y1={22} y2={70} {...s} /><rect x={75} y={32} width={14} height={24} fill="#fff" stroke={INK} strokeWidth={3.2} /></g>);
      break;
    case "E":
      body = (<g><path d="M22 10 H78 V90 L70 84 L62 90 L54 84 L46 90 L38 84 L30 90 L22 84 Z" fill="#fff" stroke={INK} strokeWidth={3.2} strokeLinejoin="round" /><path d="M32 28 l5 5 l9 -10 M32 48 l5 5 l9 -10 M32 68 l5 5 l9 -10" stroke={green} strokeWidth={3.6} fill="none" strokeLinecap="round" /><path d="M54 28 H68 M54 48 H68 M54 68 H66" {...s} strokeWidth={2.6} /></g>);
      break;
    case "F":
      body = (<g><rect x={46} y={14} width={38} height={60} rx={5} fill="#fff" stroke={INK} strokeWidth={3.2} /><path d="M54 30 H76 M54 42 H76 M54 54 H68" {...s} strokeWidth={2.6} /><circle cx={34} cy={56} r={24} fill="#F5C451" stroke={INK} strokeWidth={3.2} /><text x={34} y={66} textAnchor="middle" fontSize={28} fontWeight={900} fill={INK}>₿</text><path d="M58 80 H72 V90" {...s} strokeWidth={2.6} /><circle cx={72} cy={90} r={3} fill={green} /></g>);
      break;
    case "G":
      body = (<g><path d="M50 90 V52 M50 52 L18 26 M50 52 V14 M50 52 L82 26" {...s} /><path d="M40 22 l10 -12 l10 12 M14 38 l4 -16 l16 4 M86 38 l-4 -16 l-16 4" {...s} /></g>);
      break;
    case "H":
      body = (<g><path d="M50 8 L86 20 V48 C86 70 70 84 50 92 C30 84 14 70 14 48 V20 Z" fill="#fff" stroke={INK} strokeWidth={3.2} /><path d="M28 56 A22 22 0 0 1 72 56" stroke={green} strokeWidth={6} fill="none" strokeLinecap="round" /><path d="M28 56 A22 22 0 0 1 40 38" stroke={red} strokeWidth={6} fill="none" strokeLinecap="round" /><line x1={50} y1={56} x2={60} y2={42} {...s} /><circle cx={50} cy={56} r={4} fill={INK} /></g>);
      break;
    case "I":
      body = (<g><path d="M30 88 V68 C16 62 14 44 22 32 C30 16 52 10 68 20 C82 28 84 48 76 58 L74 66 H66 V88 Z" fill="#fff" stroke={INK} strokeWidth={3.2} strokeLinejoin="round" /><path d="M52 40 m0 0 a4 4 0 1 1 4 4 a10 10 0 1 1 -10 -10 a16 16 0 1 1 -16 16" {...s} strokeWidth={2.6} /></g>);
      break;
    default:
      body = (<g><circle cx={50} cy={48} r={14} fill="none" stroke={INK} strokeWidth={3.2} /><circle cx={50} cy={48} r={5} fill={INK} /><path d="M50 26 v-6 M50 76 v-6 M28 48 h-6 M78 48 h-6 M34 32 l-4 -4 M70 68 l4 4 M66 32 l4 -4 M34 64 l-4 4" {...s} strokeWidth={3} /><path d="M20 82 C8 66 8 36 22 18 M80 82 C92 66 92 36 78 18" stroke="#D29A1E" strokeWidth={3.6} fill="none" strokeLinecap="round" /></g>);
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      {body}
    </svg>
  );
}

export { C };
