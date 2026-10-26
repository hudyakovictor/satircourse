"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePlayer } from "./PlayerProvider";
import { Icon } from "./Icon";

export function Status({ id }: { id: string }) {
  const { state } = usePlayer();
  const l = state?.lessons[id];
  if (l?.completedAt) return <span className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-lime text-ink flex items-center justify-center shadow-lg"><Icon name="check" size={18} stroke={3} /></span>;
  if (l?.decisionLockedAt) return <span className="absolute top-3 right-3 z-10 rounded-full bg-[#ffb020] text-ink text-[10px] font-mono font-extrabold px-2 py-1">В ПРОЦЕССЕ</span>;
  return null;
}

export function LessonTile({ id, art, headline, teaser, accent, exam }: { id: string; art: ReactNode; headline: string; teaser: string; accent: string; exam: boolean }) {
  return (
    <Link href={`/lesson/${id}`} className="group card overflow-hidden block transition hover:-translate-y-1 hover:border-[var(--ac)]" style={{ ["--ac" as string]: accent }}>
      <div className="relative">
        <div className="art-frame !rounded-none">{art}</div>
        <Status id={id} />
        {exam && <span className="absolute bottom-[74px] right-3 z-10 rounded-md px-2 py-0.5 text-[10px] font-mono font-extrabold bg-bad text-white rotate-3">ЭКЗАМЕН</span>}
      </div>
      <div className="p-4">
        <h3 className="font-head text-lg leading-tight group-hover:text-[var(--ac)] transition">{headline}</h3>
        <p className="mt-1.5 text-[13px] leading-snug text-muted line-clamp-3">{teaser}</p>
      </div>
    </Link>
  );
}

export function ModuleProgress({ ids, accent }: { ids: string[]; accent: string }) {
  const { state } = usePlayer();
  const done = ids.filter((i) => state?.lessons[i]?.completedAt).length;
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px] text-muted mb-1"><span>ПРОЙДЕНО</span><span style={{ color: accent }}>{done}/{ids.length}</span></div>
      <div className="h-1.5 rounded bg-line overflow-hidden"><div className="h-full transition-all" style={{ width: `${(done / ids.length) * 100}%`, background: accent }} /></div>
    </div>
  );
}
