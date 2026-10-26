import { C, Card, Icon, Mascot, Pill, T, pick, shuffle, n1, type IconName, type K, type Rand } from "./primitives";

export type Flavor = "risk" | "psych" | "research" | "exec" | "fund" | "chart" | "strategy";

export function flavorOf(s: string): Flavor {
  if (/risk|stop|position|leverage|margin|drawdown|portfolio|breakeven|r multiple/.test(s)) return "risk";
  if (/tilt|fomo|bias|journal|checklist|psycholog|discipline|boredom|process/.test(s)) return "psych";
  if (/backtest|sample|walk|edge|capstone|playbook|audit|research/.test(s)) return "research";
  if (/order|bracket|fill|execution|liquidity|book|slippage/.test(s)) return "exec";
  if (/token|funding|unlock|on chain|macro|sentiment|listing|fdv|project|crypto/.test(s)) return "fund";
  if (/strategy|expectancy|regime|timeframe|mean reversion|trend following|range|breakout/.test(s)) return "strategy";
  return "chart";
}

const WORDS: Record<Flavor, string[]> = {
  risk: ["Риск 1%", "Стоп", "Размер", "Плечо", "Просадка", "R-цель", "Лимит", "Маржа"],
  psych: ["Триггер", "Пауза", "Правило", "Чек-лист", "Журнал", "Ревью", "Tilt", "Дисцип."],
  research: ["Гипотеза", "Данные", "Тест", "Выборка", "Отчёт", "Вывод", "Edge", "Аудит"],
  exec: ["Заявка", "Стакан", "Fill", "Стоп", "Цель", "Комиссия", "Спред", "Лимитка"],
  fund: ["Токен", "Эмиссия", "Unlock", "On-chain", "Funding", "OI", "Макро", "Листинг"],
  chart: ["Контекст", "Уровень", "Триггер", "Объём", "Структура", "Режим", "Вход", "Стоп"],
  strategy: ["Режим", "Вход", "Выход", "Стоп", "Матожид.", "Тест", "Правила", "Фильтр"],
};
const VALS = ["+2R", "−1R", "0R", "+1.5R", "−0.5R", "+3R", "1%", "$20", "0.4%", "3:1", "45%", "+0.3R"];

const frame = (k: K) => <Card k={k} x={34} y={46} w={432} h={362} r={32} />;

function Arrow({ x1, y1, x2, y2, c = C.mute }: { x1: number; y1: number; x2: number; y2: number; c?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = (d: number) => x2 + Math.cos(a + d) * 11;
  const hy = (d: number) => y2 + Math.sin(a + d) * 11;
  return (
    <g stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path d={`M${hx(2.6)} ${hy(2.6)}L${x2} ${y2}L${hx(-2.6)} ${hy(-2.6)}`} />
    </g>
  );
}

function Node({ k, x, y, w = 104, h = 104, icon, label, color }: { k: K; x: number; y: number; w?: number; h?: number; icon: IconName; label: string; color: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="26" fill={k.card} filter={k.raise} />
      <Icon name={icon} x={x + w / 2 - 20} y={y + 14} s={0.84} c={color} />
      <T x={x + w / 2} y={y + h - 16} size={12.5} fill={C.ink}>{label}</T>
    </g>
  );
}

const ICONS_BY_FLAVOR: Record<Flavor, IconName[]> = {
  risk: ["shield", "stop", "calc", "bolt", "scale", "target"],
  psych: ["brain", "clock", "book", "check", "bell", "flag"],
  research: ["flask", "search", "bars", "book", "target", "cap"],
  exec: ["layers", "clock", "coin", "stop", "target", "pie"],
  fund: ["coin", "network", "calendar", "bolt", "bell", "pie"],
  chart: ["search", "bars", "flag", "candle", "gauge", "target"],
  strategy: ["target", "candle", "rocket", "gauge", "shield", "flask"],
};

/* -------------- TABLE -------------- */
export function TableScene({ k, r, prompt, accent }: { k: K; r: Rand; prompt: string; accent: string }) {
  const s = prompt.toLowerCase();
  const fl = flavorOf(s);
  const words = shuffle(r, WORDS[fl]).slice(0, 5);
  const heads = /score|rubric|matrix|scorecard/.test(s) ? ["КРИТЕРИЙ", "БАЛЛ", "ВЕРДИКТ"] : /calculation|log|journal|fields/.test(s) ? ["ПОЛЕ", "ЗНАЧЕНИЕ", "ОК?"] : ["ПРАВИЛО", "ЗНАЧЕНИЕ", "СТАТУС"];
  const cols = [C.blue, C.teal, C.violet, C.amber, C.pink];
  return (
    <g>
      {frame(k)}
      <rect x={56} y={68} width="388" height="36" rx="18" fill={k.accent} filter={k.raiseS} />
      <T x={104} y={91} size={11} fill="#fff" w={900}>{heads[0]}</T>
      <T x={282} y={91} size={11} fill="#fff" w={900}>{heads[1]}</T>
      <T x={396} y={91} size={11} fill="#fff" w={900}>{heads[2]}</T>
      {words.map((w, i) => {
        const y = 118 + i * 55;
        const st = r();
        const good = st > 0.35;
        const v = pick(r, VALS);
        return (
          <g key={i}>
            <rect x={52} y={y} width="396" height="46" rx="23" fill={i % 2 ? "#e9eef8" : k.card} filter={i % 2 ? k.inset : k.raiseS} />
            <circle cx="80" cy={y + 23} r="14" fill={cols[i]} />
            <T x={80} y={y + 28} size={13} fill="#fff" w={900}>{i + 1}</T>
            <T x={104} y={y + 28} size={14} anchor="start">{w}</T>
            <Pill k={k} x={246} y={y + 9} w={72} h={28} text={v} size={12} color={v.startsWith("−") ? C.down : v.startsWith("+") ? C.up : C.ink} />
            <circle cx="396" cy={y + 23} r="15" fill={good ? k.up : st > 0.2 ? C.amber : k.down} filter={k.raiseS} />
            <path d={good ? `M389 ${y + 23}L394 ${y + 28}L404 ${y + 17}` : st > 0.2 ? `M396 ${y + 16}V${y + 25}M396 ${y + 30}V${y + 30.5}` : `M390 ${y + 17}L402 ${y + 29}M402 ${y + 17}L390 ${y + 29}`} stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );
      })}
    </g>
  );
}
// numeric props helper (avoid TS string attrs)
/* -------------- LEDGER (spreadsheet) -------------- */
export function LedgerScene({ k, r }: { k: K; r: Rand; prompt: string }) {
  const heads = ["#", "ВХОД", "СТОП", "РАЗМЕР", "R"];
  const xs = [76, 140, 214, 300, 396];
  return (
    <g>
      {frame(k)}
      <rect x={56} y={66} width={388} height={38} rx={19} fill={k.accent} filter={k.raiseS} />
      {heads.map((h, i) => (
        <T key={h} x={xs[i]} y={90} size={11} fill="#fff" w={900}>{h}</T>
      ))}
      {Array.from({ length: 6 }).map((_, i) => {
        const y = 116 + i * 47;
        const e = 50 + Math.floor(r() * 50);
        const st = e - (1 + Math.floor(r() * 3));
        const sz = Math.floor(400 / (e - st)) / 10 * 5;
        const rr = r() > 0.42 ? n1(1 + r() * 2.4) : -1;
        return (
          <g key={i}>
            <rect x={52} y={y} width={396} height={38} rx={19} fill={i % 2 ? "#e9eef8" : k.card} filter={i % 2 ? k.inset : k.raiseS} />
            <T x={xs[0]} y={y + 24} size={12} fill={C.mute}>{i + 1}</T>
            <T x={xs[1]} y={y + 24} size={13}>{e}</T>
            <T x={xs[2]} y={y + 24} size={13} fill={C.down}>{st}</T>
            <T x={xs[3]} y={y + 24} size={13}>{n1(sz)}</T>
            <Pill k={k} x={360} y={y + 5} w={72} h={28} text={rr > 0 ? `+${rr}R` : "−1R"} size={12} color={rr > 0 ? C.up : C.down} />
          </g>
        );
      })}
    </g>
  );
}

/* -------------- HEAT GRID -------------- */
export function GridScene({ k, r, prompt }: { k: K; r: Rand; prompt: string }) {
  const s = prompt.toLowerCase();
  const fl = flavorOf(s);
  const rows = shuffle(r, WORDS[fl]).slice(0, 5);
  const colsL = ["A", "B", "C", "D", "E"];
  const cell = 60;
  const x0 = 130, y0 = 122;
  return (
    <g>
      {frame(k)}
      {colsL.map((c, j) => (
        <Pill key={c} k={k} x={x0 + j * (cell + 4) + 6} y={72} w={cell - 12} h={28} text={c} size={12} color={C.blue} />
      ))}
      {rows.map((w, i) => (
        <g key={w}>
          <T x={58} y={y0 + i * (cell + 4) + cell / 2 + 4} size={12} anchor="start" fill={C.ink}>{w.slice(0, 9)}</T>
          {colsL.map((_, j) => {
            const v = r();
            const col = v > 0.66 ? C.up : v > 0.33 ? C.amber : C.down;
            return (
              <g key={j}>
                <rect x={x0 + j * (cell + 4) + 2} y={y0 + i * (cell + 4)} width={cell - 4} height={cell - 4} rx="16" fill={k.card} filter={k.raiseS} />
                <circle cx={x0 + j * (cell + 4) + cell / 2} cy={y0 + i * (cell + 4) + cell / 2 - 2} r={8 + v * 10} fill={col} opacity={0.55 + v * 0.4} />
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
}

/* -------------- FLOW (snake) -------------- */
export function SnakeScene({ k, r, prompt, accent }: { k: K; r: Rand; prompt: string; accent: string }) {
  const fl = flavorOf(prompt.toLowerCase());
  const w = WORDS[fl].slice(0, 5);
  const ic = ICONS_BY_FLAVOR[fl];
  const cols = [C.blue, C.teal, C.violet, C.amber, C.up];
  const pos = [[58, 82], [198, 82], [338, 82], [338, 232], [198, 232]];
  const last = [58, 232];
  void r; void accent;
  return (
    <g>
      {frame(k)}
      {pos.slice(0, 4).map((p, i) => (
        <Arrow key={i} x1={p[0] + (i < 2 ? 112 : i === 2 ? 52 : -8)} y1={p[1] + (i === 2 ? 108 : 52)} x2={pos[i + 1][0] + (i < 2 ? 130 - 14 : i === 2 ? 52 : 112 + 14)} y2={pos[i + 1][1] + (i === 2 ? -6 : 52)} />
      ))}
      <Arrow x1={190} y1={284} x2={last[0] + 118} y2={284} />
      {pos.map((p, i) => (
        <Node key={i} k={k} x={p[0]} y={p[1]} w={104} h={104} icon={ic[i]} label={w[i]} color={cols[i]} />
      ))}
      <Node k={k} x={last[0]} y={last[1]} icon="check" label="Итог" color={C.up} />
      <Pill k={k} x={140} y={372} w={220} h={26} text="ПРОПУЩЕН ШАГ — СДЕЛКИ НЕТ" size={10} color={C.down} />
    </g>
  );
}

/* -------------- FLOW (loop) -------------- */
export function LoopScene({ k, r, prompt, center }: { k: K; r: Rand; prompt: string; accent: string; center?: IconName }) {
  const fl = flavorOf(prompt.toLowerCase());
  const w = WORDS[fl].slice(0, 6);
  const ic = ICONS_BY_FLAVOR[fl];
  const cols = [C.blue, C.teal, C.violet, C.amber, C.up, C.pink];
  const cx = 250, cy = 232, R = 132;
  const n = 6;
  void r;
  return (
    <g>
      {frame(k)}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#d3dbec" strokeWidth="6" strokeDasharray="2 14" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="58" fill={k.card} filter={k.raise} />
      <circle cx={cx} cy={cy} r="42" fill={k.card} filter={k.inset} />
      <Icon name={center ?? "target"} x={cx - 22} y={cy - 22} s={0.92} c={C.ink} />
      {Array.from({ length: n }).map((_, i) => {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="38" fill={k.card} filter={k.raise} />
            <Icon name={ic[i]} x={x - 15} y={y - 21} s={0.64} c={cols[i]} />
            <T x={x} y={y + 25} size={10.5}>{w[i]}</T>
          </g>
        );
      })}
    </g>
  );
}

/* -------------- FUNNEL -------------- */
export function FunnelScene({ k, prompt }: { k: K; r: Rand; prompt: string; accent: string }) {
  const fl = flavorOf(prompt.toLowerCase());
  const w = fl === "fund" ? ["Идеи", "Токеномика", "On-chain", "Watchlist"] : ["Идеи", "Фильтры", "Тест", "Сделки"];
  const nums = ["100", "37", "12", "3"];
  const cols = [C.blue, C.teal, C.violet, C.up];
  return (
    <g>
      {frame(k)}
      {w.map((t, i) => {
        const top = 78 + i * 78;
        const wt = 340 - i * 62, wb = 340 - (i + 1) * 62;
        const cx = 250;
        return (
          <g key={t}>
            <path d={`M${cx - wt / 2} ${top}H${cx + wt / 2}L${cx + wb / 2} ${top + 68}H${cx - wb / 2}Z`} fill={cols[i]} opacity=".92" filter={k.raiseS} strokeLinejoin="round" />
            <T x={cx} y={top + 30} size={15} fill="#fff" w={900}>{t}</T>
            <T x={cx} y={top + 52} size={20} fill="#ffffffd0" w={900}>{nums[i]}</T>
          </g>
        );
      })}
    </g>
  );
}

/* -------------- QUADRANTS -------------- */
export function QuadScene({ k, r, prompt }: { k: K; r: Rand; prompt: string }) {
  const fl = flavorOf(prompt.toLowerCase());
  const rows = fl === "strategy" ? ["ТРЕНД", "РЕНДЖ"] : ["НИЗКИЙ", "ВЫСОКИЙ"];
  const cols = fl === "strategy" ? ["ТРЕНДОВАЯ", "ВОЗВРАТ"] : ["СТРЕСС", "ВРЕМЯ"];
  const good = [r() > 0.5, r() > 0.5];
  const cell = (i: number, j: number) => (i === j ? good[0] : good[1]) ? (i === j) : false;
  return (
    <g>
      {frame(k)}
      {cols.map((c, j) => (
        <Pill key={c} k={k} x={128 + j * 158} y={64} w={140} h={28} text={c} size={11} color={C.violet} />
      ))}
      {rows.map((c, i) => (
        <g key={c}>
          <Pill k={k} x={50} y={170 + i * 112} w={68} h={28} text={c} size={10} color={C.blue} />
          {cols.map((_, j) => {
            const ok = i === j ? true : r() > 0.7;
            const col = ok ? C.up : C.down;
            return (
              <g key={j}>
                <rect x={126 + j * 158} y={104 + i * 140} width={144} height={128} rx="28" fill={k.card} filter={k.raise} />
                <circle cx={198 + j * 158} cy={158 + i * 140} r="30" fill={ok ? k.up : k.down} />
                <path d={ok ? `M${184 + j * 158} ${158 + i * 140}L${194 + j * 158} ${168 + i * 140}L${214 + j * 158} ${146 + i * 140}` : `M${186 + j * 158} ${146 + i * 140}L${210 + j * 158} ${170 + i * 140}M${210 + j * 158} ${146 + i * 140}L${186 + j * 158} ${170 + i * 140}`} stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <T x={198 + j * 158} y={212 + i * 140} size={13} fill={col}>{ok ? "+0.4R" : "−0.3R"}</T>
              </g>
            );
          })}
        </g>
      ))}
      <text x={0} y={0} fontSize="0">{String(cell(0, 0))}</text>
    </g>
  );
}

/* -------------- DASHBOARD -------------- */
export function DashScene({ k, r, prompt }: { k: K; r: Rand; prompt: string }) {
  const fl = flavorOf(prompt.toLowerCase());
  const labs = shuffle(r, WORDS[fl]).slice(0, 3);
  const vals = ["+0.32R", "62%", "−4.1%", "0.9", "34", "1.8"];
  const cols = [C.blue, C.teal, C.violet];
  const bars = Array.from({ length: 9 }, () => 0.25 + r() * 0.75);
  return (
    <g>
      {frame(k)}
      {labs.map((l, i) => (
        <g key={l}>
          <rect x={56 + i * 130} y={68} width={122} height={92} rx="24" fill={k.card} filter={k.raiseS} />
          <circle cx={78 + i * 130} cy={90} r="7" fill={cols[i]} />
          <T x={92 + i * 130} y={94} size={11} fill={C.mute} anchor="start">{l}</T>
          <T x={117 + i * 130} y={132} size={24} fill={C.ink} w={900}>{vals[i + Math.floor(r() * 3)]}</T>
          <polyline points={Array.from({ length: 8 }, (_, j) => `${70 + i * 130 + j * 13},${150 - r() * 12}`).join(" ")} fill="none" stroke={cols[i]} strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
      <rect x={56} y={176} width={226} height={212} rx="28" fill="#e6ebf6" filter={k.inset} />
      {bars.map((v, i) => (
        <rect key={i} x={74 + i * 23} y={368 - v * 160} width={15} height={v * 160} rx="6" fill={i % 4 === 3 ? k.down : k.up} opacity=".9" />
      ))}
      <rect x={298} y={176} width={146} height={212} rx="28" fill={k.card} filter={k.raiseS} />
      <circle cx={371} cy={266} r="46" fill="none" stroke="#dde4f3" strokeWidth="14" />
      <circle cx={371} cy={266} r="46" fill="none" stroke={C.blue} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 46 * 0.68} 400`} transform="rotate(-90 371 266)" />
      <T x={371} y={272} size={18} w={900}>68%</T>
      <Pill k={k} x={322} y={336} w={98} h={28} text="НОРМА" size={11} color={C.up} />
    </g>
  );
}

/* -------------- CALENDAR -------------- */
export function CalendarScene({ k, r }: { k: K; r: Rand; prompt: string }) {
  const ev = new Set<number>([4 + Math.floor(r() * 3), 12 + Math.floor(r() * 3), 20 + Math.floor(r() * 3), 27]);
  const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  return (
    <g>
      {frame(k)}
      <Pill k={k} x={60} y={66} w={110} h={30} text="СОБЫТИЯ" size={12} color={C.violet} />
      <Pill k={k} x={340} y={66} w={104} h={30} text="RISK WINDOW" size={10} color={C.down} />
      {days.map((d, i) => (
        <T key={d} x={86 + i * 55} y={124} size={10} fill={C.mute}>{d}</T>
      ))}
      {Array.from({ length: 35 }).map((_, i) => {
        const cx = 86 + (i % 7) * 55, cy = 160 + Math.floor(i / 7) * 52;
        const d = i + 1;
        const e = ev.has(d);
        return (
          <g key={i}>
            <rect x={cx - 21} y={cy - 21} width={42} height={42} rx="14" fill={e ? k.down : k.card} filter={e ? k.raiseS : k.raiseS} opacity={d > 30 ? 0.4 : 1} />
            <T x={cx} y={cy + 5} size={13} fill={e ? "#fff" : C.ink}>{d > 30 ? d - 30 : d}</T>
            {e && <circle cx={cx + 16} cy={cy - 16} r="6" fill={C.amber} stroke="#fff" strokeWidth="2" />}
          </g>
        );
      })}
    </g>
  );
}

/* -------------- DONUT -------------- */
export function DonutScene({ k, r }: { k: K; r: Rand; prompt: string }) {
  const parts = [0.32 + r() * 0.1, 0.24, 0.2, 0.16];
  const tot = parts.reduce((a, b) => a + b, 0);
  const cols = [C.blue, C.teal, C.amber, C.down];
  const names = ["Комьюнити", "Команда", "Инвесторы", "Казна"];
  const R = 74, circ = 2 * Math.PI * R;
  let off = 0;
  return (
    <g>
      {frame(k)}
      <circle cx="180" cy="200" r="102" fill={k.card} filter={k.raise} />
      <circle cx="180" cy="200" r={R} fill="none" stroke="#e1e7f4" strokeWidth="32" />
      {parts.map((p, i) => {
        const len = (p / tot) * circ - 4;
        const el = <circle key={i} cx="180" cy="200" r={R} fill="none" stroke={cols[i]} strokeWidth="30" strokeDasharray={`${len} ${circ}`} strokeDashoffset={-off} transform="rotate(-90 180 200)" strokeLinecap="round" />;
        off += (p / tot) * circ;
        return el;
      })}
      <circle cx="180" cy="200" r="46" fill={k.card} filter={k.inset} />
      <T x={180} y={206} size={16} w={900}>FDV</T>
      {names.map((n, i) => (
        <g key={n}>
          <rect x={318} y={100 + i * 54} width="128" height="42" rx="21" fill={k.card} filter={k.raiseS} />
          <circle cx="340" cy={121 + i * 54} r="8" fill={cols[i]} />
          <T x={356} y={126 + i * 54} size={12} anchor="start">{n}</T>
        </g>
      ))}
      <Pill k={k} x={76} y={332} w={116} h={30} text="CIRC 18%" size={11} color={C.teal} />
      <Pill k={k} x={204} y={332} w={116} h={30} text="FDV ×5.5" size={11} color={C.down} />
    </g>
  );
}

/* -------------- LEVER / LIQUIDATION -------------- */
export function LeverScene({ k, r }: { k: K; r: Rand; prompt: string }) {
  const lev = pick(r, [3, 5, 10, 20]);
  return (
    <g>
      {frame(k)}
      <rect x={92} y={80} width="64" height="290" rx="32" fill="#e6ebf6" filter={k.inset} />
      <rect x={92} y={80} width="64" height="290" rx="32" fill="none" />
      <line x1="124" y1="110" x2="124" y2="340" stroke="#cdd6ea" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
      {[["ЦЕНА", 130, C.blue], ["СТОП", 220, C.amber], ["ЛИКВИД.", 312, C.down]].map(([t, y, col], i) => (
        <g key={i}>
          <circle cx="124" cy={y as number} r="20" fill={col as string} filter={k.raiseS} />
          <T x={124} y={(y as number) + 4} size={9} fill="#fff" w={900}>{i === 0 ? "▲" : i === 1 ? "✕" : "☠"}</T>
          <Pill k={k} x={182} y={(y as number) - 15} w={112} h={30} text={t as string} size={11} color={col as string} />
        </g>
      ))}
      <Arrow x1={330} y1={150} x2={330} y2={300} c={C.mute} />
      <Pill k={k} x={352} y={200} w={92} h={30} text={`${lev}× ПЛЕЧО`} size={11} color={C.ink} />
      <rect x={196} y={340} width="248" height="26" rx="13" fill="#e6ebf6" filter={k.inset} />
      <circle cx={196 + 248 * (lev / 24)} cy="353" r="15" fill={k.blueG} filter={k.raiseS} />
    </g>
  );
}

/* -------------- CHECKLIST GATE -------------- */
export function CheckScene({ k, r }: { k: K; r: Rand; prompt: string }) {
  const items = ["Контекст", "Триггер", "Стоп", "Размер", "Журнал"];
  const done = 3 + Math.floor(r() * 2);
  return (
    <g>
      {frame(k)}
      {items.map((t, i) => {
        const ok = i < done;
        const y = 70 + i * 46;
        return (
          <g key={t}>
            <rect x={60} y={y} width={380} height={38} rx="19" fill={k.card} filter={k.raiseS} />
            <rect x={72} y={y + 7} width={24} height={24} rx="8" fill={ok ? k.up : "#e3e9f5"} filter={ok ? undefined : k.inset} />
            {ok && <path d={`M78 ${y + 19}L83 ${y + 25}L91 ${y + 13}`} stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            <T x={112} y={y + 25} size={14} anchor="start">{t}</T>
          </g>
        );
      })}
      <rect x={110} y={312} width={280} height={60} rx="30" fill={done === 5 ? k.up : "#e0e6f3"} filter={k.raise} />
      <Icon name={done === 5 ? "check" : "lock"} x={140} y={326} s={0.64} c={done === 5 ? "#fff" : C.mute} />
      <T x={278} y={348} size={16} fill={done === 5 ? "#fff" : C.mute} w={900}>{done === 5 ? "ОРДЕР РАЗРЕШЁН" : "ВОРОТА ЗАКРЫТЫ"}</T>
    </g>
  );
}

/* -------------- FORMULA -------------- */
export function FormulaScene({ k, r, prompt }: { k: K; r: Rand; prompt: string }) {
  const s = prompt.toLowerCase();
  const isR = /r multiple|expectancy|win rate/.test(s);
  const blocks = isR ? [["WR", "45%", C.blue], ["×", "", C.mute], ["ПРИБЫЛЬ", "+2R", C.up], ["=", "", C.mute], ["E", "+0.3R", C.violet]] : [["РИСК", "$20", C.down], ["÷", "", C.mute], ["СТОП", "$1", C.amber], ["=", "", C.mute], ["РАЗМЕР", "20", C.blue]];
  let x = 52;
  const y = 84;
  const els = blocks.map(([a, b, col], i) => {
    const op = (b as string) === "";
    const w = op ? 28 : 78;
    const el = op ? (
      <T key={i} x={x + w / 2} y={y + 50} size={26} fill={col as string} w={900}>{a as string}</T>
    ) : (
      <g key={i}>
        <rect x={x} y={y} width={w} height={84} rx="24" fill={k.card} filter={k.raise} />
        <T x={x + w / 2} y={y + 28} size={10.5} fill={C.mute}>{a as string}</T>
        <T x={x + w / 2} y={y + 62} size={21} fill={col as string} w={900}>{b as string}</T>
      </g>
    );
    x += w + 8;
    return el;
  });
  const bars = Array.from({ length: 7 }, () => (r() > 0.4 ? 0.3 + r() * 0.7 : -(0.3 + r() * 0.3)));
  return (
    <g>
      {frame(k)}
      {els}
      <rect x={56} y={196} width={388} height={190} rx="28" fill="#e6ebf6" filter={k.inset} />
      <line x1={72} x2={428} y1={300} y2={300} stroke={C.mute} strokeDasharray="4 6" />
      {bars.map((v, i) => (
        <g key={i}>
          <rect x={80 + i * 50} y={v > 0 ? 300 - v * 90 : 300} width={30} height={Math.abs(v) * 90} rx="9" fill={v > 0 ? k.up : k.down} />
          <T x={95 + i * 50} y={v > 0 ? 300 - v * 90 - 8 : 300 + Math.abs(v) * 90 + 16} size={11} fill={v > 0 ? C.up : C.down}>{v > 0 ? `+${n1(v * 3)}R` : "−1R"}</T>
        </g>
      ))}
    </g>
  );
}

/* -------------- BRACKET ORDER -------------- */
export function BracketScene({ k, r }: { k: K; r: Rand; prompt: string }) {
  const pts = Array.from({ length: 14 }, (_, i) => 250 - i * 6 + (r() - 0.5) * 34);
  return (
    <g>
      {frame(k)}
      <rect x={60} y={80} width={380} height={62} rx="18" fill={C.up} opacity=".18" />
      <rect x={60} y={270} width={380} height={72} rx="18" fill={C.down} opacity=".16" />
      <line x1={60} x2={440} y1={210} y2={210} stroke={C.blue} strokeWidth="3.5" strokeDasharray="10 7" strokeLinecap="round" />
      <polyline points={pts.map((y, i) => `${80 + i * 26},${Math.min(330, Math.max(92, y))}`).join(" ")} fill="none" stroke={C.ink} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <Pill k={k} x={84} y={96} w={96} h={28} text="ЦЕЛЬ +2R" size={11} color={C.up} />
      <Pill k={k} x={84} y={196} w={84} h={28} text="ВХОД" size={11} color={C.blue} />
      <Pill k={k} x={84} y={296} w={96} h={28} text="СТОП −1R" size={11} color={C.down} />
      <g>
        <circle cx={390} cy={180} r={26} fill={k.card} filter={k.raise} />
        <T x={390} y={185} size={13} w={900}>OCO</T>
      </g>
      <Pill k={k} x={150} y={360} w={200} h={26} text="ОДНА ИЗ ДВУХ СРАБОТАЕТ" size={10} color={C.mute} />
    </g>
  );
}

/* -------------- CARD (strategy doc) -------------- */
export function DocScene({ k, r }: { k: K; r: Rand; prompt: string }) {
  const f = ["Режим", "Вход", "Стоп", "Риск", "Выход", "Тест"];
  return (
    <g>
      {frame(k)}
      <rect x={96} y={66} width={308} height={330} rx="26" fill="#fff" filter={k.raiseS} />
      <rect x={96} y={66} width={308} height={44} rx="26" fill={k.accent} />
      <rect x={96} y={90} width={308} height={20} fill={k.accent} />
      <T x={250} y={95} size={13} fill="#fff" w={900}>КАРТОЧКА СТРАТЕГИИ</T>
      {f.map((t, i) => (
        <g key={t}>
          <T x={116} y={140 + i * 40} size={12} anchor="start" fill={C.mute}>{t}</T>
          <rect x={196} y={124 + i * 40} width={92 + r() * 90} height={22} rx="11" fill={i % 2 ? "#e1e7f5" : "#dfeaff"} />
        </g>
      ))}
      <g transform="rotate(-14 340 350)">
        <rect x={290} y={326} width={110} height={40} rx="10" fill="none" stroke={C.down} strokeWidth="4" />
        <T x={345} y={353} size={15} fill={C.down} w={900}>НЕ ВЕРЬ</T>
      </g>
    </g>
  );
}

/* -------------- ROADMAP -------------- */
export function RoadScene({ k }: { k: K; r: Rand; prompt: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => [70 + i * 40, 300 - Math.sin(i * 0.8) * 70 - i * 10] as const);
  return (
    <g>
      {frame(k)}
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#dbe2f1" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts.slice(0, 6).map((p) => p.join(",")).join(" ")} fill="none" stroke={C.blue} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="14" fill={i < 6 ? k.blueG : k.card} filter={k.raiseS} />
          <T x={p[0]} y={p[1] + 4} size={10} fill={i < 6 ? "#fff" : C.mute} w={900}>{(i + 1) * 10}</T>
        </g>
      ))}
      <Icon name="cap" x={400} y={58} s={1.1} c={C.violet} />
      <Pill k={k} x={60} y={96} w={150} h={30} text="100 СДЕЛОК PAPER" size={11} color={C.blue} />
      <Pill k={k} x={60} y={356} w={190} h={28} text="МАКС. 3 СДЕЛКИ В ДЕНЬ" size={10} color={C.down} />
    </g>
  );
}

/* -------------- SHIELD -------------- */
export function ShieldScene({ k }: { k: K; r: Rand; prompt: string }) {
  const chips: [string, number, number, string][] = [["1%", 92, 100, C.blue], ["СТОП", 388, 100, C.down], ["ЛИМИТ", 88, 320, C.amber], ["R", 392, 320, C.up]];
  return (
    <g>
      {frame(k)}
      <circle cx="250" cy="225" r="138" fill="none" stroke="#d6deef" strokeWidth="4" strokeDasharray="3 12" strokeLinecap="round" />
      <circle cx="250" cy="225" r="96" fill={k.card} filter={k.raise} />
      <Icon name="shield" x={196} y={170} s={2.3} c={C.blue} />
      {chips.map(([t, x, y, c]) => (
        <g key={t}>
          <circle cx={x} cy={y} r="36" fill={k.card} filter={k.raiseS} />
          <T x={x} y={y + 5} size={14} fill={c} w={900}>{t}</T>
        </g>
      ))}
    </g>
  );
}

/* -------------- Evidence / defense (loop with cap) -------------- */
export function EvidenceScene(p: { k: K; r: Rand; prompt: string; accent: string }) {
  return <LoopScene {...p} center="cap" />;
}

/* -------------- Mascot cameo scene -------------- */
export function MascotScene({ k, r, prompt }: { k: K; r: Rand; prompt: string; accent: string }) {
  void r;
  const fl = flavorOf(prompt.toLowerCase());
  const ic = ICONS_BY_FLAVOR[fl];
  return (
    <g>
      {frame(k)}
      <circle cx="320" cy="210" r="108" fill={k.card} filter={k.inset} />
      <Icon name={ic[0]} x={276} y={166} s={1.8} c={C.blue} />
      <Mascot k={k} x={60} y={64} s={0.98} />
      <Pill k={k} x={290} y={336} w={130} h={30} text="Скрепка смотрит" size={11} color={C.ink} />
    </g>
  );
}
