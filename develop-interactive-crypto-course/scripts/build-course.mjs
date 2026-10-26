// Parses /content/*.md (original course) into src/data/course.json + glossary.json
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "01-foundation", "02-chart-literacy", "03-core-indicators", "04-patterns-price-action",
  "05-structure-execution", "06-fundamentals-context", "07-strategy-families",
  "08-risk-management", "09-psychology-process", "10-research-capstone",
];
const letters = "ABCDEFGHIJ".split("");

const modules = [];
const lessons = [];
let glitches = [];

const VIS = /\[\[\[\s*([^\/\]]+?)\s*\/\s*([^\]]*?)\s*\]\]\]\]?/g;

function parseLesson(block, letter) {
  const lines = block.split("\n");
  const head = lines[0].replace(/^##\s*/, "");
  const m = head.match(/^([A-J])(\d+)\s*·\s*(.+)$/);
  if (!m) return null;
  const id = parseInt(m[2], 10);
  let body = lines.slice(1).join("\n");

  // visuals with following marker
  const visuals = [];
  // tag placeholders with the card that follows them
  body = body.replace(VIS, (_, kind, prompt) => {
    visuals.push({ kind: kind.trim(), prompt: prompt.trim() });
    return `\n@@VIS${visuals.length - 1}@@\n`;
  });

  const marks = ["Т", "П", "Р", "Д", "Э"];
  const idx = {};
  for (const k of marks) {
    const i = body.indexOf(`**[${k}]**`);
    idx[k] = i;
  }
  const order = marks.filter((k) => idx[k] >= 0).sort((a, b) => idx[a] - idx[b]);
  const cards = {};
  const cardVis = {};
  let footer = "";
  order.forEach((k, n) => {
    const start = idx[k] + `**[${k}]**`.length;
    const end = n + 1 < order.length ? idx[order[n + 1]] : body.length;
    let chunk = body.slice(start, end);
    // extract vis markers from chunk tail
    const vs = [];
    chunk = chunk.replace(/@@VIS(\d+)@@/g, (_, d) => { vs.push(parseInt(d, 10)); return ""; });
    if (n + 1 < order.length) {
      // markers at the tail of this chunk precede the next card
      const nxt = order[n + 1];
      cardVis[nxt] = (cardVis[nxt] || []).concat(vs);
    } else {
      cardVis[k] = (cardVis[k] || []).concat(vs);
    }
    cards[k] = chunk.trim();
  });
  // Text before first mark may hold visuals (rare)
  // footer for last card (after details)
  let exam = cards["Э"] || "";
  let examQ = exam, examKey = "";
  const d = exam.match(/<details>\s*<summary>([^<]*)<\/summary>([\s\S]*?)<\/details>([\s\S]*)$/);
  if (d) {
    examQ = exam.slice(0, exam.indexOf("<details>")).trim();
    examKey = d[2].trim();
    footer = d[3].replace(/---\s*$/, "").trim();
  } else {
    examQ = exam.replace(/---\s*$/, "").trim();
  }
  // code block in theory
  let theory = cards["Т"] || "";
  let code = "";
  const c = theory.match(/```(?:text)?\n([\s\S]*?)```/);
  if (c) {
    code = c[1].trim();
    theory = theory.replace(c[0], "").trim();
  }
  const clean = (s) => (s || "").replace(/\n---\s*$/, "").trim();
  return {
    id,
    code: `${m[1]}${m[2]}`,
    module: m[1],
    title: m[3].trim(),
    isExam: /Экзамен/.test(m[3]),
    theory: clean(theory),
    schema: code,
    example: clean(cards["П"]),
    decision: clean(cards["Р"]),
    debrief: clean(cards["Д"]),
    examQ: clean(examQ),
    examKey,
    footer: clean(footer),
    visuals: visuals.map((v, i) => {
      let before = "Т";
      for (const k of Object.keys(cardVis)) if ((cardVis[k] || []).includes(i)) before = k;
      return { ...v, before };
    }),
  };
}

files.forEach((f, mi) => {
  const letter = letters[mi];
  const txt = fs.readFileSync(path.join(root, "content", f + ".md"), "utf8");
  const parts = txt.split(/\n(?=## )/);
  const header = parts[0];
  const title = header.match(/^#\s*(.+)$/m)[1].trim();
  const goal = (header.match(/\*\*Цель главы:\*\*\s*([^\n]+)/) || [])[1] || "";
  const support = (header.match(/\*\*Опора для практики:\*\*\s*([^\n]+)/) || [])[1] || "";
  const range = title.match(/уровни\s*([\d–-]+)/)?.[1] || "";
  modules.push({ letter, title: title.replace(/^МОДУЛЬ [A-J] · /, "").replace(/ · уровни.*$/, ""), range, goal, support });
  for (const p of parts.slice(1)) {
    if (p.startsWith("## Приложение")) {
      const gl = p.split(/\n(?=### )/).slice(1);
      glitches = gl.map((g) => {
        const l = g.split("\n");
        const t = l[0].replace(/^###\s*Glitch\s*/, "");
        const mm = t.match(/^(\d+)\s*·\s*[«"]?(.*?)[»"]?$/);
        const text = l.slice(1).join("\n").replace(VIS, "").trim();
        return { n: mm ? mm[1] : "", title: mm ? mm[2] : t, text };
      });
      continue;
    }
    const L = parseLesson(p, letter);
    if (L) lessons.push(L);
  }
});

lessons.sort((a, b) => a.id - b.id);

// glossary
const gtxt = fs.readFileSync(path.join(root, "content", "glossary.md"), "utf8");
const glossary = gtxt.split("\n").filter((l) => l.startsWith("|") && !/^\|\s*-/.test(l) && !/^\|\s*Термин/.test(l))
  .map((l) => l.split("|").slice(1, -1).map((s) => s.trim()))
  .filter((r) => r.length >= 3)
  .map(([term, plain, work]) => ({ term, plain, work }));

const workbook = fs.readFileSync(path.join(root, "content", "calculation-workbook.md"), "utf8").replace(VIS, "");

fs.mkdirSync(path.join(root, "src/data"), { recursive: true });
fs.writeFileSync(path.join(root, "src/data/course.json"), JSON.stringify({ modules, lessons, glitches }, null, 1));
fs.writeFileSync(path.join(root, "src/data/glossary.json"), JSON.stringify(glossary, null, 1));
fs.writeFileSync(path.join(root, "src/data/workbook.json"), JSON.stringify({ md: workbook }));
console.log("modules", modules.length, "lessons", lessons.length, "glossary", glossary.length, "glitches", glitches.length);
const bad = lessons.filter((l) => !l.theory || !l.example || !l.decision || !l.debrief);
console.log("incomplete", bad.map((b) => b.code));
console.log("visuals", lessons.reduce((a, l) => a + l.visuals.length, 0));
console.log(JSON.stringify(lessons[0], null, 1).slice(0, 2500));
