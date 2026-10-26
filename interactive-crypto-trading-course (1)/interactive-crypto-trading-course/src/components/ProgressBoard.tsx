"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "./ProgressProvider";
import { FEEDBACK } from "@/data/satire";

type M = { id: string; title: string; color: string; lessons: { id: string; title: string }[] };

export function ProgressBoard({ modules }: { modules: M[] }) {
  const { lessons, ready, doneCount, reset, gradeIdx } = useProgress();
  const [msg, setMsg] = useState("");
  const total = modules.reduce((a, m) => a + m.lessons.length, 0);
  const exams = Object.entries(lessons).filter(([, l]) => typeof l.examScore === "number");
  const locked = Object.values(lessons).filter((l) => l.locked).length;
  const pct = Math.round((doneCount / total) * 100);
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Закрыто уровней", `${ready ? doneCount : 0}/${total}`],
          ["Прогресс", `${ready ? pct : 0}%`],
          ["Решений подшито", String(ready ? locked : 0)],
          ["Экзаменов сдано", String(ready ? exams.length : 0)],
        ].map(([a, b]) => (
          <div key={a} className="neo p-5 text-center">
            <div className="headline text-4xl text-[var(--blue)]">{b}</div>
            <div className="kicker mt-1">{a}</div>
          </div>
        ))}
      </div>

      {modules.map((m) => (
        <section key={m.id} className="neo p-5 md:p-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl font-black text-white" style={{ background: m.color }}>{m.id}</span>
            <h2 className="headline text-lg">{m.title}</h2>
          </div>
          <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
            {m.lessons.map((l) => {
              const s = ready ? lessons[l.id] : undefined;
              const state = s?.done ? "done" : s?.locked || s?.revealed ? "work" : "new";
              return (
                <Link
                  key={l.id}
                  href={`/lesson/${l.id}`}
                  title={l.title}
                  className="neo-btn flex aspect-square flex-col items-center justify-center text-xs"
                  style={{ color: state === "done" ? "var(--up)" : state === "work" ? "#d9921a" : undefined, background: state === "done" ? "#dff6ec" : undefined }}
                >
                  <span className="font-black">{l.id}</span>
                  {typeof s?.examScore === "number" && <span className="text-[10px] font-bold">{s.examScore}/{s.examTotal}</span>}
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <div className="neo-in flex flex-wrap items-center gap-4 p-5">
        <button
          className="neo-btn btn-danger px-6 py-3 text-sm"
          onClick={async () => {
            if (confirm("Стереть весь прогресс? Вернуть нельзя. Это тоже будет уроком.")) {
              await reset();
              setMsg(FEEDBACK.resetNote[gradeIdx]);
            }
          }}
        >
          Стереть прогресс
        </button>
        {msg && <span className="pop text-sm font-bold">{msg}</span>}
      </div>
    </div>
  );
}
