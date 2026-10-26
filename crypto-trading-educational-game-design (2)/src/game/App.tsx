"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { GROUPS, MECHS, MECH_BY_ID, groupOf, starsFor, type Group, type Mech } from "./registry";
import { COMPONENTS } from "./mechanics";
import type { Result } from "./kit";
import { authHeader, closingConfirm, cloudGet, cloudSet, haptic, initTelegram, setBack, tg, tgUser } from "@/tma/tg";
import { isMuted, setMuted, sfx } from "@/tma/sfx";

type Phase = "splash" | "count" | "play" | "result";
type Best = Record<string, number>;
const KEY = "sa_lab_best_v1";

export default function App() {
  const [best, setBest] = useState<Best>({});
  const [filter, setFilter] = useState<Group | "all">("all");
  const [cur, setCur] = useState<Mech | null>(null);
  const [phase, setPhase] = useState<Phase>("splash");
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setM] = useState(false);
  const [name, setName] = useState("Кадет");

  useEffect(() => {
    initTelegram();
    const u = tgUser(); if (u?.first_name) setName(u.first_name);
    cloudGet(KEY).then((v) => { if (v) try { setBest(JSON.parse(v)); } catch { /* */ } });
    const m = localStorage.getItem("sa_muted") === "1"; setMuted(m); setM(m);
  }, []);

  // Interruptions: pause on background (mobile-games skill)
  useEffect(() => {
    const onVis = () => { if (document.hidden) setPaused(true); };
    document.addEventListener("visibilitychange", onVis);
    const w = tg(); const deact = () => setPaused(true);
    w?.onEvent("deactivated", deact);
    return () => { document.removeEventListener("visibilitychange", onVis); w?.offEvent("deactivated", deact); };
  }, []);

  const toHub = useCallback(() => { setCur(null); setResult(null); setPaused(false); closingConfirm(false); }, []);
  const open = (m: Mech) => { haptic.tap(); sfx.whoosh(); setCur(m); setPhase("splash"); setResult(null); };
  const start = () => { setPhase("count"); setPaused(false); };

  // Telegram native BackButton routing
  useEffect(() => {
    if (!cur) { setBack(null); return; }
    if (phase === "play") setBack(() => setPaused(true));
    else setBack(toHub);
  }, [cur, phase, toHub]);
  useEffect(() => { closingConfirm(phase === "play" && !!cur); }, [phase, cur]);

  const onEnd = useCallback((r: Result) => {
    if (!cur) return;
    const score = Math.round(Math.max(0, Math.min(100, r.score)));
    setResult({ ...r, score }); setPhase("result"); closingConfirm(false);
    const s = starsFor(score); if (s >= 2) { sfx.win(); haptic.ok(); } else { sfx.lose(); haptic.warn(); }
    setBest((b) => { const nb = { ...b, [cur.id]: Math.max(b[cur.id] ?? 0, score) }; cloudSet(KEY, JSON.stringify(nb)); return nb; });
    fetch("/api/tma/run", { method: "POST", headers: { "content-type": "application/json", ...authHeader() }, body: JSON.stringify({ mechanic: cur.id, score, stars: s }) }).catch(() => {});
  }, [cur]);

  const totalStars = MECHS.reduce((a, m) => a + starsFor(best[m.id] ?? -1), 0);

  if (cur) {
    const g = groupOf(cur.group);
    const idx = MECHS.findIndex((m) => m.id === cur.id);
    return (
      <Screen color={g.color}>
        {phase === "splash" && <Splash m={cur} best={best[cur.id]} onPlay={start} onClose={toHub} />}
        {phase === "count" && <Countdown onDone={() => { setPhase("play"); setRunKey((k) => k + 1); }} />}
        {phase === "play" && (
          <PlayFrame m={cur} paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)} onExit={toHub} onRestart={() => { setPaused(false); setPhase("count"); }}>
            <MechHost key={runKey} id={cur.id} onEnd={onEnd} paused={paused} />
          </PlayFrame>
        )}
        {phase === "result" && result && (
          <ResultView m={cur} r={result} best={best[cur.id] ?? 0} onRetry={() => setPhase("count")} onMenu={toHub}
            onNext={() => { const n = MECHS[(idx + 1) % MECHS.length]; setCur(n); setPhase("splash"); setResult(null); }} />
        )}
      </Screen>
    );
  }

  const list = MECHS.filter((m) => filter === "all" || m.group === filter);
  return (
    <div className="h-dvh flex flex-col bg-[#05080f] text-white safe-top">
      <header className="px-4 pt-3 pb-2 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-400 grid place-items-center font-black text-lg">{name[0]}</div>
        <div className="flex-1 leading-tight">
          <div className="text-[11px] font-black tracking-[.2em] text-white/40">SIGNAL ARENA</div>
          <div className="text-xl font-black">Лаборатория механик</div>
        </div>
        <div className="rounded-2xl bg-amber-300/15 px-3 py-2 font-black text-amber-200">⭐ {totalStars}<span className="text-amber-200/40">/99</span></div>
        <button aria-label="Звук" onClick={() => { const m = !isMuted(); setMuted(m); setM(m); localStorage.setItem("sa_muted", m ? "1" : "0"); haptic.tap(); }} className="w-11 h-11 rounded-2xl bg-white/5 text-xl">{muted ? "🔇" : "🔊"}</button>
      </header>
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
        <Chip on={filter === "all"} onClick={() => setFilter("all")} color="#ffffff">✦ Все {MECHS.length}</Chip>
        {GROUPS.map((g) => <Chip key={g.id} on={filter === g.id} onClick={() => setFilter(g.id)} color={g.color}>{g.icon} {g.name}</Chip>)}
      </div>
      <main className="flex-1 overflow-y-auto px-3 pb-8 safe-bottom">
        <div className="grid grid-cols-3 gap-2.5">
          {list.map((m, k) => {
            const g = groupOf(m.group); const st = starsFor(best[m.id] ?? -1);
            return (
              <button key={m.id} onClick={() => open(m)} style={{ animationDelay: `${k * 25}ms`, background: `radial-gradient(120% 90% at 50% 0%, ${g.color}55, #0b1020 70%)` }}
                className="relative aspect-[4/5] rounded-[22px] border border-white/10 flex flex-col items-center justify-center gap-1 p-2 active:scale-95 transition anim-in">
                <span className="absolute left-2 top-2 text-[10px] font-black text-white/50">{m.code}</span>
                <span className="text-[44px] leading-none drop-shadow-[0_6px_18px_rgba(0,0,0,.5)]">{m.icon}</span>
                <span className="text-[12px] font-black text-center leading-tight line-clamp-2">{m.name}</span>
                <span className="text-[11px] tracking-tighter">{[0, 1, 2].map((i) => <span key={i} className={i < st ? "" : "opacity-20 grayscale"}>⭐</span>)}</span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function Chip({ on, onClick, color, children }: { on: boolean; onClick: () => void; color: string; children: React.ReactNode }) {
  return <button onClick={() => { haptic.select(); onClick(); }} className={`shrink-0 h-10 rounded-full px-4 text-sm font-black transition ${on ? "text-[#05080f]" : "bg-white/5 text-white/70"}`} style={on ? { background: color } : undefined}>{children}</button>;
}

function Screen({ color, children }: { color: string; children: React.ReactNode }) {
  return <div className="h-dvh overflow-hidden text-white safe-top safe-bottom" style={{ background: `radial-gradient(140% 70% at 50% -10%, ${color}40, #05080f 60%)` }}>{children}</div>;
}

function Splash({ m, best, onPlay, onClose }: { m: Mech; best?: number; onPlay: () => void; onClose: () => void }) {
  const g = groupOf(m.group); const st = starsFor(best ?? -1);
  return (
    <div className="h-full flex flex-col px-5 pb-5">
      <div className="h-12 flex items-center justify-between">
        <button onClick={onClose} className="w-11 h-11 rounded-full bg-white/10 text-lg" aria-label="Закрыть">✕</button>
        <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: g.color + "33", color: g.color }}>{g.icon} {g.name}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl rounded-full anim-glow" style={{ background: g.color }} />
          <div className="relative text-[120px] leading-none anim-float">{m.icon}</div>
        </div>
        <div className="text-xs font-black tracking-[.3em] text-white/40">{m.code}</div>
        <h1 className="text-4xl font-black leading-none">{m.name}</h1>
        <p className="text-lg text-white/70 font-bold">{m.goal}</p>
        <div className="flex gap-2 flex-wrap justify-center">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/60">🃏 {m.skill}</span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/60">🧪 {m.science}</span>
        </div>
        {best != null && <div className="text-2xl">{[0, 1, 2].map((i) => <span key={i} className={i < st ? "" : "opacity-20 grayscale"}>⭐</span>)}</div>}
      </div>
      <button onClick={() => { sfx.go(); haptic.hit(); onPlay(); }} className="h-16 rounded-3xl font-black text-xl text-[#05080f] active:scale-95 transition anim-pulse-soft" style={{ background: g.color }}>▶ ИГРАТЬ</button>
    </div>
  );
}

function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);
  const done = useRef(onDone); done.current = onDone;
  useEffect(() => {
    sfx.count(); haptic.tap();
    const id = setInterval(() => setN((x) => { const v = x - 1; if (v > 0) { sfx.count(); haptic.tap(); } else if (v === 0) { sfx.go(); haptic.hit(); } else { clearInterval(id); setTimeout(() => done.current(), 0); } return v; }), 600);
    return () => clearInterval(id);
  }, []);
  return <div className="h-full grid place-items-center"><div key={n} className="text-[140px] font-black anim-count">{n > 0 ? n : "GO"}</div></div>;
}

function PlayFrame({ m, paused, onPause, onResume, onExit, onRestart, children }: { m: Mech; paused: boolean; onPause: () => void; onResume: () => void; onExit: () => void; onRestart: () => void; children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col px-3 pb-3 relative">
      <div className="h-11 flex items-center gap-2">
        <button onClick={() => { haptic.tap(); onPause(); }} className="w-10 h-10 rounded-full bg-white/10 font-black" aria-label="Пауза">❚❚</button>
        <span className="text-sm font-black text-white/50">{m.icon} {m.name}</span>
      </div>
      <div className="flex-1 min-h-0 relative">{children}</div>
      {paused && (
        <div className="absolute inset-0 z-50 bg-[#05080f]/85 backdrop-blur flex flex-col items-center justify-center gap-3 px-8 anim-in">
          <div className="text-7xl mb-4">⏸</div>
          <button onClick={onResume} className="w-full h-16 rounded-3xl bg-white text-[#05080f] font-black text-xl">▶ Продолжить</button>
          <button onClick={onRestart} className="w-full h-14 rounded-3xl bg-white/10 font-black">↻ Заново</button>
          <button onClick={onExit} className="w-full h-14 rounded-3xl bg-white/5 font-black text-white/60">☰ В меню</button>
        </div>
      )}
    </div>
  );
}

function MechHost({ id, onEnd, paused }: { id: string; onEnd: (r: Result) => void; paused: boolean }) {
  const C = COMPONENTS[id];
  const ended = useRef(false);
  const end = useCallback((r: Result) => { if (ended.current) return; ended.current = true; onEnd(r); }, [onEnd]);
  return <C onEnd={end} paused={paused} />;
}

function ResultView({ m, r, best, onRetry, onMenu, onNext }: { m: Mech; r: Result; best: number; onRetry: () => void; onMenu: () => void; onNext: () => void }) {
  const st = starsFor(r.score); const g = groupOf(m.group);
  const [shown, setShown] = useState(0); const [num, setNum] = useState(0);
  useEffect(() => {
    const ts = [0, 1, 2].map((i) => setTimeout(() => { if (i < st) { setShown(i + 1); sfx.star(i); haptic.tap(); } }, 350 + i * 330));
    let v = 0; const id = setInterval(() => { v = Math.min(r.score, v + Math.max(1, Math.ceil(r.score / 25))); setNum(v); if (v >= r.score) clearInterval(id); }, 30);
    return () => { ts.forEach(clearTimeout); clearInterval(id); };
  }, [st, r.score]);
  return (
    <div className="h-full flex flex-col px-5 pb-5">
      <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center">
        <div className="text-7xl anim-float">{st === 3 ? "🏆" : st === 2 ? "🎉" : st === 1 ? "💪" : "🌱"}</div>
        <div className="flex gap-2 text-6xl">{[0, 1, 2].map((i) => <span key={i} className={i < shown ? "anim-star" : "opacity-15 grayscale"}>⭐</span>)}</div>
        <div className="text-7xl font-black tabular-nums" style={{ color: g.color }}>{num}</div>
        {r.score >= best && r.score > 0 && <div className="rounded-full bg-amber-300 text-[#05080f] px-3 py-1 text-xs font-black anim-pop">НОВЫЙ РЕКОРД</div>}
        <p className="text-lg font-bold text-white/80 max-w-xs">{r.lesson}</p>
        {r.stats && <div className="flex gap-2 flex-wrap justify-center">{r.stats.map(([k, v]) => <span key={k} className="rounded-2xl bg-white/5 px-3 py-2 text-sm"><span className="text-white/50">{k}</span> <b>{v}</b></span>)}</div>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => { haptic.tap(); onMenu(); }} className="h-16 rounded-3xl bg-white/10 font-black text-lg">☰</button>
        <button onClick={() => { haptic.tap(); onRetry(); }} className="h-16 rounded-3xl bg-white/10 font-black text-lg">↻</button>
        <button onClick={() => { haptic.tap(); onNext(); }} className="h-16 rounded-3xl font-black text-lg text-[#05080f]" style={{ background: g.color }}>▶</button>
      </div>
    </div>
  );
}
export { MECH_BY_ID };
