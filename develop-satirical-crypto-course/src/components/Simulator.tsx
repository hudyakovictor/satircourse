"use client";

import { useCallback, useMemo, useState } from "react";
import { api } from "@/lib/client";

type Candle = { o: number; c: number; hi: number; lo: number };
type LogItem = { round: number; action: string; delta: number; note: string };

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROUND_COUNT = 10;

function buildSeries(seed: number): Candle[] {
  const rnd = mulberry32(seed);
  const out: Candle[] = [];
  let price = 100;
  for (let i = 0; i < 12 + ROUND_COUNT + 1; i++) {
    const drift = (rnd() - 0.48) * 7;
    const o = price;
    const c = Math.max(20, o + drift);
    const hi = Math.max(o, c) + rnd() * 3.2;
    const lo = Math.min(o, c) - rnd() * 3.2;
    out.push({ o, c, hi, lo });
    price = c;
  }
  return out;
}

const NOTES = {
  win: [
    "РЫНОК ПРИНЯЛ ТВОЁ РЕШЕНИЕ. НА ЭТОТ РАЗ ОНО ЕМУ ПОНРАВИЛОСЬ.",
    "ПРИБЫЛЬ ЗАФИКСИРОВАНА. НЕ ПРИВЫКАЙ — РЫНОК УЖЕ ЗАМЕТИЛ ТВОЮ САМОУВЕРЕННОСТЬ.",
    "ОТЛИЧНАЯ СДЕЛКА. СТРАТЕГИЯ РАБОТАЕТ. ПОКА.",
  ],
  lose: [
    "РЫНОК ПРИНЯЛ ТВОЁ РЕШЕНИЕ И ОФОРМИЛ ПОСЛЕДСТВИЯ.",
    "ОТЛИЧНАЯ СДЕЛКА. ТЕПЕРЬ У ТЕБЯ НА 12% МЕНЬШЕ ДЕНЕГ, ЗАТО ПОЯВИЛСЯ ОПЫТ.",
    "УБЫТОК ВРЕМЕННЫЙ. ТОЛЬКО ЕСЛИ ТЫ ПЕРЕСТАНЕШЬ ОТКРЫВАТЬ ПРИЛОЖЕНИЕ.",
  ],
  wait: [
    "ТЫ НЕ ВОШЁЛ. РЫНОК ОЦЕНИЛ ТВОЮ ОСТОРОЖНОСТЬ И ПРОДОЛЖИЛ БЕЗ ТЕБЯ.",
    "ОЖИДАНИЕ — ТОЖЕ ПОЗИЦИЯ. ПРОСТО БЕЗ КОМИССИИ.",
  ],
};

function pick<T>(arr: T[], rnd: () => number) {
  return arr[Math.floor(rnd() * arr.length)];
}

export function Simulator() {
  const [seed] = useState(() => 20260214 + Math.floor(Math.random() * 1000));
  const series = useMemo(() => buildSeries(seed), [seed]);
  const [round, setRound] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [log, setLog] = useState<LogItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [board, setBoard] = useState<
    { alias: string; pnl: number; verdict: string }[]
  >([]);
  const [alias, setAlias] = useState("");
  const [flash, setFlash] = useState<{ kind: "win" | "lose" | "wait"; note: string } | null>(
    null
  );

  const visible = series.slice(0, 13 + round);
  const finished = round >= ROUND_COUNT;

  const verdict = useMemo(() => {
    if (!finished) return "ПРОЦЕСС ПРОДОЛЖАЕТСЯ. ОТДЕЛ НАБЛЮДАЕТ.";
    if (pnl >= 800) return "ГЕНИЙ. ИЛИ ОЧЕНЬ УДАЧЛИВЫЙ НОВИЧОК. ПОДОЖДЁМ.";
    if (pnl >= 200) return "УДОВЛЕТВОРИТЕЛЬНО. РЫНОК ПОКА НЕ НАШЁЛ, ЧЕМ ТЕБЯ ВЗЯТЬ.";
    if (pnl >= -200) return "НОЛЬ. КЛАССИЧЕСКИЙ РЕЗУЛЬТАТ ЧЕСТНОЙ БОРЬБЫ.";
    return "ДЕПАРТАМЕНТ БЛАГОДАРИТ ЗА ЛИКВИДНОСТЬ.";
  }, [finished, pnl]);

  const rnd = useMemo(() => mulberry32(seed + 999), [seed]);

  const act = useCallback(
    (action: "LONG" | "SHORT" | "WAIT") => {
      if (finished) return;
      const next = series[13 + round];
      const up = next.c > next.o;
      const move = Math.abs(next.c - next.o);
      let delta = 0;
      let kind: "win" | "lose" | "wait" = "wait";
      if (action === "WAIT") {
        kind = "wait";
        delta = move < 1.2 ? 30 : 0;
      } else {
        const right = (action === "LONG" && up) || (action === "SHORT" && !up);
        kind = right ? "win" : "lose";
        delta = right ? 120 : -100;
      }
      const note = pick(NOTES[kind], rnd);
      setPnl((p) => p + delta);
      if (kind === "win" || (kind === "wait" && delta > 0)) setCorrect((c) => c + 1);
      setLog((l) => [...l, { round: round + 1, action, delta, note }]);
      setFlash({ kind, note });
      setRound((r) => r + 1);
    },
    [finished, series, round, rnd]
  );

  async function save() {
    const res = await api<{ run: { alias: string } }>("/api/sim", {
      method: "POST",
      json: {
        pnl,
        correct,
        rounds: ROUND_COUNT,
        verdict,
        alias,
      },
    });
    setSaved(true);
    const state = await api<{ leaderboard: { alias: string; pnl: number; verdict: string }[] }>(
      "/api/state"
    );
    setBoard(state.leaderboard);
    if (!alias) setAlias(res.run.alias);
  }

  const min = Math.min(...visible.map((c) => c.lo));
  const max = Math.max(...visible.map((c) => c.hi));
  const W = 900;
  const H = 380;
  const pad = 30;
  const scaleY = (v: number) => H - pad - ((v - min) / Math.max(0.001, max - min)) * (H - pad * 2);
  const step = (W - pad * 2) / visible.length;

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="panel p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
            <div className="kicker">ГРАФИК · ТАЙМФРЕЙМ «РЕШЕНИЕ ЗА 4 СЕКУНДЫ»</div>
            <div className="flex items-center gap-4">
              <div>
                <div className="kicker">P&L</div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 30,
                    color: pnl >= 0 ? "var(--lime)" : "var(--alarm)",
                  }}
                >
                  {pnl > 0 ? "+" : ""}
                  {pnl}
                </div>
              </div>
              <div>
                <div className="kicker">РАУНД</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 30 }}>
                  {Math.min(round + 1, ROUND_COUNT)}/{ROUND_COUNT}
                </div>
              </div>
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="figure__svg" role="img" aria-label="График тренажёра">
            <rect width={W} height={H} fill="#0e0c0b" />
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={pad}
                x2={W - pad}
                y1={pad + ((H - pad * 2) / 4) * i}
                y2={pad + ((H - pad * 2) / 4) * i}
                stroke="#3a322c"
                strokeDasharray="4 8"
              />
            ))}
            {visible.map((c, i) => {
              const x = pad + step * i + step / 2;
              const up = c.c > c.o;
              const color = up ? "#C7F52B" : "#FF2E7E";
              const yTop = scaleY(Math.max(c.o, c.c));
              const h = Math.max(3, Math.abs(scaleY(c.o) - scaleY(c.c)));
              return (
                <g key={i}>
                  <line x1={x} x2={x} y1={scaleY(c.hi)} y2={scaleY(c.lo)} stroke={color} strokeWidth="2" />
                  <rect x={x - step * 0.32} y={yTop} width={step * 0.64} height={h} fill={color} opacity="0.92" />
                </g>
              );
            })}
            <text
              x={pad}
              y={H - 8}
              fill="#8B8177"
              fontFamily="var(--font-mono)"
              fontSize="13"
              letterSpacing="1.4"
            >
              КАЖДАЯ СВЕЧА — ЧУЖОЕ РЕШЕНИЕ. СЛЕДУЮЩАЯ ЗАВИСИТ ОТ ТВОЕГО.
            </text>
          </svg>

          <div className="flex flex-wrap gap-3 border-t border-[var(--line)] px-5 py-5">
            <button
              type="button"
              className="btn btn--lime"
              onClick={() => act("LONG")}
              disabled={finished}
            >
              ▲ ЛОНГ
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => act("SHORT")}
              disabled={finished}
            >
              ▼ ШОРТ
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => act("WAIT")}
              disabled={finished}
            >
              ✋ ЖДАТЬ
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel">
            <div className="kicker">ОТЧЁТ О ПРОИСШЕДШЕМ</div>
            {flash ? (
              <div
                className="quiz__feedback mt-4"
                data-kind={flash.kind === "lose" ? "wrong" : "right"}
              >
                {flash.note}
              </div>
            ) : (
              <p className="mt-4" style={{ color: "var(--muted)" }}>
                Ты ещё ничего не сделал. Это лучший результат за сегодня.
              </p>
            )}
            {finished && (
              <div className="mt-5">
                <div className="stamp stamp--lime">{verdict}</div>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="kicker">ЖУРНАЛ РЕШЕНИЙ</div>
            <div className="mt-4 space-y-2">
              {log.length === 0 && (
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                  ПУСТО. КАК И ТВОЙ ПЛАН НА ЭТУ СЕССИЮ.
                </div>
              )}
              {log
                .slice()
                .reverse()
                .map((l) => (
                  <div
                    key={l.round}
                    className="flex items-center justify-between border-b border-[var(--line)] pb-2"
                  >
                    <span className="mono" style={{ fontSize: 11 }}>
                      РАУНД {String(l.round).padStart(2, "0")} · {l.action}
                    </span>
                    <span
                      className="mono"
                      style={{ fontSize: 11, color: l.delta >= 0 ? "var(--lime)" : "var(--alarm)" }}
                    >
                      {l.delta > 0 ? "+" : ""}
                      {l.delta}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="panel panel--paper">
            <h4 style={{ fontSize: 20 }}>ЗАФИКСИРОВАТЬ РЕЗУЛЬТАТ</h4>
            <p className="mt-2" style={{ fontSize: 15 }}>
              Результат будет сохранён в общем протоколе. Имя можно не указывать — стыд
              распределяется автоматически.
            </p>
            <input
              className="input mt-3"
              placeholder="ПОЗЫВНОЙ (НЕОБЯЗАТЕЛЬНО)"
              value={alias}
              maxLength={24}
              onChange={(e) => setAlias(e.target.value)}
            />
            <button
              type="button"
              className="btn btn--sm mt-4"
              onClick={save}
              disabled={!finished || saved}
            >
              {saved ? "СОХРАНЕНО В ПРОТОКОЛЕ" : "СОХРАНИТЬ"}
            </button>
          </div>
        </div>
      </div>

      {board.length > 0 && (
        <div className="table-scroll mt-10">
          <table className="ledger">
            <thead>
              <tr>
                <th>МЕСТО</th>
                <th>ПОЗЫВНОЙ</th>
                <th>P&L</th>
                <th>ВЕРДИКТ ДЕПАРТАМЕНТА</th>
              </tr>
            </thead>
            <tbody>
              {board.map((b, i) => (
                <tr key={`${b.alias}-${i}`}>
                  <td>{String(i + 1).padStart(2, "0")}</td>
                  <td>{b.alias}</td>
                  <td style={{ color: b.pnl >= 0 ? "var(--lime)" : "var(--alarm)" }}>
                    {b.pnl > 0 ? "+" : ""}
                    {b.pnl}
                  </td>
                  <td style={{ color: "var(--paper-2)" }}>{b.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-caption">ПРОТОКОЛ ОБЩЕСТВЕННОГО СТЫДА · ОБНОВЛЯЕТСЯ АВТОМАТИЧЕСКИ</div>
        </div>
      )}
    </div>
  );
}
