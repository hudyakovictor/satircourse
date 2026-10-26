import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { simRuns } from "@/db/schema";
import { ensureSession, readSessionId } from "@/lib/server";

export async function GET(request: Request) {
  const id = readSessionId(request);
  const leaderboard = await db
    .select()
    .from(simRuns)
    .orderBy(desc(simRuns.pnl))
    .limit(12);
  const mine = id
    ? await db
        .select()
        .from(simRuns)
        .where(eq(simRuns.sessionId, id))
        .orderBy(desc(simRuns.createdAt))
        .limit(5)
    : [];
  return NextResponse.json({ leaderboard, mine });
}

export async function POST(request: Request) {
  const id = readSessionId(request);
  if (!id) return NextResponse.json({ error: "no session" }, { status: 400 });
  const body = (await request.json()) as {
    pnl?: number;
    correct?: number;
    rounds?: number;
    verdict?: string;
    alias?: string;
  };
  const session = await ensureSession(id);
  const pnl = Math.round(Number(body.pnl ?? 0));
  const rows = await db
    .insert(simRuns)
    .values({
      sessionId: id,
      alias: (body.alias ?? "").trim().slice(0, 24) || session.alias,
      pnl,
      correct: Math.max(0, Math.round(Number(body.correct ?? 0))),
      rounds: Math.max(1, Math.round(Number(body.rounds ?? 1))),
      verdict: (body.verdict ?? "РЫНОК ПРИНЯЛ ТВОЁ РЕШЕНИЕ").slice(0, 160),
    })
    .returning();
  return NextResponse.json({ run: rows[0] });
}
