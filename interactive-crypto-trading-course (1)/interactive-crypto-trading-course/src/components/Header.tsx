"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "./ProgressProvider";
import { GRADES } from "@/data/satire";

const links = [
  { href: "/", label: "Главная" },
  { href: "/course", label: "Курс" },
  { href: "/tools", label: "Инструменты" },
  { href: "/glossary", label: "Глоссарий" },
  { href: "/glitches", label: "Glitch" },
  { href: "/progress", label: "Прогресс" },
];

export function Header() {
  const path = usePathname();
  const { doneCount, grade, setGrade, ready } = useProgress();
  const pct = Math.round((doneCount / 100) * 100);
  const circ = 2 * Math.PI * 15;
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
      <div className="neo mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-6" style={{ borderRadius: 28 }}>
        <Link href="/" className="flex items-center gap-2">
          <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden>
            <rect width="40" height="40" rx="12" fill="#5b7cfa" />
            <path d="M15 11V28a5 5 0 0 0 10 0V13a7 7 0 0 0-14 0V24" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          </svg>
          <span className="headline text-lg md:text-xl">Signal<span className="text-[var(--blue)]">Arena</span></span>
        </Link>
        <nav className="order-3 flex w-full gap-1 overflow-x-auto md:order-none md:ml-4 md:w-auto scroll-x">
          {links.map((l) => {
            const on = l.href === "/" ? path === "/" : path.startsWith(l.href) || (l.href === "/course" && (path.startsWith("/module") || path.startsWith("/lesson")));
            return (
              <Link key={l.href} href={l.href} data-on={on} className="neo-btn whitespace-nowrap px-4 py-2 text-sm">
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 lg:flex" title="Градус жестокости влияет на тон обратной связи">
            <span className="kicker">Градус</span>
            <div className="neo-in flex gap-1 p-1" style={{ borderRadius: 999 }}>
              {([70, 85, 99] as const).map((g) => (
                <button key={g} onClick={() => setGrade(g)} data-on={grade === g} className="neo-btn px-3 py-1 text-xs" title={GRADES[g]}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <Link href="/progress" className="relative flex h-11 w-11 items-center justify-center" title={`Пройдено уровней: ${doneCount}/100`}>
            <svg viewBox="0 0 40 40" className="absolute inset-0">
              <circle cx="20" cy="20" r="15" fill="none" stroke="#dbe2f1" strokeWidth="5" />
              <circle cx="20" cy="20" r="15" fill="none" stroke="#5b7cfa" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(circ * (ready ? pct : 0)) / 100} ${circ}`} transform="rotate(-90 20 20)" />
            </svg>
            <span className="text-[11px] font-black">{ready ? doneCount : 0}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
