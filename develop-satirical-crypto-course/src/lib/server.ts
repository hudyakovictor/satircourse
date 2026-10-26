import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";

const SESSION_RE = /^[a-zA-Z0-9-]{8,64}$/;

const ALIASES = [
  "НОВИЧОК-0001",
  "СЛУШАТЕЛЬ-ХАОСА",
  "УЧАСТНИК-ПРОЦЕССА",
  "СТАЖЁР-ПАНИКИ",
  "НАБЛЮДАТЕЛЬ-СТОПА",
  "СОИСКАТЕЛЬ-ЛИКВИДНОСТИ",
  "КУРСАНТ-ДЕПАРТАМЕНТА",
];

export function readSessionId(request: Request): string {
  const header = request.headers.get("x-session-id") ?? "";
  return SESSION_RE.test(header) ? header : "";
}

export function randomAlias(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return `${ALIASES[hash % ALIASES.length]}-${String(hash).padStart(5, "0")}`;
}

export async function ensureSession(id: string) {
  const existing = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);
  if (existing.length > 0) return existing[0];
  const inserted = await db
    .insert(sessions)
    .values({ id, alias: randomAlias(id) })
    .onConflictDoNothing()
    .returning();
  if (inserted.length > 0) return inserted[0];
  const again = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return again[0];
}

export function newSessionId() {
  return `sess-${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
}
