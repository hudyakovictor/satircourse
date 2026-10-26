"use client";

import Link from "next/link";
import { useProgress } from "./ProgressProvider";

export function ModuleProgress({ ids, color }: { ids: string[]; color: string }) {
  const { lessons, ready } = useProgress();
  const done = ready ? ids.filter((i) => lessons[i]?.done).length : 0;
  return (
    <div>
      <div className="neo-in h-3 overflow-hidden" style={{ borderRadius: 99 }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${(done / ids.length) * 100}%`, background: color }} />
      </div>
      <div className="mt-1 text-[11px] font-bold text-[var(--mute)]">
        {done}/{ids.length} закрыто
      </div>
    </div>
  );
}

export function ContinueCta({ ids, className = "" }: { ids: string[]; className?: string }) {
  const { lessons, ready } = useProgress();
  const next = ids.find((i) => !lessons[i]?.done) ?? ids[ids.length - 1];
  const started = ready && Object.values(lessons).some((l) => l.done || l.locked);
  return (
    <Link href={`/lesson/${next}`} className={`neo-btn btn-primary px-7 py-4 text-base ${className}`}>
      {started ? `Продолжить с ${next} →` : `Начать уровень ${ids[0]} →`}
    </Link>
  );
}

export function StatusDot({ id }: { id: string }) {
  const { lessons, ready } = useProgress();
  const s = ready ? lessons[id] : undefined;
  if (s?.done) return <span className="stamp" style={{ color: "var(--up)", borderColor: "var(--up)" }}>закрыт</span>;
  if (s?.locked || s?.revealed) return <span className="stamp" style={{ color: "var(--amber)", borderColor: "var(--amber)" }}>в работе</span>;
  return null;
}

export function LessonTile({ id, title, icon, color, exam }: { id: string; title: string; icon: React.ReactNode; color: string; exam: boolean }) {
  const { lessons, ready } = useProgress();
  const done = ready && lessons[id]?.done;
  return (
    <Link href={`/lesson/${id}`} className="neo-s group flex items-center gap-3 p-3 transition hover:-translate-y-0.5">
      <div className="neo-in flex h-12 w-12 shrink-0 items-center justify-center" style={{ borderRadius: 16 }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black" style={{ color }}>{id}</span>
          {exam && <span className="rounded-full bg-[var(--down)] px-2 text-[9px] font-black uppercase text-white">экзамен</span>}
        </div>
        <div className="line-clamp-2 text-[13px] font-bold leading-tight">{title}</div>
      </div>
      <span className={`h-3 w-3 shrink-0 rounded-full ${done ? "bg-[var(--up)]" : "bg-[#d3daea]"}`} />
    </Link>
  );
}
