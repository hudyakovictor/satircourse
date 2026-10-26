import type { ReactNode } from "react";

const P: Record<string, ReactNode> = {
  market: <><path d="M3 9l2-5h14l2 5" /><path d="M4 9v11h16V9" /><path d="M9 20v-6h6v6" /><path d="M3 9c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0" /></>,
  candle: <><path d="M7 3v4M7 17v4M17 6v3M17 18v3" /><rect x="4.5" y="7" width="5" height="10" rx="1" /><rect x="14.5" y="9" width="5" height="9" rx="1" /></>,
  wave: <><path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0" /><path d="M2 19h20" /></>,
  pattern: <><path d="M2 18l4-8 3 4 3-10 3 10 3-4 4 8" /></>,
  stairs: <><path d="M3 20h5v-5h5v-5h5V5h3" /><path d="M3 20h18" /></>,
  chain: <><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="8" r="2.5" /><circle cx="12" cy="18" r="2.5" /><path d="M8 7l8 1M7 8l4 8M17 10l-4 6" /></>,
  strategy: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><path d="M10 6.5h4a3 3 0 013 3V14" /></>,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5L16 9.5" /></>,
  brain: <><path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 3 3 3 0 001 4 3 3 0 003 4 3 3 0 005 1V4a3 3 0 00-4 0z" /><path d="M15 4a3 3 0 013 3 3 3 0 012 3 3 3 0 01-1 4 3 3 0 01-3 4 3 3 0 01-1 0" /></>,
  lab: <><path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3" /><path d="M7.5 15h9" /></>,
  skull: <><path d="M12 3c-4.5 0-8 3-8 7 0 2.5 1.2 4 3 5v4h10v-4c1.8-1 3-2.500 3-5 0-4-3.500-7-8-7z" /><circle cx="9" cy="11" r="1.6" /><circle cx="15" cy="11" r="1.6" /><path d="M10 19v-2M14 19v-2" /></>,
  journal: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /><path d="M3 7h3M3 12h3M3 17h3" /></>,
  tools: <><path d="M14.5 6.5a4 4 0 01-5 5L4 17l3 3 5.500-5.500a4 4 0 005-5l-2.500 2.500-2.500-.5-.5-2.500z" /></>,
  book: <><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" /><path d="M4 19V5M9 7h6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-5 5-7 8-7s7 2 8 7" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>,
  check: <path d="M4 12l5 5L20 6" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  grad: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11.500V16c0 1.500 3 3 6 3s6-1.500 6-3v-4.500" /></>,
  flame: <path d="M12 2c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3-1-3 0-6 1-9z" />,
  star: <path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
};

export function Icon({ name, size = 22, color = "currentColor", stroke = 1.8 }: { name: string; size?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name] ?? P.star}
    </svg>
  );
}

export function IconBadge({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  return (
    <span className="inline-flex items-center justify-center shrink-0" style={{ width: size, height: size, borderRadius: size * 0.3, background: `${color}1f`, border: `1.5px solid ${color}`, color }}>
      <Icon name={name} size={size * 0.55} />
    </span>
  );
}
