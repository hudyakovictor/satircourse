import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalTrades } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const playerId = new URL(req.url).searchParams.get("playerId");
  if (!playerId || playerId.length > 80) return NextResponse.json({ items: [] });
  try {
    const items = await db.select().from(journalTrades).where(eq(journalTrades.playerId, playerId)).orderBy(desc(journalTrades.id)).limit(300);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const playerId = String(b.playerId ?? "");
  const side = b.side === "short" ? "short" : "long";
  const entry = Number(b.entry),
    stop = Number(b.stop),
    exit = Number(b.exit);
  if (!playerId || playerId.length > 80 || ![entry, stop, exit].every((n) => Number.isFinite(n) && n > 0)) {
    return NextResponse.json({ error: "НЕДОСТАТОЧНО ДАННЫХ. Паника бесплатна. Вход — нет." }, { status: 400 });
  }
  const risk = side === "long" ? entry - stop : stop - entry;
  if (risk <= 0) return NextResponse.json({ error: "Стоп стоит не с той стороны. Рынок оценил оригинальность." }, { status: 400 });
  const r = side === "long" ? (exit - entry) / risk : (entry - exit) / risk;
  try {
    const [row] = await db
      .insert(journalTrades)
      .values({
        playerId,
        pair: String(b.pair ?? "BTC/USDT").slice(0, 24),
        side,
        setup: String(b.setup ?? "").slice(0, 80),
        entry,
        stop,
        exit,
        rResult: Math.round(r * 100) / 100,
        emotion: String(b.emotion ?? "").slice(0, 60),
        note: String(b.note ?? "").slice(0, 400),
      })
      .returning();
    return NextResponse.json({ item: row });
  } catch {
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const u = new URL(req.url);
  const playerId = u.searchParams.get("playerId") ?? "";
  const id = Number(u.searchParams.get("id"));
  if (!playerId || !Number.isInteger(id)) return NextResponse.json({ error: "bad" }, { status: 400 });
  try {
    await db.delete(journalTrades).where(and(eq(journalTrades.id, id), eq(journalTrades.playerId, playerId)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
