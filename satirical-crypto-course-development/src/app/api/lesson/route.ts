import { db } from "@/db";
import { lessonState, players } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getLesson } from "@/lib/course";
import { buildState, validPid } from "@/lib/state";

export const dynamic = "force-dynamic";

const DAYS = [1, 3, 7, 16, 35];

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!validPid(b.pid)) return Response.json({ error: "bad pid" }, { status: 400 });
  const lesson = getLesson(String(b.lessonId));
  if (!lesson) return Response.json({ error: "no lesson" }, { status: 404 });
  const pid: string = b.pid;
  await db.insert(players).values({ id: pid }).onConflictDoNothing();
  await db.insert(lessonState).values({ playerId: pid, lessonId: lesson.id }).onConflictDoNothing();
  const where = and(eq(lessonState.playerId, pid), eq(lessonState.lessonId, lesson.id));
  const [cur] = await db.select().from(lessonState).where(where);
  const now = new Date();

  if (b.action === "decision") {
    const dec = b.decision as Record<string, string>;
    const keys = ["context", "action", "trigger", "invalidation", "risk"];
    const clean: Record<string, string> = {};
    for (const k of keys) clean[k] = String(dec?.[k] ?? "").trim().slice(0, 400);
    if (!clean.invalidation || !clean.action) return Response.json({ error: "Решение без инвалидации — не решение." }, { status: 422 });
    const due = new Date(now.getTime() + DAYS[0] * 86400000);
    await db.update(lessonState).set({ decision: clean, decisionLockedAt: cur.decisionLockedAt ?? now, recallStage: 0, recallDue: due, updatedAt: now }).where(where);
  } else if (b.action === "exam") {
    if (!cur.decisionLockedAt) return Response.json({ error: "Сначала зафиксируй решение." }, { status: 422 });
    const total = Math.max(1, Math.min(50, Number(b.total) || 1));
    const score = Math.max(0, Math.min(total, Number(b.score) || 0));
    const passed = score / total >= lesson.passPct / 100 || (!lesson.isExam && total <= 5 && score / total >= 0.8);
    await db.update(lessonState).set({
      examScore: score, examTotal: total, passed: passed || cur.passed,
      completedAt: passed ? cur.completedAt ?? now : cur.completedAt, updatedAt: now,
    }).where(where);
  } else if (b.action === "recall") {
    const ok = !!b.remembered;
    const stage = ok ? Math.min(DAYS.length, cur.recallStage + 1) : 0;
    const due = stage >= DAYS.length ? null : new Date(now.getTime() + DAYS[stage] * 86400000);
    await db.update(lessonState).set({ recallStage: stage, recallDue: due, updatedAt: now }).where(where);
  } else {
    return Response.json({ error: "bad action" }, { status: 400 });
  }
  return Response.json(await buildState(pid));
}
