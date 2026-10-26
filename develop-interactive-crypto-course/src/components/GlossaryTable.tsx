"use client";

import { useMemo, useState } from "react";

export function GlossaryTable({ items }: { items: { term: string; plain: string; work: string }[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((i) => !s || (i.term + i.plain + i.work).toLowerCase().includes(s));
  }, [q, items]);
  return (
    <div className="mt-6">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Найти термин: ATR, funding, стоп, плечо…"
        className="w-full border-2 border-black bg-[#0b0c13] px-4 py-3 font-mono text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-toxic"
      />
      <div className="mt-2 font-mono text-xs text-zinc-500">
        Найдено {list.length} из {items.length}
      </div>
      <div className="paper mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="font-display uppercase">
              <th className="border-2 border-black bg-toxic/40 p-2">Термин</th>
              <th className="border-2 border-black bg-black/10 p-2">Простое объяснение</th>
              <th className="border-2 border-black bg-black/10 p-2">Рабочее значение в курсе</th>
            </tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.term} className="odd:bg-black/5">
                <td className="border-2 border-black p-2 font-bold">{i.term}</td>
                <td className="border-2 border-black p-2">{i.plain}</td>
                <td className="border-2 border-black p-2 text-sm">{i.work.replace(/`/g, "")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
