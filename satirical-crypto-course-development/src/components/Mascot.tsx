import { Clippy } from "./art/core";

/** Скрепка из Windows: постарела, заржавела, всё видела. SVG, никакого ИИ. */
export function Mascot({ size = 120, mood = "tired", className = "" }: { size?: number; mood?: "tired" | "smug" | "worried" | "dead"; className?: string }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="-52 -64 104 120" className={className} role="img" aria-label="Скрепка — аналоговый наставник">
      <ellipse cx={0} cy={52} rx={30} ry={5} fill="#000" opacity={0.4} />
      <Clippy x={0} y={0} mood={mood} />
    </svg>
  );
}
