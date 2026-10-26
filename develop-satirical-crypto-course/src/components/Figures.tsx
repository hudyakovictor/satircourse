type FigureProps = {
  kind: "candles" | "risk" | "cycle" | "cascade" | "psych" | "orderbook" | "flow";
  title: string;
  caption: string;
};

const AXIS = "#5B5148";
const PAPER = "#E9E1D1";

function Frame({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="figure">
      <div className="figure__head">
        <span className="figure__tag">СХЕМА</span>
        <h4 className="figure__title">{title}</h4>
      </div>
      <div className="figure__canvas">{children}</div>
      <figcaption className="figure__caption">{caption}</figcaption>
    </figure>
  );
}

export function LessonFigure({ kind, title, caption }: FigureProps) {
  return (
    <Frame title={title} caption={caption}>
      <svg
        viewBox="0 0 500 300"
        className="figure__svg"
        role="img"
        aria-label={title}
      >
        {kind === "candles" && <Candles />}
        {kind === "risk" && <Risk />}
        {kind === "cycle" && <Cycle />}
        {kind === "cascade" && <Cascade />}
        {kind === "psych" && <Psych />}
        {kind === "orderbook" && <Orderbook />}
        {kind === "flow" && <Flow />}
      </svg>
    </Frame>
  );
}

function Grid() {
  return (
    <g stroke={AXIS} strokeWidth="1" opacity="0.35">
      {[60, 110, 160, 210, 260].map((y) => (
        <line key={y} x1="40" y1={y} x2="480" y2={y} strokeDasharray="3 7" />
      ))}
    </g>
  );
}

function Candles() {
  const candles = [
    { x: 70, o: 200, c: 150, hi: 130, lo: 215, up: true },
    { x: 120, o: 150, c: 170, hi: 132, lo: 190, up: false },
    { x: 170, o: 170, c: 120, hi: 100, lo: 182, up: true },
    { x: 220, o: 120, c: 96, hi: 82, lo: 136, up: true },
    { x: 270, o: 96, c: 158, hi: 92, lo: 186, up: false },
    { x: 320, o: 158, c: 132, hi: 112, lo: 172, up: true },
    { x: 370, o: 132, c: 108, hi: 92, lo: 150, up: true },
    { x: 420, o: 108, c: 126, hi: 98, lo: 152, up: false },
  ];
  return (
    <g>
      <Grid />
      {candles.map((k) => {
        const top = Math.min(k.o, k.c);
        const h = Math.max(6, Math.abs(k.c - k.o));
        return (
          <g key={k.x}>
            <line
              x1={k.x}
              y1={k.hi}
              x2={k.x}
              y2={k.lo}
              stroke={k.up ? "#C7F52B" : "#FF2E7E"}
              strokeWidth="2"
            />
            <rect
              x={k.x - 12}
              y={top}
              width="24"
              height={h}
              fill={k.up ? "#C7F52B" : "#FF2E7E"}
              opacity={k.up ? 0.85 : 0.9}
            />
            <rect
              x={k.x - 12}
              y={250 - (k.lo - k.hi) * 0.35}
              width="24"
              height={(k.lo - k.hi) * 0.35}
              fill={PAPER}
              opacity="0.25"
            />
          </g>
        );
      })}
      <line x1="40" y1="248" x2="480" y2="248" stroke={AXIS} strokeWidth="1.5" />
      <g
        fill={PAPER}
        fontFamily="var(--font-mono)"
        fontSize="11"
        letterSpacing="1.2"
        opacity="0.85"
      >
        <text x="42" y="34">ВЕРХНЯЯ ТЕНЬ — ОТЧЁТ О НЕУДАЧНОЙ ПОПЫТКЕ</text>
        <text x="42" y="286">ОБЪЁМ — КОЛИЧЕСТВО СОГЛАСИВШИХСЯ</text>
      </g>
      <g stroke={PAPER} strokeWidth="1.2" opacity="0.7">
        <line x1="420" y1="98" x2="452" y2="62" />
        <line x1="270" y1="186" x2="300" y2="216" />
      </g>
    </g>
  );
}

function Risk() {
  return (
    <g>
      <path
        d="M80 230 A170 170 0 0 1 420 230"
        fill="none"
        stroke={AXIS}
        strokeWidth="26"
      />
      <path
        d="M80 230 A170 170 0 0 1 205 83"
        fill="none"
        stroke="#C7F52B"
        strokeWidth="26"
      />
      <path
        d="M205 83 A170 170 0 0 1 320 96"
        fill="none"
        stroke="#2FD9E0"
        strokeWidth="26"
      />
      <path
        d="M320 96 A170 170 0 0 1 420 230"
        fill="none"
        stroke="#FF2E7E"
        strokeWidth="26"
      />
      <g stroke={PAPER} strokeWidth="3">
        <line x1="250" y1="230" x2="330" y2="128" />
      </g>
      <circle cx="250" cy="230" r="12" fill={PAPER} />
      <g
        fill={PAPER}
        fontFamily="var(--font-mono)"
        fontSize="12"
        letterSpacing="1.4"
      >
        <text x="62" y="262">0,5%</text>
        <text x="196" y="66">1%</text>
        <text x="300" y="76">3%</text>
        <text x="404" y="262">10%</text>
        <text x="150" y="288" opacity="0.7">
          ВЫЖИВАНИЕ
        </text>
        <text x="330" y="288" opacity="0.7">
          ЛИКВИДАЦИЯ
        </text>
      </g>
    </g>
  );
}

function Cycle() {
  const phases = [
    { label: "НАКОПЛЕНИЕ", a: -90 },
    { label: "РОСТ", a: -30 },
    { label: "ЭЙФОРИЯ", a: 30 },
    { label: "РАСПРЕДЕЛЕНИЕ", a: 90 },
    { label: "ПАДЕНИЕ", a: 150 },
    { label: "КАПИТУЛЯЦИЯ", a: 210 },
  ];
  return (
    <g>
      <circle cx="250" cy="150" r="98" fill="none" stroke={AXIS} strokeWidth="2" />
      <circle
        cx="250"
        cy="150"
        r="98"
        fill="none"
        stroke="#FF2E7E"
        strokeWidth="6"
        strokeDasharray="200 420"
        transform="rotate(-40 250 150)"
      />
      <path d="M250 150 L250 62" stroke={PAPER} strokeWidth="2" opacity="0.5" />
      <circle cx="250" cy="150" r="34" fill="#1B1715" stroke={PAPER} strokeWidth="1.5" />
      <text
        x="250"
        y="146"
        textAnchor="middle"
        fill={PAPER}
        fontFamily="var(--font-mono)"
        fontSize="12"
        letterSpacing="1"
      >
        ВЕРА
      </text>
      <text
        x="250"
        y="164"
        textAnchor="middle"
        fill="#8B8177"
        fontFamily="var(--font-mono)"
        fontSize="10"
      >
        ХРАНИТСЯ ТУТ
      </text>
      {phases.map((p) => {
        const rad = (p.a * Math.PI) / 180;
        const x = 250 + Math.cos(rad) * 132;
        const y = 150 + Math.sin(rad) * 132;
        return (
          <g key={p.label}>
            <circle cx={x} cy={y} r="5" fill="#C7F52B" />
            <text
              x={250 + Math.cos(rad) * 158}
              y={150 + Math.sin(rad) * 158 + 4}
              textAnchor="middle"
              fill={PAPER}
              fontFamily="var(--font-mono)"
              fontSize="11"
              letterSpacing="1"
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Cascade() {
  const steps = [
    { label: "СТОПЫ", x: 40, y: 70 },
    { label: "ЛИКВИДАЦИИ", x: 150, y: 118 },
    { label: "ПРОДАЖА ЗАЛОГА", x: 260, y: 166 },
    { label: "ПАНИКА", x: 370, y: 214 },
  ];
  return (
    <g>
      {steps.map((s, i) => (
        <g key={s.label}>
          <rect
            x={s.x}
            y={s.y}
            width="108"
            height="44"
            fill="#1B1715"
            stroke="#FF2E7E"
            strokeWidth="2"
          />
          <text
            x={s.x + 54}
            y={s.y + 27}
            textAnchor="middle"
            fill={PAPER}
            fontFamily="var(--font-mono)"
            fontSize="11"
            letterSpacing="1"
          >
            {s.label}
          </text>
          {i < steps.length - 1 && (
            <path
              d={`M${s.x + 108} ${s.y + 22} L${steps[i + 1].x} ${steps[i + 1].y + 22}`}
              stroke="#C7F52B"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
          )}
        </g>
      ))}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 z" fill="#C7F52B" />
        </marker>
      </defs>
      <path
        d="M30 60 L30 250 L470 250"
        fill="none"
        stroke={AXIS}
        strokeWidth="1.5"
      />
      <text
        x="40"
        y="284"
        fill="#8B8177"
        fontFamily="var(--font-mono)"
        fontSize="11"
        letterSpacing="1"
      >
        КАЖДЫЙ ШАГ РОЖДАЕТ СЛЕДУЮЩИЙ. МЕХАНИЗМ РАБОТАЕТ БЕЗ УЧАСТИЯ ЗДРАВОГО СМЫСЛА.
      </text>
    </g>
  );
}

function Psych() {
  const nodes = [
    { label: "СКРИНШОТ", x: 60, y: 90 },
    { label: "СРАВНЕНИЕ", x: 190, y: 60 },
    { label: "БОЛЬ", x: 320, y: 90 },
    { label: "ВХОД", x: 320, y: 200 },
    { label: "ОБЛЕГЧЕНИЕ", x: 190, y: 230 },
    { label: "УБЫТОК", x: 60, y: 200 },
  ];
  return (
    <g>
      {nodes.map((n, i) => {
        const next = nodes[(i + 1) % nodes.length];
        return (
          <g key={n.label}>
            <line
              x1={n.x + 55}
              y1={n.y + 20}
              x2={next.x + 55}
              y2={next.y + 20}
              stroke="#FF2E7E"
              strokeWidth="2"
              opacity="0.75"
            />
            <rect
              x={n.x}
              y={n.y}
              width="110"
              height="40"
              fill="#1B1715"
              stroke={i === 5 ? "#FF2E7E" : "#E9E1D1"}
              strokeWidth="1.5"
            />
            <text
              x={n.x + 55}
              y={n.y + 25}
              textAnchor="middle"
              fill={PAPER}
              fontFamily="var(--font-mono)"
              fontSize="11"
              letterSpacing="1"
            >
              {n.label}
            </text>
          </g>
        );
      })}
      <text
        x="250"
        y="290"
        textAnchor="middle"
        fill="#8B8177"
        fontFamily="var(--font-mono)"
        fontSize="11"
        letterSpacing="1"
      >
        ПРОИЗВОДСТВЕННЫЙ ЦИКЛ ЗАКРЫТ. ПОВТОРЯЕТСЯ АВТОМАТИЧЕСКИ.
      </text>
    </g>
  );
}

function Orderbook() {
  const bids = [230, 190, 150, 110, 78];
  const asks = [250, 210, 168, 120, 86];
  return (
    <g>
      {bids.map((w, i) => (
        <rect
          key={`b${i}`}
          x={240 - w}
          y={60 + i * 34}
          width={w}
          height="24"
          fill="#C7F52B"
          opacity={0.25 + i * 0.14}
        />
      ))}
      {asks.map((w, i) => (
        <rect
          key={`a${i}`}
          x={250}
          y={60 + i * 34}
          width={w}
          height="24"
          fill="#FF2E7E"
          opacity={0.25 + i * 0.14}
        />
      ))}
      <line x1="245" y1="46" x2="245" y2="236" stroke={PAPER} strokeWidth="2" />
      <g
        fill={PAPER}
        fontFamily="var(--font-mono)"
        fontSize="11"
        letterSpacing="1"
      >
        <text x="40" y="40">ПОКУПАТЕЛИ</text>
        <text x="330" y="40">ПРОДАВЦЫ</text>
        <text x="196" y="270" opacity="0.7">
          ТОНКАЯ КНИГА = ПРИГЛАШЕНИЕ К НЕСЧАСТНОМУ СЛУЧАЮ
        </text>
      </g>
    </g>
  );
}

function Flow() {
  const boxes = [
    { label: "ШУМ", sub: "НОВОСТИ · СЛУХИ", x: 30, y: 60, w: 130 },
    { label: "ЛИКВИДНОСТЬ", sub: "РЕАЛЬНЫЕ ДЕНЬГИ", x: 185, y: 130, w: 130 },
    { label: "ВЕРА", sub: "ОЖИДАНИЕ СПРОСА", x: 340, y: 200, w: 130 },
  ];
  return (
    <g>
      {boxes.map((b, i) => (
        <g key={b.label}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height="66"
            fill="#1B1715"
            stroke={i === 1 ? "#C7F52B" : "#E9E1D1"}
            strokeWidth="1.5"
          />
          <text
            x={b.x + b.w / 2}
            y={b.y + 28}
            textAnchor="middle"
            fill={PAPER}
            fontFamily="var(--font-mono)"
            fontSize="13"
            letterSpacing="1.6"
          >
            {b.label}
          </text>
          <text
            x={b.x + b.w / 2}
            y={b.y + 48}
            textAnchor="middle"
            fill="#8B8177"
            fontFamily="var(--font-mono)"
            fontSize="9"
            letterSpacing="1"
          >
            {b.sub}
          </text>
        </g>
      ))}
      <path
        d="M160 100 L185 150 M315 170 L340 220"
        stroke="#FF2E7E"
        strokeWidth="2"
        strokeDasharray="6 6"
      />
      <path
        d="M405 200 C405 120 320 100 250 130"
        stroke={AXIS}
        strokeWidth="1.5"
        fill="none"
      />
      <text
        x="250"
        y="288"
        textAnchor="middle"
        fill="#8B8177"
        fontFamily="var(--font-mono)"
        fontSize="11"
        letterSpacing="1"
      >
        ДЕНЬГИ ИДУТ ОТ НЕТЕРПЕЛИВЫХ К ТЕРПЕЛИВЫМ. ПОПУТНО ОПЛАЧИВАЯ КОМИССИИ.
      </text>
    </g>
  );
}
