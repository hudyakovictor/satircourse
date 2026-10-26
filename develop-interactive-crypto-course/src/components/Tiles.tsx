import Link from "next/link";
import { DoneBadge } from "./Bits";
import { lessons, SAT } from "@/lib/course";

export function LessonTile({ id, big = false }: { id: number; big?: boolean }) {
  const l = lessons[id];
  const s = SAT[id];
  return (
    <Link href={`/lesson/${id}`} className="group relative block overflow-hidden border-2 border-black bg-[#0d0e15] shadow-[5px_5px_0_#000] transition hover:-translate-y-1 hover:shadow-[5px_9px_0_#000]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/art/lesson/${id}.svg`} alt={s.s} width={500} height={500} loading="lazy" className="aspect-square w-full object-cover" />
      <DoneBadge id={id} />
      <div className="p-3">
        <div className="flex items-center gap-2">
          <span className="border border-black bg-paper px-1.5 font-display text-sm text-black">{l.code}</span>
          {l.isExam && <span className="stamp text-[10px] text-blood">Экзамен</span>}
        </div>
        <div className="mt-1 font-display text-base uppercase leading-tight text-paper group-hover:text-toxic">{l.title}</div>
        {big && <p className="mt-1 text-sm leading-snug text-zinc-400">{s.h}</p>}
      </div>
    </Link>
  );
}
