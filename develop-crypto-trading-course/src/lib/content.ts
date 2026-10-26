import fs from "node:fs";
import path from "node:path";
import { MODULES, DOCS, type CardKey } from "./course-meta";

export type Visual = { type: string; prompt: string };
export type Quiz = { question: string; key: string; keyLabel: string; total: number; pass: number };
export type Lesson = {
  code: string;
  moduleId: string;
  n: number;
  title: string;
  isExam: boolean;
  cards: Record<CardKey, string>;
  visuals: Visual[];
  quiz: Quiz;
};
export type ModuleData = {
  id: string;
  title: string;
  intro: string;
  lessons: Lesson[];
};

const ROOT = path.join(process.cwd(), "content");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

export const VIZ_RE = /^\[\[\[\s*(.+?)\s*\/\s*(.+?)\s*\]\]\]\]?\s*$/;

const KEY_MAP: Record<string, CardKey> = { "Т": "T", "П": "P", "Р": "R", "Д": "D", "Э": "E" };

function buildQuiz(md: string, moduleId: string, n: number, isExam: boolean): Quiz {
  const m = md.match(/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/);
  const question = (m ? md.slice(0, m.index) : md).trim();
  const key = m ? m[2].trim() : "";
  const keyLabel = m ? m[1].trim() : "Ключ";
  let total = 1;
  const q = [...question.matchAll(/(?:^|[\s(])(\d{1,2})\)/g)].map((x) => Number(x[1]));
  const k = [...key.matchAll(/(?:^|;\s*)(\d{1,2})[\s).]/g)].map((x) => Number(x[1]));
  const cand = Math.max(0, ...q, ...k);
  if (cand >= 2) total = Math.min(cand, 20);
  if (isExam && total < 10) total = 10;
  const ratio = moduleId === "H" && n === 79 ? 0.85 : 0.8;
  return { question, key, keyLabel, total, pass: Math.max(1, Math.ceil(total * ratio - 1e-9)) };
}

function parseLesson(head: string, body: string): Lesson | null {
  const m = head.match(/^([A-J])(\d+)\s*·\s*(.+)$/);
  if (!m) return null;
  const cards: Record<CardKey, string[]> = { T: [], P: [], R: [], D: [], E: [] };
  const visuals: Visual[] = [];
  let cur: CardKey | null = null;
  for (const line of body.split("\n")) {
    const vm = line.match(VIZ_RE);
    if (vm) {
      visuals.push({ type: vm[1], prompt: vm[2] });
      continue;
    }
    const cm = line.match(/^\*\*\[([ТПРДЭ])\]\*\*\s?(.*)$/);
    if (cm) {
      cur = KEY_MAP[cm[1]];
      cards[cur].push(cm[2]);
      continue;
    }
    if (cur && line.trim() !== "---") cards[cur].push(line);
  }
  const out = {} as Record<CardKey, string>;
  (Object.keys(cards) as CardKey[]).forEach((k) => (out[k] = cards[k].join("\n").trim()));
  const n = Number(m[2]);
  return {
    code: `${m[1]}${n}`,
    moduleId: m[1],
    n,
    title: m[3].trim(),
    isExam: /Экзамен/.test(m[3]),
    cards: out,
    visuals,
    quiz: buildQuiz(out.E, m[1], n, /Экзамен/.test(m[3])),
  };
}

let cache: ModuleData[] | null = null;
let reviewRaw = "";

export function getModules(): ModuleData[] {
  if (cache) return cache;
  cache = MODULES.map((meta) => {
    const raw = read(`course/${meta.file}`);
    const parts = raw.split(/^## /m);
    const intro = parts[0].replace(/^# .*\n/, "").replace(/\n---\s*$/, "").trim();
    const lessons: Lesson[] = [];
    for (const p of parts.slice(1)) {
      const nl = p.indexOf("\n");
      const head = p.slice(0, nl).trim();
      const body = p.slice(nl + 1);
      const l = parseLesson(head, body);
      if (l) lessons.push(l);
      else if (/Приложение/.test(head)) reviewRaw = "## " + p;
    }
    return { id: meta.id, title: meta.title, intro, lessons };
  });
  return cache;
}

export const getModule = (id: string) => getModules().find((m) => m.id === id);
export const allLessons = () => getModules().flatMap((m) => m.lessons);
export const getLesson = (code: string) => allLessons().find((l) => l.code === code.toUpperCase());

export function getDoc(slug: string): { meta: (typeof DOCS)[number]; md: string } | null {
  const meta = DOCS.find((d) => d.slug === slug);
  if (!meta) return null;
  if (meta.file === "@review") {
    getModules();
    return { meta, md: reviewRaw.replace(/^## /, "# ") };
  }
  return { meta, md: read(meta.file) };
}

export function getCsv(name: string): string | null {
  if (!/^[a-z0-9-]+\.csv$/.test(name)) return null;
  try {
    return read(`templates/${name}`);
  } catch {
    return null;
  }
}

export function splitViz(md: string): ({ md: string } | { viz: Visual })[] {
  const out: ({ md: string } | { viz: Visual })[] = [];
  let buf: string[] = [];
  for (const line of md.split("\n")) {
    const vm = line.match(VIZ_RE);
    if (vm) {
      if (buf.length) out.push({ md: buf.join("\n") });
      buf = [];
      out.push({ viz: { type: vm[1], prompt: vm[2] } });
    } else buf.push(line);
  }
  if (buf.length) out.push({ md: buf.join("\n") });
  return out;
}
