import type { ReactNode } from "react";
import { Ctx, Shell, hash, rng } from "./core";
import { MOTIFS1 } from "./motifs1";
import { MOTIFS2 } from "./motifs2";

const MOTIFS: Record<string, (c: Ctx) => ReactNode> = { ...MOTIFS1, ...MOTIFS2 };
export type MotifName = keyof typeof MOTIFS | string;

const LESSON_MOTIF =
  "A0 tape,A1 orderbook,A2 longshort,A3 ordertypes,A4 costs,A5 volatility,A6 ticker,A7 journal,A8 risk1,A9 exam," +
  "B10 candles,B11 dojiset,B12 timeframes,B13 calendar,B14 volume,B15 candles,B16 candles,B17 structure,B18 levels,B19 exam," +
  "C20 ma,C21 ma,C22 ma,C23 macd,C24 rsi,C25 rsi,C26 bands,C27 volatility,C28 volume,C29 exam," +
  "D30 pattern,D31 dojiset,D32 dojiset,D33 dojiset,D34 pattern,D35 triangle,D36 levels,D37 volume,D38 stop,D39 exam," +
  "E40 structure,E41 levels,E42 regime,E43 orderbook,E44 costs,E45 ordertypes,E46 stop,E47 strategy,E48 journal,E49 exam," +
  "F50 mascotScene,F51 tokenomics,F52 unlocks,F53 onchain,F54 calendar,F55 sentiment,F56 derivs,F57 liquidation,F58 whale,F59 exam," +
  "G60 scales,G61 ma,G62 bands,G63 levels,G64 regime,G65 regime,G66 timeframes,G67 strategy,G68 backtest,G69 exam," +
  "H70 drawdown,H71 risk1,H72 scales,H73 stop,H74 scales,H75 derivs,H76 liquidation,H77 drawdown,H78 portfolio,H79 exam," +
  "I80 brain,I81 brain,I82 tape,I83 exam,I84 journal,I85 journal,I86 brain,I87 backtest,I88 scales,I89 exam," +
  "J90 scales,J91 backtest,J92 backtest,J93 timeframes,J94 strategy,J95 sentiment,J96 journal,J97 drawdown,J98 exam,J99 mascotScene";

const LM: Record<string, string> = Object.fromEntries(LESSON_MOTIF.split(",").map((s) => s.split(" ")));
export const lessonMotif = (id: string) => LM[id] ?? "candles";

const RULES: [RegExp, string][] = [
  [/rsi|stochastic|oscillat/, "rsi"], [/macd|histogram|diverg/, "macd"], [/bollinger|band/, "bands"],
  [/moving average|crossover|\bema\b|\bsma\b/, "ma"], [/atr|volatil|amplitude/, "volatility"],
  [/volume|obv/, "volume"], [/order book|depth|wall|spread|bid|queue|priority|liquidity/, "orderbook"],
  [/tape|aggressor/, "tape"], [/fee|cost|slippage|maker|taker|fill|partial/, "costs"],
  [/market order|limit order|oco|bracket|order type|stop-limit/, "ordertypes"], [/stop|invalidat|exit/, "stop"],
  [/liquidat|cascade|margin|leverage/, "liquidation"], [/funding|open interest|perpetual/, "derivs"],
  [/tokenomic|supply|fdv|market cap/, "tokenomics"], [/unlock|vesting/, "unlocks"],
  [/on-chain|onchain|tvl|exchange inflow/, "onchain"], [/sentiment|fear|greed/, "sentiment"],
  [/calendar|macro|news|session|gap|event/, "calendar"], [/portfolio|correlation|basket|cluster/, "portfolio"],
  [/drawdown|ruin|survival|losing streak|equity|series/, "drawdown"], [/backtest|walk-forward|sample|variance|curve|overfit/, "backtest"],
  [/expectancy|r-multiple|win rate|risk reward|r:r|breakeven|edge|position size|sizing|formula/, "scales"],
  [/journal|log|checklist|audit|review|playbook|template|capstone/, "journal"],
  [/psycholog|fomo|revenge|tilt|bias|loss aversion|emotion|discipline|overtrad/, "brain"],
  [/head and shoulders|double|reversal|flag|pennant/, "pattern"], [/triangle|continuation|wedge/, "triangle"],
  [/breakout|retest|support|resistance|level|zone/, "levels"], [/candle|doji|hammer|engulf|star|soldier|crow|ohlc|heikin/, "dojiset"],
  [/structure|swing|trend|higher high/, "structure"], [/timeframe|multi/, "timeframes"], [/regime|range|transition/, "regime"],
  [/strategy|scenario|plan|workflow|process|route|flow/, "strategy"], [/whale|small cap|delist|listing/, "whale"],
  [/ticker|watchlist|pair/, "ticker"], [/exam|certificate|rubric|criteria/, "exam"], [/long|short|direction/, "longshort"],
  [/risk/, "risk1"], [/price|chart|line/, "candles"],
];

export function pickMotif(prompt: string, type: string): string {
  const t = prompt.toLowerCase();
  for (const [re, m] of RULES) if (re.test(t)) return m;
  if (type === "Таблица" || type === "Матрица") return "table";
  if (type === "График") return "candles";
  if (type === "Схема") return "strategy";
  if (type === "Иллюстрация") return "mascotScene";
  return "table";
}

export type ArtProps = {
  motif: string;
  seedKey: string;
  accent: string;
  tag: string;
  caption: string;
  mascot?: boolean;
  mood?: "tired" | "smug" | "worried" | "dead";
};

/** Иллюстрация 500×500. Рисуется процедурно, уникальна по seedKey. */
export function Art({ motif, seedKey, accent, tag, caption, mascot, mood }: ArtProps) {
  const seed = hash(seedKey);
  const fn = MOTIFS[motif] ?? MOTIFS.candles;
  const id = `${seed.toString(36)}${accent.slice(1)}`;
  return (
    <Shell id={id} accent={accent} tag={tag} caption={caption} mascot={mascot} mood={mood} seed={seed}>
      {fn({ r: rng(seed), a: accent, seed })}
    </Shell>
  );
}
