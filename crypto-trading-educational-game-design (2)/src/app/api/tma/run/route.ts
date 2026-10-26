import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { runs } from "@/db/schema";
import { identify } from "@/lib/tma-auth";
import { MECH_BY_ID } from "@/game/registry";

export const dynamic = "force-dynamic";

async function who(req: Request) {
  const id = identify(req);
  if (!id) return null;
  if (id.verified) return id;
  const jar = await cookies();
  let anon = jar.get("sa_anon")?.value;
  if (!anon) { anon = randomUUID(); jar.set("sa_anon", anon, { httpOnly: true, sameSite: "none", secure: true, path: "/", maxAge: 31536000 }); }
  return { key: `anon:${anon}`, verified: false };
}

export async function POST(req: Request) {
  const u = await who(req);
  if (!u) return Response.json({ error: "invalid initData" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { mechanic?: string; score?: number; stars?: number };
  if (!b.mechanic || !MECH_BY_ID[b.mechanic]) return Response.json({ error: "unknown mechanic" }, { status: 400 });
  const score = Math.max(0, Math.min(100, Math.round(Number(b.score) || 0)));
  await db.insert(runs).values({ userKey: u.key, mechanic: b.mechanic, score, verified: u.verified });
  return Response.json({ ok: true });
}

export async function GET(req: Request) {
  const u = await who(req);
  if (!u) return Response.json({ error: "invalid initData" }, { status: 401 });
  const rows = await db.select({ mechanic: runs.mechanic, best: sql<number>`max(${runs.score})`, plays: sql<number>`count(*)` })
    .from(runs).where(and(eq(runs.userKey, u.key))).groupBy(runs.mechanic);
  return Response.json({ best: rows });
}
