"use client";

import Link from "next/link";
import { useProgress } from "./ProgressProvider";
import { ModuleIcon } from "./art/Illustration";

export type ModInfo = { id: string; title: string; outcome: string; from: number; to: number; color: string; examCode: string; firstCode: string };
export type LessonInfo = { code: string; title: string; moduleId: string };

function useModuleStates(mods: ModInfo[]) {
  const { get, unlockAll } = useProgress();
  const states = mods.map((m, i) => {
    const done = mods.length && get(m.examCode).completed;
    const unlocked = unlockAll || i === 0 || get(mods[i - 1].examCode).completed;
    const count = Array.from({ length: m.to - m.from + 1 }, (_, k) => get(`${m.id}${m.from + k}`).completed).filter(Boolean).length;
    return { done: !!done, unlocked, count };
  });
  const current = states.findIndex((s) => s.unlocked && !s.done);
  return { states, current };
}

export function ModuleGrid({ mods }: { mods: ModInfo[] }) {
  const { states, current } = useModuleStates(mods);
  return (
    <div className="grid gap-x-6 gap-y-7 md:grid-cols-2">
      {mods.map((m, i) => {
        const s = states[i];
        const isCurrent = i === current;
        const cls = !s.unlocked ? "card3d card3d-lock" : isCurrent ? "card3d card3d-gold" : "card3d";
        const body = (
          <div className={`${cls} relative flex items-center gap-4 p-4 transition hover:-translate-y-0.5`}>
            <div className="flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-2xl border-2 border-[#2b3a7a]/60" style={{ background: s.unlocked ? `linear-gradient(145deg, #c9d3ea, ${m.color}55)` : "#8a91a8" }}>
              <div style={{ opacity: s.unlocked ? 1 : 0.55 }}>
                <ModuleIcon id={m.id} size={84} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-black tracking-[0.18em] opacity-70">МОДУЛЬ {m.id} · УРОВНИ {m.from}–{m.to}</div>
              <div className="mt-0.5 text-[17px] font-black leading-snug">{m.title}</div>
              <div className="mt-1 text-[13px] font-semibold opacity-75">{m.outcome}</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#b9c4e0]">
                  <div className="h-full rounded-full" style={{ width: `${(s.count / (m.to - m.from + 1)) * 100}%`, background: s.done ? "#22c55e" : m.color }} />
                </div>
                <span className="text-xs font-extrabold">{s.count}/{m.to - m.from + 1}</span>
              </div>
            </div>
            {s.done && (
              <div className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#22c55e] text-xl font-black text-white shadow-lg ring-4 ring-[#0b1333]">✓</div>
            )}
            {!s.unlocked && <div className="absolute right-3 top-3 text-xl">🔒</div>}
            {isCurrent && <div className="absolute -top-3 left-5 rounded-full bg-[#e9b949] px-3 py-0.5 text-[11px] font-black tracking-widest text-[#2b1e00]">ТЕКУЩИЙ</div>}
          </div>
        );
        return s.unlocked ? (
          <Link key={m.id} href={`/module/${m.id}`} className="block">
            {body}
          </Link>
        ) : (
          <div key={m.id} title={`Пройдите экзамен модуля ${mods[i - 1].id} (${mods[i - 1].examCode}) или включите «Все главы»`}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

export function HeroCard({ lessons, mods }: { lessons: LessonInfo[]; mods: ModInfo[] }) {
  const { get, unlockAll, completedCount, ready } = useProgress();
  const { states } = useModuleStates(mods);
  const next = lessons.find((l) => {
    const mi = mods.findIndex((m) => m.id === l.moduleId);
    return states[mi]?.unlocked && !get(l.code).completed;
  });
  const pct = completedCount;
  return (
    <div className="card3d relative overflow-hidden p-5 md:p-6">
      <div className="flex items-center gap-4">
        <div className="relative h-44 w-28 shrink-0 md:h-56 md:w-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pct >= 10 ? "/art/mascot-happy.png" : "/art/mascot-teacher.png"} alt="Старая скрепка — наставник курса" className="mascot-blend floaty absolute inset-0 h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <div className="inline-block rounded-full bg-[#141d45] px-3 py-1 text-[11px] font-black tracking-widest text-[#e9b949]">
            {ready && completedCount > 0 ? "С ВОЗВРАЩЕНИЕМ" : "СТАРАЯ СКРЕПКА ГОВОРИТ"}
          </div>
          <p className="mt-2 text-lg font-black leading-snug md:text-xl">
            {ready && completedCount > 0 ? `Пройдено ${completedCount} из 100. Не гонись за плюсом — закрывай уровни по правилам.` : "Нет стопа — нет сделки. Начнём с того, как рождается цена."}
          </p>
          {next && (
            <p className="mt-2 text-sm font-semibold opacity-75">
              Следующий: <b>{next.code}</b> · {next.title}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={next ? `/lesson/${next.code}` : "/module/A"} className="btn3d">
              {completedCount > 0 ? "Продолжить" : "Начать курс"} →
            </Link>
            <Link href="/docs/guide" className="btn3d btn3d-ghost">Методика</Link>
          </div>
          {!unlockAll && <p className="mt-3 text-xs font-semibold opacity-60">Следующая глава открывается после экзамена (≥80%).</p>}
        </div>
      </div>
    </div>
  );
}
