"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";

type Trade = { id: number; date: string; market: string; side: string; setup: string; riskUsd: number; netR: number; processPass: boolean; emotion: string; notes: string };

const today = () => new Date().toISOString().slice(0, 10);
const inputCls = "mt-1 w-full rounded-xl border-2 border-[#b0bbdb] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[#2346d6]";

export default function Journal() {
  const { clientId, ready } = useProgress();
  const [list, setList] = useState<Trade[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ date: today(), market: "BTC/USDT", side: "long", setup: "", riskUsd: "20", netR: "", processPass: true, emotion: "", notes: "" });

  const load = useCallback(async () => {
    if (!clientId) return;
    const r = await fetch(`/api/trades?clientId=${clientId}`);
    if (r.ok) setList(((await r.json()) as { trades: Trade[] }).trades);
  }, [clientId]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  const submit = async () => {
    const netR = parseFloat(form.netR);
    if (!Number.isFinite(netR)) return setErr("Укажите результат в R, например −1, 0 или 2.3");
    setErr("");
    setBusy(true);
    const r = await fetch("/api/trades", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, clientId, netR, riskUsd: parseFloat(form.riskUsd) || 0 }) });
    setBusy(false);
    if (!r.ok) return setErr("Не удалось сохранить сделку");
    setForm({ ...form, netR: "", setup: "", notes: "", emotion: "" });
    void load();
  };

  const del = async (id: number) => {
    await fetch(`/api/trades?clientId=${clientId}&id=${id}`, { method: "DELETE" });
    void load();
  };

  const chrono = useMemo(() => [...list].reverse(), [list]);
  const stats = useMemo(() => {
    const real = chrono.filter((t) => t.side !== "no-trade");
    const wins = real.filter((t) => t.netR > 0);
    const total = real.reduce((s, t) => s + t.netR, 0);
    let eq = 0, peak = 0, dd = 0;
    const curve = [0];
    for (const t of chrono) {
      eq += t.netR;
      peak = Math.max(peak, eq);
      dd = Math.max(dd, peak - eq);
      curve.push(eq);
    }
    return {
      n: real.length,
      total,
      wr: real.length ? (wins.length / real.length) * 100 : 0,
      exp: real.length ? total / real.length : 0,
      dd,
      proc: chrono.length ? (chrono.filter((t) => t.processPass).length / chrono.length) * 100 : 0,
      curve,
    };
  }, [chrono]);

  const exportCsv = () => {
    const head = "trade_id,date_utc,market,side,setup,risk_usd,net_R,process_pass,emotion,notes";
    const rows = chrono.map((t, i) => [`T-${String(i + 1).padStart(3, "0")}`, t.date, t.market, t.side, t.setup, t.riskUsd, t.netR, t.processPass, t.emotion, t.notes].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[head, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "signal-arena-journal.csv";
    a.click();
  };

  const W = 560, H = 200;
  const mn = Math.min(0, ...stats.curve), mx = Math.max(1, ...stats.curve);
  const pts = stats.curve.map((v, i) => [10 + (i / Math.max(1, stats.curve.length - 1)) * (W - 20), 10 + (1 - (v - mn) / (mx - mn)) * (H - 20)]);
  const zeroY = 10 + (1 - (0 - mn) / (mx - mn)) * (H - 20);
  const pct = Math.min(100, stats.n);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-xs font-black tracking-[0.25em] text-[#e9b949]">PAPER TRADING</div>
      <h1 className="mt-2 text-4xl font-black">Журнал сделок в R</h1>
      <p className="mt-2 max-w-2xl font-medium text-[#9fb0e6]">Ведите журнал в R, а не в деньгах. Capstone — 100 документированных сделок, максимум три в день. Отказ от сделки (no-trade) тоже записывайте: это 0R и часть процесса.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["СДЕЛОК", `${stats.n}`, ""],
              ["СУММА R", `${stats.total >= 0 ? "+" : "−"}${Math.abs(stats.total).toFixed(2)}`, stats.total >= 0 ? "text-[#15803d]" : "text-[#b91c1c]"],
              ["WIN RATE", `${stats.wr.toFixed(0)}%`, ""],
              ["E / СДЕЛКА", `${stats.exp >= 0 ? "+" : "−"}${Math.abs(stats.exp).toFixed(2)}R`, stats.exp >= 0 ? "text-[#15803d]" : "text-[#b91c1c]"],
              ["МАКС. ПРОСАДКА", `−${stats.dd.toFixed(2)}R`, "text-[#b91c1c]"],
              ["ПРОЦЕСС ОК", `${stats.proc.toFixed(0)}%`, ""],
            ].map(([l, v, c]) => (
              <div key={l} className="card3d px-4 py-3">
                <div className="text-[10px] font-black tracking-widest opacity-60">{l}</div>
                <div className={`font-mono text-2xl font-black ${c}`}>{v}</div>
              </div>
            ))}
            <div className="card3d flex items-center gap-3 px-4 py-3 md:col-span-2">
              <svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="22" fill="none" stroke="#b9c4e0" strokeWidth="8" /><circle cx="28" cy="28" r="22" fill="none" stroke="#e9b949" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 138.2} 138.2`} transform="rotate(-90 28 28)" /></svg>
              <div>
                <div className="text-[10px] font-black tracking-widest opacity-60">ПРОГРЕСС CAPSTONE</div>
                <div className="text-xl font-black">{stats.n} / 100</div>
              </div>
            </div>
          </div>

          <div className="card3d p-4">
            <div className="mb-2 text-sm font-black tracking-widest opacity-70">КРИВАЯ КАПИТАЛА В R</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-[#0a1130]">
              <line x1="0" x2={W} y1={zeroY} y2={zeroY} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 5" />
              {pts.length > 1 && <path d={`M${pts[0][0]} ${zeroY} ` + pts.map((p) => `L${p[0]} ${p[1]}`).join(" ") + ` L${pts[pts.length - 1][0]} ${zeroY}Z`} fill="rgba(34,224,161,0.15)" />}
              {pts.length > 1 && <path d={pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ")} fill="none" stroke="#22e0a1" strokeWidth="3" strokeLinejoin="round" />}
              {pts.length <= 1 && <text x={W / 2} y={H / 2} textAnchor="middle" fill="#8f9ccb" fontSize="14" fontWeight="700">Добавьте первую сделку — появится кривая</text>}
            </svg>
          </div>

          <div className="card3d overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="text-lg font-black">Сделки ({list.length})</div>
              <button className="btn3d btn3d-ghost !py-2 text-sm" onClick={exportCsv} disabled={!list.length}>⬇ CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#141d45] text-left text-white">
                    {["#", "Дата", "Рынок", "Тип", "Сетап", "R", "Процесс", ""].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {list.map((t, i) => (
                    <tr key={t.id} className="border-t border-[#ccd4ea] odd:bg-[#dde3f2]/60">
                      <td className="px-3 py-2 font-mono">{list.length - i}</td>
                      <td className="px-3 py-2">{t.date}</td>
                      <td className="px-3 py-2 font-bold">{t.market}</td>
                      <td className="px-3 py-2">{t.side}</td>
                      <td className="px-3 py-2 max-w-[160px] truncate" title={t.notes}>{t.setup || "—"}</td>
                      <td className={`px-3 py-2 font-mono font-black ${t.netR > 0 ? "text-[#15803d]" : t.netR < 0 ? "text-[#b91c1c]" : ""}`}>{t.netR > 0 ? "+" : ""}{t.netR}R</td>
                      <td className="px-3 py-2">{t.processPass ? "✅" : "⚠️"}</td>
                      <td className="px-3 py-2"><button onClick={() => del(t.id)} className="font-black text-[#b91c1c]" aria-label="Удалить">✕</button></td>
                    </tr>
                  ))}
                  {!list.length && <tr><td colSpan={8} className="px-3 py-8 text-center font-semibold opacity-60">Пока пусто. Первая запись — самый важный шаг.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="card3d h-fit p-5 lg:sticky lg:top-24">
          <div className="text-lg font-black">Новая запись</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs font-extrabold">Дата<input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label className="text-xs font-extrabold">Рынок<input className={inputCls} value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })} /></label>
            <label className="text-xs font-extrabold">Тип
              <select className={inputCls} value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value })}><option>long</option><option>short</option><option>no-trade</option></select>
            </label>
            <label className="text-xs font-extrabold">Результат, R *<input className={inputCls} inputMode="decimal" placeholder="−1 / 0 / 2.3" value={form.netR} onChange={(e) => setForm({ ...form, netR: e.target.value.replace(",", ".").replace("−", "-") })} /></label>
            <label className="col-span-2 text-xs font-extrabold">Сетап<input className={inputCls} placeholder="напр. ретест уровня в тренде" value={form.setup} onChange={(e) => setForm({ ...form, setup: e.target.value })} /></label>
            <label className="text-xs font-extrabold">Риск, $<input className={inputCls} value={form.riskUsd} onChange={(e) => setForm({ ...form, riskUsd: e.target.value })} /></label>
            <label className="text-xs font-extrabold">Эмоция до<input className={inputCls} placeholder="спокойствие" value={form.emotion} onChange={(e) => setForm({ ...form, emotion: e.target.value })} /></label>
            <label className="col-span-2 text-xs font-extrabold">Заметки<textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm font-extrabold">
            <input type="checkbox" checked={form.processPass} onChange={(e) => setForm({ ...form, processPass: e.target.checked })} className="h-5 w-5" />
            Процесс соблюдён (чек-лист, стоп, риск ≤ 1R)
          </label>
          {err && <p className="mt-3 text-sm font-bold text-[#b91c1c]">{err}</p>}
          <button className="btn3d mt-4 w-full" disabled={busy || !clientId} onClick={submit}>{busy ? "Сохраняю…" : "Записать сделку"}</button>
          <p className="mt-3 text-xs font-semibold opacity-60">Уровень закрывается корректным решением, стопом и записью в журнал — а не случайной прибылью.</p>
        </aside>
      </div>
    </div>
  );
}
