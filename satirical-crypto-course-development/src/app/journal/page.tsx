"use client";

import { useMemo, useState } from "react";
import { usePlayer } from "@/components/PlayerProvider";
import { Icon } from "@/components/Icon";

const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "—");

export default function JournalPage() {
  const { state, call, error, loading } = usePlayer();
  const [f, setF] = useState({ pair: "BTC/USDT", side: "long", setup: "", entry: "", stop: "", resultR: "", riskR: "1", followedProcess: true, note: "" });
  const [busy, setBusy] = useState(false);
  const trades = useMemo(() => state?.trades ?? [], [state]);

  const stats = useMemo(() => {
    const chrono = [...trades].reverse();
    const n = chrono.length;
    const wins = chrono.filter((t) => t.resultR > 0);
    const losses = chrono.filter((t) => t.resultR < 0);
    const sum = chrono.reduce((a, t) => a + t.resultR, 0);
    const avgW = wins.length ? wins.reduce((a, t) => a + t.resultR, 0) / wins.length : 0;
    const avgL = losses.length ? losses.reduce((a, t) => a + t.resultR, 0) / losses.length : 0;
    let eq = 0, peak = 0, dd = 0;
    const curve = [0];
    for (const t of chrono) { eq += t.resultR; curve.push(eq); peak = Math.max(peak, eq); dd = Math.min(dd, eq - peak); }
    const proc = n ? (chrono.filter((t) => t.followedProcess).length / n) * 100 : 0;
    const today = trades.filter((t) => new Date(t.createdAt).toDateString() === new Date().toDateString()).length;
    return { n, wr: n ? (wins.length / n) * 100 : 0, avgW, avgL, exp: n ? sum / n : 0, sum, dd, proc, curve, today };
  }, [trades]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await call("/api/trade", "POST", f);
    setBusy(false);
    if (ok) setF({ ...f, setup: "", entry: "", stop: "", resultR: "", note: "" });
  };

  const W = 560, H = 180;
  const c = stats.curve;
  const mn = Math.min(...c, -1), mx = Math.max(...c, 1);
  const pts = c.map((v, i) => `${(i / Math.max(1, c.length - 1)) * (W - 20) + 10},${H - 14 - ((v - mn) / (mx - mn || 1)) * (H - 28)}`).join(" ");
  const zeroY = H - 14 - ((0 - mn) / (mx - mn || 1)) * (H - 28);

  return (
    <div>
      <div className="font-mono text-xs text-lime tracking-widest">КАПСТОУН · 100 СДЕЛОК · ≤ 3 В ДЕНЬ</div>
      <h1 className="font-head text-4xl sm:text-5xl mt-1">Журнал сделок</h1>
      <p className="text-muted mt-2 max-w-2xl">Протокол твоих заблуждений. Записывай в R, не в деньгах. Результат без процесса — просто чей-то удачный вторник.</p>

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
        {[
          ["СДЕЛОК", `${stats.n}/100`, "#c6ff1a"], ["WIN RATE", `${fmt(stats.wr, 0)}%`, "#22d3ee"], ["EXPECTANCY", `${stats.exp >= 0 ? "+" : ""}${fmt(stats.exp)}R`, stats.exp >= 0 ? "#9dff3a" : "#ff4d5a"],
          ["ИТОГО", `${stats.sum >= 0 ? "+" : ""}${fmt(stats.sum, 1)}R`, stats.sum >= 0 ? "#9dff3a" : "#ff4d5a"], ["МАКС. DD", `${fmt(stats.dd, 1)}R`, "#ff4d5a"], ["ПРОЦЕСС", `${fmt(stats.proc, 0)}%`, stats.proc >= 90 ? "#9dff3a" : "#ffb020"],
        ].map(([l, v, col]) => (
          <div key={l} className="card p-4"><div className="font-mono text-[10px] text-muted">{l}</div><div className="font-head text-3xl mt-1" style={{ color: col }}>{v}</div></div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6 mt-6">
        <form onSubmit={submit} className="card p-5 space-y-3 h-fit">
          <div className="font-head text-2xl">Новая запись</div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-mono text-muted">ПАРА<input className="input mt-1" value={f.pair} onChange={(e) => setF({ ...f, pair: e.target.value })} /></label>
            <div className="text-xs font-mono text-muted">СТОРОНА
              <div className="grid grid-cols-2 gap-2 mt-1">
                {["long", "short"].map((s) => <button type="button" key={s} onClick={() => setF({ ...f, side: s })} className={`rounded-xl border-2 py-2 font-head ${f.side === s ? (s === "long" ? "border-good text-good bg-good/10" : "border-bad text-bad bg-bad/10") : "border-line text-muted"}`}>{s === "long" ? "ЛОНГ" : "ШОРТ"}</button>)}
              </div>
            </div>
          </div>
          <label className="block text-xs font-mono text-muted">СЕТАП / ТРИГГЕР<input className="input mt-1" value={f.setup} onChange={(e) => setF({ ...f, setup: e.target.value })} placeholder="ретест уровня на объёме" /></label>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs font-mono text-muted">ВХОД<input className="input mt-1" inputMode="decimal" value={f.entry} onChange={(e) => setF({ ...f, entry: e.target.value })} /></label>
            <label className="text-xs font-mono text-muted">СТОП<input className="input mt-1" inputMode="decimal" value={f.stop} onChange={(e) => setF({ ...f, stop: e.target.value })} /></label>
            <label className="text-xs font-mono text-muted">РИСК, R<input className="input mt-1" inputMode="decimal" value={f.riskR} onChange={(e) => setF({ ...f, riskR: e.target.value })} /></label>
          </div>
          <label className="block text-xs font-mono text-muted">ИТОГ В R (нетто: −1 = плановый стоп)<input required className="input mt-1" inputMode="decimal" value={f.resultR} onChange={(e) => setF({ ...f, resultR: e.target.value })} placeholder="-1 / 0 / 2.1" /></label>
          <label className="block text-xs font-mono text-muted">ЗАМЕТКА<textarea className="input mt-1" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Что рынок сделал вместо того, что ты ожидал" /></label>
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="accent-[#c6ff1a] w-4 h-4" checked={f.followedProcess} onChange={(e) => setF({ ...f, followedProcess: e.target.checked })} />Правила соблюдены (стоп до входа, риск ≤ 1R)</label>
          {stats.today >= 3 && <p className="text-bad text-sm font-semibold">Лимит дня: 3 сделки. Следующая запись — это уже не дисциплина, а хобби.</p>}
          {error && <p className="text-bad text-sm font-semibold">{error}</p>}
          <button className="btn btn-solid drip w-full" disabled={busy || !f.resultR}>Записать в протокол</button>
        </form>

        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex justify-between items-baseline"><div className="font-head text-2xl">Кривая капитала, R</div><div className="font-mono text-xs text-muted">ДО {Math.max(0, 100 - stats.n)} СДЕЛОК ДО ЗАЩИТЫ</div></div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-2" role="img" aria-label="Кривая капитала в R">
              <line x1={10} x2={W - 10} y1={zeroY} y2={zeroY} stroke="#2b3139" strokeDasharray="5 5" />
              <polyline points={pts} fill="none" stroke="#c6ff1a" strokeWidth={3} strokeLinejoin="round" />
              {c.length > 1 && <circle cx={W - 10} cy={H - 14 - ((c[c.length - 1] - mn) / (mx - mn || 1)) * (H - 28)} r={5} fill="#c6ff1a" />}
            </svg>
            <div className="h-2 rounded bg-line mt-2 overflow-hidden"><div className="h-full bg-lime" style={{ width: `${Math.min(100, stats.n)}%` }} /></div>
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-3 font-head text-2xl border-b border-line">Протокол ({trades.length})</div>
            {loading ? <div className="p-6 text-muted">Загружаем твои ошибки…</div> : trades.length === 0 ? (
              <div className="p-8 text-center text-muted"><Icon name="journal" size={40} /><p className="mt-2">Пусто. Подозрительно чисто.<br />Рынок ничего не помнит. Журнал — помнит.</p></div>
            ) : (
              <div className="scroll-x"><table className="w-full text-sm">
                <thead><tr className="text-left font-mono text-[11px] text-muted"><th className="px-4 py-2">ДАТА</th><th>ПАРА</th><th>СЕТАП</th><th>R</th><th>ПРОЦЕСС</th><th /></tr></thead>
                <tbody>{trades.map((t) => (
                  <tr key={t.id} className="border-t border-line">
                    <td className="px-4 py-2 font-mono text-xs text-muted whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString("ru-RU")}</td>
                    <td className="font-semibold whitespace-nowrap"><span className={t.side === "long" ? "text-good" : "text-bad"}>{t.side === "long" ? "▲" : "▼"}</span> {t.pair}</td>
                    <td className="text-muted max-w-[220px] truncate" title={t.note}>{t.setup || "—"}</td>
                    <td className={`font-mono font-extrabold ${t.resultR >= 0 ? "text-good" : "text-bad"}`}>{t.resultR > 0 ? "+" : ""}{t.resultR}R</td>
                    <td>{t.followedProcess ? <span className="text-good">✓</span> : <span className="text-bad">✗</span>}</td>
                    <td><button className="text-muted hover:text-bad text-xs px-2" onClick={() => call(`/api/trade?id=${t.id}`, "DELETE")} aria-label="Удалить запись">✕</button></td>
                  </tr>))}</tbody>
              </table></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
