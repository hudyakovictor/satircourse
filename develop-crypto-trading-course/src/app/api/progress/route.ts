import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";

export const dynamic = "force-dynamic";

const ID_RE = /^[a-zA-Z0-9-]{8,64}$/;

export async function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId") ?? "";
  if (!ID_RE.test(clientId)) return NextResponse.json({ error: "bad client id" }, { status: 400 });
  const rows = await db.select().from(lessonProgress).where(eq(lessonProgress.clientId, clientId));
  return NextResponse.json({
    progress: rows.map((r) => ({
      code: r.code,
      cardsSeen: r.cardsSeen,
      decision: r.decision,
      quizScore: r.quizScore,
      quizTotal: r.quizTotal,
      completed: r.completed,
    })),
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    clientId?: string;
    code?: string;
    cardsSeen?: string[];
    decision?: Record<string, string>;
    quizScore?: number | null;
    quizTotal?: number | null;
    completed?: boolean;
  } | null;
  if (!body || !ID_RE.test(body.clientId ?? "") || !/^[A-J]\d{1,2}$/.test(body.code ?? "")) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const clientId = body.clientId as string;
  const code = body.code as string;
  const values = {
    cardsSeen: (body.cardsSeen ?? []).filter((x) => typeof x === "string").slice(0, 5),
    decision: Object.fromEntries(Object.entries(body.decision ?? {}).map(([k, v]) => [k.slice(0, 30), String(v).slice(0, 1500)])),
    quizScore: body.quizScore ?? null,
    quizTotal: body.quizTotal ?? null,
    completed: !!body.completed,
    completedAt: body.completed ? new Date() : null,
    updatedAt: new Date(),
  };
  const existing = await db
    .select({ id: lessonProgress.id, completed: lessonProgress.completed })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.clientId, clientId), eq(lessonProgress.code, code)));
  if (existing.length) {
    await db
      .update(lessonProgress)
      .set({ ...values, completed: values.completed || existing[0].completed })
      .where(eq(lessonProgress.id, existing[0].id));
  } else {
    await db.insert(lessonProgress).values({ clientId, code, ...values });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId") ?? "";
  if (!ID_RE.test(clientId)) return NextResponse.json({ error: "bad client id" }, { status: 400 });
  await db.delete(lessonProgress).where(eq(lessonProgress.clientId, clientId));
  return NextResponse.json({ ok: true });
}
