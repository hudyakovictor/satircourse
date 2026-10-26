import { Illustration } from "./art/Illustration";
import { moduleById } from "@/lib/course-meta";
import type { ModuleData } from "@/lib/content";

export function ModuleCover({ mod }: { mod: ModuleData }) {
  const meta = moduleById(mod.id)!;
  const first = mod.lessons[0];
  const prompt = mod.lessons.map((l) => l.visuals.find((v) => v.type !== "Таблица")?.prompt ?? "").find(Boolean) ?? "";
  if (meta.art) {
    return (
      <div className="illus relative aspect-square w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.art} alt={meta.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070c1f] via-[#070c1f]/30 to-transparent" />
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border bg-[#0a1130]/80 px-3 py-1.5 text-xs font-extrabold tracking-widest" style={{ borderColor: meta.color }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: meta.color }} />
          МОДУЛЬ {meta.id} · {meta.from}–{meta.to}
        </div>
        <div className="absolute inset-x-5 bottom-6">
          <div className="text-[56px] font-black leading-none" style={{ color: meta.color }}>{meta.id}</div>
          <div className="mt-1 text-xl font-black leading-tight text-white">{meta.title}</div>
          <div className="mt-1 text-xs font-semibold text-[#9fb0e6]">{meta.outcome}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="illus">
      <Illustration seed={`module-${meta.id}`} prompt={prompt || first.title} moduleId={meta.id} accent={meta.color} cover code={`МОДУЛЬ ${meta.id}`} title={meta.title} caption={`Уровни ${meta.from}–${meta.to} · ${meta.outcome}`} />
    </div>
  );
}
