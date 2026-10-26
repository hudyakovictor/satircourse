import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildState, validPid } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const pid = new URL(req.url).searchParams.get("pid");
  if (!validPid(pid)) return Response.json({ error: "bad pid" }, { status: 400 });
  return Response.json(await buildState(pid));
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!validPid(body.pid)) return Response.json({ error: "bad pid" }, { status: 400 });
  const name = String(body.name ?? "").trim().slice(0, 32);
  if (name) await db.update(players).set({ name }).where(eq(players.id, body.pid));
  return Response.json(await buildState(body.pid));
}
