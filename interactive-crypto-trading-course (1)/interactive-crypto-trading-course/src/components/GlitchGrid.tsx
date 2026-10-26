"use client";

import { useEffect, useState, type ReactNode } from "react";

type G = { n: number; title: string; text: string; art: ReactNode };

export function GlitchGrid({ items }: { items: G[] }) {
  const [open, setOpen] = useState<number[]>([]);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(JSON.parse(localStorage.getItem("signal-arena:glitches") || "[]"));
    } catch {}
  }, []);
  const toggle = (n: number) => {
    const next = open.includes(n) ? open.filter((x) => x !== n) : [...open, n];
    setOpen(next);
    localStorage.setItem("signal-arena:glitches", JSON.stringify(next));
  };
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {items.map((g) => {
        const on = open.includes(g.n);
        return (
          <article key={g.n} className="neo p-3" style={{ borderRadius: 38 }}>
            <div className="relative overflow-hidden" style={{ borderRadius: 30, filter: on ? "none" : "grayscale(1) blur(3px)", transition: "filter .4s" }}>{g.art}</div>
            <div className="p-4">
              <div className="kicker">Glitch 0{g.n}</div>
              <h3 className="headline mt-1 text-xl">«{g.title}»</h3>
              {on ? (
                <p className="pop mt-3 text-sm font-semibold leading-relaxed">{g.text}</p>
              ) : (
                <p className="mt-3 text-sm font-bold text-[var(--mute)]">🔒 Награда выдаётся за недельный streak дисциплины. Совесть — единственный аудитор.</p>
              )}
              <button onClick={() => toggle(g.n)} data-on={on} className="neo-btn mt-4 px-5 py-2 text-sm">
                {on ? "Спрятать" : "Я выдержал неделю без revenge-сделок"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
