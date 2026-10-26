import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { mapHref } from "@/lib/course-meta";

export function Md({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: c }) => {
            const h = mapHref(href);
            if (h && h.startsWith("/")) return <Link href={h}>{c}</Link>;
            return (
              <a href={h} target="_blank" rel="noreferrer noopener">
                {c}
              </a>
            );
          },
          table: ({ children: c }) => (
            <div className="tbl">
              <table>{c}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
