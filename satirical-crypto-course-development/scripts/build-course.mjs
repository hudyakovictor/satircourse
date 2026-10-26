// Парсер исходников курса (content/*.md) -> src/data/*.json
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const read = (f) => fs.readFileSync(path.join(root, "content", f), "utf8");
const clean = (s) =>
  s.replace(/\[([^\]]+)\]\(([^)]*\.md[^)]*)\)/g, "$1").replace(/\[\[\[[^\]]*\]\]\]\]?/g, "").trim();

const files = ["01-foundation","02-chart-literacy","03-core-indicators","04-patterns-price-action","05-structure-execution","06-fundamentals-context","07-strategy-families","08-risk-management","09-psychology-process","10-research-capstone"];
const modules = [];
const lessons = [];

for (const f of files) {
  const txt = read(f + ".md").replace(/\r/g, "");
  const parts = txt.split(/^## /m);
  const head = parts.shift();
  const h1 = head.match(/^# МОДУЛЬ (\w) · (.+?) · уровни (\d+)–(\d+)/m);
  const goal = (head.match(/\*\*Цель главы:\*\*\s*(.+)/) || [])[1] || "";
  const support = (head.match(/\*\*Опора для практики:\*\*\s*(.+)/) || [])[1] || "";
  const mod = { id: h1[1], title: h1[2], from: +h1[3], to: +h1[4], goal: clean(goal), support: clean(support), lessons: [] };
  for (const part of parts) {
    const lines = part.split("\n");
    const m = lines[0].match(/^([A-J])(\d+) · (.+)$/);
    if (!m) continue;
    const id = m[1] + m[2];
    const body = lines.slice(1).join("\n").replace(/\n---\s*$/m, "");
    // split by card markers & viz markers
    const cards = {};
    let cur = null; let pendingViz = [];
    let extraTail = "";
    for (const line of body.split("\n")) {
      const v = line.match(/^\[\[\[([^/\]]+?)\s*\/\s*(.+?)\s*\]\]\]\]?\s*$/);
      if (v) { pendingViz.push({ type: v[1].trim(), prompt: v[2].trim() }); cur = cur && cur.closedForViz ? cur : cur; if (cur) cur.closed = true; continue; }
      const c = line.match(/^\*\*\[([ТПРДЭ])\]\*\*\s?(.*)$/);
      if (c) { cur = { key: c[1], text: c[2], viz: pendingViz, closed: false }; pendingViz = []; cards[c[1]] = cur; continue; }
      if (cur) { if (cur.closed && line.trim()) { extraTail += line + "\n"; } else cur.text += "\n" + line; }
    }
    for (const k of Object.keys(cards)) {
      const c = cards[k];
      c.text = clean(c.text);
      if (k === "Э") {
        const d = c.text.match(/<details>\s*<summary>([^<]*)<\/summary>([\s\S]*?)<\/details>([\s\S]*)$/);
        if (d) { c.keyLabel = d[1].trim(); c.ans = d[2].trim(); c.text = c.text.slice(0, d.index).trim(); c.after = clean(d[3]); }
      }
    }
    const l = {
      id, module: mod.id, num: +m[2], title: m[3].trim(),
      isExam: /Экзамен/.test(m[3]),
      cards: ["Т","П","Р","Д","Э"].map((k) => ({ key: k, text: cards[k].text, viz: cards[k].viz, ...(cards[k].ans ? { keyLabel: cards[k].keyLabel, answer: cards[k].ans, after: cards[k].after } : {}) })),
    };
    lessons.push(l); mod.lessons.push(id);
  }
  modules.push(mod);
}
fs.writeFileSync("src/data/course.json", JSON.stringify({ modules, lessons }));

// glossary
const g = read("glossary.md").split("\n").filter((l) => l.startsWith("|") && !/^\|\s*-/.test(l) && !/Термин/.test(l));
const glossary = g.map((l) => { const c = l.split("|").slice(1, -1).map((x) => x.trim()); return { term: c[0], plain: c[1], work: c[2] }; }).filter((x) => x.term && x.plain);
fs.writeFileSync("src/data/glossary.json", JSON.stringify(glossary));
const wb = clean(read("calculation-workbook.md"));
fs.writeFileSync("src/data/workbook.json", JSON.stringify({ md: wb }));
console.log(modules.length, lessons.length, glossary.length, lessons.reduce((a, l) => a + l.cards.reduce((b, c) => b + c.viz.length, 0), 0));
