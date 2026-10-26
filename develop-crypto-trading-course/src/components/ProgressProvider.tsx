"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type LP = {
  cardsSeen: string[];
  decision: Record<string, string>;
  quizScore: number | null;
  quizTotal: number | null;
  completed: boolean;
};
const EMPTY: LP = { cardsSeen: [], decision: {}, quizScore: null, quizTotal: null, completed: false };

type Ctx = {
  ready: boolean;
  clientId: string;
  progress: Record<string, LP>;
  get: (code: string) => LP;
  update: (code: string, patch: Partial<LP>) => void;
  unlockAll: boolean;
  setUnlockAll: (v: boolean) => void;
  reset: () => void;
  completedCount: number;
};

const PCtx = createContext<Ctx | null>(null);

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("sa-client");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sa-client", id);
  }
  return id;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [clientId, setClientId] = useState("");
  const [progress, setProgress] = useState<Record<string, LP>>({});
  const [unlockAll, setUnlockAllState] = useState(false);
  const ref = useRef<Record<string, LP>>({});

  useEffect(() => {
    const id = getClientId();
    setClientId(id);
    setUnlockAllState(localStorage.getItem("sa-unlock") === "1");
    try {
      const local = JSON.parse(localStorage.getItem("sa-progress") ?? "{}") as Record<string, LP>;
      ref.current = local;
      setProgress(local);
    } catch {
      /* ignore */
    }
    fetch(`/api/progress?clientId=${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { progress: (LP & { code: string })[] } | null) => {
        if (d) {
          const merged: Record<string, LP> = { ...ref.current };
          for (const row of d.progress) {
            const prev = merged[row.code];
            merged[row.code] = {
              cardsSeen: row.cardsSeen,
              decision: row.decision,
              quizScore: row.quizScore,
              quizTotal: row.quizTotal,
              completed: row.completed || !!prev?.completed,
            };
          }
          ref.current = merged;
          setProgress(merged);
          localStorage.setItem("sa-progress", JSON.stringify(merged));
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const update = useCallback(
    (code: string, patch: Partial<LP>) => {
      const next: LP = { ...(ref.current[code] ?? EMPTY), ...patch };
      if (patch.completed === undefined && ref.current[code]?.completed) next.completed = true;
      ref.current = { ...ref.current, [code]: next };
      setProgress(ref.current);
      localStorage.setItem("sa-progress", JSON.stringify(ref.current));
      const id = clientId || getClientId();
      fetch("/api/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientId: id, code, ...next }),
      }).catch(() => undefined);
    },
    [clientId],
  );

  const setUnlockAll = useCallback((v: boolean) => {
    setUnlockAllState(v);
    localStorage.setItem("sa-unlock", v ? "1" : "0");
  }, []);

  const reset = useCallback(() => {
    ref.current = {};
    setProgress({});
    localStorage.removeItem("sa-progress");
    const id = clientId || getClientId();
    fetch(`/api/progress?clientId=${id}`, { method: "DELETE" }).catch(() => undefined);
  }, [clientId]);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      clientId,
      progress,
      get: (code) => progress[code] ?? EMPTY,
      update,
      unlockAll,
      setUnlockAll,
      reset,
      completedCount: Object.values(progress).filter((p) => p.completed).length,
    }),
    [ready, clientId, progress, update, unlockAll, setUnlockAll, reset],
  );
  return <PCtx.Provider value={value}>{children}</PCtx.Provider>;
}

export function useProgress() {
  const c = useContext(PCtx);
  if (!c) throw new Error("ProgressProvider missing");
  return c;
}
