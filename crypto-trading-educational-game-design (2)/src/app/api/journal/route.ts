import { randomUUID } from "crypto";
import { loadPlayer, savePlayer, logEvent, bad } from "@/lib/server";
import { today } from "@/lib/engine";
import { buildView } from "@/lib/view";

export const dynamic = "force-dynamic";

// Append-only: entries cannot be edited or deleted (immutable post-mortem).
export async function POST(req: Request) {
  const p = await loadPlayer();
  const b = (await req.json()) as { decisionId: string; planFollowed: boolean; emotion: string; rulePatch: string; note: string };
  if (!p.state.decisions.some((d) => d.id === b.decisionId)) return bad("Decision not found");
  if (p.state.journal.some((j) => j.decisionId === b.decisionId)) return bad("Запись уже существует — журнал неизменяем");
  const entry = {
    id: randomUUID(), at: Date.now(), decisionId: b.decisionId, planFollowed: !!b.planFollowed,
    emotion: String(b.emotion || "").slice(0, 30), rulePatch: String(b.rulePatch || "").slice(0, 160), note: String(b.note || "").slice(0, 400),
  };
  p.state.journal.push(entry);
  p.state.xp += 8;
  today(p.state).journal += 1;
  await savePlayer(p.id, p.state);
  await logEvent(p.id, "journal_entry", entry);
  return Response.json({ ok: true, view: buildView(p.state, p.name) });
}
