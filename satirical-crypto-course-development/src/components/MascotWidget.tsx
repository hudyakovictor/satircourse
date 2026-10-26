"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Mascot } from "./Mascot";
import { ANALOG_BITS, HELLO_LINES, PAPERCLIP_GREETING } from "@/data/meta";

export function MascotWidget({ clips }: { clips: Record<string, string> }) {
  const path = usePathname();
  const [line, setLine] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<"tired" | "smug" | "worried" | "dead">("tired");
  const clicks = useRef(0);

  useEffect(() => {
    const greeted = typeof window !== "undefined" && localStorage.getItem("sa_greeted");
    if (!greeted) {
      setLine(PAPERCLIP_GREETING);
      setMood("smug");
      setOpen(true);
      localStorage.setItem("sa_greeted", "1");
      return;
    }
    const m = path.match(/^\/lesson\/([A-J]\d+)/);
    if (m && clips[m[1]]) {
      setLine(clips[m[1]]);
      setMood("tired");
      setOpen(true);
      const t = setTimeout(() => setOpen(false), 9000);
      return () => clearTimeout(t);
    }
    setOpen(false);
  }, [path, clips]);

  const speak = () => {
    clicks.current++;
    const n = clicks.current;
    if (n % 3 === 0) { setLine(ANALOG_BITS[Math.floor(Math.random() * ANALOG_BITS.length)]); setMood("smug"); }
    else { setLine(HELLO_LINES[Math.floor(Math.random() * HELLO_LINES.length)]); setMood(n % 5 === 0 ? "dead" : "worried"); }
    setOpen(true);
  };

  return (
    <div className="fixed z-50 right-3 bottom-20 md:bottom-5 md:right-6 flex items-end gap-2 pointer-events-none">
      {open && line && (
        <div className="pop pointer-events-auto relative max-w-[250px] md:max-w-[300px] rounded-2xl rounded-br-sm bg-[#f1efe4] text-[#1b1710] px-4 py-3 shadow-2xl border-2 border-[#1b1710]">
          <button onClick={() => setOpen(false)} aria-label="Закрыть" className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#1b1710] text-[#f1efe4] text-xs leading-none">✕</button>
          <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">Скрепка · аналог</div>
          <p className="text-sm leading-snug font-semibold">{line}</p>
        </div>
      )}
      <button onClick={speak} aria-label="Скрепка. Нажми, она что-нибудь скажет." className="pointer-events-auto floaty drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform">
        <Mascot size={78} mood={mood} />
      </button>
    </div>
  );
}
