import { LESSON_BY_ID } from "@/lib/content";
import { chapterStatus, now, srsReview, today, refreshEntities } from "@/lib/engine";
import { loadPlayer, savePlayer, logEvent, bad } from "@/lib/server";
import { buildView } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const p = await loadPlayer();
  const body = (await req.json()) as { lessonId: string; answers: { qid: string; choice: number; order?: number[] }[] };
  const lesson = LESSON_BY_ID[body.lessonId];
  if (!lesson) return bad("Unknown lesson");
  const ch = chapterStatus(p.state).find((c) => c.id === lesson.chapter);
  if (!ch?.open) return bad("Глава ещё закрыта");
  const results = lesson.questions.map((q) => {
    const a = body.answers?.find((x) => x.qid === q.id);
    const original = a?.order ? a.order[a.choice] : a?.choice;
    return { qid: q.id, correct: original === q.correct, correctText: q.options[q.correct], why: q.why, choice: a?.choice ?? -1 };
  });
  const score = results.filter((r) => r.correct).length / results.length;
  const passed = score >= 0.5;
  const granted: string[] = [];
  const first = !p.state.lessonsDone.includes(lesson.id);
  if (passed && first) {
    p.state.lessonsDone.push(lesson.id);
    const t = now(p.state);
    for (const c of lesson.cards) {
      if (!p.state.cards.includes(c)) {
        p.state.cards.push(c);
        p.state.srs[c] = srsReview(undefined, true, t);
        granted.push(c);
      }
    }
    p.state.xp += 20;
    today(p.state).decisions += 1;
  }
  if (!passed) {
    for (const r of results) if (!r.correct) p.state.errors.knowledge_gap = (p.state.errors.knowledge_gap || 0) + 1;
  }
  refreshEntities(p.state);
  await savePlayer(p.id, p.state);
  await logEvent(p.id, "lesson_submit", { lessonId: lesson.id, score, passed, granted });
  return Response.json({ results, score, passed, granted, view: buildView(p.state, p.name) });
}
