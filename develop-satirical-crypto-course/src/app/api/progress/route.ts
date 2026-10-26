import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { ensureSession, readSessionId } from "@/lib/server";

export async function GET(request: Request) {
  const id = readSessionId(request);
  if (!id) return NextResponse.json({ progress: [] });
  const rows = await db
    .select()
    .from(progress)
    .where(eq(progress.sessionId, id))
    .orderBy(desc(progress.completedAt));
  return NextResponse.json({ progress: rows });
}

export async function POST(request: Request) {
  const id = readSessionId(request);
  if (!id) return NextResponse.json({ error: "no session" }, { status: 400 });
  const body = (await request.json()) as {
    chapterSlug?: string;
    lessonSlug?: string;
    quizScore?: number;
    quizTotal?: number;
  };
  if (!body.chapterSlug || !body.lessonSlug) {
    return NextResponse.json({ error: "нет данных" }, { status: 400 });
  }
  await ensureSession(id);
  const quizScore = Math.max(0, Math.min(99, Number(body.quizScore ?? 0)));
  const quizTotal = Math.max(1, Math.min(99, Number(body.quizTotal ?? 1)));
  const rows = await db
    .insert(progress)
    .values({
      sessionId: id,
      chapterSlug: body.chapterSlug,
      lessonSlug: body.lessonSlug,
      quizScore,
      quizTotal,
    })
    .onConflictDoUpdate({
      target: [progress.sessionId, progress.lessonSlug],
      set: {
        quizScore,
        quizTotal,
        chapterSlug: body.chapterSlug,
        completedAt: new Date(),
      },
    })
    .returning();
  return NextResponse.json({ progress: rows[0] });
}
