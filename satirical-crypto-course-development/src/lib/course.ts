import raw from "@/data/course.json";
import glossaryRaw from "@/data/glossary.json";
import workbookRaw from "@/data/workbook.json";
import { COPY_AE } from "@/data/copy-ae";
import { COPY_FJ } from "@/data/copy-fj";
import { MODULE_META } from "@/data/meta";

export type Viz = { type: string; prompt: string };
export type Card = { key: "Т" | "П" | "Р" | "Д" | "Э"; text: string; viz: Viz[]; keyLabel?: string; answer?: string; after?: string };
export type Lesson = {
  id: string; module: string; num: number; title: string; isExam: boolean; cards: Card[];
  headline: string; teaser: string; clip: string; accent: string; passPct: number;
};
export type Module = { id: string; title: string; from: number; to: number; goal: string; support: string; lessons: string[]; dept: string; headline: string; teaser: string; accent: string; icon: string };

const copy = new Map<string, [string, string, string]>();
for (const [id, h, t, c] of [...COPY_AE, ...COPY_FJ]) copy.set(id, [h, t, c]);

export const MODULES: Module[] = (raw.modules as unknown as Omit<Module, "dept" | "headline" | "teaser" | "accent" | "icon">[]).map((m) => ({ ...m, ...MODULE_META[m.id] }));

export const LESSONS: Lesson[] = (raw.lessons as unknown as Omit<Lesson, "headline" | "teaser" | "clip" | "accent" | "passPct">[]).map((l) => {
  const c = copy.get(l.id) ?? [l.title, "", ""];
  return { ...l, headline: c[0], teaser: c[1], clip: c[2], accent: MODULE_META[l.module].accent, passPct: l.id === "H79" ? 85 : 80 };
});

export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);
export const getModule = (id: string) => MODULES.find((m) => m.id === id);
export const lessonsOf = (m: string) => LESSONS.filter((l) => l.module === m);
export const neighbors = (id: string) => {
  const i = LESSONS.findIndex((l) => l.id === id);
  return { prev: LESSONS[i - 1], next: LESSONS[i + 1] };
};

export const GLOSSARY = glossaryRaw as { term: string; plain: string; work: string }[];
export const WORKBOOK = (workbookRaw as { md: string }).md;

export const XP = { lesson: 100, exam: 300, decision: 20 };
export const LEVEL_XP = 500;
