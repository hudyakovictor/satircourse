import { cookies } from "next/headers";
import { createHash, randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { players, events } from "@/db/schema";
import { newState, type PlayerState } from "./engine";

const COOKIE = "sa_pid";

export async function loadPlayer(): Promise<{ id: string; name: string; state: PlayerState }> {
  const jar = await cookies();
  let id = jar.get(COOKIE)?.value;
  if (id) {
    const rows = await db.select().from(players).where(eq(players.id, id)).limit(1);
    if (rows[0]) return { id, name: rows[0].name, state: { ...newState(), ...(rows[0].state as PlayerState) } };
  }
  id = randomUUID();
  const state = newState();
  await db.insert(players).values({ id, state });
  jar.set(COOKIE, id, { httpOnly: true, sameSite: "none", secure: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
  await logEvent(id, "player_created", {});
  return { id, name: "Кадет", state };
}

export async function savePlayer(id: string, state: PlayerState, name?: string) {
  if (state.decisions.length > 300) state.decisions = state.decisions.slice(-300);
  if (state.calibration.length > 300) state.calibration = state.calibration.slice(-300);
  await db.update(players).set({ state, updatedAt: new Date(), ...(name ? { name } : {}) }).where(eq(players.id, id));
}

export async function logEvent(playerId: string, type: string, payload: Record<string, unknown>) {
  await db.insert(events).values({ playerId, type, payload });
}

export const sha256 = (x: unknown) => createHash("sha256").update(typeof x === "string" ? x : JSON.stringify(x)).digest("hex");

export function hashSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const bad = (msg: string, status = 400) => Response.json({ error: msg }, { status });
