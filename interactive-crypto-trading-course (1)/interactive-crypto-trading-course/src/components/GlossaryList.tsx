"use client";

import { useMemo, useState } from "react";

type Item = { term: string; plain: string; work: string };

const strip = (s: string) => s.replace(/`/g, "").replace(/\*\*/g, "");

export function GlossaryList({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((i) => !s || `${i.term} ${i.plain} ${i.work}`.toLowerCase().includes(s));
  }, [q, items]);
  return (
    <div>
      <div className="neo-in mb-6 flex items-center gap-3 p-3 md:p-4">
        <span className="text-xl">🔎</span>
        <input className="field" placeholder={`Поиск по ${items.length} терминам: spread, R, funding…`} value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="kicker shrink-0">{list.length}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((i) => (
          <article key={i.term} className="neo-s p-5">
            <h3 className="headline text-lg text-[var(--blue)]">{strip(i.term)}</h3>
            <p className="mt-2 text-sm font-bold">{strip(i.plain)}</p>
            <p className="mt-2 border-t border-[#d8dfee] pt-2 text-sm font-semibold text-[var(--mute)]">{strip(i.work)}</p>
          </article>
        ))}
        {list.length === 0 && <p className="neo-in p-6 text-center font-black md:col-span-3">Термин не найден. Как и ликвидность в 4 утра.</p>}
      </div>
    </div>
  );
}
