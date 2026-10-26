"use client";

import { useState, type ReactNode } from "react";
import { useProgress } from "./ProgressProvider";
import { FEEDBACK } from "@/data/satire";

const ACTIONS = [
  { id: "long", label: "LONG", color: "var(--up)" },
  { id: "short", label: "SHORT", color: "var(--down)" },
  { id: "no-trade", label: "NO-TRADE", color: "var(--violet)" },
] as const;

export function DecisionCard({ lessonId, options, debrief, visual }: { lessonId: string; options: string[]; debrief: ReactNode; visual?: ReactNode }) {
  const { lessons, update, gradeIdx } = useProgress();
  const st = lessons[lessonId] ?? {};
  const [warn, setWarn] = useState("");
  const locked = !!st.locked;

  const lock = () => {
    if (!st.action) return setWarn("Выбери действие: long, short или no-trade. Молчание тоже действие, но не в протоколе.");
    if (!st.invalid?.trim()) return setWarn(FEEDBACK.decisionNeeds[gradeIdx]);
    setWarn("");
    update(lessonId, { locked: true });
  };

  const field = (key: "ctx" | "trigger" | "invalid" | "risk", label: string, ph: string, req = false) => (
    <label className="block">
      <span className="kicker">
        {label} {req && <span className="text-[var(--down)]">· обязательно</span>}
      </span>
      <input
        className="field mt-1 disabled:opacity-60"
        value={st[key] ?? ""}
        disabled={locked}
        placeholder={ph}
        onChange={(e) => update(lessonId, { [key]: e.target.value })}
      />
    </label>
  );

  return (
    <div>
      {options.length > 0 && (
        <div className="mb-4 grid gap-2">
          {options.map((o) => (
            <button key={o} data-on={st.option === o} disabled={locked} onClick={() => update(lessonId, { option: o })} className="neo-btn px-4 py-3 text-left text-sm">
              {o}
            </button>
          ))}
        </div>
      )}
      <div className="neo-in p-4 md:p-5">
        <div className="kicker mb-2">Действие</div>
        <div className="mb-4 flex flex-wrap gap-2">
          {ACTIONS.map((a) => (
            <button key={a.id} disabled={locked} data-on={st.action === a.id} onClick={() => update(lessonId, { action: a.id })} className="neo-btn px-5 py-2 text-sm" style={{ color: st.action === a.id ? a.color : undefined }}>
              {a.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {field("ctx", "1 · Контекст", "режим, старший ТФ, уровень")}
          {field("trigger", "3 · Триггер", "что должно случиться до кнопки")}
          {field("invalid", "4 · Инвалидация", "где идея станет неверной", true)}
          {field("risk", "5 · Риск", "≤ 1R, издержки")}
        </div>
        {!locked ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={lock} className="neo-btn btn-primary px-6 py-3 text-sm">
              Подшить решение к делу
            </button>
            {warn && <span className="pop text-sm font-bold text-[var(--down)]">{warn}</span>}
          </div>
        ) : (
          <div className="pop mt-4 flex flex-wrap items-center gap-3">
            <span className="stamp">Принято</span>
            <span className="text-sm font-semibold">{FEEDBACK.decisionLocked[gradeIdx]}</span>
            <button className="neo-btn ml-auto px-4 py-2 text-xs" onClick={() => update(lessonId, { locked: false })}>
              Отозвать
            </button>
          </div>
        )}
      </div>
      {locked ? (
        <div className="pop mt-6">
          {visual}
          {debrief}
        </div>
      ) : (
        <div className="neo-s mt-6 flex items-center gap-3 p-4 text-sm font-semibold text-[var(--mute)]">
          <span>🔒</span> Разбор закрыт. Рынок не показывает ответ до того, как ты сделал ставку.
        </div>
      )}
    </div>
  );
}

export function ExamCard({
  lessonId,
  questions,
  keyNode,
  keyLabel,
  threshold,
  needsDecision,
  isExam,
  nextHref,
}: {
  lessonId: string;
  questions: string[];
  keyNode: ReactNode;
  keyLabel: string;
  threshold: number;
  needsDecision: boolean;
  isExam: boolean;
  nextHref: string | null;
}) {
  const { lessons, update, gradeIdx } = useProgress();
  const st = lessons[lessonId] ?? {};
  const answers = st.answers ?? [];
  const marks = st.marks ?? [];
  const n = Math.max(1, questions.length);
  const need = Math.ceil(threshold * n - 1e-9);
  const answered = answers.some((a) => a?.trim());
  const [msg, setMsg] = useState("");
  const submitted = typeof st.examScore === "number";
  const score = marks.filter(Boolean).length;
  const passed = submitted && (st.examScore ?? 0) >= need;

  return (
    <div>
      <div className="grid gap-3">
        {(questions.length ? questions : ["Ответ"]).map((q, i) => (
          <label key={i} className="neo-in block p-3">
            <span className="flex gap-2 text-sm font-semibold">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--blue)] text-xs font-black text-white">{i + 1}</span>
              <span>{q}</span>
            </span>
            <input
              className="field mt-2 disabled:opacity-60"
              placeholder="твой ответ — до ключа"
              disabled={!!st.revealed}
              value={answers[i] ?? ""}
              onChange={(e) => {
                const a = [...answers];
                a[i] = e.target.value;
                update(lessonId, { answers: a });
              }}
            />
          </label>
        ))}
      </div>

      {!st.revealed ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            className="neo-btn btn-primary px-6 py-3 text-sm"
            onClick={() => (answered ? (setMsg(""), update(lessonId, { revealed: true })) : setMsg("Ключ не любит опоздавших и пустых. Напиши хотя бы один ответ."))}
          >
            Открыть {keyLabel.toLowerCase()}
          </button>
          {msg && <span className="pop text-sm font-bold text-[var(--down)]">{msg}</span>}
        </div>
      ) : (
        <div className="pop mt-5">
          <div className="neo-s p-5">
            <div className="kicker mb-2">{keyLabel}</div>
            <div className="rich text-sm leading-relaxed">{keyNode}</div>
          </div>
          {!submitted && (
            <div className="neo-in mt-4 p-4">
              <div className="kicker mb-2">Самопроверка · отметь верные ответы ({need}/{n} для зачёта, порог {Math.round(threshold * 100)}%)</div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: n }).map((_, i) => (
                  <button
                    key={i}
                    data-on={!!marks[i]}
                    className="neo-btn h-10 w-10 text-sm"
                    style={{ color: marks[i] ? "var(--up)" : undefined }}
                    onClick={() => {
                      const m = Array.from({ length: n }, (_, j) => !!marks[j]);
                      m[i] = !m[i];
                      update(lessonId, { marks: m });
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button className="neo-btn btn-primary px-5 py-2 text-sm" onClick={() => update(lessonId, { examScore: score, examTotal: n })}>
                  Засчитать: {score}/{n}
                </button>
                <span className="text-xs text-[var(--mute)]">Честность — единственная метрика, которую рынок не может подделать за тебя.</span>
              </div>
            </div>
          )}
          {submitted && (
            <div className={`pop mt-4 rounded-3xl p-5 ${passed ? "bg-[#dff6ec]" : "bg-[#fde3e8]"}`} style={{ boxShadow: "inset 3px 3px 8px rgba(0,0,0,.05)" }}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="stamp" style={{ color: passed ? "var(--up)" : "var(--down)", borderColor: passed ? "var(--up)" : "var(--down)" }}>
                  {passed ? "Зачёт" : "Не зачтено"} · {st.examScore}/{st.examTotal ?? n}
                </span>
                <span className="text-sm font-bold">{passed ? FEEDBACK.examPass[gradeIdx] : FEEDBACK.examFail[gradeIdx]}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {passed && !st.done && (
                  <button
                    className="neo-btn btn-primary px-6 py-3 text-sm"
                    disabled={needsDecision && !st.locked}
                    onClick={() => update(lessonId, { done: true })}
                  >
                    Закрыть уровень
                  </button>
                )}
                {passed && needsDecision && !st.locked && <span className="text-xs font-bold text-[var(--down)]">Сначала подшей решение [Р]: уровень закрывается решением, стопом и записью.</span>}
                {st.done && (
                  <>
                    <span className="stamp" style={{ color: "var(--up)", borderColor: "var(--up)" }}>Уровень закрыт</span>
                    <span className="text-sm font-semibold">{FEEDBACK.done[gradeIdx]}</span>
                    {nextHref && (
                      <a href={nextHref} className="neo-btn btn-primary px-6 py-3 text-sm">
                        Следующий уровень →
                      </a>
                    )}
                  </>
                )}
                <button className="neo-btn px-4 py-2 text-xs" onClick={() => update(lessonId, { revealed: false, examScore: undefined, examTotal: undefined, marks: [], answers: [], done: false })}>
                  {passed ? "Пройти заново" : "Новая попытка: заполни строку «сигнал → правило → действие»"}
                </button>
              </div>
              {isExam && !passed && <p className="mt-3 text-xs font-semibold text-[var(--mute)]">Тройной фейл: три одинаковые критические ошибки подряд — вернись на уровень назад. Пересдача «до удачи» не считается.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
