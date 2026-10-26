"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePlayer } from "./PlayerProvider";
import { Icon } from "./Icon";

const TABS = [
  { k: "Т", n: "Теория", icon: "book" },
  { k: "П", n: "Пример", icon: "candle" },
  { k: "Р", n: "Решение", icon: "target" },
  { k: "Д", n: "Разбор", icon: "lab" },
  { k: "Э", n: "Проверка", icon: "shield" },
];

type Props = {
  lessonId: string; isExam: boolean; passPct: number; qCount: number; accent: string;
  panels: ReactNode[]; keyMd: ReactNode; keyLabel: string; afterMd: ReactNode; nextHref: string | null; nextLabel: string;
};

export function LessonRunner({ lessonId, isExam, passPct, qCount, accent, panels, keyMd, keyLabel, afterMd, nextHref, nextLabel }: Props) {
  const { state, call, error } = usePlayer();
  const row = state?.lessons[lessonId];
  const locked = !!row?.decisionLockedAt;
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  // решение
  const [f, setF] = useState({ context: "", action: "", trigger: "", invalidation: "", risk: "" });
  useEffect(() => {
    if (row?.decision) setF({ context: "", action: "", trigger: "", invalidation: "", risk: "", ...row.decision });
  }, [row?.decision]);

  // экзамен
  const [answers, setAnswers] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [total, setTotal] = useState(qCount);
  const [ticks, setTicks] = useState<boolean[]>(() => Array(qCount).fill(false));
  const [score, setScore] = useState(0);
  const correct = isExam ? score : ticks.filter(Boolean).length;
  const needed = Math.ceil((passPct / 100) * (isExam ? total : qCount));

  const lockDecision = async () => {
    setBusy(true);
    const ok = await call("/api/lesson", "POST", { lessonId, action: "decision", decision: f });
    setBusy(false);
    if (ok) setStep(3);
  };
  const submitExam = async () => {
    setBusy(true);
    await call("/api/lesson", "POST", { lessonId, action: "exam", score: correct, total: isExam ? total : qCount });
    setBusy(false);
  };

  const actions: [string, string, string][] = [["long", "ЛОНГ", "поехали"], ["short", "ШОРТ", "едем вниз"], ["no-trade", "ВНЕ РЫНКА", "и так бывает"]];
  const canLock = f.action && f.invalidation.trim().length > 2;

  return (
    <div className="mt-10">
      {/* вкладки */}
      <div className="flex gap-2 overflow-x-auto scroll-x pb-2" role="tablist">
        {TABS.map((t, i) => {
          const disabled = i === 3 && !locked;
          return (
            <button key={t.k} role="tab" aria-selected={step === i} onClick={() => setStep(i)}
              className={`shrink-0 flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-head text-lg transition ${step === i ? "text-ink" : "text-[#cfd5dc] border-line hover:border-[var(--ac)]"}`}
              style={{ ["--ac" as string]: accent, background: step === i ? accent : "transparent", borderColor: step === i ? accent : undefined }}>
              <span className="font-mono text-xs opacity-70">[{t.k}]</span> {t.n}
              {disabled && <Icon name="lock" size={14} />}
            </button>
          );
        })}
      </div>

      <div className="card p-5 sm:p-7 mt-3 min-h-[320px]" key={step}>
        {step === 0 && <div className="pop">{panels[0]}</div>}
        {step === 1 && <div className="pop">{panels[1]}</div>}

        {step === 2 && (
          <div className="pop">
            {panels[2]}
            <div className="mt-8 border-t border-dashed border-line pt-6">
              <div className="font-head text-2xl" style={{ color: accent }}>Карточка решения</div>
              <p className="text-sm text-muted mt-1">Пять строк до разбора. Решение без пункта 4 — не решение. «Вне рынка» всегда допустимо.</p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {actions.map(([v, l, s]) => (
                  <button key={v} disabled={locked} onClick={() => setF({ ...f, action: v })}
                    className={`rounded-xl border-2 px-2 py-3 text-center transition disabled:cursor-not-allowed ${f.action === v ? "text-lime border-lime bg-lime/10" : "border-line text-[#cfd5dc] hover:border-[#4a5360]"}`}>
                    <div className="font-head text-xl">{l}</div><div className="text-[11px] text-muted">{s}</div>
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <Field label="1 · Контекст (режим, старший ТФ, уровень)" v={f.context} on={(v) => setF({ ...f, context: v })} dis={locked} />
                <Field label="3 · Триггер (что должно случиться до кнопки)" v={f.trigger} on={(v) => setF({ ...f, trigger: v })} dis={locked} />
                <Field label="4 · Инвалидация (где идея неверна) *" v={f.invalidation} on={(v) => setF({ ...f, invalidation: v })} dis={locked} hot />
                <Field label="5 · Риск (размер, максимум 1R, издержки)" v={f.risk} on={(v) => setF({ ...f, risk: v })} dis={locked} />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {!locked ? (
                  <button className="btn btn-solid drip" disabled={!canLock || busy} onClick={lockDecision}>Зафиксировать решение · +20 XP</button>
                ) : (
                  <>
                    <span className="stamp inline-block border-4 border-lime text-lime font-head text-xl px-3 py-1 rounded-lg">РЕШЕНИЕ ЗАПЕЧАТАНО</span>
                    <button className="btn" onClick={() => setStep(3)}>К разбору <Icon name="arrow" size={18} /></button>
                  </>
                )}
                {!canLock && !locked && <span className="text-xs text-muted">Выбери действие и напиши, где идея умирает. Без этого рынок не принимает заявки.</span>}
              </div>
              {error && <p className="mt-3 text-bad text-sm font-semibold">{error}</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="pop">
            {!locked ? (
              <div className="text-center py-10">
                <div className="mx-auto w-16 h-16 rounded-2xl border-2 border-bad text-bad flex items-center justify-center"><Icon name="lock" size={32} /></div>
                <div className="font-head text-3xl mt-4">Разбор запечатан</div>
                <p className="text-muted mt-2 max-w-md mx-auto">Задним числом все гении. Сначала зафиксируй решение — потом узнаешь, насколько оно было твоим.</p>
                <button className="btn btn-solid mt-5" onClick={() => setStep(2)}>Вернуться к решению</button>
              </div>
            ) : (
              <>
                {row?.decision && (
                  <div className="mb-5 rounded-xl border border-line bg-[#0d1013] p-4 text-sm">
                    <div className="font-mono text-[11px] text-muted mb-1">ТВОЁ РЕШЕНИЕ · {row.decision.action?.toUpperCase()}</div>
                    <div className="text-[#cfd5dc]">Инвалидация: <b className="text-white">{row.decision.invalidation}</b></div>
                  </div>
                )}
                {panels[3]}
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="pop">
            {panels[4]}
            {!locked ? (
              <p className="mt-6 text-bad font-semibold">Экзамен недоступен: решение не зафиксировано. Система не принимает показания от тех, кто не рисковал даже на бумаге.</p>
            ) : (
              <div className="mt-6 border-t border-dashed border-line pt-6">
                <div className="font-head text-2xl" style={{ color: accent }}>Ответы</div>
                <textarea className="input mt-2 min-h-24" placeholder="Сначала ответь. Потом подсматривай. Последовательность — единственная добродетель."
                  value={answers} onChange={(e) => setAnswers(e.target.value)} disabled={revealed} />
                {!revealed ? (
                  <button className="btn mt-3" disabled={answers.trim().length < 2} onClick={() => setRevealed(true)}>Открыть ключ</button>
                ) : (
                  <div className="mt-4 pop">
                    <div className="rounded-2xl border-2 border-dashed p-4" style={{ borderColor: accent }}>
                      <div className="font-mono text-[11px] text-muted mb-1">{keyLabel.toUpperCase()}</div>
                      {keyMd}
                    </div>
                    <div className="mt-4">
                      <div className="font-head text-lg">Самооценка. Честно. Протокол ведётся.</div>
                      {isExam ? (
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                          <label className="flex items-center gap-2">Всего вопросов <input type="number" min={1} max={50} className="input !w-20" value={total} onChange={(e) => { const t = Math.max(1, Math.min(50, +e.target.value || 1)); setTotal(t); setScore((s) => Math.min(s, t)); }} /></label>
                          <label className="flex items-center gap-2">Верных <input type="number" min={0} max={total} className="input !w-20" value={score} onChange={(e) => setScore(Math.max(0, Math.min(total, +e.target.value || 0)))} /></label>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {ticks.map((t, i) => (
                            <button key={i} onClick={() => setTicks(ticks.map((x, j) => (j === i ? !x : x)))}
                              className={`w-11 h-11 rounded-xl border-2 font-mono font-extrabold transition ${t ? "bg-lime text-ink border-lime" : "border-line text-muted hover:border-[#4a5360]"}`}>{i + 1}</button>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-muted mt-2 font-mono">Верно: {correct} / {isExam ? total : qCount} · нужно ≥ {needed} ({passPct}%)</div>
                      <button className="btn btn-solid mt-3 drip" disabled={busy} onClick={submitExam}>Записать результат</button>
                    </div>
                  </div>
                )}
                {row?.examScore != null && (
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    {row.passed ? (
                      <span className="stamp inline-block border-4 border-lime text-lime font-head text-3xl px-4 py-1 rounded-xl">ЗАЧЁТ · {row.examScore}/{row.examTotal}</span>
                    ) : (
                      <span className="stamp inline-block border-4 border-bad text-bad font-head text-3xl px-4 py-1 rounded-xl">ПОВТОР · {row.examScore}/{row.examTotal}</span>
                    )}
                    <p className="text-sm text-muted max-w-md">
                      {row.passed ? "Уровень закрыт. Не привыкай: рынок уже заметил твою самоуверенность." : "Рынок принял твой ответ. Не «пересдавай до удачи»: запиши сигнал ошибки → правило, которого не было → действие, которое блокирует повтор."}
                    </p>
                  </div>
                )}
                {row?.passed && afterMd && <div className="mt-4 rounded-xl bg-lime/10 border border-lime/40 p-4">{afterMd}</div>}
                {row?.passed && nextHref && (
                  <Link href={nextHref} className="btn btn-solid mt-5 drip">{nextLabel} <Icon name="arrow" size={18} /></Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>← Назад</button>
        <button className="btn" disabled={step === 4 || (step === 2 && !locked)} onClick={() => setStep(step + 1)}>Дальше →</button>
      </div>
    </div>
  );
}

function Field({ label, v, on, dis, hot }: { label: string; v: string; on: (v: string) => void; dis: boolean; hot?: boolean }) {
  return (
    <label className="block">
      <span className={`text-xs font-mono ${hot ? "text-pink" : "text-muted"}`}>{label}</span>
      <textarea className="input mt-1 min-h-[64px]" value={v} onChange={(e) => on(e.target.value)} disabled={dis} maxLength={400} />
    </label>
  );
}
