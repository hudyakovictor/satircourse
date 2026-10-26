import { ARCHETYPES, ASSETS, TIMEFRAMES, type Archetype, type Option } from "./content";

export interface Candle { o: number; h: number; l: number; c: number; v: number }
export type Stance = "bull" | "bear" | "neutral" | "risk";
export interface Signal { key: string; label: string; value: string; stance: Stance; noise?: boolean; hidden?: boolean }

export interface Scenario {
  archetype: Archetype;
  asset: string;
  timeframe: string;
  regime: string;
  contextKey: string;
  candles: Candle[]; // visible
  future: Candle[]; // HIDDEN until commit
  levels: { price: number; label: string }[];
  zone: number; // logical retest / entry zone
  structure: number; // structural invalidation level for long
  structureShort: number; // invalidation for short
  entry: number;
  atr: number;
  signals: Signal[];
  difficulty: number; // 1..5 number of informative sources
  aligned: boolean; // whether future matched the "truth" (variance / outcome bias teaching)
}

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pathTo(r: () => number, start: number, drifts: number[], vol: number, vols: number[]): Candle[] {
  const out: Candle[] = [];
  let p = start;
  drifts.forEach((d, i) => {
    const o = p;
    const c = o * (1 + d + (r() - 0.5) * vol);
    const h = Math.max(o, c) * (1 + r() * vol * 0.6);
    const l = Math.min(o, c) * (1 - r() * vol * 0.6);
    out.push({ o, h, l, c, v: vols[i] * (0.8 + r() * 0.4) });
    p = c;
  });
  return out;
}

const seg = (n: number, d: number) => Array(n).fill(d);

export function atrOf(cs: Candle[], n = 14) {
  const s = cs.slice(-n);
  return s.reduce((a, c) => a + (c.h - c.l), 0) / s.length;
}

export function generateScenario(seed: number, archetype: Archetype, difficulty: number): Scenario {
  const r = rng(seed);
  const asset = ASSETS[Math.floor(r() * ASSETS.length)];
  const timeframe = TIMEFRAMES[Math.floor(r() * TIMEFRAMES.length)];
  const vol = 0.008 + r() * 0.01;
  const base = asset.price * (0.9 + r() * 0.2);
  const aligned = r() < 0.78; // 22% of the time a good decision loses: teaches process over outcome
  let drifts: number[] = [];
  let vols: number[] = [];
  let fut: number[] = [];
  let fvols: number[] = [];
  const V = 100;
  switch (archetype) {
    case "real_breakout":
      drifts = [...seg(20, 0.004), ...seg(36, 0), ...seg(4, 0.012)];
      vols = [...seg(20, V), ...seg(36, V * 0.8), ...seg(4, V * 2.2)];
      fut = aligned ? [...seg(4, -0.002), ...seg(16, 0.006)] : [...seg(6, -0.01), ...seg(14, -0.002)];
      fvols = seg(20, V * 1.3);
      break;
    case "fake_breakout":
      drifts = [...seg(20, -0.002), ...seg(36, 0), ...seg(4, 0.01)];
      vols = [...seg(20, V), ...seg(36, V), ...seg(4, V * 0.55)];
      fut = aligned ? [...seg(4, -0.012), ...seg(16, -0.004)] : [...seg(20, 0.006)];
      fvols = seg(20, V * 1.2);
      break;
    case "trend_pullback":
      drifts = [...seg(30, 0.005), ...seg(8, -0.004), ...seg(22, 0.007)];
      vols = [...seg(30, V), ...seg(8, V * 0.7), ...seg(22, V * 1.1)];
      fut = aligned ? [...seg(6, -0.008), ...seg(14, 0.009)] : [...seg(8, -0.006), ...seg(12, -0.008)];
      fvols = seg(20, V);
      break;
    case "range_chop":
      drifts = Array.from({ length: 60 }, (_, i) => (i % 6 < 3 ? 0.006 : -0.006));
      vols = seg(60, V * 0.8);
      fut = Array.from({ length: 20 }, (_, i) => (i % 4 < 2 ? 0.008 : -0.008));
      fvols = seg(20, V * 0.8);
      break;
    case "news_spike":
      drifts = [...seg(55, 0), ...seg(5, 0.02)];
      vols = [...seg(55, V * 0.7), ...seg(5, V * 3.5)];
      fut = aligned ? [...seg(8, -0.012), ...seg(12, 0.001)] : [...seg(20, 0.006)];
      fvols = seg(20, V * 1.8);
      break;
    case "overleveraged":
      drifts = [...seg(40, 0.004), ...seg(20, 0.011)];
      vols = [...seg(40, V), ...seg(20, V * 1.6)];
      fut = aligned ? [...seg(3, 0.004), ...seg(8, -0.02), ...seg(9, -0.003)] : [...seg(20, 0.007)];
      fvols = seg(20, V * 2);
      break;
    case "rug_risk":
      drifts = [...seg(45, 0.002), ...seg(15, 0.014)];
      vols = [...seg(45, V * 0.6), ...seg(15, V * 1.4)];
      fut = aligned ? [...seg(4, 0.003), ...seg(6, -0.04), ...seg(10, -0.006)] : [...seg(20, 0.005)];
      fvols = seg(20, V * 2.5);
      break;
    case "downtrend_bounce":
      drifts = [...seg(50, -0.005), ...seg(10, 0.007)];
      vols = [...seg(50, V), ...seg(10, V * 0.7)];
      fut = aligned ? [...seg(4, 0.002), ...seg(16, -0.008)] : [...seg(20, 0.006)];
      fvols = seg(20, V * 1.1);
      break;
    case "social_hype":
      drifts = [...seg(48, 0.001), ...seg(12, 0.012)];
      vols = [...seg(48, V * 0.6), ...seg(12, V * 1.1)];
      fut = aligned ? [...seg(3, 0.005), ...seg(17, -0.012)] : [...seg(20, 0.006)];
      fvols = seg(20, V * 1.3);
      break;
    case "onchain_accum":
      drifts = [...seg(20, -0.006), ...Array.from({ length: 34 }, (_, i) => (i % 8 < 4 ? 0.004 : -0.004)), ...seg(6, -0.004)];
      vols = [...seg(20, V * 1.2), ...seg(40, V * 0.7)];
      fut = aligned ? [...seg(3, -0.003), ...seg(17, 0.008)] : [...seg(20, -0.008)];
      fvols = seg(20, V);
      break;
    case "breakdown_short":
      drifts = [...seg(25, 0.003), ...seg(15, -0.002), ...seg(16, 0.001), ...seg(4, -0.012)];
      vols = [...seg(25, V), ...seg(31, V * 0.8), ...seg(4, V * 2.1)];
      fut = aligned ? [...seg(3, 0.003), ...seg(17, -0.008)] : [...seg(5, 0.012), ...seg(15, 0.003)];
      fvols = seg(20, V * 1.3);
      break;
  }
  const candles = pathTo(r, base, drifts, vol, vols);
  const last = candles[candles.length - 1];
  const future = pathTo(r, last.c, fut, vol, fvols);
  const atr = atrOf(candles);
  const hi = Math.max(...candles.slice(-40, -4).map((c) => c.h));
  const lo = Math.min(...candles.slice(-40).map((c) => c.l));
  const recentLow = Math.min(...candles.slice(-12).map((c) => c.l));
  const recentHigh = Math.max(...candles.slice(-12).map((c) => c.h));
  const entry = last.c;
  let zone = entry;
  let structure = recentLow;
  let structureShort = recentHigh;
  const levels: { price: number; label: string }[] = [];
  if (archetype === "real_breakout" || archetype === "fake_breakout") {
    zone = hi; structure = hi - atr * 1.2; levels.push({ price: hi, label: "Сопротивление" });
  } else if (archetype === "trend_pullback") {
    const pb = Math.min(...candles.slice(30, 40).map((c) => c.l));
    zone = pb + (entry - pb) * 0.45; structure = pb; levels.push({ price: zone, label: "Зона ретеста" }, { price: pb, label: "HL" });
  } else if (archetype === "onchain_accum") {
    const lower = Math.min(...candles.slice(20).map((c) => c.l));
    zone = lower * 1.004; structure = lower; levels.push({ price: lower, label: "Нижняя граница" }, { price: Math.max(...candles.slice(20).map((c) => c.h)), label: "Ликвидность" });
  } else if (archetype === "breakdown_short") {
    const hl = Math.min(...candles.slice(40, 56).map((c) => c.l));
    zone = hl; structureShort = Math.max(...candles.slice(40, 56).map((c) => c.h)); levels.push({ price: hl, label: "Сломанный HL" });
  } else {
    levels.push({ price: hi, label: "Хай" }, { price: lo, label: "Лой" });
  }

  const volRatio = last.v / (candles.slice(-24, -4).reduce((a, c) => a + c.v, 0) / 20);
  const sig = buildSignals(r, archetype, volRatio, difficulty);
  const regime = ARCHETYPES[archetype].tradeable ? "trend" : archetype === "range_chop" ? "range" : "event";
  return {
    archetype, asset: asset.sym, timeframe, regime, contextKey: `${asset.sym}:${timeframe}:${regime}`,
    candles, future, levels, zone, structure, structureShort, entry, atr, signals: sig, difficulty, aligned,
  };
}

function buildSignals(r: () => number, a: Archetype, volRatio: number, difficulty: number): Signal[] {
  const vol: Signal = { key: "volume", label: "Объём последней свечи", value: `${volRatio.toFixed(1)}× от среднего`, stance: volRatio > 1.3 ? "bull" : volRatio < 0.8 ? "bear" : "neutral" };
  const htf = (s: Stance, v: string): Signal => ({ key: "htf", label: "Старший ТФ", value: v, stance: s });
  const funding = (v: number): Signal => ({ key: "funding", label: "Funding / OI", value: `${v.toFixed(3)}% · OI ${v > 0.05 ? "+38%" : "+4%"}`, stance: v > 0.05 ? "risk" : "neutral" });
  const map: Record<Archetype, Signal[]> = {
    real_breakout: [vol, htf("bull", "1D: HH/HL, выше MA200"), { key: "structure", label: "Структура", value: "Закрытие над уровнем", stance: "bull" }, funding(0.01)],
    fake_breakout: [vol, htf("bear", "1D: LH/LL, под MA200"), { key: "structure", label: "Структура", value: "Фитиль над равными хаями", stance: "risk" }, funding(0.02)],
    trend_pullback: [htf("bull", "4h/1D: HH/HL"), { key: "distance", label: "Расстояние до зоны", value: "2.4 ATR — цена растянута", stance: "risk" }, vol, { key: "rsi", label: "RSI(14)", value: "71", stance: "neutral" }],
    range_chop: [htf("neutral", "1D: боковик 3 недели"), { key: "atr", label: "ATR", value: "Рваный, пилообразный", stance: "risk" }, vol, { key: "structure", label: "Структура", value: "Нет HH/HL или LH/LL", stance: "neutral" }],
    news_spike: [{ key: "news", label: "Новость", value: "«Крупный фонд подал заявку на ETF»", stance: "bull" }, vol, { key: "structure", label: "Структура", value: "Импульс +10% без отката", stance: "risk" }, htf("neutral", "1D: боковик")],
    overleveraged: [funding(0.09 + r() * 0.05), { key: "liq", label: "Ликвидации", value: "Кластер лонгов −7% ниже", stance: "risk" }, htf("bull", "1D: параболический рост"), vol],
    rug_risk: [{ key: "tokenomics", label: "Токеномика", value: "Float 7%, FDV 14× капы", stance: "risk" }, { key: "unlock", label: "Анлок", value: "Через 4 дня: 16% предложения", stance: "risk" }, { key: "infra", label: "Инфраструктура", value: "Мост без аудита, мультисиг 2/3", stance: "risk" }, vol],
    downtrend_bounce: [htf("bear", "1D: LH/LL, под MA200"), { key: "structure", label: "Младший ТФ", value: "15m: зелёный импульс +4%", stance: "bull" }, vol, { key: "corr", label: "BTC", value: "BTC 1D нисходящий", stance: "bear" }],
    social_hype: [{ key: "social", label: "Соцсети", value: "+900% упоминаний за сутки", stance: "bull" }, { key: "source", label: "Источник", value: "Анонимные каналы, реф-ссылки", stance: "risk" }, vol, { key: "onchain", label: "Ончейн", value: "Приток на биржи +22%", stance: "bear" }],
    onchain_accum: [{ key: "onchain", label: "Ончейн", value: "Отток с бирж 3 недели подряд", stance: "bull" }, htf("bull", "1W: HL удержан"), { key: "structure", label: "Структура", value: "Цена у нижней границы диапазона", stance: "bull" }, vol],
    breakdown_short: [vol, htf("bear", "1D: LH, под MA50"), { key: "structure", label: "Структура", value: "Закрытие ниже последнего HL", stance: "bear" }, funding(0.015)],
  };
  const base = map[a];
  const noisePool: Signal[] = [
    { key: "social", label: "Соцсети", value: "Инфлюенсер: «100x скоро»", stance: "bull", noise: true },
    { key: "rsi2", label: "Stochastic", value: "Перепродан (дублирует RSI)", stance: "bull", noise: true },
    { key: "news2", label: "Заголовок", value: "«Аналитики ждут обвала»", stance: "bear", noise: true },
    { key: "whale", label: "Whale Alert", value: "Перевод 10 000 BTC (между своими кошельками)", stance: "bear", noise: true },
  ];
  const informative = Math.min(base.length, Math.max(2, difficulty));
  const shown = base.slice(0, informative).map((s) => ({ ...s }));
  // Difficulty ≥3: one conflicting noise signal; ≥4: two + one data gap
  const nNoise = difficulty >= 4 ? 2 : difficulty >= 3 ? 1 : 0;
  const pool = [...noisePool].sort(() => r() - 0.5);
  for (let i = 0; i < nNoise; i++) shown.push(pool[i]);
  if (difficulty >= 5 && shown.length > 3) shown[shown.length - 1 - nNoise] = { ...shown[shown.length - 1 - nNoise], value: "нет данных", hidden: true };
  return shown.sort(() => r() - 0.5);
}

export interface TradeParams { option: Option; stopPct: number; targetR: number; riskPct: number }

// Executes the decision on the hidden future candles. Returns outcome in R.
export function simulate(s: Scenario, p: TradeParams): { filled: boolean; r: number; exit: string; entryPrice: number; stopPrice: number; targetPrice: number; exitIndex: number } {
  if (p.option === "no_trade") return { filled: false, r: 0, exit: "Вне рынка", entryPrice: s.entry, stopPrice: 0, targetPrice: 0, exitIndex: -1 };
  const isShort = p.option === "short";
  let entryPrice = p.option === "long_retest" ? s.zone : s.entry;
  let startIdx = 0;
  if (p.option === "long_retest") {
    const idx = s.future.findIndex((c) => c.l <= entryPrice);
    if (entryPrice >= s.entry) { entryPrice = s.entry; startIdx = 0; }
    else if (idx < 0) return { filled: false, r: 0, exit: "Лимит не исполнился", entryPrice, stopPrice: 0, targetPrice: 0, exitIndex: -1 };
    else startIdx = idx;
  }
  const stopDist = entryPrice * (p.stopPct / 100);
  const stopPrice = isShort ? entryPrice + stopDist : entryPrice - stopDist;
  const targetPrice = isShort ? entryPrice - stopDist * p.targetR : entryPrice + stopDist * p.targetR;
  for (let i = startIdx; i < s.future.length; i++) {
    const c = s.future[i];
    const hitStop = isShort ? c.h >= stopPrice : c.l <= stopPrice;
    const hitTarget = isShort ? c.l <= targetPrice : c.h >= targetPrice;
    if (hitStop) return { filled: true, r: -1, exit: "Стоп", entryPrice, stopPrice, targetPrice, exitIndex: i };
    if (hitTarget) return { filled: true, r: p.targetR, exit: "Тейк", entryPrice, stopPrice, targetPrice, exitIndex: i };
  }
  const lastC = s.future[s.future.length - 1].c;
  const r = ((isShort ? entryPrice - lastC : lastC - entryPrice) / stopDist);
  return { filled: true, r: Math.round(r * 100) / 100, exit: "Закрыто по времени", entryPrice, stopPrice, targetPrice, exitIndex: s.future.length - 1 };
}

// Structural stop in % for the chosen side (used for debrief / risk geometry scoring).
export function structuralStopPct(s: Scenario, option: Option) {
  if (option === "short") return ((s.structureShort + s.atr * 0.5 - s.entry) / s.entry) * 100;
  const entry = option === "long_retest" ? Math.min(s.zone, s.entry) : s.entry;
  return ((entry - (s.structure - s.atr * 0.5)) / entry) * 100;
}
