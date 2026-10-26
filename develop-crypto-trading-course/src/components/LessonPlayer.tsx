"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useProgress } from "./ProgressProvider";
import { CARD_META } from "@/lib/course-meta";

const KEYS = CARD_META.map((c) => c.key as string);
type Dec = { action?: string; context?: string; trigger?: string; invalidation?: string; risk?: string };

export type PlayerProps = {
  code: string;
  title: string;
  color: string;
  isExam: boolean;
  quiz: { total: number; pass: number; hasQuestion: boolean };
  nodes: { T: ReactNode; P: ReactNode; R: ReactNode; D: ReactNode; QQ: ReactNode; QK: ReactNode; keyLabel: string };
  art: { cover: ReactNode; viz1: ReactNode; viz2: ReactNode; cap1: string; cap2: string };
  prev?: { code: string; title: string };
  next?: { code: string; title: string };
};

const ACTIONS = [
  { id: "long", label: "Long", emoji: "📈", cls: "border-[#22c55e] bg-[#22c55e]/15" },
  { id: "short", label: "Short", emoji: "📉", cls: "border-[#ef4444] bg-[#ef4444]/15" },
  { id: "no-trade", label: "No-trade", emoji: "🛑", cls: "border-[#e9b949] bg-[#e9b949]/20" },
];

export function LessonPlayer(p: PlayerProps) {
  const { get, update, ready } = useProgress();
  const saved = get(p.code);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [dec, setDec] = useState<Dec>({});
  const [revealed, setRevealed] = useState(false);
  const [grades, setGrades] = useState<(boolean | null)[]>(Array(p.quiz.total).fill(null));
  const [result, setResult] = useState<null | { score: number; ok: boolean }>(null);
  const restored = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready || restored.current) return;
    restored.current = true;
    const seen = saved.cardsSeen.map((k) => KEYS.indexOf(k)).filter((i) => i >= 0);
    const mx = saved.completed ? 4 : seen.length ? Math.max(...seen) : 0;
    setMaxStep(mx);
    setStep(saved.completed ? 4 : Math.min(mx, 4));
    setDec(saved.decision as Dec);
    if (saved.completed && saved.quizScore !== null) setResult({ score: saved.quizScore, ok: true });
  }, [ready, saved]);

  const decOk = !!dec.action && (dec.invalidation ?? "").trim().length >= 3;

  const go = (i: number) => {
    if (i > maxStep && i > step + 1) return;
    setStep(i);
    if (i > maxStep) setMaxStep(i);
    if (i > saved.cardsSeen.length - 1) update(p.code, { cardsSeen: KEYS.slice(0, i + 1) });
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const commitDecision = () => {
    update(p.code, { decision: dec as Record<string, string>, cardsSeen: KEYS.slice(0, 4) });
    go(3);
  };

  const finish = () => {
    const score = grades.filter(Boolean).length;
    const ok = score >= p.quiz.pass;
    setResult({ score, ok });
    update(p.code, { quizScore: score, quizTotal: p.quiz.total, cardsSeen: KEYS, ...(ok ? { completed: true } : {}) });
  };

  const meta = CARD_META[step];
  const allGraded = grades.every((g) => g !== null);

  return (
    <div ref={top} className="scroll-mt-24">
      {/* stepper */}
      <div className="flex items-center gap-2">
        {CARD_META.map((c, i) => {
          const reachable = i <= maxStep;
          const active = i === step;
          return (
            <button
              key={c.key}
              onClick={() => reachable && go(i)}
              disabled={!reachable}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-2 py-2.5 text-sm font-black transition ${active ? "border-[#e9b949] bg-[#e9b949] text-[#2b1e00] shadow-[0_4px_0_#a87b12]" : reachable ? "border-[#3a4c97] bg-[#16225a] text-white hover:bg-[#1d2c72]" : "border-white/10 bg-white/5 text-white/30"}`}
              title={c.hint}
            >
              <span>{reachable ? c.emoji : "🔒"}</span>
              <span className="hidden sm:inline">{c.name}</span>
              <span className="sm:hidden">{["Т", "П", "Р", "Д", "Э"][i]}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#1a2658]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((step + 1) / 5) * 100}%`, background: p.color }} />
      </div>

      {/* card */}
      <div key={step} className="card3d pop mt-6 p-5 md:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="text-3xl">{meta.emoji}</span>
          <div>
            <div className="text-xs font-black tracking-[0.2em] opacity-60">КАРТОЧКА {step + 1} ИЗ 5 · [{["Т", "П", "Р", "Д", "Э"][step]}]</div>
            <div className="text-2xl font-black">{meta.name}</div>
          </div>
          {saved.completed && <span className="ml-auto rounded-full bg-[#22c55e] px-3 py-1 text-xs font-black text-white">УРОВЕНЬ ПРОЙДЕН ✓</span>}
        </div>

        {step === 0 && (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_minmax(0,400px)]">
            <div>{p.nodes.T}</div>
            <figure>
              <div className="illus">{p.art.cover}</div>
            </figure>
          </div>
        )}

        {step === 1 && (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_minmax(0,400px)]">
            <div>{p.nodes.P}</div>
            <figure>
              <div className="illus">{p.art.viz1}</div>
              <figcaption className="mt-2 text-xs font-bold opacity-60">{p.art.cap1}</figcaption>
            </figure>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="rounded-2xl border-2 border-dashed border-[#9aa8d3] bg-[#dde3f2] p-5">{p.nodes.R}</div>
            <div className="mt-6 rounded-2xl border-2 border-[#26357d] bg-[#141d45] p-5 text-white">
              <div className="flex items-center gap-2 text-sm font-black tracking-widest text-[#e9b949]">🎯 ВАШЕ РЕШЕНИЕ · пять строк до открытия разбора</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {ACTIONS.map((a) => (
                  <button key={a.id} onClick={() => setDec({ ...dec, action: a.id })} className={`rounded-2xl border-2 px-4 py-3 text-left font-black transition ${dec.action === a.id ? a.cls + " ring-2 ring-white/60" : "border-white/15 bg-white/5 hover:bg-white/10"}`}>
                    <span className="mr-2 text-xl">{a.emoji}</span>
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(
                  [
                    ["context", "1 · Контекст", "режим, старший ТФ, уровень/структура"],
                    ["trigger", "3 · Триггер", "что должно случиться до нажатия кнопки"],
                    ["invalidation", "4 · Инвалидация *", "где идея станет неверной; стоп — до входа"],
                    ["risk", "5 · Риск", "размер позиции, максимум 1R, издержки"],
                  ] as const
                ).map(([k, label, ph]) => (
                  <label key={k} className="block text-sm font-extrabold">
                    {label}
                    <textarea
                      rows={2}
                      value={dec[k] ?? ""}
                      onChange={(e) => setDec({ ...dec, [k]: e.target.value })}
                      placeholder={ph}
                      className={`mt-1 w-full resize-none rounded-xl border-2 bg-[#0b1333] px-3 py-2 text-sm font-medium text-white outline-none placeholder:text-white/30 focus:border-[#e9b949] ${k === "invalidation" && (dec.invalidation ?? "").trim().length < 3 ? "border-[#ef4444]/60" : "border-[#2b3a7a]"}`}
                    />
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold text-[#9fb0e6]">Решение без пункта 4 — не решение. No-trade всегда допустимый (и часто лучший) ответ.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button className="btn3d" disabled={!decOk} onClick={commitDecision}>Зафиксировать и открыть разбор →</button>
                {!decOk && <span className="text-sm font-bold text-[#ff9aa8]">Выберите действие и заполните инвалидацию</span>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            {dec.action && (
              <div className="mb-5 rounded-2xl bg-[#141d45] p-4 text-sm text-white">
                <div className="font-black tracking-widest text-[#e9b949]">ВЫ ЗАФИКСИРОВАЛИ</div>
                <div className="mt-1 font-semibold">
                  <b className="uppercase">{dec.action}</b> · инвалидация: {dec.invalidation || "—"}
                  {dec.risk ? ` · риск: ${dec.risk}` : ""}
                </div>
              </div>
            )}
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_minmax(0,400px)]">
              <div>{p.nodes.D}</div>
              <figure>
                <div className="illus">{p.art.viz2}</div>
                <figcaption className="mt-2 text-xs font-bold opacity-60">{p.art.cap2}</figcaption>
              </figure>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            {p.quiz.hasQuestion ? <div className="rounded-2xl border-2 border-dashed border-[#9aa8d3] bg-[#dde3f2] p-5">{p.nodes.QQ}</div> : <p className="font-semibold">Ответьте на решения экзамена письменно, затем откройте ключ и сверьте каждый пункт.</p>}
            {!revealed ? (
              <button className="btn3d btn3d-gold mt-5" onClick={() => setRevealed(true)}>Я ответил(а) — показать «{p.nodes.keyLabel}»</button>
            ) : (
              <div className="pop mt-5">
                <div className="rounded-2xl border-2 border-[#22c55e] bg-[#dcf7e6] p-5">
                  <div className="mb-2 text-xs font-black tracking-widest text-[#15803d]">🔑 {p.nodes.keyLabel.toUpperCase()}</div>
                  {p.nodes.QK}
                </div>
                {!result && (
                  <div className="mt-6">
                    <div className="text-lg font-black">Честная самопроверка — порог {p.quiz.pass} из {p.quiz.total}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {grades.map((g, i) => (
                        <div key={i} className="flex items-center gap-1 rounded-xl border-2 border-[#b0bbdb] bg-white px-2 py-1.5">
                          <span className="w-6 text-center text-sm font-black">{i + 1}</span>
                          <button onClick={() => setGrades(grades.map((x, k) => (k === i ? true : x)))} className={`h-8 w-8 rounded-lg text-lg font-black ${g === true ? "bg-[#22c55e] text-white" : "bg-[#e3e8f5] text-[#5a668f]"}`} aria-label={`Вопрос ${i + 1} верно`}>✓</button>
                          <button onClick={() => setGrades(grades.map((x, k) => (k === i ? false : x)))} className={`h-8 w-8 rounded-lg text-lg font-black ${g === false ? "bg-[#ef4444] text-white" : "bg-[#e3e8f5] text-[#5a668f]"}`} aria-label={`Вопрос ${i + 1} ошибка`}>✕</button>
                        </div>
                      ))}
                    </div>
                    <button className="btn3d mt-4" disabled={!allGraded} onClick={finish}>Подвести итог</button>
                  </div>
                )}
                {result && (
                  <div className={`pop mt-6 flex flex-wrap items-center gap-5 rounded-2xl border-2 p-5 ${result.ok ? "border-[#22c55e] bg-[#dcf7e6]" : "border-[#ef4444] bg-[#fde3e6]"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.ok ? "/art/mascot-happy.png" : "/art/mascot-warning.png"} alt="" className="mascot-blend h-40 object-contain" />
                    <div className="min-w-[220px] flex-1">
                      <div className="text-2xl font-black">{result.ok ? "Уровень закрыт! +10 XP" : "Пока не засчитано"}</div>
                      <div className="mt-1 font-semibold">Результат: {result.score} из {p.quiz.total} (порог {p.quiz.pass}).</div>
                      {!result.ok && (
                        <p className="mt-2 text-sm font-semibold">Не пересдавайте до удачи. Запишите: сигнал ошибки → правило, которого не хватало → действие, которое заблокирует повтор. Затем вернитесь к карточке [Т].</p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-3">
                        {result.ok && p.next && <Link href={`/lesson/${p.next.code}`} className="btn3d">Дальше: {p.next.code} →</Link>}
                        {result.ok && !p.next && <Link href="/docs/capstone-defense" className="btn3d btn3d-gold">Защита capstone 🎓</Link>}
                        {!result.ok && (
                          <>
                            <button className="btn3d btn3d-red" onClick={() => { setResult(null); setGrades(Array(p.quiz.total).fill(null)); setRevealed(false); }}>Повторить проверку</button>
                            <button className="btn3d btn3d-ghost" onClick={() => go(0)}>К теории</button>
                          </>
                        )}
                        {result.ok && <Link href={`/module/${p.code[0]}`} className="btn3d btn3d-ghost">К модулю</Link>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* nav */}
        {step !== 2 && (
          <div className="mt-8 flex items-center justify-between gap-3 border-t-2 border-dashed border-[#c4cde4] pt-5">
            <button className="btn3d btn3d-ghost" disabled={step === 0} onClick={() => go(step - 1)}>← Назад</button>
            {step < 4 && <button className="btn3d" onClick={() => go(step + 1)}>Далее →</button>}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 text-sm font-bold">
        {p.prev ? <Link href={`/lesson/${p.prev.code}`} className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">← {p.prev.code} · {p.prev.title.slice(0, 32)}</Link> : <span />}
        {p.next && <Link href={`/lesson/${p.next.code}`} className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">{p.next.code} · {p.next.title.slice(0, 32)} →</Link>}
      </div>
    </div>
  );
}
