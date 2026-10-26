"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "./ProgressProvider";

const NAV = [
  { href: "/", label: "Маршрут" },
  { href: "/tools", label: "Калькуляторы" },
  { href: "/journal", label: "Журнал R" },
  { href: "/materials", label: "Материалы" },
];

export function ShieldLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 24 30" aria-hidden>
      <path d="M12 0 L24 4 V14 C24 22 18 27 12 30 C6 27 0 22 0 14 V4 Z" fill="#f3f0e4" stroke="#e9b949" strokeWidth={1.8} />
      <line x1={8} x2={8} y1={8} y2={20} stroke="#22c55e" strokeWidth={1.4} />
      <rect x={6} y={11} width={4} height={6} fill="#22c55e" rx={0.8} />
      <line x1={16} x2={16} y1={7} y2={19} stroke="#ef4444" strokeWidth={1.4} />
      <rect x={14} y={9} width={4} height={6} fill="#ef4444" rx={0.8} />
    </svg>
  );
}

export function TopBar() {
  const { completedCount, unlockAll, setUnlockAll, ready } = useProgress();
  const path = usePathname();
  const pct = Math.round((completedCount / 100) * 100);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1333]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <ShieldLogo size={30} />
          <span className="text-lg font-black tracking-tight">
            Signal <span className="text-[#e9b949]">Arena</span>
          </span>
        </Link>
        <div className="order-3 flex min-w-[220px] flex-1 items-center gap-3 md:order-2" title={`${completedCount} из 100 уровней пройдено`}>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-[#1a2658] ring-1 ring-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#e9b949] transition-all duration-700" style={{ width: `${ready ? Math.max(pct, 2) : 2}%` }} />
          </div>
          <span className="w-24 text-right text-xs font-extrabold text-[#c6d0f5]">{completedCount}/100 · {completedCount * 10} XP</span>
        </div>
        <nav className="order-2 ml-auto flex items-center gap-1 md:order-3">
          {NAV.map((n) => {
            const on = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={`rounded-xl px-3 py-1.5 text-sm font-bold transition ${on ? "bg-white/15 text-white" : "text-[#9fb0e6] hover:bg-white/10 hover:text-white"}`}>
                {n.label}
              </Link>
            );
          })}
          <button
            onClick={() => setUnlockAll(!unlockAll)}
            className={`ml-1 rounded-xl border px-3 py-1.5 text-xs font-extrabold ${unlockAll ? "border-[#e9b949] bg-[#e9b949]/15 text-[#e9b949]" : "border-white/20 text-[#9fb0e6]"}`}
            title="Открыть все главы без прохождения экзаменов"
          >
            {unlockAll ? "🔓 Все главы" : "🔒 По порядку"}
          </button>
        </nav>
      </div>
    </header>
  );
}
