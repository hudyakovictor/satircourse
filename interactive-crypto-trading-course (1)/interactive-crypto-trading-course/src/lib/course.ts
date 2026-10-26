import raw from "@/data/course.json";
import { LESSON_SATIRE, MODULE_SATIRE } from "@/data/satire";

export type Visual = { type: string; prompt: string; before: string };
export type Lesson = {
  id: string;
  n: number;
  letter: string;
  title: string;
  t: string;
  diagram: string;
  p: string;
  r: string;
  d: string;
  e: string;
  key: string;
  keyLabel: string;
  cert: string;
  visuals: Visual[];
};
export type Glitch = { n: number; title: string; text: string };
export type Module = {
  id: string;
  index: number;
  title: string;
  from: number;
  to: number;
  goal: string;
  anchor: string;
  lessons: Lesson[];
  glitches: Glitch[];
  appendixVisuals: { type: string; prompt: string }[];
  recall?: string[];
};
export type GlossaryItem = { term: string; plain: string; work: string };

export const modules = (raw as unknown as { modules: Module[] }).modules;
export const glossary = (raw as unknown as { glossary: GlossaryItem[] }).glossary;
export const allLessons: Lesson[] = modules.flatMap((m) => m.lessons);
export const lessonById = (id: string) => allLessons.find((l) => l.id === id);
export const moduleById = (id: string) => modules.find((m) => m.id === id);
export const lessonIndex = (id: string) => allLessons.findIndex((l) => l.id === id);
export const isExam = (l: Lesson) => /экзамен/i.test(l.title);
export const satireOf = (id: string): [string, string] => LESSON_SATIRE[id] ?? ["СИСТЕМА МОЛЧИТ", "Это подозрительно."];
export const moduleSatire = (id: string) => MODULE_SATIRE[id];
export const cleanTitle = (t: string) => t.replace(/^Экзамен модуля [A-J](:.*)?$/, (m) => m);

/** Split the [Э] exam text into numbered questions: "1) ... 2) ..." */
export function splitQuestions(text: string): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const parts = t.split(/(?=\b\d{1,2}\)\s)/).map((s) => s.trim()).filter(Boolean);
  const numbered = parts.filter((p) => /^\d{1,2}\)/.test(p));
  if (numbered.length >= 2) return numbered.map((p) => p.replace(/^\d{1,2}\)\s*/, ""));
  return [t];
}

/** Split the [Р] text for "(а) ... (б) ..." options */
export function splitOptions(text: string): { stem: string; options: string[] } {
  const m = text.match(/\((а|a)\)/);
  if (!m || m.index === undefined) return { stem: text, options: [] };
  const stem = text.slice(0, m.index).trim();
  const rest = text.slice(m.index);
  const opts = rest.split(/(?=\([а-яa-z]\)\s)/i).map((s) => s.trim().replace(/[?.,;]+\s*$/, "")).filter((s) => /^\([а-яa-z]\)/i.test(s));
  return opts.length >= 2 ? { stem, options: opts } : { stem: text, options: [] };
}
