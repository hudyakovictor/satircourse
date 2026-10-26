import { db } from "@/db";
import { players, trades } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { buildState, validPid } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!validPid(b.pid)) return Response.json({ error: "bad pid" }, { status: 400 });
  const pair = String(b.pair ?? "").trim().toUpperCase().slice(0, 20);
  const side = ["long", "short"].includes(b.side) ? b.side : "long";
  const resultR = Number(b.resultR);
  if (!pair || !Number.isFinite(resultR) || Math.abs(resultR) > 50) return Response.json({ error: "НЕТ ПАРЫ ИЛИ R. Журнал без цифр — это дневник жалоб." }, { status: 422 });
  const num = (v: unknown) => (v === "" || v == null || !Number.isFinite(Number(v)) ? null : Number(v));
  await db.insert(players).values({ id: b.pid }).onConflictDoNothing();
  await db.insert(trades).values({
    playerId: b.pid, pair, side, setup: String(b.setup ?? "").slice(0, 80),
    entry: num(b.entry), stop: num(b.stop), riskR: Math.min(1, Math.max(0.1, Number(b.riskR) || 1)),
    resultR, followedProcess: !!b.followedProcess, note: String(b.note ?? "").slice(0, 400),
  });
  return Response.json(await buildState(b.pid));
}

export async function DELETE(req: Request) {
  const u = new URL(req.url);
  const pid = u.searchParams.get("pid");
  const id = Number(u.searchParams.get("id"));
  if (!validPid(pid) || !Number.isFinite(id)) return Response.json({ error: "bad" }, { status: 400 });
  await db.delete(trades).where(and(eq(trades.playerId, pid), eq(trades.id, id)));
  return Response.json(await buildState(pid));
}
