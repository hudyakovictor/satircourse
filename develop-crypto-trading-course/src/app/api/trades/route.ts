import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { trades } from "@/db/schema";

export const dynamic = "force-dynamic";
const ID_RE = /^[a-zA-Z0-9-]{8,64}$/;

export async function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId") ?? "";
  if (!ID_RE.test(clientId)) return NextResponse.json({ error: "bad client id" }, { status: 400 });
  const rows = await db.select().from(trades).where(eq(trades.clientId, clientId)).orderBy(desc(trades.id)).limit(500);
  return NextResponse.json({ trades: rows });
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || !ID_RE.test(String(b.clientId ?? ""))) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const netR = Number(b.netR);
  if (!Number.isFinite(netR) || Math.abs(netR) > 100) return NextResponse.json({ error: "netR invalid" }, { status: 400 });
  const [row] = await db
    .insert(trades)
    .values({
      clientId: String(b.clientId),
      date: String(b.date ?? "").slice(0, 10) || new Date().toISOString().slice(0, 10),
      market: String(b.market ?? "BTC/USDT").slice(0, 24),
      side: ["long", "short", "no-trade"].includes(String(b.side)) ? String(b.side) : "long",
      setup: String(b.setup ?? "").slice(0, 60),
      riskUsd: Number(b.riskUsd) || 0,
      netR,
      processPass: b.processPass !== false,
      emotion: String(b.emotion ?? "").slice(0, 40),
      notes: String(b.notes ?? "").slice(0, 600),
    })
    .returning();
  return NextResponse.json({ trade: row });
}

export async function DELETE(req: Request) {
  const u = new URL(req.url);
  const clientId = u.searchParams.get("clientId") ?? "";
  const id = Number(u.searchParams.get("id"));
  if (!ID_RE.test(clientId) || !Number.isInteger(id)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  await db.delete(trades).where(and(eq(trades.clientId, clientId), eq(trades.id, id)));
  return NextResponse.json({ ok: true });
}
