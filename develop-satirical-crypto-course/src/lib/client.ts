"use client";

const KEY = "dp-session-id";

export function getClientSession(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY) ?? "";
  if (!id) {
    id = `sess-${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const session = getClientSession();
  const res = await fetch(path, {
    ...init,
    headers: {
      "x-session-id": session,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  if (!res.ok) {
    throw new Error(`Запрос отклонён: ${res.status}`);
  }
  return (await res.json()) as T;
}
