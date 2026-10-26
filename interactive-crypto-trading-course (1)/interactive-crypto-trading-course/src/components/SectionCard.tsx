import type { ReactNode } from "react";
import { CARD_META } from "@/data/satire";

export function SectionCard({ id, k, color, children, art }: { id: string; k: keyof typeof CARD_META; color: string; children: ReactNode; art?: ReactNode }) {
  const m = CARD_META[k];
  return (
    <section id={id} className="neo scroll-mt-28 p-5 md:p-8">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center text-xl font-black text-white" style={{ background: color, borderRadius: 16, boxShadow: `4px 4px 12px ${color}55` }}>
          {m.tag}
        </span>
        <div>
          <div className="kicker">{m.alias}</div>
          <h2 className="headline text-2xl">{m.name}</h2>
        </div>
        <p className="w-full text-xs font-semibold text-[var(--mute)] md:ml-auto md:w-auto md:max-w-xs md:text-right">{m.sub}</p>
      </div>
      <div className={art ? "grid items-start gap-6 lg:grid-cols-[1fr_minmax(0,420px)]" : ""}>
        <div>{children}</div>
        {art && <div className="neo-s overflow-hidden p-2" style={{ borderRadius: 34 }}>{art}</div>}
      </div>
    </section>
  );
}
