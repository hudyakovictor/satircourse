import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { journalEntries } from "@/db/schema";

export const dynamic = "force-dynamic";

const okId = (s: unknown): s is string => typeof s === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(s);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export async function GET(req: Request) {
  const learner = new URL(req.url).searchParams.get("learner");
  if (!okId(learner)) return Response.json({ error: "bad learner" }, { status: 400 });
  const rows = await db.select().from(journalEntries).where(eq(journalEntries.learnerId, learner)).orderBy(desc(journalEntries.createdAt)).limit(200);
  return Response.json({ entries: rows });
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || !okId(b.learnerId)) return Response.json({ error: "bad request" }, { status: 400 });
  const entry = num(b.entry), stop = num(b.stop), exit = num(b.exit), riskUsd = num(b.riskUsd);
  let r = num(b.rMultiple) ?? 0;
  const side = b.side === "short" ? "short" : "long";
  if (entry !== null && stop !== null && exit !== null && entry !== stop) {
    const risk = Math.abs(entry - stop);
    const move = side === "long" ? exit - entry : entry - exit;
    r = Math.round((move / risk) * 100) / 100;
  }
  const [row] = await db
    .insert(journalEntries)
    .values({
      learnerId: b.learnerId,
      pair: typeof b.pair === "string" && b.pair ? b.pair.slice(0, 20) : "BTC/USDT",
      side,
      entry,
      stop,
      exit,
      riskUsd,
      rMultiple: r,
      note: typeof b.note === "string" ? b.note.slice(0, 280) : "",
    })
    .returning();
  return Response.json({ entry: row });
}

export async function DELETE(req: Request) {
  const u = new URL(req.url).searchParams;
  const learner = u.get("learner");
  const id = Number(u.get("id"));
  if (!okId(learner) || !Number.isInteger(id)) return Response.json({ error: "bad request" }, { status: 400 });
  await db.delete(journalEntries).where(and(eq(journalEntries.learnerId, learner), eq(journalEntries.id, id)));
  return Response.json({ ok: true });
}
