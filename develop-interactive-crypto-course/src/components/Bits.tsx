"use client";

import Link from "next/link";
import { useProgress } from "./ProgressProvider";

export function HeaderProgress() {
  const { doneCount } = useProgress();
  return (
    <Link href="/course" className="ml-auto flex items-center gap-2 rounded border-2 border-black bg-paper px-2 py-1 font-display text-sm uppercase text-black shadow-[3px_3px_0_#000] md:ml-2" title="Пройдено уровней">
      <span className="text-toxic drop-shadow-[0_0_1px_#000]" style={{ WebkitTextStroke: "0.6px #000" }}>
        {doneCount}
      </span>
      <span>/ 100</span>
    </Link>
  );
}

export function DoneBadge({ id }: { id: number }) {
  const { progress } = useProgress();
  const p = progress[id];
  if (p?.completed)
    return <span className="stamp absolute right-2 top-2 bg-black/70 text-xs text-toxic">Зачёт</span>;
  if (p?.decision) return <span className="stamp absolute right-2 top-2 bg-black/70 text-xs text-amber-300">Решил</span>;
  return null;
}

export function ModuleProgress({ ids }: { ids: number[] }) {
  const { progress } = useProgress();
  const done = ids.filter((i) => progress[i]?.completed).length;
  return (
    <div className="mt-2">
      <div className="h-2 w-full overflow-hidden border border-black bg-black/60">
        <div className="h-full bg-toxic transition-all" style={{ width: `${(done / ids.length) * 100}%` }} />
      </div>
      <div className="mt-1 font-mono text-[11px] text-zinc-400">
        {done}/{ids.length} пройдено
      </div>
    </div>
  );
}

export function NextUp({ total }: { total: number }) {
  const { progress } = useProgress();
  let next = 0;
  for (let i = 0; i < total; i++) {
    if (!progress[i]?.completed) {
      next = i;
      break;
    }
    next = Math.min(total - 1, i + 1);
  }
  return (
    <Link href={`/lesson/${next}`} className="inline-block border-2 border-black bg-toxic px-6 py-3 font-display text-lg uppercase text-black shadow-[5px_5px_0_#000] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#000]">
      {next === 0 && !progress[0] ? "Войти в рынок → уровень A0" : `Продолжить → уровень ${next}`}
    </Link>
  );
}
