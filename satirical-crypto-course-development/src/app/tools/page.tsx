"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));
const f = (n: number, d = 2) => (Number.isFinite(n) ? n.toLocaleString("ru-RU", { maximumFractionDigits: d, minimumFractionDigits: d }) : "—");

function Box({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return <section className="card p-5"><h2 className="font-head text-2xl text-lime">{title}</h2><p className="text-sm text-muted mb-4">{sub}</p>{children}</section>;
}
function In({ l, v, on }: { l: string; v: string; on: (s: string) => void }) {
  return <label className="text-xs font-mono text-muted block">{l}<input className="input mt-1" inputMode="decimal" value={v} onChange={(e) => on(e.target.value)} /></label>;
}
function Out({ l, v, warn }: { l: string; v: string; warn?: boolean }) {
  return <div className="rounded-xl bg-[#0d1013] border border-line p-3"><div className="font-mono text-[10px] text-muted">{l}</div><div className={`font-head text-2xl ${warn ? "text-bad" : "text-white"}`}>{v}</div></div>;
}

export default function ToolsPage() {
  const [acc, setAcc] = useState("3000"), [rp, setRp] = useState("1"), [en, setEn] = useState("60000"), [st, setSt] = useState("59100"), [fee, setFee] = useState("0.25");
  const risk$ = num(acc) * num(rp) / 100;
  const dist = Math.abs(num(en) - num(st)) / num(en);
  const costPct = num(fee) / 100;
  const notional = risk$ / (dist + costPct);
  const qty = notional / num(en);

  const [e1, setE1] = useState("100"), [s1, setS1] = useState("98"), [x1, setX1] = useState("104");
  const rMul = (num(x1) - num(e1)) / (num(e1) - num(s1));

  const [wr, setWr] = useState("40"), [aw, setAw] = useState("2"), [al, setAl] = useState("1");
  const exp = (num(wr) / 100) * num(aw) - (1 - num(wr) / 100) * num(al);
  const be = num(al) / (num(al) + num(aw)) * 100;

  const [lev, setLev] = useState("10"), [lp, setLp] = useState("60000");
  const mm = 0.005;
  const liqL = num(lp) * (1 - 1 / num(lev) + mm);
  const liqS = num(lp) * (1 + 1 / num(lev) - mm);

  return (
    <div>
      <div className="font-mono text-xs text-lime tracking-widest">ИНСТРУМЕНТЫ · ЦИФРЫ БЕЗ ЭМОЦИЙ</div>
      <h1 className="font-head text-4xl sm:text-5xl mt-1">Калькуляторы паники</h1>
      <p className="text-muted mt-2 max-w-2xl">Считай до входа. После входа считает рынок — и у него другая арифметика. Больше решённых примеров — в <Link href="/workbook" className="text-lime underline">рабочей тетради</Link>.</p>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <Box title="Размер позиции от стопа" sub="Сначала стоп. Потом размер. Наоборот — это азарт с калькулятором.">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3"><In l="СЧЁТ, $" v={acc} on={setAcc} /><In l="РИСК, %" v={rp} on={setRp} /><In l="КОМИССИИ+СКОЛЬЖ., %" v={fee} on={setFee} /><In l="ВХОД" v={en} on={setEn} /><In l="СТОП" v={st} on={setSt} /></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <Out l="РИСК, $ (1R)" v={`$${f(risk$)}`} warn={num(rp) > 1} /><Out l="ДИСТАНЦИЯ СТОПА" v={`${f(dist * 100)}%`} /><Out l="НОМИНАЛ" v={`$${f(notional, 0)}`} /><Out l="КОЛИЧЕСТВО" v={f(qty, 4)} />
          </div>
          {num(rp) > 1 && <p className="text-bad text-sm font-semibold mt-3">Риск выше 1%. Рынок благодарит вас за ликвидность.</p>}
        </Box>

        <Box title="Результат в R" sub="Ты не проиграл $120. Ты оплатил урок номер 14.">
          <div className="grid grid-cols-3 gap-3"><In l="ВХОД" v={e1} on={setE1} /><In l="СТОП" v={s1} on={setS1} /><In l="ВЫХОД" v={x1} on={setX1} /></div>
          <div className="grid grid-cols-2 gap-3 mt-4"><Out l="РЕЗУЛЬТАТ" v={`${rMul > 0 ? "+" : ""}${f(rMul)}R`} warn={rMul < 0} /><Out l="ВЕРДИКТ" v={rMul >= 2 ? "Не привыкай" : rMul >= 0 ? "Бывает" : rMul <= -1.2 ? "Стоп не стоп" : "Штатно"} /></div>
        </Box>

        <Box title="Математическое ожидание" sub="E = WR × W − (1 − WR) × L. Не посчитал — надеешься.">
          <div className="grid grid-cols-3 gap-3"><In l="WIN RATE, %" v={wr} on={setWr} /><In l="СР. ПРИБЫЛЬ, R" v={aw} on={setAw} /><In l="СР. УБЫТОК, R" v={al} on={setAl} /></div>
          <div className="grid grid-cols-2 gap-3 mt-4"><Out l="EXPECTANCY" v={`${exp > 0 ? "+" : ""}${f(exp)}R`} warn={exp < 0} /><Out l="БЕЗУБЫТОЧНЫЙ WR" v={`${f(be, 1)}%`} /></div>
          <p className="text-xs text-muted mt-3">{exp < 0 ? "Отрицательное ожидание. Это не стратегия — это благотворительная программа." : "Положительное — на бумаге. Издержки уже посчитал?"}</p>
        </Box>

        <Box title="Цена ликвидации (оценка)" sub="Изолированная маржа, поддерживающая 0.5%. Реальные формулы — в правилах биржи.">
          <div className="grid grid-cols-2 gap-3"><In l="ПЛЕЧО, ×" v={lev} on={setLev} /><In l="ЦЕНА ВХОДА" v={lp} on={setLp} /></div>
          <div className="grid grid-cols-2 gap-3 mt-4"><Out l="ЛОНГ ЛИКВИДИРУЮТ" v={f(liqL, 0)} warn /><Out l="ШОРТ ЛИКВИДИРУЮТ" v={f(liqS, 0)} warn /></div>
          <p className="text-xs text-muted mt-3">Расстояние до ликвидации: {f((1 / num(lev) - mm) * 100)}%. Плечо не увеличивает деньги — оно уменьшает расстояние.</p>
        </Box>
      </div>
    </div>
  );
}
