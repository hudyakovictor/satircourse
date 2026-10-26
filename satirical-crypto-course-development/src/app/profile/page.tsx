"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlayer } from "@/components/PlayerProvider";
import { Art } from "@/components/art";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/Mascot";
import { GLITCHES, RANKS } from "@/data/meta";
import { LESSONS, LEVEL_XP, MODULES, getLesson } from "@/lib/course";

export default function ProfilePage() {
  const { state, call, loading } = usePlayer();
  const [name, setName] = useState("");
  if (loading || !state) return <div className="text-muted">Выписываем тебе досье…</div>;

  const xp = state.xp;
  const lvl = Math.floor(xp / LEVEL_XP);
  const rank = RANKS[Math.min(lvl, RANKS.length - 1)];
  const rows = Object.values(state.lessons);
  const done = rows.filter((r) => r.completedAt).length;
  const now = Date.now();
  const due = rows.filter((r) => r.recallDue && new Date(r.recallDue).getTime() <= now && r.recallStage < 5);
  const passedExams = new Set(rows.filter((r) => r.passed).map((r) => r.lessonId));
  const certs = MODULES.filter((m) => passedExams.has(m.lessons[m.lessons.length - 1]));

  return (
    <div>
      <div className="font-mono text-xs text-lime tracking-widest">ДОСЬЕ УЧАСТНИКА СИСТЕМЫ</div>
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center mt-2">
        <div>
          <h1 className="font-head text-4xl sm:text-5xl">{state.player.name}</h1>
          <p className="text-muted mt-1">Звание: <b className="text-lime">{rank}</b> · Уровень {lvl + 1} · Ты здесь ради денег. Это зафиксировано.</p>
          <form className="flex gap-2 mt-3 max-w-sm" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { call("/api/state", "PATCH", { name }); setName(""); } }}>
            <input className="input" placeholder="Сменить позывной" value={name} onChange={(e) => setName(e.target.value)} maxLength={32} />
            <button className="btn !py-2 !text-base">ОК</button>
          </form>
        </div>
        <Mascot size={110} mood="smug" className="floaty hidden md:block" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        <Stat l="XP" v={`${xp % LEVEL_XP} / ${LEVEL_XP}`} c="#c6ff1a" /><Stat l="УРОВНЕЙ ПРОЙДЕНО" v={`${done} / 100`} c="#22d3ee" /><Stat l="СЕРИЯ ДНЕЙ" v={`${state.streak}`} c="#ffb020" /><Stat l="СДЕЛОК В ЖУРНАЛЕ" v={`${state.trades.length}`} c="#ff2d95" />
      </div>

      <section className="mt-10">
        <h2 className="font-head text-3xl">Департаменты</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {MODULES.map((m) => {
            const d = m.lessons.filter((i) => state.lessons[i]?.completedAt).length;
            return (
              <Link key={m.id} href={`/module/${m.id}`} className="card p-4 hover:border-[var(--ac)] transition" style={{ ["--ac" as string]: m.accent }}>
                <div className="flex items-center justify-between"><span className="font-head text-3xl" style={{ color: m.accent }}>{m.id}</span><Icon name={m.icon} color={m.accent} /></div>
                <div className="text-xs text-muted mt-1 line-clamp-2 min-h-8">{m.title}</div>
                <div className="h-1.5 rounded bg-line mt-3 overflow-hidden"><div className="h-full" style={{ width: `${d * 10}%`, background: m.accent }} /></div>
                <div className="font-mono text-[11px] mt-1" style={{ color: m.accent }}>{d}/{m.lessons.length}</div>
              </Link>
            );
          })}
        </div>
        {certs.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{certs.map((m) => <span key={m.id} className="stamp border-2 border-lime text-lime font-head px-3 py-1 rounded-lg text-sm">СЕРТИФИКАТ · {m.title}</span>)}</div>}
      </section>

      <section className="mt-10">
        <h2 className="font-head text-3xl">Повторения <span className="text-muted text-xl">+1 · +3 · +7 · +16 · +35 дней</span></h2>
        {due.length === 0 ? (
          <p className="text-muted mt-2">Нечего повторять. Либо ты гений, либо ещё ничего не решал. Рынок склоняется ко второму.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {due.map((r) => {
              const l = getLesson(r.lessonId)!;
              return (
                <div key={r.lessonId} className="card p-4">
                  <div className="font-mono text-xs text-lime">{l.id} · ПОВТОР {r.recallStage + 1}/5</div>
                  <p className="text-sm mt-2 text-[#d7dbe0] line-clamp-5">{l.cards[2].text}</p>
                  <p className="text-xs text-muted mt-2">Ты тогда решил: <b className="text-white">{r.decision?.action}</b>, инвалидация — {r.decision?.invalidation}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="btn !py-2 !text-base" onClick={() => call("/api/lesson", "POST", { lessonId: l.id, action: "recall", remembered: true })}>Помню</button>
                    <button className="btn btn-danger !py-2 !text-base" onClick={() => call("/api/lesson", "POST", { lessonId: l.id, action: "recall", remembered: false })}>Забыл — вернуть завтра</button>
                    <Link href={`/lesson/${l.id}`} className="btn btn-ghost !py-2 !text-base">Открыть</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-head text-3xl">Секретные глитчи Скрепки</h2>
        <p className="text-muted mt-1 text-sm max-w-2xl">Шесть необязательных юмористических карточек. Они не дают сигналов, не повышают риск-лимит и не дают права увеличить размер. Открываются серией дней или экзаменом модуля.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {GLITCHES.map((g) => {
            const open = state.streak >= g.n || passedExams.has(LESSONS.find((l) => l.module === g.exam && l.isExam)!.id);
            return (
              <div key={g.n} className="card overflow-hidden">
                <div className={`art-frame !rounded-none relative ${open ? "" : "grayscale blur-[3px] opacity-60"}`}>
                  <Art motif={g.motif} seedKey={`glitch-${g.n}`} accent={g.accent} tag={`GLITCH 0${g.n}`} caption={g.title} mascot mood={g.n % 2 ? "worried" : "dead"} />
                  {!open && <div className="absolute inset-0 flex items-center justify-center"><Icon name="lock" size={56} color="#fff" /></div>}
                </div>
                <div className="p-4">
                  <div className="font-head text-lg" style={{ color: g.accent }}>{open ? g.title : "Заблокировано"}</div>
                  <p className="text-[13px] text-muted mt-1">{open ? g.text : `Серия ${g.n} дн. подряд или экзамен модуля ${g.exam}. Рынок любит последовательность.`}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ l, v, c }: { l: string; v: string; c: string }) {
  return <div className="card p-4"><div className="font-mono text-[10px] text-muted">{l}</div><div className="font-head text-3xl mt-1" style={{ color: c }}>{v}</div></div>;
}
