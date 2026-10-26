import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Md({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ table: ({ children: c }) => <div className="scroll-x"><table>{c}</table></div> }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
