import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { journal, progress, simRuns } from "@/db/schema";
import { ensureSession, readSessionId } from "@/lib/server";

export async function GET(request: Request) {
  const id = readSessionId(request);
  if (!id) {
    return NextResponse.json({
      alias: "НЕИЗВЕСТНЫЙ УЧАСТНИК",
      progress: [],
      journal: [],
      leaderboard: [],
      mine: [],
    });
  }
  const session = await ensureSession(id);
  const [progressRows, journalRows, leaderboard, mine] = await Promise.all([
    db.select().from(progress).where(eq(progress.sessionId, id)),
    db
      .select()
      .from(journal)
      .where(eq(journal.sessionId, id))
      .orderBy(desc(journal.createdAt))
      .limit(20),
    db.select().from(simRuns).orderBy(desc(simRuns.pnl)).limit(12),
    db
      .select()
      .from(simRuns)
      .where(eq(simRuns.sessionId, id))
      .orderBy(desc(simRuns.createdAt))
      .limit(5),
  ]);
  return NextResponse.json({
    alias: session.alias,
    progress: progressRows,
    journal: journalRows,
    leaderboard,
    mine,
  });
}
