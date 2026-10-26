"use client";

import { useMemo, useState } from "react";
import { glossary } from "@/content/glossary";

const DANGER_COLOR: Record<string, string> = {
  НИЗКИЙ: "var(--lime)",
  СРЕДНИЙ: "var(--cyan)",
  ВЫСОКИЙ: "var(--magenta)",
  ЛЕТАЛЬНЫЙ: "var(--alarm)",
};

export function GlossaryTable() {
  const [query, setQuery] = useState("");
  const [only, setOnly] = useState<string>("ВСЕ");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return glossary.filter((g) => {
      const match =
        !q ||
        g.term.toLowerCase().includes(q) ||
        g.real.toLowerCase().includes(q) ||
        g.official.toLowerCase().includes(q);
      const danger = only === "ВСЕ" || g.danger === only;
      return match && danger;
    });
  }, [query, only]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <input
          className="input"
          style={{ maxWidth: 380 }}
          placeholder="ПОИСК ПО СЛОВАРЮ…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {["ВСЕ", "НИЗКИЙ", "СРЕДНИЙ", "ВЫСОКИЙ", "ЛЕТАЛЬНЫЙ"].map((d) => (
            <button
              key={d}
              type="button"
              className="sticker"
              style={{
                background: only === d ? "var(--magenta)" : "var(--panel-2)",
                color: only === d ? "var(--paper)" : "var(--muted)",
                cursor: "pointer",
              }}
              onClick={() => setOnly(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="mono ml-auto" style={{ fontSize: 11, color: "var(--muted)" }}>
          НАЙДЕНО: {rows.length} ИЗ {glossary.length}
        </div>
      </div>

      <div className="table-scroll mt-8">
        <table className="ledger">
          <thead>
            <tr>
              <th>ТЕРМИН</th>
              <th>ОФИЦИАЛЬНОЕ ОПРЕДЕЛЕНИЕ</th>
              <th>ЧТО ЭТО ЗНАЧИТ НА САМОМ ДЕЛЕ</th>
              <th>УРОВЕНЬ ОПАСНОСТИ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.term}>
                <td style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{g.term}</td>
                <td style={{ color: "var(--muted)" }}>{g.official}</td>
                <td style={{ color: "var(--paper-2)" }}>{g.real}</td>
                <td>
                  <span
                    className="mono"
                    style={{ color: DANGER_COLOR[g.danger], fontSize: 11 }}
                  >
                    ● {g.danger}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-caption">
          СЛОВАРЬ ДЕПАРТАМЕНТА · РЕДАКЦИЯ ОБНОВЛЯЕТСЯ ПОСЛЕ КАЖДОГО ПАДЕНИЯ
        </div>
      </div>

      {rows.length === 0 && (
        <div className="truth">
          НИЧЕГО НЕ НАЙДЕНО. РЫНОК ТОЖЕ ЧАСТО НИЧЕГО НЕ НАХОДИТ, НО СТРОИТСЯ ДАЛЬШЕ.
        </div>
      )}
    </div>
  );
}
