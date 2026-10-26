"use client";
import { useMemo, useRef, useState } from "react";
import { QUESTIONS } from "@/lib/content";
import { Big, CandleChart, Dots, Hearts, Hud, Pill, TimeBar, fx, genCandles, pick, rand, shuffle, useCountdown, useFeedback, type MechProps } from "../kit";

// ---------------- M01 Quiz 2.0 ----------------
export function Quiz({ onEnd, paused }: MechProps) {
  const qs = useMemo(() => shuffle(QUESTIONS).slice(0, 8).map((q) => {
    const order = shuffle(q.options.map((_, i) => i));
    const wrongWhy = pick(QUESTIONS.filter((x) => x.id !== q.id)).why;
    return { ...q, order, whys: shuffle([q.why, wrongWhy]) };
  }), []);
  const [i, setI] = useState(0); const [hearts, setHearts] = useState(3); const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0); const [hidden, setHidden] = useState<number[]>([]); const [fifty, setFifty] = useState(true);
  const [why, setWhy] = useState(false); const [locked, setLocked] = useState<number | null>(null); const [correct, setCorrect] = useState(0);
  const fb = useFeedback();
  const q = qs[i];
  const finish = (h: number, c: number) => onEnd({ score: Math.round((c / qs.length) * 100), lesson: "Извлечение из памяти сильнее перечитывания.", stats: [["Верно", `${c}/${qs.length}`], ["Сердца", `${h}`]] });
  const next = (h: number, c: number) => { setLocked(null); setWhy(false); setHidden([]); if (h <= 0 || i + 1 >= qs.length) finish(h, c); else { setI(i + 1); setT(15); } };
  const [t, setT] = useCountdown(15, !paused && locked === null && !why, () => answer(-1));
  function answer(k: number) {
    if (locked !== null) return;
    const ok = k >= 0 && q.order[k] === q.correct; setLocked(k);
    if (ok) {
      const c2 = correct + 1; setCorrect(c2); setCombo(combo + 1); setScore(score + 100 * (1 + combo * 0.5)); fb.show("good", combo >= 1 ? `x${combo + 1}` : "+100");
      if (Math.random() < 0.35) setTimeout(() => setWhy(true), 500); else setTimeout(() => next(hearts, c2), 700);
    } else { const h = hearts - 1; setHearts(h); setCombo(0); fb.show("bad"); setTimeout(() => next(h, correct), 1100); }
  }
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Hearts n={hearts} />} center={<Dots i={i} n={qs.length} />} right={<Pill tone="bg-amber-300/20 text-amber-200">{Math.round(score)}</Pill>} />
      <TimeBar t={t} max={15} />
      {!why ? (
        <>
          <div className="flex-1 grid place-items-center px-2"><h2 className="text-2xl font-black text-center leading-tight anim-in" key={i}>{q.prompt}</h2></div>
          <div className="grid gap-2">
            {q.order.map((oi, k) => (
              <button key={k} disabled={hidden.includes(k) || locked !== null} onClick={() => answer(k)}
                className={`min-h-14 rounded-2xl px-4 text-left font-bold transition active:scale-[.98] ${hidden.includes(k) ? "opacity-0" : ""} ${locked !== null && oi === q.correct ? "bg-emerald-400 text-[#05080f]" : locked === k ? "bg-rose-500" : "bg-white/10"}`}>{q.options[oi]}</button>
            ))}
          </div>
          <button disabled={!fifty || locked !== null} onClick={() => { fx.coin(); setFifty(false); setHidden(shuffle(q.order.map((oi, k) => (oi === q.correct ? -1 : k)).filter((k) => k >= 0)).slice(0, 2)); }}
            className="self-center rounded-full bg-violet-500/30 px-4 py-2 text-sm font-black disabled:opacity-20">✂️ 50/50</button>
        </>
      ) : (
        <div className="flex-1 flex flex-col justify-center gap-3 anim-in">
          <div className="text-center text-5xl">🤔</div>
          <h2 className="text-center text-xl font-black">Почему?</h2>
          {q.whys.map((w) => <Big key={w} tone="ghost" className="text-left !font-bold text-sm" onClick={() => { const ok = w === q.why; fb.show(ok ? "good" : "bad", ok ? "+50" : undefined); if (ok) setScore(score + 50); setTimeout(() => next(hearts, correct), 600); }}>{w}</Big>)}
        </div>
      )}
    </div>
  );
}

// ---------------- M02 Speed round ----------------
const STATEMENTS: [string, boolean][] = [
  ["Пробой без объёма подозрителен", true], ["Один RSI — достаточное подтверждение", false], ["Кэш — это тоже позиция", true],
  ["Новость = сигнал к входу", false], ["Стоп ставят до входа", true], ["После стопа нужно отыграться", false],
  ["Риск ≤1% на сделку", true], ["Плечо определяет риск сделки", false], ["Старший ТФ важнее младшего", true],
  ["Усреднение в минус — хороший план", false], ["Эйфория толпы — поздняя фаза", true], ["Прибыль доказывает, что процесс верный", false],
  ["Анлок токенов давит на цену", true], ["Круглая цифра — лучшее место для стопа", false], ["R:R 1:0.5 требует винрейт >67%", true],
  ["Stochastic подтверждает RSI", false], ["Отток с бирж — чаще накопление", true], ["Сделку мести можно, если уверен", false],
];
export function Speed({ onEnd, paused }: MechProps) {
  const deck = useMemo(() => shuffle(STATEMENTS), []);
  const [i, setI] = useState(0); const [ok, setOk] = useState(0); const [bad, setBad] = useState(0); const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null); const fb = useFeedback();
  const done = () => onEnd({ score: Math.round((ok / Math.max(1, ok + bad)) * Math.min(1, (ok + bad) / 12) * 100), lesson: "Правила должны вспоминаться быстрее эмоции.", stats: [["Верно", `${ok}`], ["Ошибок", `${bad}`]] });
  const [t] = useCountdown(30, !paused, done);
  const ans = (v: boolean) => { const r = deck[i % deck.length][1] === v; if (r) setOk(ok + 1); else setBad(bad + 1); fb.show(r ? "good" : "bad"); setI(i + 1); setDx(0); };
  const s = deck[i % deck.length];
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Pill tone="bg-emerald-400/20 text-emerald-200">✓ {ok}</Pill>} center={<span className="text-2xl tabular-nums">{Math.ceil(t)}</span>} right={<Pill tone="bg-rose-500/20 text-rose-200">✗ {bad}</Pill>} />
      <TimeBar t={t} max={30} />
      <div className="flex-1 grid place-items-center">
        <div key={i} className="w-full aspect-[4/5] max-h-[52vh] rounded-[28px] bg-gradient-to-br from-violet-500/40 to-sky-500/20 border border-white/10 grid place-items-center p-6 text-center text-2xl font-black anim-in touch-none"
          style={{ transform: `translateX(${dx}px) rotate(${dx / 18}deg)` }}
          onPointerDown={(e) => { start.current = e.clientX; }} onPointerMove={(e) => { if (start.current != null) setDx(e.clientX - start.current); }}
          onPointerUp={() => { if (dx > 70) ans(true); else if (dx < -70) ans(false); else setDx(0); start.current = null; }}>
          {s[0]}
          <div className="absolute" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3"><Big tone="red" onClick={() => ans(false)}>← Миф</Big><Big tone="green" onClick={() => ans(true)}>Правда →</Big></div>
    </div>
  );
}

// ---------------- M03 Pairs ----------------
const GLOSS: [string, string][] = [["Спред", "Ask − Bid"], ["ATR", "Средний размах"], ["FDV", "Цена × все токены"], ["Funding", "Плата лонг↔шорт"], ["HL", "Более высокий лой"], ["R", "Единица риска"], ["Float", "Токены в обороте"], ["OI", "Открытый интерес"]];
export function Pairs({ onEnd, paused }: MechProps) {
  const pairs = useMemo(() => shuffle(GLOSS).slice(0, 6), []);
  const tiles = useMemo(() => shuffle(pairs.flatMap(([a, b], k) => [{ k, t: a, term: true }, { k, t: b, term: false }])), [pairs]);
  const [open, setOpen] = useState<number[]>([]); const [done, setDone] = useState<number[]>([]); const [moves, setMoves] = useState(0);
  const fb = useFeedback();
  const [t] = useCountdown(60, !paused, () => end(done.length));
  const end = (d: number) => onEnd({ score: Math.round((d / 12) * 100 * Math.min(1, 14 / Math.max(moves, 1)) ** 0.3), lesson: "Термин без смысла не работает — связывай их.", stats: [["Пары", `${d / 2}/6`], ["Ходы", `${moves}`]] });
  const flip = (idx: number) => {
    if (open.length === 2 || open.includes(idx) || done.includes(idx)) return; fx.tap();
    const o = [...open, idx]; setOpen(o);
    if (o.length === 2) {
      setMoves(moves + 1);
      const [a, b] = o.map((x) => tiles[x]);
      if (a.k === b.k && a.term !== b.term) { const d = [...done, ...o]; setTimeout(() => { setDone(d); setOpen([]); fb.show("good"); if (d.length === 12) end(12); }, 350); }
      else setTimeout(() => { setOpen([]); fx.bad(); }, 800);
    }
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Pill>🔁 {moves}</Pill>} center={<span className="text-2xl tabular-nums">{Math.ceil(t)}</span>} right={<Pill tone="bg-emerald-400/20 text-emerald-200">{done.length / 2}/6</Pill>} />
      <TimeBar t={t} max={60} />
      <div className="flex-1 grid grid-cols-3 gap-2 content-center">
        {tiles.map((x, idx) => {
          const up = open.includes(idx) || done.includes(idx);
          return (
            <button key={idx} onClick={() => flip(idx)} className="aspect-[3/4] [perspective:600px]">
              <div className={`relative h-full w-full transition-transform duration-300 [transform-style:preserve-3d] ${up ? "[transform:rotateY(180deg)]" : ""}`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-800 grid place-items-center text-3xl [backface-visibility:hidden]">✦</div>
                <div className={`absolute inset-0 rounded-2xl grid place-items-center p-2 text-center font-black [backface-visibility:hidden] [transform:rotateY(180deg)] ${done.includes(idx) ? "bg-emerald-400 text-[#05080f]" : x.term ? "bg-white text-[#05080f] text-xl" : "bg-sky-400 text-[#05080f] text-sm"}`}>{x.t}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- M04 Procedure ----------------
const PROCS: { title: string; steps: string[]; decoy: string }[] = [
  { title: "Вход в сделку", steps: ["🔭 Старший ТФ", "📏 Уровень", "📊 Подтверждение", "🧯 Стоп", "⚖️ Размер", "▶️ Вход"], decoy: "➕ Усреднить" },
  { title: "После стопа", steps: ["⏸ Пауза", "📓 Журнал", "🔍 Был ли план?", "🧘 Сброс", "🔁 Следующий сетап"], decoy: "💥 Отыграться x2" },
  { title: "Новость вышла", steps: ["📰 Прочитать", "❓ Меняет спрос?", "⏳ Ждать реакцию", "📐 Структура", "✅ Решение"], decoy: "🚀 Купить сразу" },
];
export function Procedure({ onEnd }: MechProps) {
  const [r, setR] = useState(0); const [got, setGot] = useState<string[]>([]); const [errs, setErrs] = useState(0); const [total, setTotal] = useState(0);
  const p = PROCS[r]; const pool = useMemo(() => shuffle([...p.steps, p.decoy]), [p]);
  const fb = useFeedback();
  const tapStep = (s: string) => {
    if (got.includes(s)) return;
    if (s === p.steps[got.length]) {
      const g = [...got, s]; setGot(g); fx.coin();
      if (g.length === p.steps.length) { fb.show("good", "✓"); setTimeout(() => { if (r + 1 >= PROCS.length) onEnd({ score: Math.max(0, 100 - (errs) * 12), lesson: "Порядок шагов убивает импульсивность.", stats: [["Ошибок", `${errs}`], ["Процедур", "3/3"]] }); else { setR(r + 1); setGot([]); } }, 700); }
    } else { setErrs(errs + 1); setTotal(total + 1); fb.show("bad", s === p.decoy ? "Ловушка!" : undefined); }
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={r} n={3} />} center={<span className="text-lg">{p.title}</span>} right={<Pill tone="bg-rose-500/20 text-rose-200">✗ {errs}</Pill>} />
      <div className="flex flex-col gap-1.5 min-h-[40%]">
        {p.steps.map((_, k) => (
          <div key={k} className={`h-11 rounded-xl flex items-center gap-3 px-3 font-bold ${got[k] ? "bg-emerald-400/20 anim-in" : "border border-dashed border-white/15"}`}>
            <span className="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-xs">{k + 1}</span>{got[k] ?? ""}
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-wrap gap-2 content-start justify-center pt-2">
        {pool.filter((s) => !got.includes(s)).map((s) => <button key={s} onClick={() => tapStep(s)} className="min-h-12 rounded-2xl bg-white/10 px-4 font-bold active:scale-95 anim-in">{s}</button>)}
      </div>
    </div>
  );
}

// ---------------- M17 Higher / Lower ----------------
export function HigherLower({ onEnd }: MechProps) {
  const make = () => { const dir = pick([1, -1, 0] as const); const d = dir === 0 ? Array.from({ length: 30 }, (_, i) => (i % 6 < 3 ? 0.007 : -0.007)) : Array.from({ length: 30 }, () => dir * rand(0.001, 0.008)); return genCandles(d); };
  const [round, setRound] = useState(0); const [cs, setCs] = useState(make); const [reveal, setReveal] = useState(false);
  const [streak, setStreak] = useState(0); const [best, setBest] = useState(0); const [hits, setHits] = useState(0);
  const fb = useFeedback(); const N = 10;
  const guess = (up: boolean) => {
    if (reveal) return; const last = cs[cs.length - 2]; const nx = cs[cs.length - 1]; const ok = (nx.c > last.c) === up;
    setReveal(true); if (ok) { setHits(hits + 1); setStreak(streak + 1); setBest(Math.max(best, streak + 1)); } else setStreak(0);
    fb.show(ok ? "good" : "bad", ok ? `🔥 ${streak + 1}` : undefined);
    setTimeout(() => { if (round + 1 >= N) onEnd({ score: Math.round((hits + (ok ? 1 : 0)) / N * 100), lesson: "Разведка без штрафа: мозг готовится к новой главе.", stats: [["Попаданий", `${hits + (ok ? 1 : 0)}/${N}`], ["Серия", `${Math.max(best, ok ? streak + 1 : 0)}`]] }); else { setRound(round + 1); setCs(make()); setReveal(false); } }, 900);
  };
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={round} n={N} />} right={<Pill tone="bg-amber-300/20 text-amber-200">🔥 {streak}</Pill>} />
      <div className="flex-1 grid place-items-center"><CandleChart candles={cs} hideFrom={reveal ? undefined : cs.length - 1} height={280} highlight={reveal ? [cs.length - 1] : []} /></div>
      <div className="grid grid-cols-2 gap-3"><Big tone="red" onClick={() => guess(false)}>▼ Ниже</Big><Big tone="green" onClick={() => guess(true)}>▲ Выше</Big></div>
    </div>
  );
}
