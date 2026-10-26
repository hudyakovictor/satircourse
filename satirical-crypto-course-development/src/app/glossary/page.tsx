"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GLOSSARY } from "@/lib/course";

export default function GlossaryPage() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return GLOSSARY.filter((g) => !s || `${g.term} ${g.plain} ${g.work}`.toLowerCase().includes(s));
  }, [q]);
  return (
    <div>
      <div className="font-mono text-xs text-lime tracking-widest">ПРИЛОЖЕНИЕ · ТЕРМИНОЛОГИЧЕСКИЙ СТАНДАРТ</div>
      <h1 className="font-head text-4xl sm:text-5xl mt-1">Глоссарий без лишнего жаргона</h1>
      <p className="text-muted mt-2 max-w-2xl">Ликвидность — это когда деньги исчезают достаточно быстро, чтобы никто не успел задать вопросы. Ниже — определения чуть полезнее.</p>
      <div className="flex flex-wrap gap-3 mt-5 items-center">
        <input className="input max-w-md" placeholder="Поиск: ATR, funding, спред…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="font-mono text-xs text-muted">{rows.length} из {GLOSSARY.length}</span>
        <Link href="/workbook" className="btn btn-ghost ml-auto !py-2 !text-base">Рабочая тетрадь →</Link>
      </div>
      <div className="card mt-5 overflow-hidden">
        <div className="scroll-x">
          <table className="w-full text-sm">
            <thead><tr className="bg-lime text-ink font-head text-left uppercase tracking-wide"><th className="px-4 py-2.5">Термин</th><th className="px-4">Простое объяснение</th><th className="px-4">Рабочее значение в курсе</th></tr></thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.term} className="border-t border-line align-top hover:bg-white/[0.03]">
                  <td className="px-4 py-2.5 font-semibold text-white whitespace-nowrap">{g.term}</td>
                  <td className="px-4 py-2.5 text-[#cfd5dc]">{g.plain}</td>
                  <td className="px-4 py-2.5 text-muted">{g.work.replace(/`/g, "")}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted">Такого термина нет. Возможно, его придумал инфлюенсер вчера.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
