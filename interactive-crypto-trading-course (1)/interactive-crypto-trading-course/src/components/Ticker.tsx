import { TICKER } from "@/data/satire";

export function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="neo-in mx-3 mt-4 overflow-hidden py-2 md:mx-6" style={{ borderRadius: 999 }} aria-label="Новости департамента управляемой паники">
      <div className="mx-auto max-w-7xl overflow-hidden">
        <div className="ticker-track items-center text-xs font-black uppercase tracking-wider text-[var(--ink)]">
          {items.map((t, i) => (
            <span key={i} className="flex items-center whitespace-nowrap px-6">
              <span className="mr-3 rounded-full bg-[var(--down)] px-2 py-0.5 text-[10px] text-white">СРОЧНО</span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
