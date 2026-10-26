import type { ReactNode } from "react";
import { Arrow, Candles, Chip, Clippy, Ctx, DOWN, Grid, INK, LINE, MUTED, Panel, TXT, Txt, UP, d, genCandles, pts, series } from "./core";

export const derivs = ({ r, a }: Ctx): ReactNode => {
  const price = pts(series(r, 36, 0.01, 0.07, 1), 52, 104, 396, 110);
  const oi = pts(series(r, 36, 0.015, 0.06, 2), 52, 104, 396, 110);
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="FUNDING · OPEN INTEREST" a={a} />
      <path d={d(price)} fill="none" stroke={TXT} strokeWidth={3} /><path d={d(oi)} fill="none" stroke={a} strokeWidth={3} strokeDasharray="8 4" />
      <Txt x={56} y={100} size={10} fill={TXT}>ЦЕНА</Txt><Txt x={110} y={100} size={10} fill={a}>OI</Txt>
      {Array.from({ length: 24 }, (_, i) => {
        const f = Math.sin(i / 3) * 0.6 + (r() - 0.4) * 0.5;
        return <rect key={i} x={52 + i * 16.5} y={f > 0 ? 300 - f * 40 : 300} width={11} height={Math.abs(f) * 40} fill={f > 0 ? DOWN : UP} opacity={0.8} />;
      })}
      <line x1={52} x2={448} y1={300} y2={300} stroke={MUTED} />
      <Txt x={52} y={246} size={10} fill={MUTED}>FUNDING / 8H</Txt>
      <rect x={52} y={346} width={396} height={44} rx={8} fill={a} opacity={0.14} stroke={a} strokeDasharray="5 4" />
      <Txt x={250} y={374} size={14} fill={a} anchor="middle" weight={800}>АРЕНДА МНЕНИЯ: 0.01% / 8Ч</Txt>
    </g>
  );
};

export const onchain = ({ r, a }: Ctx): ReactNode => {
  const nodes = Array.from({ length: 16 }, () => [70 + r() * 360, 110 + r() * 270] as [number, number]);
  const hub: [number, number] = [250, 244];
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ON-CHAIN · ПОТОКИ" a={a} />
      <Grid x={52} y={100} w={396} h={290} nx={8} ny={6} />
      {nodes.map((p, i) => (
        <g key={i}>
          <line x1={p[0]} y1={p[1]} x2={hub[0]} y2={hub[1]} stroke={i % 3 ? UP : DOWN} strokeWidth={1.4} opacity={0.5} strokeDasharray="3 5" />
          {i % 4 === 0 && <line x1={p[0]} y1={p[1]} x2={nodes[(i + 3) % 16][0]} y2={nodes[(i + 3) % 16][1]} stroke={a} strokeWidth={1.4} opacity={0.5} />}
          <circle cx={p[0]} cy={p[1]} r={4 + r() * 8} fill={i % 3 ? UP : DOWN} opacity={0.8} />
        </g>
      ))}
      <circle cx={hub[0]} cy={hub[1]} r={34} fill={INK} stroke={a} strokeWidth={4} />
      <Txt x={hub[0]} y={hub[1] + 4} size={13} fill={a} anchor="middle" weight={800}>БИРЖА</Txt>
      <Chip x={60} y={126} fill={a}>ПРИТОК НА БИРЖИ ↑</Chip>
    </g>
  );
};

export const tokenomics = ({ r, a }: Ctx): ReactNode => {
  void r;
  const parts = [{ v: 0.22, c: DOWN, l: "КОМАНДА" }, { v: 0.28, c: "#ffb020", l: "VC" }, { v: 0.14, c: UP, l: "СООБЩЕСТВО" }, { v: 0.12, c: a, l: "ОБРАЩЕНИЕ" }, { v: 0.24, c: "#22d3ee", l: "КАЗНА" }];
  const cx = 160, cy = 232, R = 78;
  let acc = 0;
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="TOKENOMICS · FDV" a={a} />
      {parts.map((p, i) => {
        const a0 = acc * Math.PI * 2 - Math.PI / 2; acc += p.v; const a1 = acc * Math.PI * 2 - Math.PI / 2;
        const x0 = cx + Math.cos(a0) * R, y0 = cy + Math.sin(a0) * R, x1 = cx + Math.cos(a1) * R, y1 = cy + Math.sin(a1) * R;
        return <path key={i} d={`M${x0} ${y0} A${R} ${R} 0 ${p.v > 0.5 ? 1 : 0} 1 ${x1} ${y1}`} fill="none" stroke={p.c} strokeWidth={36} />;
      })}
      <Txt x={cx} y={cy + 6} size={18} fill={TXT} anchor="middle" weight={800}>100%</Txt>
      {parts.map((p, i) => (
        <g key={i}><rect x={290} y={110 + i * 34} width={14} height={14} rx={3} fill={p.c} /><Txt x={312} y={122 + i * 34} size={12} fill={TXT}>{p.l}</Txt><Txt x={448} y={122 + i * 34} size={12} fill={p.c} anchor="end" weight={800}>{Math.round(p.v * 100)}%</Txt></g>
      ))}
      <Chip x={60} y={376} fill={a}>MCAP 12% ≠ FDV 100%</Chip>
      <rect x={292} y={290} width={30} height={24} rx={4} fill={INK} stroke={DOWN} strokeWidth={3} /><path d="M298 290 v-8 a9 9 0 0 1 18 0 v8" fill="none" stroke={DOWN} strokeWidth={3} />
    </g>
  );
};

export const unlocks = ({ r, a }: Ctx): ReactNode => {
  const m = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ"];
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="VESTING · КАЛЕНДАРЬ" a={a} />
      <Grid x={52} y={100} w={396} h={250} nx={8} ny={5} />
      {m.map((s, i) => {
        const v = i === 3 ? 1 : 0.15 + r() * 0.28;
        return (
          <g key={s}>
            <rect x={60 + i * 48} y={350 - v * 230} width={32} height={v * 230} fill={i === 3 ? DOWN : a} opacity={i === 3 ? 0.95 : 0.55} rx={3} />
            <Txt x={76 + i * 48} y={368} size={10} fill={MUTED} anchor="middle">{s}</Txt>
          </g>
        );
      })}
      <Chip x={206} y={124} fill={DOWN} color={TXT}>CLIFF · ЗАМОК СНЯТ</Chip>
      <Txt x={250} y={396} size={11} fill={MUTED} anchor="middle">РАСПИСАНИЕ ПУБЛИЧНОЕ · ТЫ НЕ ОТКРЫВАЛ</Txt>
    </g>
  );
};

export const sentiment = ({ r, a }: Ctx): ReactNode => {
  void r;
  const cx = 250, cy = 280, R = 140;
  const val = 0.82; const ang = Math.PI * (1 - val);
  const seg = [DOWN, "#ff7a1a", "#ffb020", "#c6ff1a", UP];
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="FEAR & GREED" a={a} />
      {seg.map((c, i) => {
        const a0 = Math.PI + (i / 5) * Math.PI, a1 = Math.PI + ((i + 1) / 5) * Math.PI - 0.03;
        return <path key={i} d={`M${cx + Math.cos(a0) * R} ${cy + Math.sin(a0) * R} A${R} ${R} 0 0 1 ${cx + Math.cos(a1) * R} ${cy + Math.sin(a1) * R}`} fill="none" stroke={c} strokeWidth={30} />;
      })}
      <line x1={cx} y1={cy} x2={cx + Math.cos(ang) * -1 * 0 + Math.cos(Math.PI + (val) * Math.PI) * 110} y2={cy + Math.sin(Math.PI + val * Math.PI) * 110} stroke={a} strokeWidth={6} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={14} fill={INK} stroke={a} strokeWidth={4} />
      <Txt x={cx} y={cy + 56} size={40} fill={a} anchor="middle" weight={800}>82</Txt>
      <Txt x={cx} y={cy + 78} size={13} fill={TXT} anchor="middle">ЖАДНОСТЬ · ИНДЕКС ВЕРЫ В ГРАФИК</Txt>
      <Txt x={90} y={cy + 28} size={11} fill={DOWN}>СТРАХ</Txt><Txt x={410} y={cy + 28} size={11} fill={UP} anchor="end">ЖАДНОСТЬ</Txt>
    </g>
  );
};

export const liquidation = ({ r, a }: Ctx): ReactNode => {
  const data = genCandles(r, 22, -0.045, 0.05, 0.9);
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="КАСКАД ЛИКВИДАЦИЙ" a={a} />
      <rect x={46} y={92} width={408} height={308} fill={DOWN} opacity={0.06} />
      <Candles data={data} x={56} y={106} w={300} h={270} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={372} y={116 + i * 52} width={74} height={34} rx={5} fill={DOWN} opacity={0.2 + i * 0.12} />
          <Txt x={409} y={138 + i * 52} size={12} fill={TXT} anchor="middle" weight={800}>×{(20 - i * 3)} LIQ</Txt>
        </g>
      ))}
      <path d="M356 134 l-10 0 M356 186 l-10 0 M356 238 l-10 0" stroke={DOWN} strokeWidth={3} />
      <Arrow x1={120} y1={130} x2={300} y2={360} color={a} w={5} />
      <Chip x={60} y={396} fill={DOWN} color={TXT}>КИТ СЛУЧАЙНО НАЖАЛ КНОПКУ</Chip>
    </g>
  );
};

export const strategy = ({ r, a }: Ctx): ReactNode => {
  void r;
  const steps = ["КОНТЕКСТ", "ТРИГГЕР", "СТОП", "РАЗМЕР", "ЖУРНАЛ"];
  const subs = ["режим?", "что нажать", "где неверно", "1R", "до / после"];
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="КАРТОЧКА СТРАТЕГИИ" a={a} />
      {steps.map((s, i) => {
        const y = 98 + i * 60;
        return (
          <g key={s}>
            <rect x={60} y={y} width={300} height={46} rx={10} fill={i === 2 ? DOWN : a} opacity={0.16} stroke={i === 2 ? DOWN : a} strokeWidth={2} />
            <circle cx={86} cy={y + 23} r={13} fill={i === 2 ? DOWN : a} />
            <Txt x={86} y={y + 28} size={14} fill={INK} anchor="middle" weight={800}>{i + 1}</Txt>
            <Txt x={112} y={y + 22} size={16} fill={TXT} weight={800}>{s}</Txt><Txt x={112} y={y + 38} size={11} fill={MUTED}>{subs[i]}</Txt>
            {i < 4 && <Arrow x1={210} y1={y + 48} x2={210} y2={y + 60} color={MUTED} w={2} />}
          </g>
        );
      })}
      <g transform="rotate(8 410 250)"><rect x={372} y={200} width={78} height={100} rx={8} fill={INK} stroke={a} strokeWidth={3} /><Txt x={411} y={236} size={14} fill={a} anchor="middle" weight={800}>НЕТ</Txt><Txt x={411} y={256} size={14} fill={a} anchor="middle" weight={800}>СТОПА</Txt><Txt x={411} y={282} size={14} fill={DOWN} anchor="middle" weight={800}>НЕТ</Txt><Txt x={411} y={298} size={14} fill={DOWN} anchor="middle" weight={800}>СДЕЛКИ</Txt></g>
    </g>
  );
};

export const backtest = ({ r, a }: Ctx): ReactNode => {
  const curves = [0, 1, 2, 3].map(() => series(r, 40, 0.01, 0.07, 1));
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="БЭКТЕСТ · IN / OUT OF SAMPLE" a={a} />
      <Grid x={52} y={100} w={396} h={280} />
      <rect x={290} y={100} width={158} height={280} fill={DOWN} opacity={0.1} />
      {curves.map((c, i) => <path key={i} d={d(pts(c, 52, 100, 396, 280))} fill="none" stroke={i === 0 ? a : MUTED} strokeWidth={i === 0 ? 4 : 1.6} opacity={i === 0 ? 1 : 0.5} strokeLinejoin="round" />)}
      <line x1={290} x2={290} y1={100} y2={380} stroke={TXT} strokeDasharray="6 5" />
      <Txt x={170} y={396} size={11} fill={UP} anchor="middle">ОБУЧЕНИЕ · КРАСИВО</Txt><Txt x={370} y={396} size={11} fill={DOWN} anchor="middle">ПРОВЕРКА · ФАКТЫ</Txt>
    </g>
  );
};

export const drawdown = ({ r, a }: Ctx): ReactNode => {
  void r;
  const eq = [0.1, 0.18, 0.26, 0.34, 0.42, 0.5, 0.6, 0.72, 0.8, 0.7, 0.58, 0.46, 0.38, 0.34, 0.4, 0.5, 0.58, 0.7, 0.84, 0.95];
  const p = pts(eq, 52, 110, 396, 260);
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="КРИВАЯ КАПИТАЛА · DD" a={a} />
      <Grid x={52} y={110} w={396} h={260} />
      <path d={`M${p[8][0]} ${p[8][1]} L${p[9][0]} ${p[9][1]} L${p[10][0]} ${p[10][1]} L${p[11][0]} ${p[11][1]} L${p[12][0]} ${p[12][1]} L${p[13][0]} ${p[13][1]} L${p[14][0]} ${p[14][1]} L${p[15][0]} ${p[15][1]} L${p[16][0]} ${p[16][1]} L${p[17][0]} ${p[8][1]} Z`} fill={DOWN} opacity={0.2} />
      <line x1={p[8][0]} x2={p[17][0]} y1={p[8][1]} y2={p[8][1]} stroke={DOWN} strokeDasharray="5 4" />
      <path d={d(p)} fill="none" stroke={a} strokeWidth={4} strokeLinejoin="round" />
      <Arrow x1={p[13][0]} y1={p[8][1] + 6} x2={p[13][0]} y2={p[13][1] - 6} color={DOWN} w={3} />
      <Chip x={p[13][0] - 40} y={p[13][1] + 38} fill={DOWN} color={TXT}>ПРОСАДКА −12R</Chip>
      <Chip x={60} y={134} fill={a}>ПИК → ДНО → ПАМЯТЬ</Chip>
    </g>
  );
};

export const portfolio = ({ r, a }: Ctx): ReactNode => {
  const t = ["BTC", "ETH", "SOL", "BNB", "AVAX", "ARB"];
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="КОРРЕЛЯЦИИ В СТРЕССЕ" a={a} />
      {t.map((s, i) => (
        <g key={s}>
          <Txt x={92 + i * 56} y={112} size={10} fill={MUTED} anchor="middle">{s}</Txt>
          <Txt x={84} y={150 + i * 40 + 6} size={10} fill={MUTED} anchor="end">{s}</Txt>
          {t.map((_, j) => {
            const v = i === j ? 1 : 0.72 + r() * 0.26;
            return <g key={j}><rect x={64 + j * 56} y={124 + i * 40} width={52} height={36} rx={5} fill={i === j ? a : DOWN} opacity={0.3 + v * 0.6} /><Txt x={90 + j * 56} y={147 + i * 40} size={11} fill={INK} anchor="middle" weight={800}>{v.toFixed(2)}</Txt></g>;
          })}
        </g>
      ))}
      <Chip x={60} y={396} fill={a}>ПЯТЬ АЛЬТОВ = ОДНА СТАВКА</Chip>
    </g>
  );
};

export const brain = ({ r, a }: Ctx): ReactNode => {
  void r;
  const em = pts([0.2, 0.3, 0.5, 0.8, 1, 0.9, 0.6, 0.3, 0.12, 0.04, 0.18, 0.4], 52, 270, 396, 100);
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ЭМОЦИИ · КРИВАЯ" a={a} />
      <g transform="translate(250 160)">
        <path d="M-70 10 C-90 -30 -50 -60 -20 -50 C0 -75 50 -70 62 -40 C95 -35 98 10 70 24 C72 52 40 60 20 46 C0 62 -40 56 -48 36 C-70 40 -80 28 -70 10Z" fill={a} opacity={0.22} stroke={a} strokeWidth={3.5} />
        <path d="M-30 -30 C-10 -20 -10 0 -30 8 M10 -40 C30 -30 20 -6 6 -2 M30 10 C46 20 30 34 14 30" fill="none" stroke={a} strokeWidth={2.5} />
        <g transform="translate(-100 6)"><circle r={26} fill={INK} stroke={DOWN} strokeWidth={3} /><path d="M-10 8 q10 -10 20 0" fill="none" stroke={DOWN} strokeWidth={3} /><circle cx={-8} cy={-6} r={3} fill={DOWN} /><circle cx={8} cy={-6} r={3} fill={DOWN} /></g>
        <g transform="translate(100 6)"><circle r={26} fill={INK} stroke={UP} strokeWidth={3} /><path d="M-10 4 q10 12 20 0" fill="none" stroke={UP} strokeWidth={3} /><text x={-8} y={-2} fontSize={14} fill={UP} textAnchor="middle" fontWeight={800}>$</text><text x={8} y={-2} fontSize={14} fill={UP} textAnchor="middle" fontWeight={800}>$</text></g>
      </g>
      <path d={d(em)} fill="none" stroke={TXT} strokeWidth={3.5} strokeLinejoin="round" />
      <Txt x={170} y={262} size={11} fill={UP} anchor="middle" weight={800}>ЭЙФОРИЯ</Txt><Txt x={290} y={388} size={11} fill={DOWN} anchor="middle" weight={800}>«ОТЫГРАЮСЬ»</Txt>
      <Txt x={64} y={392} size={10} fill={MUTED}>ВХОД</Txt><Txt x={430} y={392} size={10} fill={MUTED} anchor="end">ПОСЛЕ ЖУРНАЛА</Txt>
    </g>
  );
};

export const journal = ({ r, a }: Ctx): ReactNode => {
  const f = ["ПАРА", "ТРИГГЕР", "СТОП", "РИСК 1R", "ИТОГ R", "ПРОЦЕСС"];
  return (
    <g>
      <rect x={46} y={66} width={408} height={346} rx={12} fill="#e9e4d2" transform="rotate(-1.2 250 240)" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={66} x2={434} y1={118 + i * 24} y2={118 + i * 24} stroke="#a89f86" strokeWidth={1} transform="rotate(-1.2 250 240)" />)}
      <g transform="rotate(-1.2 250 240)">
        <Txt x={66} y={102} size={22} fill="#3a2d16" mono={false} weight={700}>ЖУРНАЛ СДЕЛОК № {Math.floor(r() * 90 + 10)}</Txt>
        {f.map((s, i) => (
          <g key={s}>
            <rect x={66} y={124 + i * 40} width={16} height={16} rx={3} fill="none" stroke="#3a2d16" strokeWidth={2} />
            {i < 5 && <path d={`M69 ${132 + i * 40} l4 5 l8 -11`} fill="none" stroke={DOWN} strokeWidth={3} />}
            <Txt x={94} y={137 + i * 40} size={13} fill="#3a2d16" weight={800}>{s}</Txt>
            <path d={`M190 ${140 + i * 40} q40 -10 80 0 t90 0`} fill="none" stroke="#1f3a8a" strokeWidth={2} />
          </g>
        ))}
      </g>
      <g transform="rotate(-14 380 330)"><rect x={318} y={300} width={124} height={48} rx={6} fill="none" stroke={DOWN} strokeWidth={4} /><Txt x={380} y={333} size={22} fill={DOWN} anchor="middle" mono={false} weight={700}>ПРОЦЕСС ≥ 90%</Txt></g>
      <rect x={400} y={70} width={8} height={90} rx={3} fill={a} transform="rotate(30 404 115)" />
    </g>
  );
};

export const scales = ({ r, a }: Ctx): ReactNode => {
  void r;
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="EXPECTANCY" a={a} />
      <rect x={244} y={150} width={12} height={200} fill={MUTED} /><rect x={196} y={350} width={108} height={14} rx={4} fill={MUTED} />
      <g transform="rotate(-8 250 150)">
        <rect x={90} y={146} width={320} height={9} rx={4} fill={a} />
        <path d="M110 155 L80 230 H140 Z M390 155 L360 230 H420 Z" fill="none" stroke={a} strokeWidth={2.5} />
        <ellipse cx={110} cy={236} rx={46} ry={11} fill={UP} opacity={0.9} /><ellipse cx={390} cy={236} rx={46} ry={11} fill={DOWN} opacity={0.9} />
        <Txt x={110} y={216} size={22} fill={UP} anchor="middle" weight={800}>+2R</Txt><Txt x={390} y={216} size={22} fill={DOWN} anchor="middle" weight={800}>−1R</Txt>
      </g>
      <circle cx={250} cy={150} r={16} fill={INK} stroke={a} strokeWidth={4} />
      <Chip x={74} y={304} fill={a} size={13}>E = WR × W − (1−WR) × L</Chip>
      <Txt x={250} y={344} size={12} fill={MUTED} anchor="middle">40% × 2R − 60% × 1R = +0.2R</Txt>
      <Txt x={250} y={394} size={12} fill={TXT} anchor="middle">ЕСЛИ НЕ ПОСЧИТАЛ — ТЫ НЕ ТОРГУЕШЬ. ТЫ НАДЕЕШЬСЯ.</Txt>
    </g>
  );
};

export const exam = ({ r, a }: Ctx): ReactNode => {
  void r;
  return (
    <g>
      <rect x={70} y={64} width={360} height={348} rx={14} fill="#1b2026" stroke={a} strokeWidth={3} />
      <rect x={190} y={52} width={120} height={32} rx={8} fill={a} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={94} y={104 + i * 36} width={22} height={22} rx={4} fill="none" stroke={TXT} strokeWidth={2} />
          {i !== 5 && <path d={`M98 ${116 + i * 36} l6 7 l11 -15`} fill="none" stroke={i === 6 ? DOWN : UP} strokeWidth={4} strokeLinecap="round" />}
          <rect x={130} y={110 + i * 36} width={120 + ((i * 53) % 90)} height={9} rx={4} fill={LINE} />
        </g>
      ))}
      <g transform="rotate(-16 340 300)"><circle cx={340} cy={300} r={66} fill="none" stroke={a} strokeWidth={6} /><circle cx={340} cy={300} r={56} fill="none" stroke={a} strokeWidth={2} /><Txt x={340} y={296} size={34} fill={a} anchor="middle" mono={false} weight={700}>80%</Txt><Txt x={340} y={322} size={13} fill={a} anchor="middle" weight={800}>ДОПУЩЕН</Txt></g>
    </g>
  );
};

export const whale = ({ r, a }: Ctx): ReactNode => {
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="СОНАР · КИТЫ" a={a} />
      {[40, 80, 120].map((q) => <circle key={q} cx={250} cy={300} r={q} fill="none" stroke={a} opacity={0.28} />)}
      <g transform="translate(250 190)">
        <path d="M-150 20 C-130 -50 -40 -70 40 -40 C100 -20 130 -50 160 -80 C170 -30 150 0 130 14 C100 60 20 80 -60 70 C-110 66 -140 50 -150 20Z" fill={a} opacity={0.88} />
        <path d="M-90 52 C-40 74 40 66 90 44" fill="none" stroke={INK} strokeWidth={4} opacity={0.5} />
        <circle cx={-98} cy={4} r={6} fill={INK} />
        <path d="M-10 -50 C-14 -80 0 -96 -12 -118 M-10 -50 C0 -80 20 -90 22 -112" stroke={a} strokeWidth={4} fill="none" />
      </g>
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${60 + r() * 380} ${340 + r() * 50} l14 -6 l-4 6 l4 6 Z`} fill={i % 2 ? UP : DOWN} opacity={0.9} />)}
      <Chip x={60} y={126} fill={a}>ТОНКИЙ РЫНОК · ГЛУБОКИЙ КИТ</Chip>
    </g>
  );
};

export const timeframes = ({ r, a }: Ctx): ReactNode => {
  const base = series(r, 60, 0.01, 0.08, 0);
  const labels = ["1W · ОБЗОР", "1D · КОНТЕКСТ", "15M · ТРИГГЕР"];
  return (
    <g>
      {labels.map((l, i) => {
        const y = 62 + i * 116;
        const v = i === 0 ? series(r, 12, 0.03, 0.08, 1) : i === 1 ? base.filter((_, k) => k % 3 === 0) : base.slice(30);
        return (
          <g key={l}>
            <Panel x={34} y={y} w={432} h={106} title={l} a={a} />
            <path d={d(pts(v, 52, y + 40, 396, 56))} fill="none" stroke={i === 2 ? a : TXT} strokeWidth={3} strokeLinejoin="round" />
            {i === 2 && <circle cx={448} cy={y + 40 + (1 - v[v.length - 1]) * 56} r={6} fill={a} />}
          </g>
        );
      })}
      <Chip x={294} y={408} fill={a}>СТАРШИЙ ПРАВ. ПОЗДНО.</Chip>
    </g>
  );
};

export const regime = ({ r, a }: Ctx): ReactNode => {
  const t = [{ l: "ТРЕНД", v: series(r, 18, 0.05, 0.03, 1) }, { l: "ДИАПАЗОН", v: Array.from({ length: 18 }, (_, i) => 0.5 + Math.sin(i * 1.1) * 0.3) }, { l: "ПЕРЕХОД", v: series(r, 18, -0.01, 0.12, 0) }];
  return (
    <g>
      {t.map((x, i) => (
        <g key={x.l}>
          <Panel x={34 + i * 146} y={80} w={134} h={310} title={undefined} a={a} />
          <Txt x={101 + i * 146} y={112} size={14} fill={a} anchor="middle" weight={800}>{x.l}</Txt>
          <path d={d(pts(x.v, 46 + i * 146, 140, 110, 160))} fill="none" stroke={TXT} strokeWidth={3} strokeLinejoin="round" />
          {i === 1 && (<><line x1={46 + i * 146} x2={156 + i * 146} y1={170} y2={170} stroke={DOWN} strokeDasharray="4 4" /><line x1={46 + i * 146} x2={156 + i * 146} y1={270} y2={270} stroke={UP} strokeDasharray="4 4" /></>)}
          <Txt x={101 + i * 146} y={346} size={10} fill={MUTED} anchor="middle">{["СЛЕДУЙ", "ВОЗВРАТ К СРЕДНЕМУ", "ЖДИ"][i]}</Txt>
        </g>
      ))}
    </g>
  );
};

export const dojiset = ({ r, a }: Ctx): ReactNode => {
  void r;
  const cell = (x: number, y: number, name: string, items: [number, number, number, number, string][]) => (
    <g key={name}>
      <Panel x={x} y={y} w={206} h={170} a={a} />
      <Txt x={x + 12} y={y + 22} size={12} fill={a} weight={800}>{name}</Txt>
      {items.map((c, i) => {
        const cx = x + 56 + i * 50;
        return <g key={i}><line x1={cx} x2={cx} y1={y + c[0]} y2={y + c[1]} stroke={c[4]} strokeWidth={3} /><rect x={cx - 13} y={y + c[2]} width={26} height={Math.max(3, c[3] - c[2])} fill={c[4]} rx={2} /></g>;
      })}
    </g>
  );
  return (
    <g>
      {cell(34, 66, "ДОДЖИ", [[50, 150, 98, 102, TXT]])}
      {cell(260, 66, "МОЛОТ", [[60, 150, 66, 90, UP]])}
      {cell(34, 246, "ПОГЛОЩЕНИЕ", [[60, 130, 80, 110, DOWN], [50, 150, 70, 130, UP]])}
      {cell(260, 246, "УТРЕННЯЯ ЗВЕЗДА", [[50, 140, 60, 118, DOWN], [112, 134, 118, 128, MUTED], [70, 130, 78, 118, UP]])}
    </g>
  );
};

export const stop = ({ r, a }: Ctx): ReactNode => {
  const data = genCandles(r, 24, 0.012, 0.07);
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ВХОД · СТОП · ЦЕЛЬ" a={a} />
      <rect x={52} y={158} width={396} height={86} fill={UP} opacity={0.12} /><rect x={52} y={244} width={396} height={44} fill={DOWN} opacity={0.18} />
      <Candles data={data} x={56} y={106} w={300} h={270} />
      <line x1={52} x2={448} y1={244} y2={244} stroke={TXT} strokeWidth={2} />
      <line x1={52} x2={448} y1={288} y2={288} stroke={DOWN} strokeWidth={3} strokeDasharray="8 4" />
      <line x1={52} x2={448} y1={158} y2={158} stroke={UP} strokeWidth={3} strokeDasharray="8 4" />
      <Chip x={370} y={156} fill={UP}>+2R</Chip><Chip x={370} y={242} fill={TXT}>ВХОД</Chip><Chip x={370} y={286} fill={DOWN} color={TXT}>−1R</Chip>
      <Txt x={60} y={396} size={11} fill={a}>СТОП — ДО ВХОДА. ПОСЛЕ — МЕМУАРЫ.</Txt>
    </g>
  );
};

export const calendar = ({ r, a }: Ctx): ReactNode => {
  const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  const ev: Record<number, [string, string]> = { 9: ["CPI", DOWN], 15: ["FOMC", "#ffb020"], 22: ["UNLOCK", a], 27: ["NFP", DOWN] };
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="МАКРО-КАЛЕНДАРЬ" a={a} />
      {days.map((s, i) => <Txt key={s} x={78 + i * 56} y={112} size={11} fill={MUTED} anchor="middle">{s}</Txt>)}
      {Array.from({ length: 35 }, (_, i) => {
        const x = 52 + (i % 7) * 56, y = 122 + Math.floor(i / 7) * 54;
        const e = ev[i];
        return (
          <g key={i}>
            <rect x={x} y={y} width={52} height={48} rx={6} fill={e ? e[1] : "#fff"} opacity={e ? 0.2 : 0.03} stroke={e ? e[1] : LINE} />
            <Txt x={x + 6} y={y + 14} size={10} fill={MUTED}>{i + 1}</Txt>
            {e && <Txt x={x + 26} y={y + 36} size={11} fill={e[1]} anchor="middle" weight={800}>{e[0]}</Txt>}
            {!e && r() > 0.8 && <circle cx={x + 40} cy={y + 36} r={4} fill={MUTED} />}
          </g>
        );
      })}
      <Txt x={250} y={398} size={11} fill={TXT} anchor="middle">ВРЕМЯ СОБЫТИЯ ИЗВЕСТНО. ИСХОД — НЕТ.</Txt>
    </g>
  );
};

export const table = ({ r, a }: Ctx): ReactNode => {
  const heads = ["СИТУАЦИЯ", "ДЕЙСТВИЕ", "R"];
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="ТАБЛИЦА РЕШЕНИЙ" a={a} />
      <rect x={46} y={96} width={408} height={30} rx={6} fill={a} />
      {heads.map((h, i) => <Txt key={h} x={[60, 230, 410][i]} y={116} size={12} fill={INK} weight={800}>{h}</Txt>)}
      {Array.from({ length: 6 }, (_, i) => {
        const y = 134 + i * 44;
        const good = r() > 0.4;
        return (
          <g key={i}>
            <rect x={46} y={y} width={408} height={38} rx={6} fill="#fff" opacity={i % 2 ? 0.02 : 0.05} />
            <rect x={60} y={y + 14} width={90 + r() * 80} height={9} rx={4} fill={MUTED} opacity={0.7} />
            <rect x={230} y={y + 8} width={70 + r() * 40} height={22} rx={11} fill={good ? UP : DOWN} opacity={0.85} />
            <Txt x={410} y={y + 24} size={13} fill={good ? UP : DOWN} weight={800}>{good ? "0R" : "−1R"}</Txt>
          </g>
        );
      })}
    </g>
  );
};

export const mascotScene = ({ r, a }: Ctx): ReactNode => {
  const data = genCandles(r, 14, -0.02, 0.1);
  return (
    <g>
      <Panel x={34} y={60} w={432} h={350} title="СКРЕПКА · ИЗ ПРОШЛОГО" a={a} />
      <Candles data={data} x={52} y={250} w={396} h={120} />
      <Clippy x={250} y={190} s={2.1} mood="smug" />
      <rect x={298} y={92} width={150} height={56} rx={12} fill={TXT} /><path d="M310 148 l-14 22 l34 -22Z" fill={TXT} />
      <Txt x={373} y={115} size={12} fill={INK} anchor="middle" weight={800} mono={false}>НЕ ИИ.</Txt><Txt x={373} y={134} size={12} fill={INK} anchor="middle" weight={800} mono={false}>АНАЛОГОВЫЙ.</Txt>
    </g>
  );
};

export const MOTIFS2 = { derivs, onchain, tokenomics, unlocks, sentiment, liquidation, strategy, backtest, drawdown, portfolio, brain, journal, scales, exam, whale, timeframes, regime, dojiset, stop, calendar, table, mascotScene };
void Grid; void Arrow;
