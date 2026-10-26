import type { ReactNode } from "react";
import { Arrow, Candles, Chip, Ctx, DOWN, Grid, INK, LINE, MUTED, Panel, TXT, Txt, UP, d, genCandles, pts, series, sma } from "./core";

export const candles = ({ r, a }: Ctx): ReactNode => {
  const data = genCandles(r, 30, 0.012, 0.09);
  const x = 52, y = 108, w = 396, h = 205;
  const closes = data.map((k) => k.c);
  const ma = pts(sma(closes, 7), x + w / 60, y, w - w / 30, h);
  const last = data[data.length - 1];
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="BTC/USDT · 15M" a={a} />
      <Grid x={x} y={y} w={w} h={h} />
      <Candles data={data} x={x} y={y} w={w} h={h} />
      <path d={d(ma)} fill="none" stroke={a} strokeWidth={2.5} strokeDasharray="1 0" />
      {data.map((k, i) => (
        <rect key={i} x={x + (w / 30) * i + 3} y={372 - k.v * 38} width={w / 30 - 6} height={k.v * 38} fill={k.c >= k.o ? UP : DOWN} opacity={0.45} rx={1} />
      ))}
      <line x1={x} x2={x + w} y1={y + h - last.c * h} y2={y + h - last.c * h} stroke={a} strokeDasharray="4 4" />
      <Chip x={x + w - 62} y={y + h - last.c * h - 6} fill={a}>{(60000 + Math.round(last.c * 900)).toString()}</Chip>
      <Txt x={x} y={102} size={10} fill={MUTED}>O H L C · ОБЪЁМ ВНИЗУ</Txt>
    </g>
  );
};

export const orderbook = ({ r, a }: Ctx): ReactNode => {
  const rows: ReactNode[] = [];
  const rowH = 20;
  for (let i = 0; i < 8; i++) {
    const wv = 40 + r() * 150 + (i === 5 ? 120 : 0);
    const yy = 98 + i * rowH;
    rows.push(
      <g key={"a" + i}>
        <rect x={250} y={yy} width={wv} height={rowH - 3} fill={DOWN} opacity={0.75} rx={2} />
        <Txt x={60} y={yy + 14} size={11} fill={DOWN}>{(3010 - i * 1).toFixed(1)}</Txt>
        <Txt x={190} y={yy + 14} size={11} fill={MUTED}>{(r() * 9).toFixed(2)}</Txt>
      </g>
    );
  }
  const ay = 98 + 8 * rowH;
  for (let i = 0; i < 8; i++) {
    const wv = 40 + r() * 150 + (i === 2 ? 100 : 0);
    const yy = ay + 40 + i * rowH;
    rows.push(
      <g key={"b" + i}>
        <rect x={250} y={yy} width={wv} height={rowH - 3} fill={UP} opacity={0.75} rx={2} />
        <Txt x={60} y={yy + 14} size={11} fill={UP}>{(3000 - i).toFixed(1)}</Txt>
        <Txt x={190} y={yy + 14} size={11} fill={MUTED}>{(r() * 9).toFixed(2)}</Txt>
      </g>
    );
  }
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ORDER BOOK · ETH/USDT" a={a} />
      <rect x={44} y={ay + 2} width={412} height={34} rx={6} fill={a} opacity={0.15} stroke={a} strokeDasharray="5 4" />
      <Txt x={250} y={ay + 24} size={15} fill={a} anchor="middle" weight={800}>СПРЕД · ЦЕНА 3 005.0</Txt>
      {rows}
      <Txt x={60} y={92} size={9} fill={MUTED}>ЦЕНА</Txt><Txt x={190} y={92} size={9} fill={MUTED}>ОБЪЁМ</Txt>
    </g>
  );
};

export const tape = ({ r, a }: Ctx): ReactNode => {
  const rows: ReactNode[] = [];
  let p = 62000;
  for (let i = 0; i < 13; i++) {
    const buy = r() > 0.38;
    p += buy ? Math.round(r() * 6) : -Math.round(r() * 5);
    const col = buy ? UP : DOWN;
    const yy = 98 + i * 22.5;
    rows.push(
      <g key={i}>
        <rect x={46} y={yy - 11} width={408} height={20} rx={4} fill={col} opacity={i === 12 ? 0.28 : 0.08} />
        <Txt x={58} y={yy + 3} size={11} fill={MUTED}>09:{(10 + i).toString()}:{(10 + Math.floor(r() * 49)).toString()}</Txt>
        <Txt x={176} y={yy + 3} size={12} fill={col} weight={800}>{p}</Txt>
        <rect x={286} y={yy - 6} width={8 + r() * 100} height={10} rx={2} fill={col} opacity={0.7} />
        <Txt x={438} y={yy + 3} size={11} fill={col} anchor="end">{buy ? "▲ ASK" : "▼ BID"}</Txt>
      </g>
    );
  }
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="TIME & SALES" a={a} />
      {rows}
      <Chip x={296} y={402} fill={a}>АГРЕССОР: ПОКУПАТЕЛЬ</Chip>
    </g>
  );
};

export const longshort = ({ r, a }: Ctx): ReactNode => {
  const up = pts(series(r, 14, 0.05, 0.04, 1), 52, 150, 170, 110);
  const dn = pts(series(r, 14, -0.05, 0.04, 1), 278, 150, 170, 110);
  return (
    <g>
      <Panel x={34} y={60} w={200} h={350} a={a} />
      <Panel x={266} y={60} w={200} h={350} a={a} />
      <Txt x={134} y={96} size={26} fill={UP} anchor="middle" mono={false} weight={700}>ЛОНГ</Txt>
      <Txt x={366} y={96} size={26} fill={DOWN} anchor="middle" mono={false} weight={700}>ШОРТ</Txt>
      <path d={d(up)} fill="none" stroke={UP} strokeWidth={4} strokeLinejoin="round" />
      <path d={d(dn)} fill="none" stroke={DOWN} strokeWidth={4} strokeLinejoin="round" />
      <Arrow x1={70} y1={330} x2={200} y2={270} color={UP} w={7} />
      <Arrow x1={300} y1={270} x2={430} y2={330} color={DOWN} w={7} />
      <Txt x={134} y={366} size={32} fill={UP} anchor="middle" weight={800}>+8%</Txt>
      <Txt x={366} y={366} size={32} fill={DOWN} anchor="middle" weight={800}>+8%*</Txt>
      <Txt x={366} y={392} size={10} fill={MUTED} anchor="middle">*ЗАЁМ · РИСК БЕЗ ПОТОЛКА</Txt>
      <circle cx={250} cy={236} r={44} fill={INK} stroke={a} strokeWidth={4} />
      <Txt x={250} y={246} size={30} fill={a} anchor="middle" weight={800}>0R</Txt>
      <Txt x={250} y={302} size={11} fill={a} anchor="middle">NO-TRADE</Txt>
    </g>
  );
};

export const ordertypes = ({ r, a }: Ctx): ReactNode => {
  void r;
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="MARKET vs LIMIT" a={a} />
      <line x1={250} x2={250} y1={100} y2={390} stroke={LINE} strokeWidth={2} strokeDasharray="5 6" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>
          <line x1={150} x2={350} y1={120 + i * 40} y2={120 + i * 40} stroke={LINE} />
          <Txt x={360} y={124 + i * 40} size={11} fill={MUTED}>{(103 - i).toFixed(1)}</Txt>
        </g>
      ))}
      <rect x={72} y={238} width={104} height={44} rx={6} fill={UP} />
      <Txt x={124} y={266} size={16} fill={INK} anchor="middle" weight={800}>MARKET</Txt>
      <Arrow x1={180} y1={260} x2={296} y2={200} color={UP} w={5} />
      <Txt x={80} y={304} size={11} fill={UP}>СЕЙЧАС · ПО ЛЮБОЙ</Txt>
      <rect x={324} y={318} width={104} height={44} rx={6} fill="none" stroke={a} strokeWidth={3} strokeDasharray="6 5" />
      <Txt x={376} y={346} size={16} fill={a} anchor="middle" weight={800}>LIMIT</Txt>
      <Txt x={300} y={384} size={11} fill={a}>ЖДЁТ СВОЮ ЦЕНУ</Txt>
      <circle cx={300} cy={200} r={9} fill={a} />
      <Chip x={72} y={128} fill={DOWN} color={TXT}>СПРЕД = НАЛОГ</Chip>
    </g>
  );
};

export const costs = ({ r, a }: Ctx): ReactNode => {
  void r;
  const bars = [
    { l: "GROSS", v: 0.4, c: UP, base: 0 },
    { l: "СПРЕД", v: -0.08, c: DOWN, base: 0.4 },
    { l: "КОМИС.", v: -0.1, c: DOWN, base: 0.32 },
    { l: "СКОЛЬЖ.", v: -0.07, c: DOWN, base: 0.22 },
    { l: "NET", v: 0.15, c: a, base: 0 },
  ];
  const sc = 600;
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ИЗДЕРЖКИ, %" a={a} />
      <Grid x={52} y={100} w={396} h={260} nx={5} ny={5} />
      {bars.map((b, i) => {
        const x = 70 + i * 78;
        const top = 360 - (b.v > 0 ? b.v + b.base : b.base) * sc;
        const hh = Math.abs(b.v) * sc;
        return (
          <g key={i}>
            <rect x={x} y={top} width={56} height={hh} fill={b.c} rx={4} opacity={0.92} />
            <Txt x={x + 28} y={top - 8} size={12} fill={b.c} anchor="middle" weight={800}>{(b.v > 0 ? "+" : "") + b.v.toFixed(2)}</Txt>
            <Txt x={x + 28} y={380} size={10} fill={MUTED} anchor="middle">{b.l}</Txt>
          </g>
        );
      })}
      <Chip x={290} y={118} fill={a}>0.40 − 0.25 = 0.15%</Chip>
    </g>
  );
};

export const volatility = ({ r, a }: Ctx): ReactNode => {
  const n = 40;
  const base = Array.from({ length: n }, (_, i) => 0.5 + Math.sin(i / 3.2) * (i < 20 ? 0.08 : 0.3) + (r() - 0.5) * (i < 20 ? 0.04 : 0.16));
  const upper = pts(base.map((v, i) => v + (i < 20 ? 0.07 : 0.2)), 52, 108, 396, 270);
  const lower = pts(base.map((v, i) => v - (i < 20 ? 0.07 : 0.2)), 52, 108, 396, 270).reverse();
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ATR · ДЫХАНИЕ РЫНКА" a={a} />
      <path d={d(upper) + " " + d(lower).replace("M", "L") + "Z"} fill={a} opacity={0.16} />
      <path d={d(pts(base, 52, 108, 396, 270))} fill="none" stroke={TXT} strokeWidth={3} strokeLinejoin="round" />
      <line x1={250} x2={250} y1={100} y2={390} stroke={MUTED} strokeDasharray="4 5" />
      <Txt x={150} y={398} size={11} fill={UP} anchor="middle">ШТИЛЬ</Txt>
      <Txt x={350} y={398} size={11} fill={DOWN} anchor="middle">«ТАК И БЫЛО ЗАДУМАНО»</Txt>
      <Chip x={60} y={126} fill={a}>ATR ×1.5 = ТВОЙ СТОП</Chip>
    </g>
  );
};

export const ticker = ({ r, a }: Ctx): ReactNode => {
  const syms = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ARB"];
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="WATCHLIST" a={a} />
      {syms.map((s, i) => {
        const y = 96 + i * 44;
        const ch = (r() - 0.45) * 12;
        const col = ch >= 0 ? UP : DOWN;
        return (
          <g key={s}>
            <rect x={46} y={y} width={408} height={38} rx={6} fill={i === 1 ? a : "#fff"} opacity={i === 1 ? 0.14 : 0.03} />
            <circle cx={68} cy={y + 19} r={11} fill={col} opacity={0.25} />
            <Txt x={68} y={y + 23} size={10} fill={col} anchor="middle" weight={800}>{s[0]}</Txt>
            <Txt x={92} y={y + 24} size={15} fill={TXT} weight={800}>{s}/USDT</Txt>
            <path d={d(pts(series(r, 16, ch / 90, 0.07, 1), 214, y + 6, 110, 26))} fill="none" stroke={col} strokeWidth={2} />
            <Txt x={440} y={y + 24} size={14} fill={col} anchor="end" weight={800}>{(ch >= 0 ? "+" : "") + ch.toFixed(2)}%</Txt>
          </g>
        );
      })}
    </g>
  );
};

export const risk1 = ({ r, a }: Ctx): ReactNode => {
  void r;
  const cx = 160, cy = 220, R = 92;
  const ang = (1 / 100) * Math.PI * 2;
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="РИСК НА СДЕЛКУ" a={a} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={UP} strokeWidth={34} opacity={0.25} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={a} strokeWidth={34} strokeDasharray={`${ang * R} ${Math.PI * 2 * R}`} transform={`rotate(-90 ${cx} ${cy})`} />
      <path d={`M${cx} ${cy - R - 24} l${Math.sin(ang) * (R + 24)} ${(1 - Math.cos(ang)) * (R + 24)}`} stroke={a} strokeWidth={0} />
      <Txt x={cx} y={cy + 10} size={36} fill={a} anchor="middle" weight={800}>1%</Txt>
      <Txt x={cx} y={cy + 32} size={11} fill={MUTED} anchor="middle">СЧЁТА = 1R</Txt>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <ellipse cx={338} cy={344 - i * 14} rx={46} ry={11} fill="#d9a35b" stroke="#6b4a1f" strokeWidth={2} />
          <ellipse cx={338} cy={340 - i * 14} rx={46} ry={11} fill="#f0c26a" stroke="#6b4a1f" strokeWidth={2} />
        </g>
      ))}
      <path d="M338 120 L392 140 V196 C392 232 362 252 338 262 C314 252 284 232 284 196 V140 Z" fill={a} opacity={0.2} stroke={a} strokeWidth={4} />
      <path d="M312 190 L332 210 L366 168" fill="none" stroke={a} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <Txt x={338} y={286} size={11} fill={TXT} anchor="middle">10 СТОПОВ = ЦАРАПИНА</Txt>
    </g>
  );
};

export const rsi = ({ r, a }: Ctx): ReactNode => {
  const v = series(r, 40, 0.012, 0.09, 1);
  const rs = v.map((x, i) => Math.min(0.97, Math.max(0.03, x * 0.9 + 0.06 + Math.sin(i / 4) * 0.05)));
  const rp = pts(rs, 52, 262, 396, 110);
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="RSI(14)" a={a} />
      <path d={d(pts(v, 52, 100, 396, 130))} fill="none" stroke={TXT} strokeWidth={3} strokeLinejoin="round" />
      <rect x={52} y={262} width={396} height={110 * 0.3} fill={DOWN} opacity={0.14} />
      <rect x={52} y={262 + 110 * 0.7} width={396} height={110 * 0.3} fill={UP} opacity={0.14} />
      <line x1={52} x2={448} y1={262 + 33} y2={262 + 33} stroke={DOWN} strokeDasharray="5 5" />
      <line x1={52} x2={448} y1={262 + 77} y2={262 + 77} stroke={UP} strokeDasharray="5 5" />
      <path d={d(rp)} fill="none" stroke={a} strokeWidth={3} strokeLinejoin="round" />
      <Txt x={56} y={258 + 33} size={10} fill={DOWN}>70</Txt><Txt x={56} y={258 + 77} size={10} fill={UP}>30</Txt>
      <Chip x={290} y={124} fill={a}>RSI 76 ≠ «ПРОДАВАЙ»</Chip>
    </g>
  );
};

export const macd = ({ r, a }: Ctx): ReactNode => {
  const n = 36;
  const h = Array.from({ length: n }, (_, i) => Math.sin(i / 3.5) * 0.9 + (r() - 0.5) * 0.4);
  const mc = pts(h.map((x) => 0.5 + x * 0.35), 52, 262, 396, 110);
  const sg = pts(sma(h, 4).map((x) => 0.5 + x * 0.35), 52, 262, 396, 110);
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="MACD 12·26·9" a={a} />
      <Candles data={genCandles(r, 36, 0.006, 0.07)} x={52} y={100} w={396} h={130} />
      {h.map((x, i) => (
        <rect key={i} x={52 + (396 / n) * i + 2} y={x > 0 ? 317 - x * 50 : 317} width={396 / n - 4} height={Math.abs(x) * 50} fill={x > 0 ? UP : DOWN} opacity={0.75} />
      ))}
      <line x1={52} x2={448} y1={317} y2={317} stroke={MUTED} />
      <path d={d(mc)} fill="none" stroke={a} strokeWidth={2.5} /><path d={d(sg)} fill="none" stroke="#ffb020" strokeWidth={2.5} />
      <Chip x={52} y={250} fill={a}>ДИВЕРГЕНЦИЯ?</Chip>
    </g>
  );
};

export const bands = ({ r, a }: Ctx): ReactNode => {
  const v = series(r, 44, 0.004, 0.06, 2);
  const m = sma(v, 10);
  const up = pts(m.map((x, i) => x + (i > 16 && i < 28 ? 0.05 : 0.17)), 52, 100, 396, 280);
  const lo = pts(m.map((x, i) => x - (i > 16 && i < 28 ? 0.05 : 0.17)), 52, 100, 396, 280);
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="BOLLINGER 20·2" a={a} />
      <path d={d(up) + " " + d([...lo].reverse()).replace("M", "L") + "Z"} fill={a} opacity={0.13} />
      <path d={d(up)} fill="none" stroke={a} strokeWidth={2} /><path d={d(lo)} fill="none" stroke={a} strokeWidth={2} />
      <path d={d(pts(m, 52, 100, 396, 280))} fill="none" stroke={MUTED} strokeWidth={2} strokeDasharray="4 4" />
      <path d={d(pts(v, 52, 100, 396, 280))} fill="none" stroke={TXT} strokeWidth={3} strokeLinejoin="round" />
      <ellipse cx={250} cy={240} rx={64} ry={30} fill="none" stroke={DOWN} strokeWidth={2.5} strokeDasharray="5 4" />
      <Chip x={186} y={196} fill={DOWN} color={TXT}>СЖАТИЕ → СЮРПРИЗ</Chip>
    </g>
  );
};

export const ma = ({ r, a }: Ctx): ReactNode => {
  const v = series(r, 46, 0.003, 0.08, 1);
  const f = pts(sma(v, 5), 52, 100, 396, 280);
  const s = pts(sma(v, 14), 52, 100, 396, 280);
  const cross: ReactNode[] = [];
  const fa = sma(v, 5), sa = sma(v, 14);
  for (let i = 15; i < v.length; i++) {
    if ((fa[i] - sa[i]) * (fa[i - 1] - sa[i - 1]) < 0) cross.push(<circle key={i} cx={f[i][0]} cy={f[i][1]} r={9} fill="none" stroke={DOWN} strokeWidth={3} />);
  }
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="EMA 9 / SMA 21" a={a} />
      <Grid x={52} y={100} w={396} h={280} />
      <path d={d(pts(v, 52, 100, 396, 280))} fill="none" stroke={MUTED} strokeWidth={2} />
      <path d={d(f)} fill="none" stroke={a} strokeWidth={3.5} /><path d={d(s)} fill="none" stroke="#ffb020" strokeWidth={3.5} />
      {cross}
      <Chip x={60} y={126} fill={DOWN} color={TXT}>КРЕСТ ≠ ГАРАНТИЯ</Chip>
    </g>
  );
};

export const levels = ({ r, a }: Ctx): ReactNode => {
  const data = genCandles(r, 28, 0, 0.1);
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ЗОНЫ, А НЕ ЛИНИИ" a={a} />
      <rect x={46} y={118} width={408} height={46} fill={DOWN} opacity={0.2} />
      <rect x={46} y={296} width={408} height={46} fill={UP} opacity={0.2} />
      <Txt x={56} y={114} size={10} fill={DOWN}>СОПРОТИВЛЕНИЕ</Txt><Txt x={56} y={364} size={10} fill={UP}>ПОДДЕРЖКА</Txt>
      <Candles data={data} x={56} y={110} w={380} h={240} />
      <Arrow x1={380} y1={200} x2={430} y2={104} color={a} w={5} />
      <Chip x={240} y={392} fill={a}>РЕТЕСТ = ПРОВЕРКА УВАЖЕНИЯ</Chip>
    </g>
  );
};

export const pattern = ({ r, a }: Ctx): ReactNode => {
  void r;
  const P: [number, number][] = [[52, 330], [100, 250], [140, 290], [200, 160], [260, 290], [310, 240], [350, 300], [400, 360], [448, 400]];
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ГОЛОВА И ПЛЕЧИ" a={a} />
      <Grid x={52} y={100} w={396} h={280} />
      <path d={d(P)} fill="none" stroke={TXT} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
      <line x1={52} x2={448} y1={292} y2={292} stroke={a} strokeWidth={3} strokeDasharray="8 5" />
      <Txt x={100} y={238} size={11} fill={MUTED} anchor="middle">ПЛЕЧО</Txt><Txt x={200} y={148} size={12} fill={a} anchor="middle" weight={800}>ГОЛОВА</Txt><Txt x={310} y={228} size={11} fill={MUTED} anchor="middle">ПЛЕЧО</Txt>
      <Arrow x1={350} y1={300} x2={420} y2={376} color={DOWN} w={5} />
      <Chip x={60} y={314} fill={a}>ЛИНИЯ ШЕИ</Chip>
      <Txt x={440} y={396} size={11} fill={DOWN} anchor="end">ПРОБОЙ ПОДТВЕРЖДЁН?</Txt>
    </g>
  );
};

export const triangle = ({ r, a }: Ctx): ReactNode => {
  const z = Array.from({ length: 12 }, (_, i) => [90 + i * 24, i % 2 ? 180 + i * 7 : 330 - i * 7] as [number, number]);
  void r;
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ТРЕУГОЛЬНИК" a={a} />
      <line x1={80} y1={160} x2={400} y2={245} stroke={DOWN} strokeWidth={3} /><line x1={80} y1={340} x2={400} y2={265} stroke={UP} strokeWidth={3} />
      <path d={d(z)} fill="none" stroke={TXT} strokeWidth={3.5} strokeLinejoin="round" />
      <Arrow x1={380} y1={255} x2={446} y2={150} color={a} w={6} />
      <Chip x={60} y={392} fill={a}>ПАУЗА МЕЖДУ ИМПУЛЬСАМИ</Chip>
    </g>
  );
};

export const structure = ({ r, a }: Ctx): ReactNode => {
  void r;
  const Z: [number, number][] = [[56, 370], [110, 300], [150, 336], [214, 238], [260, 280], [330, 172], [370, 214], [440, 108]];
  const lab = ["LL", "HH", "HL", "HH", "HL", "HH", "HL", "HH"];
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="СТРУКТУРА HH / HL" a={a} />
      <Grid x={52} y={100} w={396} h={290} />
      <path d={d(Z)} fill="none" stroke={a} strokeWidth={4} strokeLinejoin="round" />
      {Z.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r={7} fill={INK} stroke={i % 2 ? UP : DOWN} strokeWidth={3} />
          {i > 0 && <Txt x={p[0]} y={p[1] + (lab[i] === "HH" ? -14 : 24)} size={12} fill={lab[i] === "HH" ? UP : "#ffb020"} anchor="middle" weight={800}>{lab[i]}</Txt>}
        </g>
      ))}
      <Chip x={60} y={126} fill={a}>ЛЕСТНИЦА ВВЕРХ</Chip>
    </g>
  );
};

export const volume = ({ r, a }: Ctx): ReactNode => {
  const bars = Array.from({ length: 18 }, (_, i) => 0.15 + Math.exp(-Math.pow((i - 8) / 4, 2)) * 0.85 * (0.7 + r() * 0.3));
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ОБЪЁМ · ПРОФИЛЬ" a={a} />
      <Candles data={genCandles(r, 20, 0.004, 0.07)} x={52} y={100} w={236} h={282} />
      {bars.map((b, i) => (
        <rect key={i} x={448 - b * 140} y={100 + i * 15.6} width={b * 140} height={12} rx={2} fill={i === 8 ? a : UP} opacity={i === 8 ? 1 : 0.5} />
      ))}
      <Txt x={300} y={100 + 8 * 15.6 + 10} size={11} fill={a} anchor="end" weight={800}>POC</Txt>
      <Chip x={60} y={126} fill={a}>ЦЕНА ШЕПЧЕТ · ОБЪЁМ КРИЧИТ</Chip>
      <line x1={52} x2={448} y1={100 + 8 * 15.6 + 6} y2={100 + 8 * 15.6 + 6} stroke={a} strokeDasharray="4 4" opacity={0.6} />
    </g>
  );
};

export const MOTIFS1 = { candles, orderbook, tape, longshort, ordertypes, costs, volatility, ticker, risk1, rsi, macd, bands, ma, levels, pattern, triangle, structure, volume };
void LINE;
