import type { ReactNode } from "react";
import { C, Poly, Tag, series, makeScale, CandleLayer, g, sm, ChartScene, type SceneProps, type Area } from "./engine";

const pathOf = (pts: [number, number][]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
const fmt = (n: number, d = 0) => n.toFixed(d);

/* ---------- oscillators ---------- */
export function OscScene({ uid, r, A, variant, accent }: SceneProps) {
  const cs = series(r, 30, (t) => 50 + 20 * Math.sin(t * 9) + 10 * t, 2.2);
  const top: Area = { x: A.x, y: A.y, w: A.w, h: A.h * 0.46 };
  const bot: Area = { x: A.x, y: A.y + A.h * 0.52, w: A.w, h: A.h * 0.48 };
  const sc = makeScale(cs, top, 8);
  const ph = r() * 3;
  const osc = cs.map((_, i) => Math.min(96, Math.max(4, 50 + 34 * Math.sin(i * 0.42 + ph) + (r() - 0.5) * 12)));
  const yy = (v: number) => bot.y + 6 + (1 - v / 100) * (bot.h - 12);
  const els: ReactNode[] = [<CandleLayer key="c" cs={cs} sc={sc} />];
  els.push(<rect key="bp" x={bot.x} y={bot.y} width={bot.w} height={bot.h} rx={10} fill="rgba(255,255,255,0.04)" />);
  if (variant === "rsi" || variant === "stoch") {
    els.push(<rect key="ob" x={bot.x} y={yy(100)} width={bot.w} height={yy(70) - yy(100)} fill={C.red} opacity={0.14} />);
    els.push(<rect key="os" x={bot.x} y={yy(30)} width={bot.w} height={yy(0) - yy(30)} fill={C.green} opacity={0.14} />);
    els.push(<line key="l70" x1={bot.x} x2={bot.x + bot.w} y1={yy(70)} y2={yy(70)} stroke={C.red} strokeDasharray="5 5" />);
    els.push(<line key="l30" x1={bot.x} x2={bot.x + bot.w} y1={yy(30)} y2={yy(30)} stroke={C.green} strokeDasharray="5 5" />);
    els.push(<text key="t70" x={bot.x + 6} y={yy(70) - 4} fontSize={10} fontWeight={800} fill={C.red}>{variant === "rsi" ? "70" : "80"}</text>);
    els.push(<text key="t30" x={bot.x + 6} y={yy(30) + 12} fontSize={10} fontWeight={800} fill={C.green}>{variant === "rsi" ? "30" : "20"}</text>);
    els.push(<Poly key="o" uid={uid} glow pts={osc.map((v, i) => [sc.X(i), yy(v)])} color={variant === "rsi" ? accent : C.gold} />);
    if (variant === "stoch") {
      const d = osc.map((_, i) => osc.slice(Math.max(0, i - 3), i + 1).reduce((a, b) => a + b, 0) / Math.min(4, i + 1));
      els.push(<Poly key="d" pts={d.map((v, i) => [sc.X(i), yy(v)])} color={C.cyan} w={2} />);
    }
    els.push(<Tag key="n" x={bot.x + bot.w - 6} y={bot.y + 22} anchor="end" text={variant === "rsi" ? "RSI 14" : "%K / %D"} color={accent} />);
  } else if (variant === "macd") {
    const zero = bot.y + bot.h / 2;
    const hist = osc.map((v) => (v - 50) / 50);
    els.push(<line key="z" x1={bot.x} x2={bot.x + bot.w} y1={zero} y2={zero} stroke="rgba(255,255,255,0.3)" />);
    hist.forEach((h, i) => els.push(<rect key={`h${i}`} x={sc.X(i) - sc.bw / 2} y={h >= 0 ? zero - h * (bot.h / 2 - 8) : zero} width={sc.bw} height={Math.abs(h) * (bot.h / 2 - 8)} fill={h >= 0 ? C.green : C.red} opacity={0.7} rx={1.5} />));
    els.push(<Poly key="m" uid={uid} glow pts={hist.map((h, i) => [sc.X(i), zero - h * (bot.h / 2 - 12) * 0.8])} color={C.cyan} />);
    els.push(<Poly key="s" pts={hist.map((h, i) => [sc.X(i), zero - (hist[Math.max(0, i - 3)] ?? 0) * (bot.h / 2 - 12) * 0.8])} color={C.gold} w={2} />);
    els.push(<Tag key="n" x={bot.x + 6} y={bot.y + 22} text="MACD · Signal · Hist" color={accent} />);
  } else {
    // atr
    const atr = cs.map((c) => (c.h - c.l) / 8 + 0.25);
    atr.forEach((a, i) => els.push(<rect key={`a${i}`} x={sc.X(i) - sc.bw / 2} y={bot.y + bot.h - 8 - a * (bot.h - 20)} width={sc.bw} height={a * (bot.h - 20)} rx={2} fill={accent} opacity={0.35 + a * 0.5} />));
    const last = cs[cs.length - 1];
    const x = sc.X(29) + 10;
    els.push(<line key="b1" x1={x} x2={x} y1={sc.Y(last.c)} y2={sc.Y(last.c - 6)} stroke={C.gold} strokeWidth={3} />);
    els.push(<line key="b2" x1={sc.X(24)} x2={x} y1={sc.Y(last.c - 6)} y2={sc.Y(last.c - 6)} stroke={C.red} strokeDasharray="4 4" strokeWidth={1.6} />);
    els.push(<Tag key="n" x={bot.x + 6} y={bot.y + 22} text="ATR 14" color={accent} />, <Tag key="s" x={sc.X(20)} y={sc.Y(last.c - 6) + 24} text="Стоп = 1.5 ATR" color={C.red} anchor="middle" />);
  }
  return <g>{els}</g>;
}

/* ---------- order book ---------- */
export function BookScene({ r, A, variant, accent }: SceneProps) {
  const rows = 6;
  const rh = (A.h - 44) / (rows * 2);
  const base = 3000 + Math.floor(r() * 50000) / 10;
  const wall = Math.floor(r() * rows);
  const els: ReactNode[] = [];
  const draw = (side: "ask" | "bid") => {
    for (let i = 0; i < rows; i++) {
      const idx = side === "ask" ? rows - 1 - i : i;
      const y = side === "ask" ? A.y + i * rh : A.y + rows * rh + 44 + i * rh;
      const size = 0.15 + r() * 0.5 + (idx === wall ? 0.38 : 0);
      const col = side === "ask" ? C.red : C.green;
      const px = side === "ask" ? base + (idx + 1) * 2 : base - idx * 2 - 1;
      els.push(<rect key={`${side}b${i}`} x={A.x + 92} y={y + 2} width={(A.w - 150) * Math.min(1, size)} height={rh - 4} rx={4} fill={col} opacity={0.55} />);
      els.push(<text key={`${side}p${i}`} x={A.x + 8} y={y + rh / 2 + 4} fontSize={12} fontWeight={700} fill={col} fontFamily="ui-monospace, monospace">{fmt(px, 1)}</text>);
      els.push(<text key={`${side}s${i}`} x={A.x + A.w - 8} y={y + rh / 2 + 4} textAnchor="end" fontSize={11} fontWeight={600} fill={C.muted} fontFamily="ui-monospace, monospace">{fmt(size * 40, 1)}</text>);
      if (variant === "queue" && side === "bid") els.push(<text key={`q${i}`} x={A.x + 98} y={y + rh / 2 + 4} fontSize={10} fontWeight={800} fill="#fff">#{i + 1} · 09:0{i}</text>);
      if (idx === wall) {
        els.push(<rect key={`${side}w${i}`} x={A.x + 92} y={y + 2} width={(A.w - 150) * Math.min(1, size)} height={rh - 4} rx={4} fill="none" stroke={C.gold} strokeWidth={2} strokeDasharray="4 3" />);
        if (side === "ask") els.push(<Tag key="wt" x={A.x + A.w - 70} y={y + rh - 6} text="Стена" anchor="end" size={10} />);
      }
    }
  };
  draw("ask");
  draw("bid");
  const my = A.y + rows * rh;
  els.push(<rect key="sp" x={A.x} y={my + 4} width={A.w} height={36} rx={10} fill="rgba(255,255,255,0.07)" stroke={accent} strokeWidth={1.2} />);
  els.push(<text key="mp" x={A.x + 16} y={my + 29} fontSize={20} fontWeight={800} fill="#fff" fontFamily="ui-monospace, monospace">{fmt(base, 1)}</text>);
  els.push(<Tag key="spt" x={A.x + A.w - 10} y={my + 28} anchor="end" text="Спред 0.1" color={accent} />);
  return <g>{els}</g>;
}

/* ---------- depth ---------- */
export function DepthScene({ r, A, accent }: SceneProps) {
  const n = 18;
  const mid = A.x + A.w / 2;
  const bid: [number, number][] = [];
  const ask: [number, number][] = [];
  let cb = 0;
  let ca = 0;
  const wallAt = 6 + Math.floor(r() * 6);
  for (let i = 0; i < n; i++) {
    cb += 0.4 + r() * 0.7 + (i === wallAt ? 4 : 0);
    ca += 0.4 + r() * 0.7 + (i === wallAt + 1 ? 3.5 : 0);
    bid.push([mid - 6 - (i * (A.w / 2 - 14)) / (n - 1), cb]);
    ask.push([mid + 6 + (i * (A.w / 2 - 14)) / (n - 1), ca]);
  }
  const mx = Math.max(cb, ca);
  const Y = (v: number) => A.y + A.h - 14 - (v / mx) * (A.h - 40);
  const step = (pts: [number, number][]) => {
    const out: [number, number][] = [[pts[0][0], A.y + A.h - 14]];
    pts.forEach((p, i) => {
      out.push([p[0], i ? Y(pts[i - 1][1]) : A.y + A.h - 14], [p[0], Y(p[1])]);
    });
    return out;
  };
  const b = step(bid);
  const a = step(ask);
  return (
    <g>
      <path d={`${pathOf(b)} L${b[b.length - 1][0]} ${A.y + A.h - 14} Z`} fill={C.green} opacity={0.25} />
      <path d={`${pathOf(a)} L${a[a.length - 1][0]} ${A.y + A.h - 14} Z`} fill={C.red} opacity={0.25} />
      <Poly pts={b} color={C.green} w={2.4} />
      <Poly pts={a} color={C.red} w={2.4} />
      <line x1={mid} x2={mid} y1={A.y + 8} y2={A.y + A.h - 14} stroke={accent} strokeDasharray="5 5" strokeWidth={1.6} />
      <Tag x={mid} y={A.y + 22} anchor="middle" text="Mid price" color={accent} />
      <Tag x={bid[wallAt][0]} y={Y(bid[wallAt][1]) - 10} anchor="middle" text="Стена bid" color={C.green} size={10} />
      <Tag x={ask[wallAt + 1][0]} y={Y(ask[wallAt + 1][1]) - 10} anchor="middle" text="Стена ask" color={C.red} size={10} />
      <line x1={A.x} x2={A.x + A.w} y1={A.y + A.h - 14} y2={A.y + A.h - 14} stroke="rgba(255,255,255,0.3)" />
    </g>
  );
}

/* ---------- tape ---------- */
export function TapeScene({ r, A, accent }: SceneProps) {
  const rows = 11;
  const rh = A.h / rows;
  let px = 62000 + Math.floor(r() * 500);
  const els: ReactNode[] = [];
  for (let i = 0; i < rows; i++) {
    const buy = r() > 0.4;
    px += buy ? Math.floor(r() * 9) : -Math.floor(r() * 7);
    const sz = 0.05 + r() * 1.2;
    const y = A.y + i * rh;
    const col = buy ? C.green : C.red;
    els.push(<rect key={`r${i}`} x={A.x} y={y + 2} width={A.w} height={rh - 4} rx={7} fill="rgba(255,255,255,0.04)" />);
    els.push(<rect key={`s${i}`} x={A.x + 230} y={y + 6} width={sz * 120} height={rh - 12} rx={4} fill={col} opacity={0.55} />);
    els.push(<circle key={`d${i}`} cx={A.x + 16} cy={y + rh / 2} r={5} fill={col} />);
    els.push(<text key={`t${i}`} x={A.x + 30} y={y + rh / 2 + 4} fontSize={12} fill={C.muted} fontFamily="ui-monospace, monospace">14:0{(9 - (i % 10)) % 10}:{10 + i * 4}</text>);
    els.push(<text key={`p${i}`} x={A.x + 112} y={y + rh / 2 + 4} fontSize={13} fontWeight={800} fill={col} fontFamily="ui-monospace, monospace">{px}</text>);
    els.push(<text key={`q${i}`} x={A.x + 192} y={y + rh / 2 + 4} fontSize={11} fontWeight={700} fill={C.text} fontFamily="ui-monospace, monospace">{fmt(sz, 2)}</text>);
    els.push(<text key={`c${i}`} x={A.x + A.w - 10} y={y + rh / 2 + 4} textAnchor="end" fontSize={10} fontWeight={800} fill={col} letterSpacing={1}>{buy ? "BUY · ask" : "SELL · bid"}</text>);
  }
  els.push(<Tag key="h" x={A.x + 230} y={A.y - 2} text="Агрессор" color={accent} size={9} />);
  return <g>{els}</g>;
}

/* ---------- table ---------- */
const DICT: [RegExp, string][] = [
  [/price/, "Цена"], [/risk/, "Риск"], [/stop/, "Стоп"], [/entry/, "Вход"], [/exit/, "Выход"], [/target/, "Цель"], [/volume/, "Объём"],
  [/trend/, "Тренд"], [/range/, "Диапазон"], [/spread/, "Спред"], [/fee|cost/, "Издержки"], [/slippage/, "Проскальз."], [/size/, "Размер"],
  [/order/, "Ордер"], [/limit/, "Лимит"], [/market/, "Рынок"], [/signal/, "Сигнал"], [/pattern/, "Паттерн"], [/level/, "Уровень"],
  [/scenario|plan/, "План"], [/error|mistake/, "Ошибка"], [/rule/, "Правило"], [/regime/, "Режим"], [/trigger/, "Триггер"],
  [/leverage/, "Плечо"], [/margin/, "Маржа"], [/funding/, "Funding"], [/liquidation/, "Ликвидация"], [/drawdown/, "Просадка"],
  [/expectancy/, "E (R)"], [/win ?rate/, "Win rate"], [/sample/, "Выборка"], [/test|backtest/, "Тест"], [/metric/, "Метрика"],
  [/checklist/, "Чек-лист"], [/journal/, "Журнал"], [/emotion/, "Эмоция"], [/bias/, "Искажение"], [/token/, "Токен"],
  [/supply/, "Эмиссия"], [/unlock/, "Разблок."], [/sentiment/, "Настроение"], [/news|event/, "Событие"], [/strategy/, "Стратегия"],
  [/timeframe/, "ТФ"], [/volatility/, "Волат."], [/support/, "Поддержка"], [/resistance/, "Сопрот."], [/breakout/, "Пробой"],
  [/confirmation/, "Подтв."], [/invalidation/, "Инвалид."], [/fill/, "Fill"], [/result|outcome/, "Итог"], [/decision/, "Решение"],
  [/correction/, "Правка"], [/score/, "Балл"], [/pass/, "Зачёт"], [/artifact/, "Артефакт"], [/blocker/, "Блокер"],
  [/profit/, "Прибыль"], [/loss/, "Убыток"], [/direction/, "Направл."], [/liquidity|thin/, "Ликвидн."], [/indicator/, "Индикатор"],
  [/candle/, "Свеча"], [/chart/, "График"], [/average/, "Среднее"], [/correlation/, "Корреляц."], [/portfolio/, "Портфель"],
];
const ROWS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "DOGE/USDT", "Сетап A", "Сетап B", "Кейс 1", "Кейс 2", "Кейс 3", "Режим 1", "Режим 2"];

export function tableHeads(prompt: string): string[] {
  const words = prompt.toLowerCase().split(/[^a-z-]+/);
  const out: string[] = [];
  for (const w of words) {
    const hit = DICT.find(([re]) => re.test(w));
    if (hit && !out.includes(hit[1])) out.push(hit[1]);
  }
  const def = ["Параметр", "Значение", "Вывод"];
  while (out.length < 3) out.push(def[out.length]);
  return out.slice(0, 3);
}

export function TableScene({ r, A, accent, prompt }: SceneProps & { prompt: string }) {
  const heads = tableHeads(prompt);
  const rows = 6;
  const hh = 34;
  const rh = (A.h - hh - 8) / rows;
  const start = Math.floor(r() * (ROWS.length - rows));
  const order = [0, 1, 2].sort(() => r() - 0.5);
  const cw = [118, 100, 100, 100];
  const xs = [A.x, A.x + cw[0], A.x + cw[0] + cw[1], A.x + cw[0] + cw[1] + cw[2]];
  const els: ReactNode[] = [];
  els.push(<rect key="hd" x={A.x} y={A.y} width={A.w} height={hh} rx={10} fill={accent} opacity={0.22} />);
  els.push(<rect key="hb" x={A.x} y={A.y} width={A.w} height={hh} rx={10} fill="none" stroke={accent} strokeWidth={1.2} />);
  els.push(<text key="h0" x={xs[0] + 12} y={A.y + 22} fontSize={12} fontWeight={800} fill="#fff" letterSpacing={0.6}>{heads[0].toUpperCase()}</text>);
  const colHeads = [heads[1], heads[2], "Вердикт"];
  colHeads.forEach((h, i) => els.push(<text key={`h${i + 1}`} x={xs[i + 1] + 10} y={A.y + 22} fontSize={12} fontWeight={800} fill="#fff" letterSpacing={0.6}>{h.toUpperCase()}</text>));
  for (let i = 0; i < rows; i++) {
    const y = A.y + hh + 8 + i * rh;
    const v = Math.round((r() * 5 - 1.5) * 10) / 10;
    const good = v > 0 || r() > 0.55;
    els.push(<rect key={`b${i}`} x={A.x} y={y + 2} width={A.w} height={rh - 4} rx={8} fill={i % 2 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.065)"} />);
    els.push(<text key={`l${i}`} x={xs[0] + 12} y={y + rh / 2 + 4} fontSize={12} fontWeight={700} fill={C.text}>{ROWS[start + i]}</text>);
    order.forEach((kind, ci) => {
      const x = xs[ci + 1] + 10;
      if (kind === 0) {
        els.push(<rect key={`c${i}${ci}`} x={x} y={y + rh / 2 - 10} width={62} height={20} rx={10} fill={v >= 0 ? C.green : C.red} opacity={0.22} />);
        els.push(<text key={`ct${i}${ci}`} x={x + 31} y={y + rh / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill={v >= 0 ? C.green : C.red} fontFamily="ui-monospace, monospace">{v >= 0 ? "+" : "−"}{Math.abs(v).toFixed(1)}R</text>);
      } else if (kind === 1) {
        const w = 18 + r() * 66;
        els.push(<rect key={`c${i}${ci}`} x={x} y={y + rh / 2 - 5} width={78} height={10} rx={5} fill="rgba(255,255,255,0.1)" />);
        els.push(<rect key={`cb${i}${ci}`} x={x} y={y + rh / 2 - 5} width={w} height={10} rx={5} fill={accent} />);
      } else {
        els.push(<text key={`c${i}${ci}`} x={x} y={y + rh / 2 + 5} fontSize={13} fontWeight={800} fill={C.muted} fontFamily="ui-monospace, monospace">{fmt(r() * 9 + 0.5, 1)}{r() > 0.5 ? "%" : "×"}</text>);
      }
    });
    const vx = xs[3] + 14;
    els.push(<circle key={`v${i}`} cx={vx + 10} cy={y + rh / 2} r={10} fill={good ? C.green : C.red} opacity={0.2} />);
    els.push(good ? <path key={`vt${i}`} d={`M${vx + 4} ${y + rh / 2} l4 4 l8 -8`} stroke={C.green} strokeWidth={2.6} fill="none" strokeLinecap="round" /> : <path key={`vt${i}`} d={`M${vx + 5} ${y + rh / 2 - 5} l10 10 M${vx + 15} ${y + rh / 2 - 5} l-10 10`} stroke={C.red} strokeWidth={2.6} fill="none" strokeLinecap="round" />);
    els.push(<text key={`vw${i}`} x={vx + 28} y={y + rh / 2 + 4} fontSize={10} fontWeight={700} fill={good ? C.green : C.red}>{good ? "ОК" : "СТОП"}</text>);
  }
  return <g>{els}</g>;
}

/* ---------- flow ---------- */
const FLOWS: Record<string, string[]> = {
  route: ["Контекст", "Ордер", "Издержки", "Стоп", "Размер", "Журнал"],
  research: ["Гипотеза", "Данные", "Тест", "Аудит", "Paper", "Отчёт"],
  process: ["План", "Чек-лист", "Вход", "Сопровожд.", "Выход", "Ревью"],
};
export function FlowScene({ r, A, accent, variant }: SceneProps) {
  const els: ReactNode[] = [];
  const mode = variant === "branch" || variant === "loop" || variant === "route" ? variant : (["route", "branch", "loop"] as const)[Math.floor(r() * 3)];
  const labels = FLOWS[(["route", "research", "process"] as const)[Math.floor(r() * 3)]];
  const node = (x: number, y: number, w: number, h: number, text: string, col: string, n?: number) => (
    <g key={`n${x}${y}`}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="rgba(255,255,255,0.07)" stroke={col} strokeWidth={1.8} />
      {n !== undefined && (
        <>
          <circle cx={x + 20} cy={y + h / 2} r={11} fill={col} />
          <text x={x + 20} y={y + h / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#0A1130">{n}</text>
        </>
      )}
      <text x={x + (n !== undefined ? 38 : w / 2)} y={y + h / 2 + 5} textAnchor={n !== undefined ? "start" : "middle"} fontSize={13} fontWeight={800} fill="#fff">{text}</text>
    </g>
  );
  const arrow = (x1: number, y1: number, x2: number, y2: number, col = accent) => (
    <g key={`a${x1}${y1}${x2}${y2}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={2.4} />
      <circle cx={x2} cy={y2} r={4} fill={col} />
    </g>
  );
  if (mode === "route") {
    const w = 118;
    const h = 52;
    labels.forEach((l, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = A.x + 4 + col * (w + 35);
      const y = A.y + 34 + row * 130;
      els.push(node(x, y, w, h, l, i === 3 ? C.red : i === 5 ? C.gold : accent, i + 1));
      if (col < 2) els.push(arrow(x + w, y + h / 2, x + w + 35, y + h / 2));
      if (i === 2) els.push(<path key="el" d={`M${x + w / 2} ${y + h} V${y + 66} H${A.x + 4 + w / 2} V${y + 130}`} fill="none" stroke={accent} strokeWidth={2.4} />);
    });
    els.push(<Tag key="t" x={A.x + 6} y={A.y + 12} text="Нет шага — нет сделки" color={C.gold} size={10} />);
  } else if (mode === "branch") {
    els.push(node(A.x + 4, A.y + A.h / 2 - 30, 120, 60, "Цена у зоны", accent));
    const br = [["План A · пробой", "+2R", C.green], ["План B · отскок", "0R", C.gold], ["План C · нет сделки", "0R", C.muted]];
    br.forEach(([t, v, col], i) => {
      const y = A.y + 20 + i * 92;
      els.push(<path key={`p${i}`} d={`M${A.x + 124} ${A.y + A.h / 2} C${A.x + 190} ${A.y + A.h / 2} ${A.x + 170} ${y + 30} ${A.x + 226} ${y + 30}`} fill="none" stroke={col} strokeWidth={2.4} />);
      els.push(node(A.x + 226, y, 150, 60, t, col));
      els.push(<Tag key={`v${i}`} x={A.x + A.w - 4} y={y + 34} anchor="end" text={v} color={col} />);
    });
  } else {
    const cx = A.x + A.w / 2;
    const cy = A.y + A.h / 2;
    els.push(<circle key="ring" cx={cx} cy={cy} r={104} fill="none" stroke={accent} strokeWidth={2} strokeDasharray="4 7" opacity={0.6} />);
    els.push(<circle key="c" cx={cx} cy={cy} r={44} fill={accent} opacity={0.2} stroke={accent} strokeWidth={2} />);
    els.push(<text key="ct" x={cx} y={cy + 8} textAnchor="middle" fontSize={26} fontWeight={900} fill="#fff">1R</text>);
    const L = ["Правило", "Сделка", "Запись", "Аудит", "Правка"];
    L.forEach((t, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / L.length;
      const x = cx + Math.cos(a) * 104;
      const y = cy + Math.sin(a) * 104;
      els.push(<g key={`l${i}`}><circle cx={x} cy={y} r={30} fill="#111B45" stroke={i % 2 ? C.gold : accent} strokeWidth={2.4} /><text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">{t}</text></g>);
    });
  }
  return <g>{els}</g>;
}

/* ---------- gauge ---------- */
export function GaugeScene({ uid, r, A, accent }: SceneProps) {
  const cx = A.x + A.w / 2;
  const cy = A.y + 170;
  const R = 130;
  const v = 12 + Math.floor(r() * 76);
  const ang = Math.PI * (1 - v / 100);
  const arc = (a0: number, a1: number, col: string) => {
    const p = (a: number, rr: number) => `${cx + Math.cos(a) * rr} ${cy - Math.sin(a) * rr}`;
    return <path key={col + a0} d={`M${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} L${p(a1, R - 26)} A${R - 26} ${R - 26} 0 0 0 ${p(a0, R - 26)} Z`} fill={col} opacity={0.85} />;
  };
  const cols = [C.red, "#FF8A5B", C.gold, "#9BE564", C.green];
  const els: ReactNode[] = cols.map((c, i) => arc(Math.PI - (i * Math.PI) / 5 - 0.02, Math.PI - ((i + 1) * Math.PI) / 5 + 0.02, c));
  els.push(<line key="nd" x1={cx} y1={cy} x2={cx + Math.cos(ang) * (R - 14)} y2={cy - Math.sin(ang) * (R - 14)} stroke="#fff" strokeWidth={5} strokeLinecap="round" filter={`url(#${uid}g)`} />);
  els.push(<circle key="hub" cx={cx} cy={cy} r={12} fill="#fff" />);
  els.push(<text key="v" x={cx} y={cy + 56} textAnchor="middle" fontSize={40} fontWeight={900} fill="#fff">{v}</text>);
  els.push(<text key="vl" x={cx} y={cy + 76} textAnchor="middle" fontSize={12} fontWeight={800} fill={v > 55 ? C.green : v < 45 ? C.red : C.gold} letterSpacing={2}>{v > 75 ? "ЖАДНОСТЬ" : v > 55 ? "ОПТИМИЗМ" : v > 45 ? "НЕЙТРАЛЬНО" : v > 25 ? "СТРАХ" : "ПАНИКА"}</text>);
  ["Funding", "OI", "Соцсети"].forEach((t, i) => {
    const x = A.x + 10 + i * 140;
    const w = 20 + r() * 80;
    els.push(<text key={`t${i}`} x={x} y={A.y + A.h - 26} fontSize={10} fontWeight={800} fill={C.muted}>{t}</text>);
    els.push(<rect key={`b${i}`} x={x} y={A.y + A.h - 16} width={110} height={8} rx={4} fill="rgba(255,255,255,0.1)" />);
    els.push(<rect key={`f${i}`} x={x} y={A.y + A.h - 16} width={w} height={8} rx={4} fill={accent} />);
  });
  return <g>{els}</g>;
}

/* ---------- equity ---------- */
export function EquityScene({ uid, r, A, variant, accent }: SceneProps) {
  const els: ReactNode[] = [];
  const n = 40;
  const walk = (drift: number, vol: number, start = 50) => {
    const out: number[] = [start];
    for (let i = 1; i < n; i++) out.push(out[i - 1] + drift + (r() - 0.5) * vol);
    return out;
  };
  if (variant === "streak") {
    const cols = 12;
    const rows = 6;
    const cw = A.w / cols;
    let run = 0;
    let best = 0;
    for (let i = 0; i < cols * rows; i++) {
      const win = r() > 0.5;
      run = win ? 0 : run + 1;
      best = Math.max(best, run);
      const x = A.x + (i % cols) * cw + cw / 2;
      const y = A.y + 14 + Math.floor(i / cols) * 44 + 18;
      els.push(<circle key={i} cx={x} cy={y} r={14} fill={win ? C.green : C.red} opacity={win ? 0.3 : 0.75} stroke={win ? C.green : C.red} strokeWidth={1.4} />);
      els.push(<text key={`t${i}`} x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">{win ? "W" : "L"}</text>);
    }
    els.push(<Tag key="s" x={A.x + 6} y={A.y + A.h - 10} text={`Макс. серия убытков: ${best}`} color={C.red} />);
    return <g>{els}</g>;
  }
  const mkY = (vals: number[]) => {
    const mn = Math.min(...vals);
    const mx = Math.max(...vals);
    return (v: number) => A.y + 12 + (1 - (v - mn) / (mx - mn || 1)) * (A.h - 44);
  };
  if (variant === "ruin" || variant === "fan") {
    const k = variant === "ruin" ? 9 : 22;
    const paths = Array.from({ length: k }, () => walk(variant === "ruin" ? 0.2 : 0.6, variant === "ruin" ? 18 : 10));
    const all = paths.flat().concat([0]);
    const Y = mkY(all);
    paths.forEach((p, pi) => {
      let dead = false;
      const pts: [number, number][] = [];
      p.forEach((v, i) => {
        if (v <= 0) dead = true;
        pts.push([A.x + (i / (n - 1)) * A.w, Y(dead ? 0 : v)]);
      });
      els.push(<Poly key={pi} pts={pts} color={dead ? C.red : accent} w={dead ? 2.2 : 1.6} />);
    });
    if (variant === "ruin") els.push(<line key="z" x1={A.x} x2={A.x + A.w} y1={Y(0)} y2={Y(0)} stroke={C.red} strokeDasharray="5 5" />, <Tag key="zt" x={A.x + 6} y={Y(0) - 8} text="Разорение" color={C.red} />);
    else {
      const med = Array.from({ length: n }, (_, i) => paths.map((p) => p[i]).sort((a, b) => a - b)[Math.floor(k / 2)]);
      els.push(<Poly key="m" uid={uid} glow pts={med.map((v, i) => [A.x + (i / (n - 1)) * A.w, Y(v)])} color={C.gold} w={3.4} />, <Tag key="mt" x={A.x + 6} y={A.y + 22} text="Медиана · разброс путей" color={C.gold} />);
    }
    return <g>{els}</g>;
  }
  const eq = walk(0.7, 7);
  const Y = mkY(eq);
  const pts = eq.map((v, i) => [A.x + (i / (n - 1)) * A.w, Y(v)] as [number, number]);
  let pk = -1e9;
  const peak = eq.map((v, i) => {
    pk = Math.max(pk, v);
    return [A.x + (i / (n - 1)) * A.w, Y(pk)] as [number, number];
  });
  els.push(<path key="dd" d={`${pathOf(peak)} L${[...pts].reverse().map((p) => p.join(" ")).join(" L")}Z`} fill={C.red} opacity={0.28} />);
  els.push(<path key="ar" d={`${pathOf(pts)} L${pts[n - 1][0]} ${A.y + A.h} L${A.x} ${A.y + A.h}Z`} fill={`url(#${uid}ar)`} />);
  els.push(<Poly key="p" uid={uid} glow pts={pts} color={accent} w={3} />);
  els.push(<Poly key="pk" pts={peak} color={C.gold} w={1.4} dash="4 4" />);
  let dd = 0;
  eq.forEach((v, i) => {
    dd = Math.max(dd, peak[i][1] - Y(v));
  });
  els.push(<Tag key="t" x={A.x + 6} y={A.y + 22} text="Кривая капитала и просадка" color={accent} />);
  return <g>{els}</g>;
}

/* ---------- R distribution ---------- */
export function RDistScene({ r, A, accent }: SceneProps) {
  const buckets = ["−1R", "−0.5", "0R", "+0.5", "+1R", "+2R", "+3R"];
  const vals = [0.85, 0.22, 0.3, 0.26, 0.34, 0.22, 0.1].map((v) => v * (0.75 + r() * 0.5));
  const bw = (A.w - 20) / buckets.length;
  const base = A.y + A.h - 34;
  const els: ReactNode[] = [];
  vals.forEach((v, i) => {
    const h = Math.min(1, v) * (A.h - 90);
    const col = i < 2 ? C.red : i === 2 ? C.muted : C.green;
    els.push(<rect key={i} x={A.x + 10 + i * bw + 6} y={base - h} width={bw - 12} height={h} rx={8} fill={col} opacity={0.75} />);
    els.push(<text key={`t${i}`} x={A.x + 10 + i * bw + bw / 2} y={base + 18} textAnchor="middle" fontSize={12} fontWeight={800} fill={C.text}>{buckets[i]}</text>);
  });
  const E = vals.reduce((s, v, i) => s + v * [-1, -0.5, 0, 0.5, 1, 2, 3][i], 0) / vals.reduce((s, v) => s + v, 0);
  const ex = A.x + 10 + ((E + 1.25) / 4.5) * (A.w - 20);
  els.push(<line key="e" x1={ex} x2={ex} y1={A.y + 22} y2={base} stroke={C.gold} strokeWidth={2.4} strokeDasharray="6 5" />);
  els.push(<Tag key="et" x={ex + 6} y={A.y + 22} text={`E = ${E >= 0 ? "+" : "−"}${Math.abs(E).toFixed(2)}R`} color={C.gold} />);
  els.push(<line key="ax" x1={A.x} x2={A.x + A.w} y1={base} y2={base} stroke="rgba(255,255,255,0.3)" />);
  els.push(<Tag key="t" x={A.x + 6} y={A.y + A.h - 2} text="Распределение исходов сделок" color={accent} size={10} />);
  return <g>{els}</g>;
}

/* ---------- RR ladder ---------- */
export function RRScene({ r, A, accent }: SceneProps) {
  const rr = [2, 2.5, 3][Math.floor(r() * 3)];
  const u = (A.h - 60) / (rr + 1.3);
  const entry = A.y + 30 + rr * u;
  const els: ReactNode[] = [];
  const x0 = A.x + 130;
  els.push(<rect key="rk" x={x0} y={entry} width={150} height={u} rx={8} fill={C.red} opacity={0.35} stroke={C.red} />);
  els.push(<rect key="rw" x={x0} y={entry - rr * u} width={150} height={rr * u} rx={8} fill={C.green} opacity={0.28} stroke={C.green} />);
  els.push(<line key="en" x1={A.x + 20} x2={A.x + A.w - 10} y1={entry} y2={entry} stroke="#fff" strokeWidth={2.4} />);
  els.push(<text key="rkt" x={x0 + 75} y={entry + u / 2 + 5} textAnchor="middle" fontSize={18} fontWeight={900} fill="#fff">−1R</text>);
  els.push(<text key="rwt" x={x0 + 75} y={entry - (rr * u) / 2 + 6} textAnchor="middle" fontSize={22} fontWeight={900} fill="#fff">+{rr}R</text>);
  els.push(<Tag key="t1" x={A.x + 6} y={entry - 8} text="Вход" color="#fff" />, <Tag key="t2" x={A.x + 6} y={entry + u + 4} text="Стоп" color={C.red} />, <Tag key="t3" x={A.x + 6} y={entry - rr * u + 6} text="Цель" color={C.green} />);
  for (let i = 1; i <= rr; i++) els.push(<line key={`g${i}`} x1={x0 + 150} x2={x0 + 170} y1={entry - i * u} y2={entry - i * u} stroke={C.green} strokeWidth={2} />, <text key={`gt${i}`} x={x0 + 176} y={entry - i * u + 4} fontSize={11} fontWeight={800} fill={C.green}>{i}R</text>);
  els.push(<rect key="f" x={A.x + 300} y={A.y + A.h - 70} width={120} height={64} rx={12} fill="rgba(255,255,255,0.07)" stroke={accent} />);
  els.push(<text key="f1" x={A.x + 360} y={A.y + A.h - 46} textAnchor="middle" fontSize={10} fontWeight={800} fill={C.muted}>РАЗМЕР =</text>);
  els.push(<text key="f2" x={A.x + 360} y={A.y + A.h - 26} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">риск $ / стоп</text>);
  els.push(<Tag key="be" x={A.x + 300} y={A.y + 22} text={`Break-even WR ${Math.round(100 / (1 + rr))}%`} color={C.gold} size={10} />);
  return <g>{els}</g>;
}

/* ---------- liquidation ---------- */
export function LiqScene({ r, A, accent }: SceneProps) {
  const cs = series(r, 26, (t) => 70 - 40 * sm(0.3, 0.9, t) + 3 * Math.sin(t * 18), 2);
  const sc = makeScale(cs, { x: A.x, y: A.y, w: A.w, h: A.h * 0.7 }, 10);
  const els: ReactNode[] = [<CandleLayer key="c" cs={cs} sc={sc} />];
  const L: [string, number, string][] = [["x3", 62, C.green], ["x10", 46, C.gold], ["x25", 34, C.red]];
  L.forEach(([t, p, col]) => {
    const y = sc.Y(Math.min(sc.hi, Math.max(sc.lo, p)));
    els.push(<line key={t} x1={A.x} x2={A.x + A.w} y1={y} y2={y} stroke={col} strokeDasharray="6 5" strokeWidth={1.8} />);
    els.push(<Tag key={`t${t}`} x={A.x + A.w - 6} y={y - 8} anchor="end" text={`Ликвидация ${t}`} color={col} size={10} />);
  });
  const by = A.y + A.h * 0.78;
  cs.forEach((c, i) => {
    const h = i > 14 ? (c.h - c.l) * 4 + r() * 10 : 3 + r() * 6;
    els.push(<rect key={`b${i}`} x={sc.X(i) - sc.bw / 2} y={by + 40 - h} width={sc.bw} height={h} rx={1.5} fill={i > 14 ? C.red : accent} opacity={0.6} />);
  });
  els.push(<Tag key="t" x={A.x + 6} y={by + 6} text="Каскад ликвидаций" color={C.red} size={10} />);
  return <g>{els}</g>;
}

/* ---------- unlock / tokenomics ---------- */
export function UnlockScene({ r, A, accent }: SceneProps) {
  const steps = 10;
  const w = (A.w - 140) / steps;
  let acc = 0.12;
  const els: ReactNode[] = [];
  const cliff = 3 + Math.floor(r() * 3);
  for (let i = 0; i < steps; i++) {
    const add = i === cliff ? 0.22 : 0.03 + r() * 0.05;
    acc += add;
    const h = Math.min(0.98, acc) * (A.h - 50);
    els.push(<rect key={i} x={A.x + i * w + 2} y={A.y + A.h - 26 - h} width={w - 4} height={h} rx={5} fill={i === cliff ? C.red : accent} opacity={i === cliff ? 0.8 : 0.45} />);
    if (i === cliff) els.push(<Tag key="c" x={A.x + i * w + w / 2} y={A.y + A.h - 26 - h - 10} anchor="middle" text="Cliff +22%" color={C.red} size={10} />);
  }
  els.push(<text key="x" x={A.x} y={A.y + A.h - 6} fontSize={10} fontWeight={700} fill={C.muted}>Месяцы после TGE →</text>);
  const cx = A.x + A.w - 62;
  const cy = A.y + 92;
  const parts = [0.35, 0.25, 0.2, 0.2];
  const cols = [accent, C.gold, C.violet, C.cyan];
  let a0 = -Math.PI / 2;
  parts.forEach((p, i) => {
    const a1 = a0 + p * Math.PI * 2;
    const pt = (a: number, rr: number) => `${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr}`;
    els.push(<path key={`d${i}`} d={`M${pt(a0, 54)} A54 54 0 ${p > 0.5 ? 1 : 0} 1 ${pt(a1, 54)} L${pt(a1, 32)} A32 32 0 ${p > 0.5 ? 1 : 0} 0 ${pt(a0, 32)}Z`} fill={cols[i]} opacity={0.9} />);
    a0 = a1;
  });
  ["Команда", "Инвесторы", "Сообщество", "Фонд"].forEach((t, i) => {
    els.push(<circle key={`lc${i}`} cx={A.x + A.w - 122} cy={A.y + 176 + i * 22} r={5} fill={cols[i]} />, <text key={`lt${i}`} x={A.x + A.w - 112} y={A.y + 180 + i * 22} fontSize={11} fontWeight={700} fill={C.text}>{t}</text>);
  });
  return <g>{els}</g>;
}

/* ---------- heat / correlation ---------- */
export function HeatScene({ r, A }: SceneProps) {
  const names = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"];
  const n = names.length;
  const m: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = i; j < n; j++) m[i][j] = m[j][i] = i === j ? 1 : 0.45 + r() * 0.5;
  const cw = (A.w - 50) / n;
  const ch = (A.h - 40) / n;
  const els: ReactNode[] = [];
  names.forEach((t, i) => {
    els.push(<text key={`c${i}`} x={A.x + 50 + i * cw + cw / 2} y={A.y + 12} textAnchor="middle" fontSize={11} fontWeight={800} fill={C.muted}>{t}</text>);
    els.push(<text key={`r${i}`} x={A.x + 40} y={A.y + 32 + i * ch + ch / 2 + 4} textAnchor="end" fontSize={11} fontWeight={800} fill={C.muted}>{t}</text>);
    for (let j = 0; j < n; j++) {
      const v = m[i][j];
      const col = v > 0.8 ? C.red : v > 0.62 ? C.gold : C.green;
      els.push(<rect key={`${i}${j}`} x={A.x + 50 + j * cw + 2} y={A.y + 20 + i * ch + 2} width={cw - 4} height={ch - 4} rx={8} fill={col} opacity={0.22 + v * 0.55} />);
      els.push(<text key={`v${i}${j}`} x={A.x + 50 + j * cw + cw / 2} y={A.y + 20 + i * ch + ch / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">{v.toFixed(2)}</text>);
    }
  });
  return <g>{els}</g>;
}

/* ---------- on-chain ---------- */
export function OnchainScene({ uid, r, A, accent }: SceneProps) {
  const n = 28;
  const vals = Array.from({ length: n }, (_, i) => 40 + 30 * Math.sin(i / 4) + i * 1.2 + r() * 8);
  const mn = Math.min(...vals);
  const mx = Math.max(...vals);
  const pts = vals.map((v, i) => [A.x + (i / (n - 1)) * A.w, A.y + 10 + (1 - (v - mn) / (mx - mn)) * 100] as [number, number]);
  const els: ReactNode[] = [];
  els.push(<path key="a" d={`${pathOf(pts)} L${A.x + A.w} ${A.y + 120} L${A.x} ${A.y + 120}Z`} fill={`url(#${uid}ar)`} />);
  els.push(<Poly key="l" uid={uid} glow pts={pts} color={accent} w={3} />);
  els.push(<Tag key="t" x={A.x + 6} y={A.y + 22} text="TVL / активные адреса" color={accent} size={10} />);
  const y = A.y + 190;
  const node = (x: number, label: string, col: string) => (
    <g key={label}>
      <circle cx={x} cy={y} r={38} fill="rgba(255,255,255,0.06)" stroke={col} strokeWidth={2.4} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">{label}</text>
    </g>
  );
  els.push(node(A.x + 54, "Кошельки", C.cyan), node(A.x + A.w - 54, "Биржа", C.gold));
  els.push(<path key="in" d={`M${A.x + 94} ${y - 14} H${A.x + A.w - 94}`} stroke={C.red} strokeWidth={8} opacity={0.7} strokeLinecap="round" />);
  els.push(<path key="out" d={`M${A.x + A.w - 94} ${y + 16} H${A.x + 94}`} stroke={C.green} strokeWidth={4 + r() * 6} opacity={0.7} strokeLinecap="round" />);
  els.push(<Tag key="ti" x={A.x + A.w / 2} y={y - 24} anchor="middle" text="Inflow →" color={C.red} size={10} />, <Tag key="to" x={A.x + A.w / 2} y={y + 42} anchor="middle" text="← Outflow" color={C.green} size={10} />);
  return <g>{els}</g>;
}

/* ---------- checklist ---------- */
export function CheckScene({ r, A, accent }: SceneProps) {
  const items = ["Контекст и режим записаны", "Триггер входа ясен", "Инвалидация задана", "Риск ≤ 1R", "Издержки учтены", "Скриншот «до» сохранён"];
  const bad = Math.floor(r() * items.length);
  const els: ReactNode[] = [];
  items.forEach((t, i) => {
    const y = A.y + i * 46;
    const ok = i !== bad || r() > 0.5;
    els.push(<rect key={`r${i}`} x={A.x} y={y} width={A.w - 100} height={38} rx={10} fill="rgba(255,255,255,0.06)" stroke={ok ? "rgba(255,255,255,0.1)" : C.red} />);
    els.push(<circle key={`c${i}`} cx={A.x + 22} cy={y + 19} r={12} fill={ok ? C.green : C.red} opacity={0.25} />);
    els.push(ok ? <path key={`k${i}`} d={`M${A.x + 16} ${y + 19} l5 5 l9 -10`} stroke={C.green} strokeWidth={3} fill="none" strokeLinecap="round" /> : <path key={`k${i}`} d={`M${A.x + 17} ${y + 14} l10 10 M${A.x + 27} ${y + 14} l-10 10`} stroke={C.red} strokeWidth={3} fill="none" strokeLinecap="round" />);
    els.push(<text key={`t${i}`} x={A.x + 46} y={y + 24} fontSize={13} fontWeight={700} fill="#fff">{t}</text>);
  });
  const pct = items.length - 1 - (r() > 0.5 ? 0 : 0);
  const cx = A.x + A.w - 48;
  const cy = A.y + 70;
  const frac = pct / items.length;
  els.push(<circle key="rg" cx={cx} cy={cy} r={38} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={10} />);
  els.push(<circle key="rp" cx={cx} cy={cy} r={38} fill="none" stroke={accent} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${frac * 238.8} 238.8`} transform={`rotate(-90 ${cx} ${cy})`} />);
  els.push(<text key="pt" x={cx} y={cy + 7} textAnchor="middle" fontSize={20} fontWeight={900} fill="#fff">{Math.round(frac * 100)}%</text>);
  els.push(<Tag key="v" x={cx + 4} y={cy + 76} anchor="middle" text="Процесс" color={accent} size={10} />);
  return <g>{els}</g>;
}

/* ---------- psychology ---------- */
function Face({ x, y, mood, col }: { x: number; y: number; mood: number; col: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={17} fill="#111B45" stroke={col} strokeWidth={2.4} />
      <circle cx={x - 6} cy={y - 4} r={1.8} fill="#fff" />
      <circle cx={x + 6} cy={y - 4} r={1.8} fill="#fff" />
      <path d={`M${x - 7} ${y + 7 - mood * 2} Q${x} ${y + 7 + mood * 6} ${x + 7} ${y + 7 - mood * 2}`} stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  );
}
export function PsychScene({ uid, A, accent }: SceneProps) {
  const pts: [number, number, string, number, string][] = [
    [0.08, 0.62, "Надежда", 0.6, C.cyan], [0.3, 0.12, "Эйфория", 1, C.gold], [0.52, 0.45, "Тревога", -0.3, "#FF8A5B"],
    [0.72, 0.9, "Паника", -1, C.red], [0.88, 0.5, "Дисциплина", 0.4, C.green],
  ];
  const P = pts.map(([x, y]) => [A.x + 20 + x * (A.w - 40), A.y + 30 + y * (A.h - 90)] as [number, number]);
  let d = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 1; i < P.length; i++) d += ` C${(P[i - 1][0] + P[i][0]) / 2} ${P[i - 1][1]} ${(P[i - 1][0] + P[i][0]) / 2} ${P[i][1]} ${P[i][0]} ${P[i][1]}`;
  return (
    <g>
      <path d={d} fill="none" stroke={accent} strokeWidth={4} strokeLinecap="round" filter={`url(#${uid}g)`} />
      {pts.map((p, i) => (
        <g key={i}>
          <Face x={P[i][0]} y={P[i][1]} mood={p[3]} col={p[4]} />
          <text x={P[i][0]} y={P[i][1] + (p[1] > 0.5 ? -26 : 36)} textAnchor="middle" fontSize={11} fontWeight={800} fill={p[4]}>{p[2]}</text>
        </g>
      ))}
      <Tag x={A.x + 6} y={A.y + A.h - 4} text="Эмоциональный цикл сделки" color={accent} size={10} />
    </g>
  );
}

/* ---------- mascot ---------- */
const QUOTES = ["Нет стопа — нет сделки.", "Сначала режим, потом сигнал.", "Стена из желе — не поддержка.", "После tilt — пауза, не ордер.", "No-trade тоже позиция."];
const POSES = ["teacher", "thinking", "warning", "happy"];
export function MascotScene({ r, A, accent }: SceneProps) {
  const pose = POSES[Math.floor(r() * 4)];
  const q = QUOTES[Math.floor(r() * QUOTES.length)];
  return (
    <g>
      <rect x={A.x + 6} y={A.y + 4} width={A.w - 12} height={A.h - 8} rx={22} fill="#E3E9F6" />
      <image href={`/art/mascot-${pose}.png`} x={A.x + 6} y={A.y - 6} width={A.w * 0.52} height={A.h + 8} preserveAspectRatio="xMidYMid meet" style={{ mixBlendMode: "multiply" }} />
      <rect x={A.x + A.w * 0.5} y={A.y + 40} width={A.w * 0.46} height={86} rx={18} fill="#fff" stroke={accent} strokeWidth={3} />
      <path d={`M${A.x + A.w * 0.5 + 2} ${A.y + 92} l-18 12 l20 -2Z`} fill="#fff" stroke={accent} strokeWidth={3} strokeLinejoin="round" />
      <text x={A.x + A.w * 0.73} y={A.y + 76} textAnchor="middle" fontSize={13} fontWeight={800} fill="#111B45">{q.split(" ").slice(0, Math.ceil(q.split(" ").length / 2)).join(" ")}</text>
      <text x={A.x + A.w * 0.73} y={A.y + 98} textAnchor="middle" fontSize={13} fontWeight={800} fill="#111B45">{q.split(" ").slice(Math.ceil(q.split(" ").length / 2)).join(" ")}</text>
    </g>
  );
}

/* ---------- sessions ---------- */
export function SessionScene({ uid, r, A, accent }: SceneProps) {
  const w = A.w / 24;
  const els: ReactNode[] = [];
  const bands: [number, number, string, string][] = [[0, 8, "Азия", C.violet], [7, 16, "Европа", C.cyan], [13, 22, "США", C.gold]];
  bands.forEach(([a, b, t, col], i) => {
    els.push(<rect key={`b${i}`} x={A.x + a * w} y={A.y + i * 16} width={(b - a) * w} height={12} rx={6} fill={col} opacity={0.6} />);
    els.push(<text key={`bt${i}`} x={A.x + a * w + 8} y={A.y + i * 16 + 10} fontSize={9} fontWeight={800} fill="#0A1130">{t}</text>);
  });
  const vol = Array.from({ length: 24 }, (_, h) => 0.25 + 0.45 * g(h, 9, 3) + 0.6 * g(h, 15.5, 2.6) + r() * 0.12);
  vol.forEach((v, h) => els.push(<rect key={h} x={A.x + h * w + 2} y={A.y + A.h - 26 - v * (A.h - 100)} width={w - 4} height={v * (A.h - 100)} rx={4} fill={accent} opacity={0.35 + v * 0.5} />));
  const sp = vol.map((v, h) => [A.x + h * w + w / 2, A.y + 70 + v * 70] as [number, number]);
  els.push(<Poly key="sp" uid={uid} glow pts={sp} color={C.red} w={2.6} />);
  els.push(<Tag key="t" x={A.x + A.w - 6} y={A.y + 100} anchor="end" text="Спред" color={C.red} size={10} />, <Tag key="t2" x={A.x + A.w - 6} y={A.y + 140} anchor="end" text="Объём" color={accent} size={10} />);
  ["00", "06", "12", "18", "24"].forEach((t, i) => els.push(<text key={`x${i}`} x={A.x + i * 6 * w} y={A.y + A.h - 6} fontSize={10} fontWeight={700} fill={C.muted}>{t}</text>));
  els.push(<text key="u" x={A.x + A.w} y={A.y + A.h - 6} textAnchor="end" fontSize={10} fontWeight={700} fill={C.muted}>UTC</text>);
  return <g>{els}</g>;
}

/* ---------- waterfall ---------- */
export function WaterfallScene({ A, accent }: SceneProps) {
  const steps: [string, number][] = [["Gross", 0.4], ["Комисс.", -0.1], ["Спред", -0.08], ["Проскальз.", -0.07], ["Net", 0.15]];
  const bw = (A.w - 30) / steps.length;
  const U = (A.h - 80) / 0.45;
  const base = A.y + A.h - 34;
  let run = 0;
  const els: ReactNode[] = [];
  steps.forEach(([t, v], i) => {
    const total = i === 0 || i === steps.length - 1;
    const from = total ? 0 : run;
    const to = total ? v : run + v;
    if (i === 0) run = v;
    else if (!total) run += v;
    const y0 = base - Math.max(from, to) * U;
    const h = Math.abs(to - from) * U;
    const col = total ? accent : C.red;
    els.push(<rect key={i} x={A.x + 15 + i * bw + 8} y={y0} width={bw - 16} height={h} rx={8} fill={col} opacity={0.75} />);
    els.push(<text key={`v${i}`} x={A.x + 15 + i * bw + bw / 2} y={y0 - 8} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff" fontFamily="ui-monospace, monospace">{v > 0 ? "+" : "−"}{Math.abs(v).toFixed(2)}%</text>);
    els.push(<text key={`t${i}`} x={A.x + 15 + i * bw + bw / 2} y={base + 18} textAnchor="middle" fontSize={11} fontWeight={800} fill={C.muted}>{t}</text>);
    if (i < steps.length - 1) els.push(<line key={`c${i}`} x1={A.x + 15 + i * bw + bw - 8} x2={A.x + 15 + (i + 1) * bw + 8} y1={base - run * U} y2={base - run * U} stroke="rgba(255,255,255,0.35)" strokeDasharray="3 4" />);
  });
  els.push(<line key="ax" x1={A.x} x2={A.x + A.w} y1={base} y2={base} stroke="rgba(255,255,255,0.3)" />);
  return <g>{els}</g>;
}

/* ---------- spaced repetition ---------- */
export function SpacedScene({ uid, A, accent }: SceneProps) {
  const days = [1, 3, 7, 16, 35];
  const els: ReactNode[] = [];
  const X = (i: number) => A.x + 30 + i * ((A.w - 60) / 4);
  const Y = (i: number) => A.y + A.h - 70 - i * 42;
  const forget: [number, number][] = [];
  for (let i = 0; i <= 40; i++) forget.push([A.x + 20 + (i / 40) * (A.w - 40), A.y + 20 + (1 - Math.exp(-i / 8)) * 100]);
  els.push(<Poly key="f" pts={forget} color={C.red} w={2} dash="4 5" />, <Tag key="ft" x={A.x + 6} y={A.y + 16} text="Кривая забывания" color={C.red} size={10} />);
  const pts = days.map((_, i) => [X(i), Y(i)] as [number, number]);
  els.push(<Poly key="p" uid={uid} glow pts={pts} color={accent} w={3.4} />);
  days.forEach((d, i) => {
    els.push(<circle key={`c${i}`} cx={X(i)} cy={Y(i)} r={22} fill="#111B45" stroke={accent} strokeWidth={3} />);
    els.push(<text key={`t${i}`} x={X(i)} y={Y(i) + 5} textAnchor="middle" fontSize={14} fontWeight={900} fill="#fff">+{d}</text>);
    els.push(<text key={`d${i}`} x={X(i)} y={Y(i) + 40} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.muted}>день</text>);
  });
  return <g>{els}</g>;
}

/* ---------- candle models ---------- */
export function ModelsScene({ A }: SceneProps) {
  const cells: { name: string; c: [number, number, number, number][] }[] = [
    { name: "Доджи", c: [[50, 50.5, 70, 30]] },
    { name: "Молот", c: [[60, 70, 72, 28]] },
    { name: "Поглощение", c: [[58, 52, 60, 50], [50, 66, 68, 48]] },
    { name: "Вечерняя звезда", c: [[40, 60, 62, 38], [63, 65, 70, 60], [62, 44, 64, 42]] },
  ];
  const els: ReactNode[] = [];
  cells.forEach((cell, i) => {
    const x0 = A.x + (i % 2) * (A.w / 2);
    const y0 = A.y + Math.floor(i / 2) * (A.h / 2);
    els.push(<rect key={`r${i}`} x={x0 + 4} y={y0 + 4} width={A.w / 2 - 8} height={A.h / 2 - 8} rx={14} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />);
    cell.c.forEach(([o, c, h, l], k) => {
      const up = c >= o;
      const col = up ? C.green : C.red;
      const cx = x0 + A.w / 4 + (k - (cell.c.length - 1) / 2) * 34;
      const Y = (p: number) => y0 + A.h / 2 - 34 - ((p - 25) / 50) * (A.h / 2 - 60);
      els.push(<line key={`w${i}${k}`} x1={cx} x2={cx} y1={Y(h)} y2={Y(l)} stroke={col} strokeWidth={2.4} />);
      els.push(<rect key={`b${i}${k}`} x={cx - 11} y={Math.min(Y(o), Y(c))} width={22} height={Math.max(3, Math.abs(Y(o) - Y(c)))} rx={3} fill={col} />);
    });
    els.push(<text key={`t${i}`} x={x0 + A.w / 4} y={y0 + A.h / 2 - 14} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">{cell.name}</text>);
  });
  return <g>{els}</g>;
}

/* ---------- line / area ---------- */
export function LineScene({ uid, r, A, accent }: SceneProps) {
  const n = 36;
  const lin = Array.from({ length: n }, (_, i) => 30 + i * 2.2 + 8 * Math.sin(i / 3) + r() * 5);
  const mn = Math.min(...lin);
  const mx = Math.max(...lin);
  const P = lin.map((v, i) => [A.x + (i / (n - 1)) * A.w, A.y + 14 + (1 - (v - mn) / (mx - mn)) * (A.h - 70)] as [number, number]);
  const lg = lin.map((v, i) => [A.x + (i / (n - 1)) * A.w, A.y + 14 + (1 - (Math.log(v) - Math.log(mn)) / (Math.log(mx) - Math.log(mn))) * (A.h - 70)] as [number, number]);
  return (
    <g>
      <path d={`${pathOf(P)} L${A.x + A.w} ${A.y + A.h - 36} L${A.x} ${A.y + A.h - 36}Z`} fill={`url(#${uid}ar)`} />
      <Poly uid={uid} glow pts={P} color={accent} w={3.2} />
      <Poly pts={lg} color={C.gold} w={2} dash="5 5" />
      {P.filter((_, i) => i % 6 === 0).map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={4.5} fill="#0A1130" stroke={accent} strokeWidth={2.4} />)}
      {Array.from({ length: 12 }, (_, i) => <rect key={`b${i}`} x={A.x + 6 + i * (A.w / 12)} y={A.y + A.h - 26 - (8 + r() * 18)} width={A.w / 12 - 10} height={8 + r() * 18} rx={3} fill={C.cyan} opacity={0.35} />)}
      <Tag x={A.x + 6} y={A.y + 22} text="Line · Area · Log" color={accent} size={10} />
    </g>
  );
}

export { ChartScene };
