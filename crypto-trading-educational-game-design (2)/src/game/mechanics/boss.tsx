"use client";
import { useMemo, useState } from "react";
import { CARDS, CARD_BY_ID, ENTITIES, ARCHETYPES, type Entity } from "@/lib/content";
import { generateScenario } from "@/lib/market";
import { Big, CandleChart, Dots, Hearts, Hud, Pill, TimeBar, fx, pick, shuffle, useCountdown, useFeedback, type MechProps } from "../kit";

const MON = ["👻", "🐍", "🕷️", "🐙", "🐉", "👺", "🦇", "🧟", "🗿", "🦂", "🐺", "🦑", "👹", "💀", "🧛", "🐲", "🦈", "🪼", "🦠", "🕸️"];
export const monster = (e: Entity) => MON[(parseInt(e.id.slice(1)) - 1) % MON.length];
const BR: Record<string, string> = { market: "from-sky-500 to-indigo-700", trade: "from-emerald-400 to-teal-700", discipline: "from-amber-300 to-orange-600" };

function Card({ id, on, onClick, pulse }: { id: string; on?: boolean; onClick?: () => void; pulse?: boolean }) {
  const c = CARD_BY_ID[id];
  return (
    <button onClick={onClick} className={`relative w-full h-32 rounded-2xl break-words hyphens-auto bg-gradient-to-br ${BR[c.branch]} p-2 text-left text-[#05080f] shadow-lg transition active:scale-95 ${on ? "-translate-y-4 ring-4 ring-white" : ""} ${pulse ? "anim-pulse ring-4 ring-white" : ""}`}>
      <div className="text-[10px] font-black opacity-70">#{c.n}</div>
      <div className="text-[13px] font-black leading-tight">{c.name}</div>
      <div className="absolute bottom-2 left-2 right-2 text-[10px] font-bold leading-tight opacity-80">{c.ru}</div>
    </button>
  );
}

function Arena({ e, hp, shake, children }: { e: Entity; hp: number; shake: boolean; children?: React.ReactNode }) {
  return (
    <div className="relative rounded-[28px] bg-gradient-to-b from-rose-950/70 to-transparent p-3 border border-rose-500/20">
      <div className="flex items-center gap-3">
        <div className={`text-6xl drop-shadow-[0_0_20px_rgba(255,77,109,.6)] ${shake ? "anim-shake" : "anim-float"}`}>{monster(e)}</div>
        <div className="flex-1">
          <div className="font-black leading-tight">{e.name}</div>
          <div className="h-3 bg-white/10 rounded-full mt-1 overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-500" style={{ width: `${hp}%` }} /></div>
        </div>
      </div>
      {children}
    </div>
  );
}

// ---------------- M22 Boss battle ----------------
export function BossBattle({ onEnd }: MechProps) {
  const e = useMemo(() => pick(ENTITIES), []);
  const phases = useMemo(() => [1, 2, 3].map((rank) => {
    const s = generateScenario(Math.floor(Math.random() * 1e9), e.archetype, rank + 1);
    const need = [e.native, ...e.secondary.slice(0, rank - 1)].slice(0, rank === 1 ? 1 : 2);
    const decoys = rank === 3 ? [...e.decoys] : [];
    const fill = shuffle(CARDS.map((c) => c.id).filter((c) => ![...need, ...e.decoys, ...e.secondary].includes(c)));
    return { rank, s, need, hand: shuffle([...need, ...decoys, ...fill].slice(0, 5)) };
  }), [e]);
  const [p, setP] = useState(0); const [sel, setSel] = useState<string[]>([]); const [hp, setHp] = useState(100); const [hearts, setHearts] = useState(3);
  const [shake, setShake] = useState(false); const [hits, setHits] = useState(0); const fb = useFeedback();
  const ph = phases[p];
  const strike = () => {
    const ok = ph.need.every((c) => sel.includes(c)) && sel.length === ph.need.length;
    const h2 = ok ? hits + 1 : hits; const hearts2 = ok ? hearts : hearts - 1;
    if (ok) { setHp(Math.max(0, hp - 34)); setShake(true); fx.hit(); fb.show("good", "💥"); } else { setHearts(hearts2); fb.show("bad", "🩸"); }
    setHits(h2);
    setTimeout(() => { setShake(false); setSel([]); if (p + 1 >= 3 || hearts2 <= 0) onEnd({ score: Math.round((h2 / 3) * 100), lesson: h2 === 3 ? e.lesson : "Подтяни навык — реванш через 2 дня.", stats: [["Фазы", `${h2}/3`], ["Ранги", "I → II → III"]] }); else setP(p + 1); }, 900);
  };
  const sig = ph.s.signals.slice(0, 3);
  return (
    <div className="flex flex-col h-full gap-2">
      {fb.node}
      <Hud left={<Hearts n={hearts} />} center={<Pill tone="bg-rose-500/20 text-rose-200">Ранг {["", "I", "II", "III"][ph.rank]}</Pill>} right={<Pill>🃏 {sel.length}/{ph.need.length}</Pill>} />
      <Arena e={e} hp={hp} shake={shake}>
        <div className="mt-2 rounded-2xl bg-black/30 px-3 py-2 text-sm italic">«{e.distortion}»</div>
      </Arena>
      <CandleChart key={p} candles={ph.s.candles.slice(-40)} height={150} />
      <div className="flex gap-1.5 flex-wrap">{sig.map((g) => <span key={g.label} className={`rounded-full px-3 py-1 text-xs font-bold ${g.stance === "bull" ? "bg-emerald-400/15" : g.stance === "bear" ? "bg-rose-500/15" : g.stance === "risk" ? "bg-amber-300/15" : "bg-white/10"}`}>{g.label}: {g.value}</span>)}</div>
      <div className="flex-1" />
      <div className="flex gap-2 overflow-x-auto no-scrollbar pt-4 -mx-3 px-3 snap-x">{ph.hand.map((id) => <div key={id} className="w-[30%] shrink-0 snap-start"><Card id={id} on={sel.includes(id)} onClick={() => { fx.tap(); setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id].slice(-ph.need.length)); }} /></div>)}</div>
      <Big tone="red" disabled={sel.length !== ph.need.length} onClick={strike}>⚔️ Удар</Big>
    </div>
  );
}

// ---------------- Shadow demo (the only worked example in the game) ----------------
export function ShadowDemo({ onEnd }: MechProps) {
  const [step, setStep] = useState(0);
  const hand = useMemo(() => shuffle(["c35", "c16", "c9", "c19"]), []);
  const lines = ["Вижу свечу +12%. Тень шепчет: «успей».", "Это FOMO. Беру правило против погони.", "Структуры для стопа нет → вне рынка.", "Дальше — сам. Подсказок больше не будет."];
  const fake = useMemo(() => generateScenario(7, "news_spike", 2), []);
  return (
    <div className="flex flex-col h-full gap-3">
      <Hud left={<Dots i={step} n={4} />} center={<Pill tone="bg-violet-500/20 text-violet-200">Демонстрация</Pill>} />
      <div className="relative rounded-[28px] bg-gradient-to-b from-violet-950/70 to-transparent p-4 flex items-center gap-3">
        <div className={`text-7xl ${step >= 3 ? "opacity-10 blur-sm transition duration-1000" : "anim-float"}`}>🌑</div>
        <div className="font-black text-lg">Тень</div>
      </div>
      <div className={`transition ${step === 0 ? "ring-4 ring-amber-300 rounded-2xl" : ""}`}><CandleChart candles={fake.candles.slice(-40)} height={170} /></div>
      <div className="flex items-start gap-2 anim-in" key={step}><div className="text-4xl">📎</div><div className="rounded-2xl rounded-tl-none bg-white text-[#05080f] px-4 py-3 font-bold">{lines[step]}</div></div>
      <div className="flex-1" />
      {step === 1 ? (
        <div className="grid grid-cols-4 gap-1.5">{hand.map((id) => <Card key={id} id={id} pulse={id === "c35"} onClick={() => { if (id === "c35") { fx.good(); setStep(2); } else fx.bad(); }} />)}</div>
      ) : step === 2 ? (
        <div className="grid grid-cols-3 gap-2"><Big tone="ghost" onClick={() => fx.bad()}>▲</Big><Big className="anim-pulse" onClick={() => { fx.hit(); setStep(3); }}>⏸</Big><Big tone="ghost" onClick={() => fx.bad()}>▼</Big></div>
      ) : step === 3 ? (
        <Big onClick={() => onEnd({ score: 100, lesson: "Вижу искажение → выбираю карту → решаю задачу карты.", stats: [["Демо", "1 раз за игру"]] })}>Понял</Big>
      ) : <Big onClick={() => setStep(1)}>Дальше</Big>}
    </div>
  );
}

// ---------------- M23 Boss Rush ----------------
export function BossRush({ onEnd, paused }: MechProps) {
  const foes = useMemo(() => shuffle(ENTITIES).slice(0, 5).map((e) => ({ e, hand: shuffle([e.native, ...shuffle(CARDS.filter((c) => c.id !== e.native && !e.secondary.includes(c.id)).map((c) => c.id)).slice(0, 3)]) })), []);
  const [i, setI] = useState(0); const [hearts, setHearts] = useState(3); const [kills, setKills] = useState(0); const [shake, setShake] = useState(false); const fb = useFeedback();
  const f = foes[i];
  const resolve = (ok: boolean) => {
    const k = kills + (ok ? 1 : 0); const h = hearts - (ok ? 0 : 1); setKills(k); setHearts(h);
    if (ok) { setShake(true); fx.hit(); fb.show("good", "💀"); } else fb.show("bad", "🩸");
    setTimeout(() => { setShake(false); if (i + 1 >= foes.length || h <= 0) onEnd({ score: k * 20, lesson: "Разные враги подряд — проверка переноса, а не зубрёжки.", stats: [["Повержено", `${k}/5`], ["Сердца", `${h}`]] }); else { setI(i + 1); setT(10); } }, 700);
  };
  const [t, setT] = useCountdown(10, !paused, () => resolve(false));
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Hearts n={hearts} />} center={<Dots i={i} n={5} />} right={<Pill tone="bg-rose-500/20 text-rose-200">☠️ {kills}</Pill>} />
      <TimeBar t={t} max={10} />
      <div key={i} className="anim-in"><Arena e={f.e} hp={shake ? 0 : 100} shake={shake}><div className="mt-3 text-lg font-black text-center">«{f.e.distortion}»</div></Arena></div>
      <div className="text-center text-xs opacity-50">{ARCHETYPES[f.e.archetype].ru}</div>
      <div className="flex-1" />
      <div className="grid grid-cols-2 gap-2">{f.hand.map((id) => <Card key={id} id={id} onClick={() => resolve(id === f.e.native)} />)}</div>
    </div>
  );
}

// ---------------- M24 Post-mortem deck ----------------
const TRADES = [
  { r: +2.4, stop: true, plan: true, emo: "😌", ok: true, err: "" },
  { r: +3.1, stop: false, plan: false, emo: "🤑", ok: false, err: "risk" },
  { r: -1.0, stop: true, plan: true, emo: "😌", ok: true, err: "" },
  { r: -2.8, stop: true, plan: false, emo: "😡", ok: false, err: "revenge" },
  { r: +1.2, stop: true, plan: false, emo: "😱", ok: false, err: "fomo" },
  { r: -1.0, stop: true, plan: true, emo: "😐", ok: true, err: "" },
];
const ERRS = [{ id: "fomo", icon: "🏃", t: "FOMO" }, { id: "revenge", icon: "😡", t: "Месть" }, { id: "risk", icon: "🧯", t: "Без стопа" }];
export function PostMortem({ onEnd }: MechProps) {
  const deck = useMemo(() => shuffle(TRADES), []);
  const [i, setI] = useState(0); const [stage, setStage] = useState<"judge" | "err">("judge"); const [pts, setPts] = useState(0); const [eq, setEq] = useState<number[]>([0]); const fb = useFeedback();
  const tr = deck[i];
  const next = (p: number) => { const tot = pts + p; setPts(tot); setEq([...eq, eq[eq.length - 1] + tr.r]); setStage("judge"); if (i + 1 >= deck.length) setTimeout(() => onEnd({ score: Math.round(tot / deck.length), lesson: "Прибыль с нарушением — ошибка. Убыток по плану — норма.", stats: [["Карточек", `${deck.length}`]] }), 600); else setI(i + 1); };
  const judge = (ok: boolean) => { const good = ok === tr.ok; fb.show(good ? "good" : "bad", !good && tr.r > 0 && !tr.ok ? "Повезло ≠ верно" : undefined); if (good && !tr.ok) setStage("err"); else setTimeout(() => next(good ? 100 : 0), 400); };
  const mn = Math.min(...eq), mx = Math.max(...eq, 1);
  return (
    <div className="flex flex-col h-full gap-3">
      {fb.node}
      <Hud left={<Dots i={i} n={deck.length} />} right={<Pill>📓 {i + 1}/{deck.length}</Pill>} />
      <svg viewBox="0 0 300 60" className="w-full h-14"><polyline fill="none" stroke="#c792ea" strokeWidth={3} points={eq.map((v, k) => `${(k / 6) * 300},${55 - ((v - mn) / (mx - mn || 1)) * 50}`).join(" ")} /></svg>
      <div key={i} className="flex-1 rounded-[28px] bg-gradient-to-br from-violet-600/30 to-[#0b1222] border border-white/10 p-5 flex flex-col items-center justify-center gap-5 anim-in">
        <div className={`text-6xl font-black tabular-nums ${tr.r > 0 ? "text-emerald-300" : "text-rose-400"}`}>{tr.r > 0 ? "+" : ""}{tr.r}R</div>
        <div className="grid grid-cols-3 gap-3 w-full text-center">
          <div className="rounded-2xl bg-white/5 py-3"><div className="text-3xl">🧯</div><div className="font-black">{tr.stop ? "✓" : "✗"}</div></div>
          <div className="rounded-2xl bg-white/5 py-3"><div className="text-3xl">📋</div><div className="font-black">{tr.plan ? "✓" : "✗"}</div></div>
          <div className="rounded-2xl bg-white/5 py-3"><div className="text-3xl">{tr.emo}</div><div className="font-black opacity-50">эмоция</div></div>
        </div>
      </div>
      {stage === "judge" ? (
        <div className="grid grid-cols-2 gap-3"><Big tone="red" onClick={() => judge(false)}>Процесс ✗</Big><Big tone="green" onClick={() => judge(true)}>Процесс ✓</Big></div>
      ) : (
        <div className="grid grid-cols-3 gap-2">{ERRS.map((x) => <Big key={x.id} tone="ghost" onClick={() => { const g = x.id === tr.err; fb.show(g ? "good" : "bad"); setTimeout(() => next(g ? 100 : 50), 400); }}><div className="text-2xl">{x.icon}</div><div className="text-xs">{x.t}</div></Big>)}</div>
      )}
    </div>
  );
}
