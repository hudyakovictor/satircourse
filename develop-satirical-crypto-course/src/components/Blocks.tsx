import type { Block } from "@/content/types";
import { LessonFigure } from "./Figures";

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "lead":
            return (
              <p className="lead" key={i}>
                {b.text}
              </p>
            );
          case "h":
            return (
              <h3 className="block-h" key={i}>
                {b.text}
              </h3>
            );
          case "p":
            return <p key={i}>{b.text}</p>;
          case "slogan":
            return (
              <div className={`slogan slogan--${b.tone ?? "lime"}`} key={i}>
                {b.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            );
          case "list":
            return (
              <div key={i}>
                {b.title && <div className="kicker mb-2">{b.title}</div>}
                <ul className="bullets">
                  {b.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="my-8 border-l-4 border-[var(--lime)] pl-6 italic text-[var(--paper-2)]"
              >
                <p style={{ margin: 0 }}>«{b.text}»</p>
                {b.source && (
                  <cite className="kicker mt-2 block not-italic">— {b.source}</cite>
                )}
              </blockquote>
            );
          case "memo":
            return (
              <div className="memo" key={i}>
                <h4>{b.title}</h4>
                <p>{b.body}</p>
                <div className="stamp">{b.stamp}</div>
              </div>
            );
          case "truth":
            return (
              <div className="truth" key={i}>
                <div className="kicker mb-2" style={{ color: "var(--alarm)" }}>
                  ГОРЬКАЯ ПРАВДА
                </div>
                {b.text}
              </div>
            );
          case "table":
            return (
              <div className="table-scroll" key={i}>
                <table className="ledger">
                  <thead>
                    <tr>
                      {b.head.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {b.caption && <div className="table-caption">{b.caption}</div>}
              </div>
            );
          case "formula":
            return (
              <div className="formula" key={i}>
                <code>{b.expr}</code>
                <p>{b.note}</p>
              </div>
            );
          case "figure":
            return (
              <LessonFigure key={i} kind={b.kind} title={b.title} caption={b.caption} />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
