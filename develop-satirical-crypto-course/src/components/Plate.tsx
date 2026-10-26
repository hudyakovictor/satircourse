type PlateProps = {
  uid: string;
  code: string;
  title: string;
  motif: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  ink?: "magenta" | "lime" | "cyan" | "cream";
};

const INK = {
  magenta: "#FF2E7E",
  lime: "#C7F52B",
  cyan: "#2FD9E0",
  cream: "#E9E1D1",
};

function MotifShape({ motif, color }: { motif: number; color: string }) {
  const s = { fill: "none", stroke: color, strokeWidth: 5, strokeLinecap: "round" as const };
  switch (motif) {
    case 1:
      return (
        <g>
          <path d="M-95 -30 L-20 -30 L-20 40 L-95 40 Z" {...s} />
          <path d="M95 -30 L20 -30 L20 40 L95 40 Z" {...s} />
          <circle cx="-58" cy="-2" r="14" {...s} />
          <circle cx="58" cy="-2" r="14" {...s} />
          <path d="M-20 5 L20 5 M0 -60 L0 -40 M-40 -55 L-30 -40 M40 -55 L30 -40" {...s} />
          <path d="M-95 62 L95 62" stroke={color} strokeWidth="2" strokeDasharray="8 8" />
        </g>
      );
    case 2:
      return (
        <g>
          {[
            { x: -70, top: -40, bot: 30, wick: -70 },
            { x: -10, top: -70, bot: 55, wick: -95 },
            { x: 50, top: -20, bot: 70, wick: -45 },
          ].map((c) => (
            <g key={c.x}>
              <line x1={c.x} y1={c.wick} x2={c.x} y2={c.bot + 30} stroke={color} strokeWidth="4" />
              <rect x={c.x - 18} y={c.top} width="36" height={c.bot - c.top} {...s} strokeWidth={4} />
            </g>
          ))}
          <path d="M-95 78 L95 78" stroke={color} strokeWidth="3" />
          <path d="M-95 -95 L-60 -60 M-95 -95 L-60 -95" stroke={color} strokeWidth="3" />
        </g>
      );
    case 3:
      return (
        <g>
          <path d="M0 -92 L78 -62 L78 12 C78 56 40 82 0 94 C-40 82 -78 56 -78 12 L-78 -62 Z" {...s} />
          <path d="M-38 -2 L-8 -2 L-8 28 M-38 -2 L-38 28 L-8 28 M22 -30 L62 -30 M22 0 L62 0 M22 30 L52 30" {...s} strokeWidth={4} />
          <path d="M-78 -100 L78 96" stroke="#FF2E7E" strokeWidth="6" />
        </g>
      );
    case 4:
      return (
        <g>
          {[-78, -40, 0, 40, 78].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={-30 - (i % 2) * 12} r="17" {...s} strokeWidth={4} />
              <path
                d={`M${x - 22} 46 C${x - 22} 6 ${x + 22} 6 ${x + 22} 46`}
                {...s}
                strokeWidth={4}
              />
            </g>
          ))}
          <rect x="-46" y="-96" width="92" height="42" {...s} strokeWidth={4} />
          <path d="M-26 -82 L26 -82 M-26 -68 L6 -68" stroke={color} strokeWidth="4" />
        </g>
      );
    case 5:
      return (
        <g>
          <circle cx="-30" cy="-8" r="58" {...s} />
          <circle cx="-30" cy="-8" r="18" {...s} strokeWidth={4} />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <line
                key={i}
                x1={-30 + Math.cos(a) * 58}
                y1={-8 + Math.sin(a) * 58}
                x2={-30 + Math.cos(a) * 76}
                y2={-8 + Math.sin(a) * 76}
                stroke={color}
                strokeWidth="6"
              />
            );
          })}
          <path d="M46 -86 L46 60 M46 -86 L96 -86 M20 60 L72 60" {...s} strokeWidth={4} />
          <path d="M46 -20 L96 -20" stroke="#FF2E7E" strokeWidth="6" />
        </g>
      );
    case 6:
      return (
        <g>
          <path d="M-20 -60 L60 -96 L60 40 L-20 4 Z" {...s} />
          <path d="M-20 -60 L-20 4 L-64 24 L-64 -42 Z" {...s} strokeWidth={4} />
          <path d="M-72 60 L-40 44 M78 -30 C104 -6 104 8 78 32" stroke={color} strokeWidth="5" fill="none" />
          <path d="M-64 -8 L-96 -8 L-96 46 L-40 46" {...s} strokeWidth={4} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M-84 40 L84 40 L64 88 L-64 88 Z" {...s} strokeWidth={4} />
          <rect x="-58" y="-38" width="76" height="62" {...s} strokeWidth={4} />
          <path d="M-44 -18 L4 -18 M-44 2 L-6 2 M-44 22 L-14 22" stroke={color} strokeWidth="4" />
          <path d="M32 -86 L62 -46 M32 -86 L2 -46" {...s} strokeWidth={4} />
          <path d="M62 -46 L46 -8 Z" {...s} strokeWidth={4} />
          <circle cx="54" cy="-2" r="16" fill={color} opacity="0.35" />
        </g>
      );
  }
}

export function LessonPlate({ uid, code, title, motif, ink = "magenta" }: PlateProps) {
  const color = INK[ink];
  return (
    <svg
      viewBox="0 0 500 500"
      className="plate"
      role="img"
      aria-label={`Иллюстрация урока: ${title}`}
    >
      <defs>
        <pattern id={`dots-${uid}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#E9E1D1" opacity="0.12" />
        </pattern>
        <pattern id={`scan-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="1" fill="#E9E1D1" opacity="0.06" />
        </pattern>
      </defs>
      <rect width="500" height="500" fill="#12100F" />
      <rect width="500" height="500" fill={`url(#dots-${uid})`} />
      <rect width="500" height="500" fill={`url(#scan-${uid})`} />
      <path d="M0 372 L500 322 L500 500 L0 500 Z" fill="#1B1715" />
      <path d="M0 372 L500 322" stroke={color} strokeWidth="3" opacity="0.8" />
      <circle cx="404" cy="112" r="86" fill={color} opacity="0.12" />
      <circle cx="404" cy="112" r="86" fill="none" stroke={color} strokeWidth="2" />
      <g transform="translate(242 236) scale(1.05)">
        <MotifShape motif={motif} color={color} />
      </g>
      <g
        fill="#E9E1D1"
        fontFamily="var(--font-mono)"
        fontSize="13"
        letterSpacing="2"
        opacity="0.85"
      >
        <text x="34" y="52">ДЕПАРТАМЕНТ УПРАВЛЯЕМОЙ ПАНИКИ</text>
      </g>
      <text
        x="34"
        y="446"
        fill="#E9E1D1"
        fontFamily="var(--font-display)"
        fontSize="30"
        fontWeight="700"
        letterSpacing="0.5"
      >
        {title.length > 26 ? title.slice(0, 25) + "…" : title}
      </text>
      <g transform="translate(386 402) rotate(-6)">
        <rect x="0" y="0" width="92" height="42" fill={color} />
        <text
          x="46"
          y="28"
          textAnchor="middle"
          fill="#12100F"
          fontFamily="var(--font-mono)"
          fontSize="16"
          letterSpacing="1.5"
        >
          {code}
        </text>
      </g>
      <g stroke="#E9E1D1" strokeWidth="1.5" opacity="0.5">
        <path d="M20 20 L20 44 M20 20 L44 20" />
        <path d="M480 20 L480 44 M480 20 L456 20" />
      </g>
    </svg>
  );
}
