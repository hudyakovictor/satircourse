import { CHAPTERS, LESSONS, QUESTIONS_BY_CARD, QUESTION_BY_ID } from "@/lib/content";
import { chapterStatus, dueCards, now, srsReview, today, refreshEntities, dayIndex } from "@/lib/engine";
import { loadPlayer, savePlayer, logEvent, bad, hashSeed } from "@/lib/server";
import { rng } from "@/lib/market";
import { buildView } from "@/lib/view";

export const dynamic = "force-dynamic";

const pub = (qid: string) => {
  const q = QUESTION_BY_ID[qid];
  return { id: q.id, card: q.card, prompt: q.prompt, options: q.options };
};

// Options are shuffled per request so the correct answer is never "always first".
function shuffled(qid: string, salt: string) {
  const q = QUESTION_BY_ID[qid];
  const r = rng(hashSeed(qid + salt));
  const order = q.options.map((_, i) => i).sort(() => r() - 0.5);
  return { ...pub(qid), options: order.map((i) => q.options[i]), order };
}

export async function GET(req: Request) {
  const p = await loadPlayer();
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "recall";
  const salt = String(dayIndex(p.state)) + p.id.slice(0, 6);
  if (mode === "exam") {
    const ch = url.searchParams.get("chapter") || "A";
    const st = chapterStatus(p.state).find((c) => c.id === ch);
    if (!st?.examOpen) return bad("Экзамен недоступен: пройди все уроки главы и экзамен предыдущей главы");
    const qs = LESSONS.filter((l) => l.chapter === ch).flatMap((l) => l.questions);
    const r = rng(hashSeed(ch + salt + (p.state.examAttempts[ch] || 0)));
    const pick = [...qs].sort(() => r() - 0.5).slice(0, Math.min(6, qs.length));
    return Response.json({ questions: pick.map((q) => shuffled(q.id, salt)) });
  }
  // recall patrol: interleaved across ALL passed chapters, due cards first
  const due = dueCards(p.state).slice(0, 5);
  const r = rng(hashSeed(salt + p.state.decisions.length));
  const qs = due.map((c) => {
    const pool = QUESTIONS_BY_CARD[c];
    return shuffled(pool[Math.floor(r() * pool.length)].id, salt);
  });
  return Response.json({ questions: qs });
}

export async function POST(req: Request) {
  const p = await loadPlayer();
  const body = (await req.json()) as {
    mode: "recall" | "exam"; qid?: string; choice?: number; order?: number[]; confidence?: number; chapter?: string;
    answers?: { qid: string; choice: number; order: number[] }[];
  };
  const t = now(p.state);
  if (body.mode === "recall") {
    const q = body.qid ? QUESTION_BY_ID[body.qid] : undefined;
    if (!q || !body.order) return bad("Bad question");
    if (!p.state.cards.includes(q.card)) return bad("Card not owned");
    const original = body.order[body.choice ?? -1];
    const correct = original === q.correct;
    p.state.srs[q.card] = srsReview(p.state.srs[q.card], correct, t);
    const conf = Math.min(100, Math.max(50, body.confidence ?? 70)) / 100;
    p.state.calibration.push({ p: conf, y: correct ? 1 : 0 });
    if (!correct) p.state.errors.knowledge_gap = (p.state.errors.knowledge_gap || 0) + 1;
    today(p.state).recall += 1;
    p.state.xp += correct ? 6 : 2;
    refreshEntities(p.state);
    await savePlayer(p.id, p.state);
    await logEvent(p.id, "recall", { qid: q.id, card: q.card, correct, S: p.state.srs[q.card].S });
    return Response.json({ correct, correctText: q.options[q.correct], why: q.why, nextDays: Math.round(p.state.srs[q.card].S * 10) / 10, view: buildView(p.state, p.name) });
  }
  // exam
  const ch = body.chapter || "";
  const chapter = CHAPTERS.find((c) => c.id === ch);
  const st = chapterStatus(p.state).find((c) => c.id === ch);
  if (!chapter || !st?.examOpen) return bad("Экзамен недоступен");
  const results = (body.answers || []).map((a) => {
    const q = QUESTION_BY_ID[a.qid];
    const correct = !!q && a.order?.[a.choice] === q.correct;
    return { qid: a.qid, correct, correctText: q?.options[q.correct], why: q?.why };
  });
  const score = results.length ? results.filter((r) => r.correct).length / results.length : 0;
  const passed = score >= chapter.examThreshold && results.length >= 3;
  p.state.examAttempts[ch] = (p.state.examAttempts[ch] || 0) + 1;
  if (passed && !p.state.examsPassed.includes(ch)) { p.state.examsPassed.push(ch); p.state.xp += 60; }
  for (const r of results) {
    const q = QUESTION_BY_ID[r.qid];
    if (q && p.state.cards.includes(q.card)) p.state.srs[q.card] = srsReview(p.state.srs[q.card], r.correct, t);
  }
  today(p.state).decisions += 1;
  refreshEntities(p.state);
  await savePlayer(p.id, p.state);
  await logEvent(p.id, "exam", { chapter: ch, score, passed });
  return Response.json({ results, score, passed, threshold: chapter.examThreshold, view: buildView(p.state, p.name) });
}
