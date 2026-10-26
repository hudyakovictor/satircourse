import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { journal } from "@/db/schema";
import { ensureSession, readSessionId } from "@/lib/server";

const MOODS = ["СПОКОЙНО", "ТРЕВОЖНО", "ЭЙФОРИЯ", "КАПИТУЛЯЦИЯ", "ОТРИЦАНИЕ"];

export async function GET(request: Request) {
  const id = readSessionId(request);
  if (!id) return NextResponse.json({ journal: [] });
  const rows = await db
    .select()
    .from(journal)
    .where(eq(journal.sessionId, id))
    .orderBy(desc(journal.createdAt))
    .limit(30);
  return NextResponse.json({ journal: rows });
}

export async function POST(request: Request) {
  const id = readSessionId(request);
  if (!id) return NextResponse.json({ error: "no session" }, { status: 400 });
  const body = (await request.json()) as {
    title?: string;
    body?: string;
    mood?: string;
    damage?: number;
  };
  const title = (body.title ?? "").trim().slice(0, 120);
  const text = (body.body ?? "").trim().slice(0, 2000);
  if (!title || !text) {
    return NextResponse.json(
      { error: "Запись без заголовка не принимается. Департамент ценит форму." },
      { status: 400 }
    );
  }
  const mood = MOODS.includes(body.mood ?? "") ? (body.mood as string) : "СПОКОЙНО";
  const damage = Math.max(0, Math.min(1000000, Math.round(Number(body.damage ?? 0))));
  await ensureSession(id);
  const rows = await db
    .insert(journal)
    .values({ sessionId: id, title, body: text, mood, damage })
    .returning();
  return NextResponse.json({ journal: rows[0] });
}
