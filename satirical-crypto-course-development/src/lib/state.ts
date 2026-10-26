import { db } from "@/db";
import { lessonState, players, trades } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { LESSONS, XP } from "@/lib/course";

export const validPid = (p: unknown): p is string => typeof p === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(p);

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export async function buildState(pid: string) {
  await db.insert(players).values({ id: pid }).onConflictDoNothing();
  const [player] = await db.select().from(players).where(eq(players.id, pid));
  const ls = await db.select().from(lessonState).where(eq(lessonState.playerId, pid));
  const tr = await db.select().from(trades).where(eq(trades.playerId, pid)).orderBy(desc(trades.createdAt));
  const lessons: Record<string, unknown> = {};
  let xp = 0;
  const days = new Set<string>();
  for (const l of ls) {
    lessons[l.lessonId] = l;
    const isExam = LESSONS.find((x) => x.id === l.lessonId)?.isExam;
    if (l.decisionLockedAt) { xp += XP.decision; days.add(dayKey(l.decisionLockedAt)); }
    if (l.completedAt) { xp += isExam ? XP.exam : XP.lesson; days.add(dayKey(l.completedAt)); }
  }
  xp += Math.min(tr.length, 100) * 5;
  // серия дней подряд (по последнему активному дню)
  let streak = 0;
  const cur = new Date();
  if (!days.has(dayKey(cur))) cur.setUTCDate(cur.getUTCDate() - 1);
  while (days.has(dayKey(cur))) { streak++; cur.setUTCDate(cur.getUTCDate() - 1); }
  return { player, lessons, trades: tr, xp, streak };
}

