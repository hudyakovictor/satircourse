"use client";

import { useState, type ReactNode } from "react";
import { useProgress } from "./ProgressProvider";

const ACTIONS = [
  ["long", "ЛОНГ", "Купить. Оптимизм за свой счёт."],
  ["short", "ШОРТ", "Продать чужое. Потолок не предусмотрен."],
  ["no-trade", "NO-TRADE", "Редкая дисциплина. 0R, зато спишь."],
];

export function DecisionCard({ lessonId, debrief }: { lessonId: number; debrief: ReactNode }) {
  const { progress, save } = useProgress();
  const saved = progress[lessonId]?.decision;
  const [action, setAction] = useState("");
  const [f, setF] = useState({ context: "", trigger: "", invalidation: "", risk: "" });
  const [err, setErr] = useState("");

  function commit() {
    if (!action) return setErr("ДЕЙСТВИЕ НЕ ВЫБРАНО. Бездействие тоже решение, но его нужно хотя бы назвать.");
    if (!f.invalidation.trim()) return setErr("ИНВАЛИДАЦИЯ НЕ УКАЗАНА. Решение без неё — не решение, а надежда с кнопкой.");
    setErr("");
    save(lessonId, { decision: { action, ...f, at: Date.now() } });
  }

  const inp = "w-full border-2 border-black bg-[#0b0c13] px-3 py-2 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-toxic";

  return (
    <div className="mt-4">
      {!saved ? (
        <div className="ink-panel p-4">
          <div className="font-display text-lg uppercase text-paper">Протокол решения · пять строк до разбора</div>
          <p className="mt-1 text-sm text-zinc-400">Сначала фиксируешь — потом читаешь [Д]. Рынок принимает решения без подсказок. Ты — тоже.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {ACTIONS.map(([k, t, d]) => (
              <button
                key={k}
                onClick={() => setAction(k)}
                className={`border-2 border-black px-3 py-2 text-left transition ${action === k ? "bg-toxic text-black shadow-[4px_4px_0_#000]" : "bg-[#151722] text-zinc-200 hover:bg-[#1c1f2e]"}`}
              >
                <div className="font-display text-lg uppercase">{t}</div>
                <div className="text-xs opacity-80">{d}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input className={inp} placeholder="1. Контекст: режим, ТФ, уровень" value={f.context} onChange={(e) => setF({ ...f, context: e.target.value })} />
            <input className={inp} placeholder="3. Триггер: что должно случиться" value={f.trigger} onChange={(e) => setF({ ...f, trigger: e.target.value })} />
            <input className={inp} placeholder="4. Инвалидация: где идея неверна *" value={f.invalidation} onChange={(e) => setF({ ...f, invalidation: e.target.value })} />
            <input className={inp} placeholder="5. Риск: размер, максимум 1R" value={f.risk} onChange={(e) => setF({ ...f, risk: e.target.value })} />
          </div>
          {err && <div className="mt-3 border-2 border-blood bg-blood/10 px-3 py-2 font-mono text-sm text-blood">{err}</div>}
          <button onClick={commit} className="mt-3 border-2 border-black bg-paper px-5 py-2 font-display uppercase text-black shadow-[4px_4px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000]">
            Зафиксировать решение
          </button>
          <div className="mt-2 font-mono text-[11px] text-zinc-500">Разбор заблокирован. Паника бесплатна. Вход — нет.</div>
        </div>
      ) : (
        <div>
          <div className="ink-panel p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="stamp text-toxic">Решение принято</span>
              <span className="font-display text-lg uppercase text-paper">{saved.action.toUpperCase()}</span>
              <span className="font-mono text-xs text-zinc-500">{new Date(saved.at).toLocaleString("ru-RU")}</span>
            </div>
            <div className="mt-2 grid gap-1 font-mono text-xs text-zinc-300 sm:grid-cols-2">
              <div>Контекст: {saved.context || "—"}</div>
              <div>Триггер: {saved.trigger || "—"}</div>
              <div>Инвалидация: {saved.invalidation}</div>
              <div>Риск: {saved.risk || "—"}</div>
            </div>
            <p className="mt-2 text-sm italic text-zinc-400">Рынок принял твоё решение. Возражений не поступило — возражать некому.</p>
            <button onClick={() => save(lessonId, { decision: null })} className="mt-2 font-mono text-xs text-zinc-500 underline hover:text-blood">
              отозвать решение (рынок запомнит)
            </button>
          </div>
          <div className="mt-4">{debrief}</div>
        </div>
      )}
    </div>
  );
}

export function ExamCard({ lessonId, isExam, keyText }: { lessonId: number; isExam: boolean; keyText: string }) {
  const { progress, save } = useProgress();
  const p = progress[lessonId];
  const max = isExam ? 10 : 5;
  const need = isExam ? (lessonId === 79 ? 9 : 8) : 4;
  const [answers, setAnswers] = useState("");
  const [open, setOpen] = useState(false);
  const revealed = open || p?.examScore != null;

  return (
    <div className="mt-4 ink-panel p-4">
      {!revealed ? (
        <>
          <div className="font-display text-lg uppercase text-paper">Ответь до раскрытия ключа</div>
          <textarea
            className="mt-2 h-28 w-full border-2 border-black bg-[#0b0c13] p-3 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-toxic"
            placeholder="1) ...  2) ...  3) ...  — честно, без подглядывания. Рынок всё равно узнает."
            value={answers}
            onChange={(e) => setAnswers(e.target.value)}
          />
          <button
            onClick={() => setOpen(true)}
            disabled={answers.trim().length < 3}
            className="mt-3 border-2 border-black bg-paper px-5 py-2 font-display uppercase text-black shadow-[4px_4px_0_#000] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Раскрыть ключ
          </button>
          {answers.trim().length < 3 && <div className="mt-2 font-mono text-[11px] text-zinc-500">НЕДОСТАТОЧНО ОТВЕТОВ. Ключ не открывается из любопытства.</div>}
        </>
      ) : (
        <>
          <div className="stamp text-amber-300">Ключ</div>
          <div className="paper mt-3 p-3 font-mono text-sm leading-relaxed">{keyText}</div>
          <div className="mt-4 font-display uppercase text-paper">Сколько верных? (порог — {need}/{max})</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from({ length: max + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => save(lessonId, { examScore: i, examMax: max, completed: i >= need })}
                className={`h-10 w-10 border-2 border-black font-display text-lg ${p?.examScore === i ? (i >= need ? "bg-toxic text-black" : "bg-blood text-black") : "bg-[#151722] text-zinc-200 hover:bg-[#1f2232]"}`}
              >
                {i}
              </button>
            ))}
          </div>
          {p?.examScore != null && (
            <div className={`mt-3 border-2 px-3 py-2 font-mono text-sm ${p.completed ? "border-toxic bg-toxic/10 text-toxic" : "border-blood bg-blood/10 text-blood"}`}>
              {p.completed
                ? "ЗАЧЁТ. Не привыкай. Рынок уже заметил твою самоуверенность."
                : "ПОРОГ НЕ ДОСТИГНУТ. Вернись к [Т]. Пересдача — после разбора ошибки, а не «до удачи»."}
            </div>
          )}
          <button onClick={() => save(lessonId, { examScore: null, examMax: null, completed: false })} className="mt-2 font-mono text-xs text-zinc-500 underline hover:text-blood">
            сбросить и подумать ещё раз
          </button>
        </>
      )}
    </div>
  );
}
