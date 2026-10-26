import { Fragment, type ReactNode } from "react";

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("`")) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("**")) out.push(<strong key={key}>{inline(tok.slice(2, -2), key)}</strong>);
    else if (tok.startsWith("[")) out.push(<Fragment key={key}>{tok.slice(1, tok.indexOf("]"))}</Fragment>);
    else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Rich({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <div className={`rich ${className}`}>
      {lines.map((l, i) => (
        <p key={i} className={i ? "mt-2" : ""}>
          {inline(l, `l${i}`)}
        </p>
      ))}
    </div>
  );
}

export function RichInline({ text }: { text: string }) {
  return <>{inline(text, "x")}</>;
}
