"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LessonRow = {
  lessonId: string;
  decision: Record<string, string> | null;
  decisionLockedAt: string | null;
  examScore: number | null;
  examTotal: number | null;
  passed: boolean;
  completedAt: string | null;
  recallStage: number;
  recallDue: string | null;
};
export type TradeRow = {
  id: number; pair: string; side: string; setup: string; entry: number | null; stop: number | null;
  riskR: number; resultR: number; followedProcess: boolean; note: string; createdAt: string;
};
export type GameState = { player: { id: string; name: string }; lessons: Record<string, LessonRow>; trades: TradeRow[]; xp: number; streak: number };

type Ctx = {
  pid: string | null;
  state: GameState | null;
  loading: boolean;
  error: string | null;
  call: (url: string, method: string, body?: unknown) => Promise<boolean>;
};

const C = createContext<Ctx>({ pid: null, state: null, loading: true, error: null, call: async () => false });
export const usePlayer = () => useContext(C);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [pid, setPid] = useState<string | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("sa_pid");
    if (!id) {
      id = (crypto.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9-]/g, "");
      localStorage.setItem("sa_pid", id);
    }
    setPid(id);
    fetch(`/api/state?pid=${id}`)
      .then((r) => r.json())
      .then((s) => setState(s))
      .catch(() => setError("Система недоступна. Это не баг, это режим."))
      .finally(() => setLoading(false));
  }, []);

  const call = useCallback(async (url: string, method: string, body?: unknown) => {
    if (!pid) return false;
    setError(null);
    try {
      const full = method === "DELETE" ? `${url}&pid=${pid}` : url;
      const r = await fetch(full, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify({ ...(body as object), pid }) : undefined });
      const j = await r.json();
      if (!r.ok) { setError(j.error ?? "Рынок принял решение отказать."); return false; }
      setState(j);
      return true;
    } catch {
      setError("Связь потеряна. Как и ликвидность.");
      return false;
    }
  }, [pid]);

  const v = useMemo(() => ({ pid, state, loading, error, call }), [pid, state, loading, error, call]);
  return <C.Provider value={v}>{children}</C.Provider>;
}
