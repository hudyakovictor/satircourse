"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/client";
import type { Question } from "@/content/types";

type Props = {
  chapterSlug: string;
  lessonSlug: string;
  questions: Question[];
};

type AnswerState = { picked: number | null; locked: boolean };

export function Quiz({ chapterSlug, lessonSlug, questions }: Props) {
  const [state, setState] = useState<AnswerState[]>(
    questions.map(() => ({ picked: null, locked: false }))
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const correct = useMemo(
    () =>
      state.reduce(
        (sum, s, i) => (s.locked && s.picked === questions[i].correct ? sum + 1 : sum),
        0
      ),
    [state, questions]
  );
  const answered = state.filter((s) => s.locked).length;

  function pick(qi: number, oi: number) {
    setState((prev) => {
      if (prev[qi].locked) return prev;
      const next = [...prev];
      next[qi] = { picked: oi, locked: true };
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await api("/api/progress", {
        method: "POST",
        json: {
          chapterSlug,
          lessonSlug,
          quizScore: correct,
          quizTotal: questions.length,
        },
      });
      setSaved(true);
    } catch {
      setError("ДЕПАРТАМЕНТ НЕ ОТВЕТИЛ. ТВОЯ ОШИБКА ВСЁ РАВНО ЗАФИКСИРОВАНА.");
    } finally {
      setSaving(false);
    }
  }

  const verdict =
    answered < questions.length
      ? "ДОПРОС ПРОДОЛЖАЕТСЯ"
      : correct === questions.length
        ? "ПОЛНОЕ ПОПАДАНИЕ. РЫНОК ВРЕМЕННО РАЗОЧАРОВАН"
        : correct >= questions.length / 2
          ? "УДОВЛЕТВОРИТЕЛЬНО. УБЫТОК НЕ ЗАФИКСИРОВАН"
          : "СИСТЕМА ПРИНЯЛА ТВОИ ОТВЕТЫ К СВЕДЕНИЮ";

  return (
    <section className="quiz" aria-label="Проверка знаний">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="kicker">ОТДЕЛ ДОПРОСА · {questions.length} ВОПРОСА</div>
          <h3 style={{ fontSize: 28, marginTop: 8 }}>ПРОВЕРКА НА ПРОЧНОСТЬ</h3>
        </div>
        <div className="text-right">
          <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
            ВЕРНО: {correct} / {questions.length}
          </div>
          <div className="bar mt-2" style={{ width: 180 }}>
            <span style={{ width: `${(correct / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {questions.map((q, qi) => {
        const s = state[qi];
        return (
          <div key={q.q} className="mt-8">
            <div className="mono" style={{ fontSize: 11, color: "var(--magenta)" }}>
              ВОПРОС {String(qi + 1).padStart(2, "0")}
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                textTransform: "uppercase",
                fontSize: 21,
                lineHeight: 1.15,
                margin: "8px 0 14px",
              }}
            >
              {q.q}
            </p>
            <div>
              {q.options.map((opt, oi) => {
                const isPicked = s.picked === oi;
                const stateName =
                  s.locked && isPicked
                    ? oi === q.correct
                      ? "right"
                      : "wrong"
                    : s.locked && oi === q.correct
                      ? "right"
                      : undefined;
                return (
                  <button
                    key={opt}
                    type="button"
                    className="quiz__opt"
                    data-state={stateName}
                    disabled={s.locked}
                    onClick={() => pick(qi, oi)}
                  >
                    <span className="mono mr-3" style={{ fontSize: 11, color: "var(--muted)" }}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {s.locked && (
              <div
                className="quiz__feedback"
                data-kind={s.picked === q.correct ? "right" : "wrong"}
              >
                <div className="kicker mb-2">
                  {s.picked === q.correct ? "ЗАСЧИТАНО" : "ОТКЛОНЕНО"}
                </div>
                {s.picked === q.correct ? q.onRight : q.onWrong}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-6">
        <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
          {verdict}
        </div>
        <button
          type="button"
          className="btn btn--lime"
          onClick={save}
          disabled={answered < questions.length || saving || saved}
        >
          {saved ? "ЗАФИКСИРОВАНО В ЛИЧНОМ ДЕЛЕ" : saving ? "ОФОРМЛЯЕМ…" : "ЗАФИКСИРОВАТЬ РЕЗУЛЬТАТ"}
        </button>
        {error && (
          <div className="mono" style={{ color: "var(--alarm)", fontSize: 12 }}>
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
