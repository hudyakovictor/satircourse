"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlayer } from "./PlayerProvider";
import { Icon } from "./Icon";
import { LEVEL_XP } from "@/lib/course";
import { RANKS } from "@/data/meta";

const NAV = [
  { href: "/", label: "Академия", icon: "grad" },
  { href: "/journal", label: "Журнал", icon: "journal" },
  { href: "/tools", label: "Инструменты", icon: "tools" },
  { href: "/glossary", label: "Глоссарий", icon: "book" },
  { href: "/profile", label: "Профиль", icon: "skull" },
];

export function Header() {
  const path = usePathname();
  const { state } = usePlayer();
  const xp = state?.xp ?? 0;
  const lvl = Math.floor(xp / LEVEL_XP);
  const into = xp % LEVEL_XP;
  const done = state ? Object.values(state.lessons).filter((l) => l.completedAt).length : 0;
  const active = (h: string) => (h === "/" ? path === "/" || path.startsWith("/module") || path.startsWith("/lesson") : path.startsWith(h));

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0b0d10]/80 border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-lime text-ink flex items-center justify-center"><Icon name="skull" size={22} stroke={2.2} /></span>
            <span className="font-head text-xl leading-none hidden sm:block">Signal<span className="text-lime">·</span>Arena</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`px-3 py-1.5 rounded-lg font-head text-[0.95rem] tracking-wide transition ${active(n.href) ? "bg-lime text-ink" : "text-muted hover:text-white"}`}>{n.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-panel px-2.5 py-1.5" title={RANKS[Math.min(lvl, RANKS.length - 1)]}>
              <span className="bg-lime text-ink font-mono font-extrabold rounded px-1.5">XP {into}</span>
              <span className="text-muted font-mono">/ {LEVEL_XP}</span>
              <span className="hidden sm:block w-20 h-1.5 rounded bg-line overflow-hidden"><span className="block h-full bg-lime" style={{ width: `${(into / LEVEL_XP) * 100}%` }} /></span>
            </div>
            <div className="hidden sm:flex items-center gap-1 rounded-xl border border-line bg-panel px-2.5 py-1.5 font-mono"><Icon name="target" size={14} color="#ff4d5a" /><span className="text-bad font-bold">{done}/100</span></div>
            <div className="flex items-center gap-1 rounded-xl border border-line bg-panel px-2.5 py-1.5 font-mono"><Icon name="flame" size={14} color="#ffb020" /><span className="font-bold">{state?.streak ?? 0}</span></div>
          </div>
        </div>
      </header>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-[#0b0d10]/95 backdrop-blur grid grid-cols-5">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-head tracking-wide ${active(n.href) ? "text-lime" : "text-muted"}`}>
            <Icon name={n.icon} size={22} />
            {n.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
