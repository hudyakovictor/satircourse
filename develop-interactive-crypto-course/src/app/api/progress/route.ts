import { NextResponse } from "next/server";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const playerId = new URL(req.url).searchParams.get("playerId");
  if (!playerId || playerId.length > 80) return NextResponse.json({ items: [] });
  try {
    const items = await db.select().from(progress).where(eq(progress.playerId, playerId));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [], error: "db" }, { status: 200 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const playerId = String(body.playerId ?? "");
  const lessonId = Number(body.lessonId);
  if (!playerId || playerId.length > 80 || !Number.isInteger(lessonId) || lessonId < 0 || lessonId > 99) {
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  }
  const values = {
    playerId,
    lessonId,
    decision: body.decision ?? null,
    examScore: typeof body.examScore === "number" ? body.examScore : null,
    examMax: typeof body.examMax === "number" ? body.examMax : null,
    completed: Boolean(body.completed),
    updatedAt: new Date(),
  };
  const set: Partial<typeof values> = { updatedAt: values.updatedAt };
  if (body.decision !== undefined) set.decision = values.decision;
  if (body.examScore !== undefined) {
    set.examScore = values.examScore;
    set.examMax = values.examMax;
  }
  if (body.completed !== undefined) set.completed = values.completed;
  try {
    await db
      .insert(progress)
      .values(values)
      .onConflictDoUpdate({ target: [progress.playerId, progress.lessonId], set });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
