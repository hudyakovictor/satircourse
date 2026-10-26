"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Decision = { action: string; context: string; trigger: string; invalidation: string; risk: string; at: number };
export type LessonProgress = { decision?: Decision | null; examScore?: number | null; examMax?: number | null; completed?: boolean };

type Ctx = {
  playerId: string;
  ready: boolean;
  progress: Record<number, LessonProgress>;
  save: (lessonId: number, patch: LessonProgress) => void;
  doneCount: number;
  reset: () => void;
};

const C = createContext<Ctx | null>(null);
const KEY_ID = "signal-arena-player";
const KEY_P = "signal-arena-progress";

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [playerId, setPlayerId] = useState("");
  const [progress, setProgress] = useState<Record<number, LessonProgress>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem(KEY_ID);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
      localStorage.setItem(KEY_ID, id);
    }
    let local: Record<number, LessonProgress> = {};
    try {
      local = JSON.parse(localStorage.getItem(KEY_P) || "{}");
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlayerId(id);
    setProgress(local);
    fetch(`/api/progress?playerId=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        const merged = { ...local };
        for (const it of d.items ?? []) {
          merged[it.lessonId] = { decision: it.decision, examScore: it.examScore, examMax: it.examMax, completed: it.completed };
        }
        setProgress(merged);
        localStorage.setItem(KEY_P, JSON.stringify(merged));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const save = useCallback(
    (lessonId: number, patch: LessonProgress) => {
      setProgress((prev) => {
        const next = { ...prev, [lessonId]: { ...prev[lessonId], ...patch } };
        localStorage.setItem(KEY_P, JSON.stringify(next));
        return next;
      });
      if (playerId) {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, lessonId, ...patch }),
        }).catch(() => {});
      }
    },
    [playerId],
  );

  const reset = useCallback(() => {
    localStorage.removeItem(KEY_P);
    setProgress({});
  }, []);

  const doneCount = useMemo(() => Object.values(progress).filter((p) => p?.completed).length, [progress]);

  return <C.Provider value={{ playerId, ready, progress, save, doneCount, reset }}>{children}</C.Provider>;
}

export function useProgress() {
  const v = useContext(C);
  if (!v) throw new Error("ProgressProvider missing");
  return v;
}
