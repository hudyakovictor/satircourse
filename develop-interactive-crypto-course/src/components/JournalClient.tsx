"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgress } from "./ProgressProvider";

type Trade = { id: number; pair: string; side: string; setup: string; entry: number; stop: number; exit: number; rResult: number; emotion: string; note: string; createdAt: string };

const inp = "w-full border-2 border-black bg-[#0b0c13] px-3 py-2 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-toxic";

export function JournalClient() {
  const { playerId } = useProgress();
  const [items, setItems] = useState<Trade[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ pair: "BTC/USDT", side: "long", setup: "", entry: "", stop: "", exit: "", emotion: "", note: "" });

  const load = useCallback(async () => {
    if (!playerId) return;
    const r = await fetch(`/api/journal?playerId=${encodeURIComponent(playerId)}`);
    const d = await r.json();
    setItems(d.items ?? []);
  }, [playerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function add() {
    setBusy(true);
    setErr("");
    const r = await fetch("/api/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerId, ...f }) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(d.error ?? "Ошибка");
    setF({ ...f, setup: "", entry: "", stop: "", exit: "", emotion: "", note: "" });
    load();
  }

  async function del(id: number) {
    await fetch(`/api/journal?playerId=${encodeURIComponent(playerId)}&id=${id}`, { method: "DELETE" });
    load();
  }

  const st = useMemo(() => {
    const n = items.length;
    const wins = items.filter((i) => i.rResult > 0);
    const sum = items.reduce((a, i) => a + i.rResult, 0);
    const gw = wins.reduce((a, i) => a + i.rResult, 0);
    const gl = Math.abs(items.filter((i) => i.rResult < 0).reduce((a, i) => a + i.rResult, 0));
    let peak = 0, cur = 0, dd = 0;
    [...items].reverse().forEach((i) => {
      cur += i.rResult;
      peak = Math.max(peak, cur);
      dd = Math.max(dd, peak - cur);
    });
    return { n, wr: n ? (wins.length / n) * 100 : 0, sum, exp: n ? sum / n : 0, pf: gl ? gw / gl : gw ? Infinity : 0, dd };
  }, [items]);

  const verdict =
    st.n === 0
      ? "Журнал пуст. Рынок с интересом ждёт."
      : st.n < 30
        ? "Выборка мала. Это пока анекдот, а не статистика."
        : st.exp > 0
          ? "Ожидание положительное. Не привыкай. Рынок уже заметил твою самоуверенность."
          : "Ожидание отрицательное. Стратегия работает. Жаль, что против тебя.";

  const eq = useMemo(() => {
    let c = 0;
    return [...items].reverse().map((i) => (c += i.rResult));
  }, [items]);
  const W = 600, H = 140;
  const min = Math.min(0, ...eq), max = Math.max(0.1, ...eq);
  const pts = eq.map((v, i) => `${(i / Math.max(1, eq.length - 1)) * W},${H - ((v - min) / (max - min || 1)) * (H - 10) - 5}`).join(" ");

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="ink-panel h-fit p-5">
        <div className="font-display text-2xl uppercase text-paper">Новая запись</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input className={inp} placeholder="Пара" value={f.pair} onChange={(e) => setF({ ...f, pair: e.target.value })} />
          <select className={inp} value={f.side} onChange={(e) => setF({ ...f, side: e.target.value })}>
            <option value="long">LONG</option>
            <option value="short">SHORT</option>
          </select>
          <input className={inp} type="number" placeholder="Вход" value={f.entry} onChange={(e) => setF({ ...f, entry: e.target.value })} />
          <input className={inp} type="number" placeholder="Стоп" value={f.stop} onChange={(e) => setF({ ...f, stop: e.target.value })} />
          <input className={inp} type="number" placeholder="Выход" value={f.exit} onChange={(e) => setF({ ...f, exit: e.target.value })} />
          <input className={inp} placeholder="Сетап" value={f.setup} onChange={(e) => setF({ ...f, setup: e.target.value })} />
        </div>
        <input className={`${inp} mt-2`} placeholder="Эмоция (честно: FOMO, скука, азарт…)" value={f.emotion} onChange={(e) => setF({ ...f, emotion: e.target.value })} />
        <textarea className={`${inp} mt-2 h-20`} placeholder="Вывод: что сделал по плану, что нет" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        {err && <div className="mt-2 border-2 border-blood bg-blood/10 px-3 py-2 font-mono text-sm text-blood">{err}</div>}
        <button disabled={busy || !playerId} onClick={add} className="mt-3 w-full border-2 border-black bg-toxic px-4 py-2 font-display uppercase text-black shadow-[4px_4px_0_#000] disabled:opacity-50">
          Зафиксировать в R
        </button>
        <div className="mt-2 font-mono text-[11px] text-zinc-500">R считается автоматически: (выход − вход) / (вход − стоп).</div>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Сделок", `${st.n}/100`],
            ["Win rate", `${st.wr.toFixed(0)}%`],
            ["Σ R", st.sum.toFixed(2)],
            ["Expectancy", `${st.exp.toFixed(2)}R`],
            ["Макс. просадка", `${st.dd.toFixed(1)}R`],
          ].map(([k, v]) => (
            <div key={k} className="paper p-3 text-center">
              <div className="font-mono text-[10px] uppercase">{k}</div>
              <div className="font-display text-2xl">{v}</div>
            </div>
          ))}
        </div>
        <div className="ink-panel mt-4 p-4">
          <div className="font-mono text-xs uppercase text-zinc-400">Кривая капитала в R</div>
          {eq.length > 1 ? (
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
              <line x1="0" x2={W} y1={H - ((0 - min) / (max - min || 1)) * (H - 10) - 5} y2={H - ((0 - min) / (max - min || 1)) * (H - 10) - 5} stroke="#555" strokeDasharray="4 4" />
              <polyline points={pts} fill="none" stroke="#35e08a" strokeWidth="2.5" />
            </svg>
          ) : (
            <div className="py-6 text-center font-mono text-sm text-zinc-500">Нужно хотя бы две сделки. Одна — это анекдот.</div>
          )}
          <p className="mt-2 font-mono text-sm text-amber-300">» {verdict}</p>
        </div>
        <div className="paper mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="font-display uppercase">
                {["#", "Пара", "Сторона", "Вход", "Стоп", "Выход", "R", "Эмоция", ""].map((h) => (
                  <th key={h} className="border-2 border-black bg-black/10 p-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center">Сделок нет. Рынок не знает, что ты существуешь.</td>
                </tr>
              )}
              {items.map((i, k) => (
                <tr key={i.id} className="odd:bg-black/5" title={i.note}>
                  <td className="border-2 border-black p-2">{items.length - k}</td>
                  <td className="border-2 border-black p-2">{i.pair}</td>
                  <td className="border-2 border-black p-2">{i.side.toUpperCase()}</td>
                  <td className="border-2 border-black p-2">{i.entry}</td>
                  <td className="border-2 border-black p-2">{i.stop}</td>
                  <td className="border-2 border-black p-2">{i.exit}</td>
                  <td className={`border-2 border-black p-2 font-bold ${i.rResult >= 0 ? "text-emerald-700" : "text-red-700"}`}>{i.rResult > 0 ? "+" : ""}{i.rResult}R</td>
                  <td className="border-2 border-black p-2">{i.emotion || "—"}</td>
                  <td className="border-2 border-black p-2">
                    <button onClick={() => del(i.id)} className="text-xs underline">удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
