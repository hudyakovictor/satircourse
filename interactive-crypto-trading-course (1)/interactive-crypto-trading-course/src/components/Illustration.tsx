import { C, Card, Defs, Icon, Mascot, Pill, Sparkle, T, hash, iconForTitle, makeRand, mkK, type K, type Rand } from "@/lib/art/primitives";
import { BookScene, CandleScene, EquityScene, HistScene, TwinScene, isBook, isEquity, isHist, isTwin } from "@/lib/art/charts";
import {
  BracketScene, CalendarScene, CheckScene, DashScene, DocScene, DonutScene, EvidenceScene, FormulaScene, FunnelScene, GridScene,
  LedgerScene, LeverScene, LoopScene, MascotScene, QuadScene, RoadScene, ShieldScene, SnakeScene, TableScene, flavorOf, type Flavor,
} from "@/lib/art/scenes";
import { GlitchScene } from "@/lib/art/glitch";

type Props = {
  seed: string;
  type?: string;
  prompt?: string;
  code?: string;
  accent?: string;
  variant?: "visual" | "cover" | "glitch";
  glitch?: number;
  title?: string;
  className?: string;
};

function chipsFor(s: string, fl: Flavor): [string, string][] {
  if (/stop|invalid|risk|atr|outcome/.test(s)) return [["ВХОД", C.blue], ["СТОП −1R", C.down], ["ЦЕЛЬ +2R", C.up]];
  if (/volume|obv/.test(s)) return [["ОБЪЁМ", C.blue], ["ПОДТВЕРЖДЕНИЕ", C.up], ["НЕТ СИГНАЛА", C.amber]];
  if (/rsi|macd|stoch|diverg|oscill/.test(s)) return [["ЦЕНА", C.blue], ["ИНДИКАТОР", C.violet], ["ЖДЁМ ТРИГГЕР", C.amber]];
  if (/order|book|liquidity|fill|slippage/.test(s)) return [["BID", C.up], ["ASK", C.down], ["ПРОСКАЛЬЗЫВАНИЕ", C.amber]];
  if (/equity|drawdown|monte|curve|survival/.test(s)) return [["КАПИТАЛ", C.blue], ["ПРОСАДКА", C.down], ["ВЫЖИЛ?", C.amber]];
  if (fl === "fund") return [["ТОКЕН", C.blue], ["ФАКТОР", C.violet], ["РИСК", C.down]];
  if (fl === "psych") return [["ТРИГГЕР", C.down], ["ПАУЗА", C.amber], ["ПРАВИЛО", C.up]];
  if (fl === "research") return [["ГИПОТЕЗА", C.blue], ["ТЕСТ", C.violet], ["ВЫВОД", C.up]];
  return [["КОНТЕКСТ", C.blue], ["ТРИГГЕР", C.violet], ["ИНВАЛИДАЦИЯ", C.down]];
}

function pickInfo(type: string, s: string, r: Rand) {
  if (/order book|depth|\bwall\b/.test(s)) return "book";
  if (/funnel/.test(s)) return "funnel";
  if (/roadmap|hundred paper/.test(s)) return "road";
  if (/calendar/.test(s)) return "calendar";
  if (/market cap|fdv/.test(s)) return "donut";
  if (/leverage|margin/.test(s)) return "lever";
  if (/bracket/.test(s)) return "bracket";
  if (/strategy card/.test(s)) return "doc";
  if (/position siz|r multiple|expectancy|win rate/.test(s)) return "formula";
  if (/checklist|gate/.test(s)) return "check";
  if (/dashboard|metrics|leading/.test(s)) return "dash";
  if (/matrix|quadrant|matched|stress cost/.test(s)) return "quad";
  if (/evidence|defense/.test(s)) return "evidence";
  if (/illustration|paperclip|glitch/.test(type.toLowerCase())) return "mascot";
  const pool = ["snake", "loop", "shield", "dash", "mascot", "snake", "loop"];
  return pool[Math.floor(r() * pool.length)];
}

function Cover({ k, r, title, code, accent }: { k: K; r: Rand; title: string; code: string; accent: string }) {
  const ic = iconForTitle(title);
  const fl = flavorOf(title.toLowerCase());
  const sats: [number, number, string][] = [[118, 158, "candle"], [376, 146, "target"], [108, 318, "shield"]];
  const pool = ["candle", "bars", "gauge", "coin", "layers", "flag", "calc", "book", "bolt", "network", "clock", "search", "flask", "bell", "pie", "rocket"] as const;
  const satIcons = sats.map(() => pool[Math.floor(r() * pool.length)]);
  const colors = [C.blue, C.teal, C.violet, C.amber, C.pink, C.up];
  const cameo = r() > 0.4;
  const candles = Array.from({ length: 16 }, () => 0.25 + r() * 0.75);
  void fl;
  return (
    <g>
      <Card k={k} x={28} y={28} w={444} h={444} r={44} />
      <circle cx="250" cy="236" r="150" fill={accent} opacity=".08" />
      <circle cx="250" cy="236" r="112" fill="none" stroke={accent} strokeOpacity=".28" strokeWidth="3" strokeDasharray="3 12" strokeLinecap="round" />
      <T x={62} y={92} size={15} fill={C.mute} anchor="start" w={900}>УРОВЕНЬ</T>
      <T x={60} y={146} size={58} fill={accent} anchor="start" w={900}>{code}</T>
      <circle cx="250" cy="246" r="98" fill={k.card} filter={k.raise} />
      <circle cx="250" cy="246" r="74" fill="#e6ebf6" filter={k.inset} />
      <Icon name={ic} x={250 - 28 * 1.6} y={246 - 24 * 1.6} s={1.6} c={accent} />
      {sats.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x + (i === 0 ? 40 : 0)} cy={y + (i === 0 ? 70 : i === 1 ? 10 : 20)} r="34" fill={k.card} filter={k.raiseS} />
          <Icon name={satIcons[i]} x={x + (i === 0 ? 40 : 0) - 17} y={y + (i === 0 ? 70 : i === 1 ? 10 : 20) - 17} s={0.72} c={colors[(i + Math.floor(r() * 3)) % 6]} />
        </g>
      ))}
      <rect x={56} y={412} width="388" height="42" rx="21" fill="#e6ebf6" filter={k.inset} />
      {candles.map((v, i) => (
        <rect key={i} x={74 + i * 23.2} y={446 - v * 28} width="12" height={v * 28} rx="4" fill={i % 3 === 1 ? C.down : C.up} opacity=".85" />
      ))}
      {cameo && <Mascot k={k} x={376} y={262} s={0.4} flip />}
      <Sparkle x={420} y={70} s={1.3} c={accent} />
      <Sparkle x={200} y={62} s={0.8} c="#fff" />
    </g>
  );
}

export function Illustration({ seed, type = "Иллюстрация", prompt = "", code = "", accent = "#5b7cfa", variant = "visual", glitch = 1, title = "", className }: Props) {
  const u = "a" + hash(seed).toString(36);
  const k = mkK(u);
  const r = makeRand(seed);
  const s = prompt.toLowerCase();
  const fl = flavorOf(s || title.toLowerCase());
  let scene: React.ReactNode;
  let footer = true;

  if (variant === "cover") {
    scene = <Cover k={k} r={r} title={title} code={code} accent={accent} />;
    footer = false;
  } else if (variant === "glitch") {
    scene = <GlitchScene k={k} n={glitch} />;
    footer = false;
  } else if (type === "График" || type.startsWith("Граф")) {
    if (isEquity(s)) scene = <EquityScene k={k} r={r} prompt={s} />;
    else if (isHist(s)) scene = <HistScene k={k} r={r} prompt={s} />;
    else if (isBook(s)) scene = <BookScene k={k} r={r} prompt={s} />;
    else if (isTwin(s)) scene = <TwinScene k={k} r={r} prompt={s} />;
    else scene = <CandleScene k={k} r={r} prompt={s} />;
  } else if (type === "Таблица") {
    if (/calculation|log|journal|fields|row/.test(s) && !/matrix|score/.test(s)) scene = <LedgerScene k={k} r={r} prompt={s} />;
    else if (/grid|matrix|sensitivity|scorecard|rubric|cluster|ladder|threshold|quadrant/.test(s)) scene = <GridScene k={k} r={r} prompt={s} />;
    else scene = <TableScene k={k} r={r} prompt={s} accent={accent} />;
  } else {
    const kind = pickInfo(type, s, r);
    const props = { k, r, prompt: s, accent };
    switch (kind) {
      case "book": scene = <BookScene k={k} r={r} prompt={s} />; break;
      case "funnel": scene = <FunnelScene {...props} />; break;
      case "road": scene = <RoadScene k={k} r={r} prompt={s} />; break;
      case "calendar": scene = <CalendarScene k={k} r={r} prompt={s} />; break;
      case "donut": scene = <DonutScene k={k} r={r} prompt={s} />; break;
      case "lever": scene = <LeverScene k={k} r={r} prompt={s} />; break;
      case "bracket": scene = <BracketScene k={k} r={r} prompt={s} />; break;
      case "doc": scene = <DocScene k={k} r={r} prompt={s} />; break;
      case "formula": scene = <FormulaScene k={k} r={r} prompt={s} />; break;
      case "check": scene = <CheckScene k={k} r={r} prompt={s} />; break;
      case "dash": scene = <DashScene k={k} r={r} prompt={s} />; break;
      case "quad": scene = <QuadScene k={k} r={r} prompt={s} />; break;
      case "evidence": scene = <EvidenceScene {...props} />; break;
      case "mascot": scene = <MascotScene {...props} />; break;
      case "shield": scene = <ShieldScene k={k} r={r} prompt={s} />; break;
      case "loop": scene = <LoopScene {...props} />; break;
      default: scene = <SnakeScene {...props} />;
    }
  }
  const chips = chipsFor(s, fl);
  const label = variant === "visual" ? type.toUpperCase() : "";
  return (
    <svg viewBox="0 0 500 500" width="500" height="500" className={className} role="img" aria-label={prompt || title || "иллюстрация"} style={{ width: "100%", height: "auto", display: "block" }}>
      <Defs u={u} accent={accent} />
      <rect width="500" height="500" rx="40" fill={k.bg} />
      <circle cx="60" cy="440" r="90" fill={accent} opacity=".07" />
      <circle cx="450" cy="60" r="110" fill={C.pink} opacity=".08" />
      <circle cx="470" cy="430" r="70" fill={C.teal} opacity=".08" />
      {scene}
      {variant === "visual" && (
        <g>
          <Pill k={k} x={38} y={8} w={Math.max(92, label.length * 9 + 60)} h={28} text={`${label} · ${code}`} size={11} color={accent} />
          <g transform="translate(426 6) rotate(12 20 20) scale(.85)">
            <Icon name="coin" x={0} y={0} s={0.9} />
          </g>
        </g>
      )}
      {variant === "visual" && footer && chips.map(([t, c], i) => (
        <Pill key={t} k={k} x={38 + i * 146} y={424} w={132} h={32} text={t} size={11.5} color={c} />
      ))}
      <Sparkle x={474} y={250} s={0.9} c="#fff" />
    </svg>
  );
}
