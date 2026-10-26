"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type LessonState = {
  action?: "long" | "short" | "no-trade";
  ctx?: string;
  trigger?: string;
  invalid?: string;
  risk?: string;
  option?: string;
  locked?: boolean;
  answers?: string[];
  revealed?: boolean;
  marks?: boolean[];
  done?: boolean;
  examScore?: number;
  examTotal?: number;
};

type Grade = 70 | 85 | 99;

type Ctx = {
  ready: boolean;
  learnerId: string;
  lessons: Record<string, LessonState>;
  update: (lessonId: string, patch: Partial<LessonState>) => void;
  grade: Grade;
  gradeIdx: 0 | 1 | 2;
  setGrade: (g: Grade) => void;
  doneCount: number;
  reset: () => Promise<void>;
};

const PCtx = createContext<Ctx | null>(null);
const LS_ID = "signal-arena:learner";
const LS_DATA = "signal-arena:data";
const LS_GRADE = "signal-arena:grade";

function uid() {
  const a = new Uint8Array(12);
  crypto.getRandomValues(a);
  return "L" + Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [learnerId, setLearnerId] = useState("");
  const [lessons, setLessons] = useState<Record<string, LessonState>>({});
  const [grade, setGradeState] = useState<Grade>(99);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const idRef = useRef("");

  useEffect(() => {
    let id = localStorage.getItem(LS_ID);
    if (!id) {
      id = uid();
      localStorage.setItem(LS_ID, id);
    }
    idRef.current = id;
    let local: Record<string, LessonState> = {};
    try {
      local = JSON.parse(localStorage.getItem(LS_DATA) || "{}");
    } catch {
      local = {};
    }
    const g = Number(localStorage.getItem(LS_GRADE));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLearnerId(id);
    setLessons(local);
    if (g === 70 || g === 85 || g === 99) setGradeState(g);
    setReady(true);
    fetch(`/api/progress?learner=${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { lessons?: Record<string, LessonState> } | null) => {
        if (!j?.lessons) return;
        setLessons((cur) => {
          const merged = { ...j.lessons, ...cur };
          for (const key of Object.keys(j.lessons!)) merged[key] = { ...j.lessons![key], ...cur[key] };
          localStorage.setItem(LS_DATA, JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => {});
  }, []);

  const update = useCallback((lessonId: string, patch: Partial<LessonState>) => {
    setLessons((cur) => {
      const next = { ...cur, [lessonId]: { ...cur[lessonId], ...patch } };
      localStorage.setItem(LS_DATA, JSON.stringify(next));
      clearTimeout(timers.current[lessonId]);
      timers.current[lessonId] = setTimeout(() => {
        fetch("/api/progress", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ learnerId: idRef.current, lessonId, data: next[lessonId] }),
        }).catch(() => {});
      }, 500);
      return next;
    });
  }, []);

  const setGrade = useCallback((g: Grade) => {
    setGradeState(g);
    localStorage.setItem(LS_GRADE, String(g));
  }, []);

  const reset = useCallback(async () => {
    localStorage.removeItem(LS_DATA);
    setLessons({});
    await fetch(`/api/progress?learner=${idRef.current}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      learnerId,
      lessons,
      update,
      grade,
      gradeIdx: grade === 70 ? 0 : grade === 85 ? 1 : 2,
      setGrade,
      doneCount: Object.values(lessons).filter((l) => l.done).length,
      reset,
    }),
    [ready, learnerId, lessons, update, grade, setGrade, reset],
  );
  return <PCtx.Provider value={value}>{children}</PCtx.Provider>;
}

export function useProgress() {
  const c = useContext(PCtx);
  if (!c) throw new Error("useProgress outside provider");
  return c;
}
