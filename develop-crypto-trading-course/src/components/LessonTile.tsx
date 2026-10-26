"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useProgress } from "./ProgressProvider";

export function LessonTile({ code, title, isExam, color, children }: { code: string; title: string; isExam: boolean; color: string; children: ReactNode }) {
  const { get } = useProgress();
  const p = get(code);
  const started = p.cardsSeen.length > 0;
  return (
    <Link href={`/lesson/${code}`} className="group block">
      <div className={`card3d relative overflow-hidden p-3 transition group-hover:-translate-y-1 ${started && !p.completed ? "card3d-gold" : ""}`}>
        <div className="overflow-hidden rounded-2xl">{children}</div>
        <div className="mt-3 flex items-start gap-3 px-1 pb-1">
          <span className="mt-0.5 rounded-lg px-2 py-1 text-xs font-black text-[#0a1130]" style={{ background: color }}>{code}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-black leading-snug">{title}</div>
            <div className="mt-1 text-xs font-bold opacity-60">
              {p.completed ? "Пройден ✓" : started ? `Карточек открыто: ${p.cardsSeen.length}/5` : isExam ? "Экзамен модуля" : "5 карточек · 2 иллюстрации"}
            </div>
          </div>
        </div>
        {p.completed && <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#22c55e] text-xl font-black text-white ring-4 ring-[#e6ebf5]">✓</div>}
        {isExam && <div className="absolute left-4 top-4 rounded-full bg-[#e9b949] px-3 py-1 text-[11px] font-black tracking-widest text-[#2b1e00]">ЭКЗАМЕН</div>}
      </div>
    </Link>
  );
}
