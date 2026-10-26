import { loadPlayer, savePlayer, logEvent, bad } from "@/lib/server";
import { buildView } from "@/lib/view";
import { newState, refreshEntities, now } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const p = await loadPlayer();
  const awakened = refreshEntities(p.state);
  if (awakened.length) await savePlayer(p.id, p.state);
  return Response.json({ view: buildView(p.state, p.name), awakened });
}

export async function POST(req: Request) {
  const p = await loadPlayer();
  const body = (await req.json().catch(() => ({}))) as { action?: string; name?: string; entityId?: string };
  let name: string | undefined;
  switch (body.action) {
    case "timeTravel":
      p.state.dayOffset += 1;
      break;
    case "designer":
      p.state.designerMode = !p.state.designerMode;
      break;
    case "rename":
      name = String(body.name || "").slice(0, 24).trim() || undefined;
      break;
    case "shadowDemo":
      p.state.shadowDemoSeen = true;
      p.state.xp += 10;
      break;
    case "unfreeze": {
      const es = body.entityId ? p.state.entities[body.entityId] : undefined;
      if (!es || es.status !== "frozen") return bad("Entity is not frozen");
      es.status = "awake"; es.lossStreak = 0;
      es.dueAt = Math.max(es.dueAt, now(p.state));
      break;
    }
    case "reset":
      p.state = newState();
      break;
    default:
      return bad("Unknown action");
  }
  const awakened = refreshEntities(p.state);
  await savePlayer(p.id, p.state, name);
  await logEvent(p.id, `player_${body.action}`, { dayOffset: p.state.dayOffset });
  return Response.json({ view: buildView(p.state, name || p.name), awakened });
}
