import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { loadPlayer } from "@/lib/server";
import { metrics } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const p = await loadPlayer();
  const log = await db.select().from(events).where(eq(events.playerId, p.id)).orderBy(desc(events.id)).limit(500);
  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), player: p.id, metrics: metrics(p.state), state: p.state, events: log }, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": "attachment; filename=signal-arena-evidence.json" },
  });
}
