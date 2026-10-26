"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { allLessons, chapters, totalLessons } from "@/content/course";

type ProgressRow = {
  lessonSlug: string;
  chapterSlug: string;
  quizScore: number;
  quizTotal: number;
  completedAt: string;
};
type JournalRow = {
  id: number;
  title: string;
  body: string;
  mood: string;
  damage: number;
  createdAt: string;
};
type SimRow = {
  id: number;
  pnl: number;
  correct: number;
  rounds: number;
  verdict: string;
  createdAt: string;
};

type State = {
  alias: string;
  progress: ProgressRow[];
  journal: JournalRow[];
  leaderboard: { alias: string; pnl: number; verdict: string }[];
  mine: SimRow[];
};

const MOODS = ["СПОКОЙНО", "ТРЕВОЖНО", "ЭЙФОРИЯ", "КАПИТУЛЯЦИЯ", "ОТРИЦАНИЕ"];

export function Dashboard() {
  const [state, setState] = useState<State | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [damage, setDamage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<State>("/api/state")
      .then(setState)
      .catch(() =>
        setState({ alias: "НЕИЗВЕСТНЫЙ УЧАСТНИК", progress: [], journal: [], leaderboard: [], mine: [] })
      );
  }, []);

  useEffect(load, [load]);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api("/api/journal", {
        method: "POST",
        json: { title, body, mood, damage: Number(damage || 0) },
      });
      setTitle("");
      setBody("");
      setDamage("");
      load();
    } catch {
      setError("ЗАПИСЬ ОТКЛОНЕНА. ДЕПАРТАМЕНТ ЦЕНИТ ФОРМУ, А НЕ ЧУВСТВА.");
    } finally {
      setBusy(false);
    }
  }

  if (!state) {
    return (
      <div className="panel">
        <div className="kicker">ОТКРЫВАЕМ ЛИЧНОЕ ДЕЛО…</div>
      </div>
    );
  }

  const done = state.progress.length;
  const pct = Math.round((done / totalLessons) * 100);
  const quizCorrect = state.progress.reduce((s, p) => s + p.quizScore, 0);
  const quizTotal = state.progress.reduce((s, p) => s + p.quizTotal, 0);
  const totalDamage = state.journal.reduce((s, j) => s + j.damage, 0);

  return (
    <div className="space-y-12">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "ПОЗЫВНОЙ УЧАСТНИКА", value: state.alias, tone: "var(--paper)" },
          { label: "ПРОЙДЕНО УРОКОВ", value: `${done}/${totalLessons}`, tone: "var(--lime)" },
          {
            label: "ВЕРНЫХ ОТВЕТОВ",
            value: `${quizCorrect}/${Math.max(quizTotal, 1)}`,
            tone: "var(--cyan)",
          },
          {
            label: "ЗАЯВЛЕННЫЙ УЩЕРБ",
            value: `${totalDamage.toLocaleString("ru-RU")} ₽`,
            tone: "var(--alarm)",
          },
        ].map((c) => (
          <div key={c.label} className="panel">
            <div className="kicker">{c.label}</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 30,
                marginTop: 10,
                color: c.tone,
                wordBreak: "break-word",
              }}
            >
              {c.value}
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="section-head">
          <h2>ХОД ОБУЧЕНИЯ</h2>
          <div className="kicker">{pct}% ОТ ОБЩЕГО ОБЪЁМА ЗНАНИЙ, КОТОРЫЕ ТЫ ВСЁ РАВНО ПРИМЕНИШЬ СВОИМ СПОСОБОМ</div>
        </div>
        <div className="bar mb-8">
          <span style={{ width: `${pct}%` }} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {chapters.map((ch) => (
            <div key={ch.slug} className="panel">
              <div className="flex items-center justify-between">
                <h3 style={{ fontSize: 21 }}>
                  {String(ch.number).padStart(2, "0")}. {ch.title}
                </h3>
                <Link href={`/course/${ch.slug}`} className="navlink">
                  ОТКРЫТЬ →
                </Link>
              </div>
              <ul className="mt-4">
                {ch.lessons.map((l) => {
                  const row = state.progress.find((p) => p.lessonSlug === l.slug);
                  return (
                    <li
                      key={l.slug}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] py-2"
                    >
                      <Link
                        href={`/course/${ch.slug}/${l.slug}`}
                        className="navlink"
                        style={{ color: row ? "var(--paper)" : "var(--muted)" }}
                      >
                        {row ? "✓ " : "○ "}
                        {l.title}
                      </Link>
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: row ? "var(--lime)" : "var(--muted)",
                        }}
                      >
                        {row ? `${row.quizScore}/${row.quizTotal}` : "НЕ ПРОЙДЕН"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>ЖУРНАЛ ЖЕРТВОПРИНОШЕНИЙ</h2>
          <div className="kicker">ТО, ЧТО НЕ ЗАПИСАНО, ПОВТОРИТСЯ. ОБЫЧНО ТОЧНЕЕ</div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="panel panel--paper">
            <h3 style={{ fontSize: 22 }}>НОВАЯ ЗАПИСЬ</h3>
            <p className="mt-2" style={{ fontSize: 15 }}>
              Опиши решение так, будто его будут читать на заседании. Потому что будут.
            </p>
            <label className="kicker mt-5 block">ЗАГОЛОВОК</label>
            <input
              className="input mt-2"
              value={title}
              maxLength={120}
              placeholder="НАПРИМЕР: КУПИЛ НА ВЕРШИНЕ, ЧТОБЫ НЕ ОПОЗДАТЬ"
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="kicker mt-4 block">СУТЬ ПРОИСШЕДШЕГО</label>
            <textarea
              className="textarea mt-2"
              rows={5}
              maxLength={2000}
              value={body}
              placeholder="Рынок принял моё решение и оформил последствия…"
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="kicker block">НАСТРОЕНИЕ</label>
                <select
                  className="select mt-2"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                >
                  {MOODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="kicker block">УЩЕРБ, ₽</label>
                <input
                  className="input mt-2"
                  inputMode="numeric"
                  value={damage}
                  placeholder="0"
                  onChange={(e) => setDamage(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
            <button
              type="button"
              className="btn btn--sm mt-5"
              onClick={submit}
              disabled={busy || !title.trim() || !body.trim()}
            >
              {busy ? "ОФОРМЛЯЕМ…" : "ВНЕСТИ В ЖУРНАЛ"}
            </button>
            {error && (
              <div className="mono mt-3" style={{ color: "var(--alarm)", fontSize: 11 }}>
                {error}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {state.journal.length === 0 && (
              <div className="panel">
                <div className="kicker">ЗАПИСЕЙ НЕТ</div>
                <p className="mt-3">
                  Журнал пуст. Это единственная часть твоего дела, которая пока не содержит
                  улик.
                </p>
              </div>
            )}
            {state.journal.map((j) => (
              <article key={j.id} className="memo" style={{ marginTop: 0 }}>
                <h4>
                  {new Date(j.createdAt).toLocaleDateString("ru-RU")} · {j.mood}
                </h4>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 21, marginBottom: 10 }}>
                  {j.title}
                </p>
                <p>{j.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="sticker sticker--magenta">
                    УЩЕРБ: {j.damage.toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="stamp">ПРИНЯТО</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>ПРОТОКОЛ ТРЕНАЖЁРА</h2>
          <Link href="/simulator" className="btn btn--sm">
            ПРОЙТИ ЗАНОВО →
          </Link>
        </div>
        <div className="table-scroll">
          <table className="ledger">
            <thead>
              <tr>
                <th>ДАТА</th>
                <th>P&L</th>
                <th>ВЕРНЫХ РЕШЕНИЙ</th>
                <th>ВЕРДИКТ</th>
              </tr>
            </thead>
            <tbody>
              {state.mine.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color: "var(--muted)" }}>
                    ТРЕНАЖЁР НЕ ПРОЙДЕН. ОПЫТ ПОЛУЧЕН ДРУГИМ СПОСОБОМ — НА ДЕНЬГИ.
                  </td>
                </tr>
              )}
              {state.mine.map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleDateString("ru-RU")}</td>
                  <td style={{ color: m.pnl >= 0 ? "var(--lime)" : "var(--alarm)" }}>
                    {m.pnl > 0 ? "+" : ""}
                    {m.pnl}
                  </td>
                  <td>
                    {m.correct}/{m.rounds}
                  </td>
                  <td style={{ color: "var(--paper-2)" }}>{m.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-caption">ЛИЧНАЯ СТАТИСТИКА · ХРАНИТСЯ БЕССРОЧНО</div>
        </div>
      </section>
    </div>
  );
}
