"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { chapters, totalLessons } from "@/content/course";

type State = {
  alias: string;
  progress: { lessonSlug: string; quizScore: number; quizTotal: number }[];
};

export function CourseProgress() {
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    api<State>("/api/state")
      .then(setState)
      .catch(() => setState({ alias: "НЕИЗВЕСТНЫЙ УЧАСТНИК", progress: [] }));
  }, []);

  const done = state?.progress.length ?? 0;
  const pct = Math.round((done / totalLessons) * 100);

  return (
    <div className="panel">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="kicker">ЛИЧНОЕ ДЕЛО</div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            {state ? state.alias : "ЗАГРУЗКА ДЕЛА…"}
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 52, lineHeight: 1 }}>
            {pct}%
          </div>
          <div className="kicker">
            ПРОЙДЕНО {done} ИЗ {totalLessons}
          </div>
        </div>
      </div>
      <div className="bar mt-5">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {chapters.map((c) => {
          const passed = c.lessons.filter((l) =>
            state?.progress.some((p) => p.lessonSlug === l.slug)
          ).length;
          return (
            <div key={c.slug} className="border border-[var(--line)] p-3">
              <div className="flex items-center justify-between">
                <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                  ГЛАВА {String(c.number).padStart(2, "0")}
                </span>
                <span className="mono" style={{ fontSize: 10 }}>
                  {passed}/{c.lessons.length}
                </span>
              </div>
              <div className="bar mt-2" style={{ height: 8 }}>
                <span
                  style={{ width: `${(passed / c.lessons.length) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {done === 0 && (
        <div className="truth mt-6">
          ДЕЛО ПУСТОЕ. ЭТО ЕДИНСТВЕННЫЙ МОМЕНТ, КОГДА РЫНОК ЕЩЁ НИЧЕГО О ТЕБЕ НЕ ЗНАЕТ.
        </div>
      )}
    </div>
  );
}
