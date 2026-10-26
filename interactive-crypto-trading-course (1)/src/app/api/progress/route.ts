import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";

export const dynamic = "force-dynamic";

const okId = (s: unknown): s is string => typeof s === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(s);

export async function GET(req: Request) {
  const learner = new URL(req.url).searchParams.get("learner");
  if (!okId(learner)) return Response.json({ error: "bad learner" }, { status: 400 });
  const rows = await db.select().from(lessonProgress).where(eq(lessonProgress.learnerId, learner));
  return Response.json({
    lessons: Object.fromEntries(
      rows.map((r) => [r.lessonId, { ...(r.data as object), done: r.done, examScore: r.examScore ?? undefined, examTotal: r.examTotal ?? undefined }]),
    ),
  });
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => null)) as { learnerId?: string; lessonId?: string; data?: Record<string, unknown> } | null;
  if (!body || !okId(body.learnerId) || typeof body.lessonId !== "string" || !/^[A-J]\d{1,2}$/.test(body.lessonId)) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const { done, examScore, examTotal, ...rest } = (body.data ?? {}) as Record<string, unknown>;
  const values = {
    learnerId: body.learnerId,
    lessonId: body.lessonId,
    data: rest,
    done: Boolean(done),
    examScore: typeof examScore === "number" ? examScore : null,
    examTotal: typeof examTotal === "number" ? examTotal : null,
    updatedAt: new Date(),
  };
  await db
    .insert(lessonProgress)
    .values(values)
    .onConflictDoUpdate({
      target: [lessonProgress.learnerId, lessonProgress.lessonId],
      set: { data: values.data, done: values.done, examScore: values.examScore, examTotal: values.examTotal, updatedAt: values.updatedAt },
    });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const learner = new URL(req.url).searchParams.get("learner");
  if (!okId(learner)) return Response.json({ error: "bad learner" }, { status: 400 });
  await db.delete(lessonProgress).where(and(eq(lessonProgress.learnerId, learner)));
  return Response.json({ ok: true });
}
