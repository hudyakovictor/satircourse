import courseJson from "@/data/course.json";
import glossaryJson from "@/data/glossary.json";
import workbookJson from "@/data/workbook.json";
import type { CourseModule, Lesson, Sat } from "./types";
import { satA } from "@/data/sat-a";
import { satB } from "@/data/sat-b";
import { satC } from "@/data/sat-c";
import { satD } from "@/data/sat-d";
import { satE } from "@/data/sat-e";
import { satF } from "@/data/sat-f";
import { satG } from "@/data/sat-g";
import { satH } from "@/data/sat-h";
import { satI } from "@/data/sat-i";
import { satJ } from "@/data/sat-j";

export const lessons = courseJson.lessons as Lesson[];
export const modules = courseJson.modules as CourseModule[];
export const glitches = courseJson.glitches as { n: string; title: string; text: string }[];
export const glossary = glossaryJson as { term: string; plain: string; work: string }[];
export const workbookMd = (workbookJson as { md: string }).md;

export const SAT: Sat[] = [...satA, ...satB, ...satC, ...satD, ...satE, ...satF, ...satG, ...satH, ...satI, ...satJ];

export const MODSAT: Record<string, { dept: string; tag: string; teaser: string; motifs: string[]; color: string }> = {
  A: { dept: "Департамент первых потерь", tag: "Вход на рынок — бесплатный. Выход — по расписанию.", teaser: "Цена, заявка, спред и правило 1%. Всё, что ты должен знать до того, как рынок узнает о тебе.", motifs: ["ticker", "scales", "bag"], color: "#3ee6c1" },
  B: { dept: "Галерея свечного искусства", tag: "Красивый график — это график, который что-то скрывает.", teaser: "Свечи, таймфреймы, объём, тренд и уровни. Научись читать картину, а не любоваться ею.", motifs: ["candles", "chartframe", "lens"], color: "#b48cff" },
  C: { dept: "Культ индикаторов", tag: "Формулы пересказывают прошлое с такой уверенностью.", teaser: "SMA, MACD, RSI, ATR, OBV — без магии и без пятнадцати индикаторов сразу.", motifs: ["lens", "clock", "scales"], color: "#39f0ff" },
  D: { dept: "Цирк паттернов", tag: "Фигура без инвалидации — рисунок для детей.", teaser: "Свечные модели, фигуры, пробои и фейки. С обязательной точкой отмены.", motifs: ["chartframe", "guillotine", "dice"], color: "#ff6b8a" },
  E: { dept: "Порт структуры и исполнения", tag: "Идея стоит ноль, пока не исполнена.", teaser: "HH/HL, ликвидность, стакан, типы ордеров, OCO. Как идея становится сделкой и не теряет штаны по дороге.", motifs: ["whale", "vault", "bomb"], color: "#6bf0a2" },
  F: { dept: "Собор токеномики", tag: "Проект объяснил, как он заработает. Не спросил — на ком.", teaser: "Токеномика, разблокировки, on-chain, funding, ликвидации, листинги.", motifs: ["pie", "pipe", "chest"], color: "#ffd34d" },
  G: { dept: "Казино «Плечо» (закрытое)", tag: "Каждая стратегия гениальна в свой сезон.", teaser: "Тренд, возврат к среднему, пробой, диапазон. Карточка стратегии и честный бэктест.", motifs: ["cards", "dice", "rocket"], color: "#ff9a3c" },
  H: { dept: "Бункер выживания", tag: "Выжить — единственная стратегия на все сезоны.", teaser: "Risk of ruin, размер позиции, R, стопы, плечо, ликвидация, просадка, корреляции.", motifs: ["shield", "umbrella", "guillotine"], color: "#ff4d4d" },
  I: { dept: "Таверна реванша", tag: "Рынок не знает, что ты хочешь отыграться.", teaser: "Loss aversion, FOMO, tilt, журнал, аудит. Твои худшие враги — в зеркале.", motifs: ["bell", "hamster", "mirror"], color: "#8dff6b" },
  J: { dept: "Обсерватория доказательств", tag: "Edge — это цифра, а не ощущение.", teaser: "Выборка, бэктест, walk-forward, плейбук, 100 сделок и защита проекта.", motifs: ["lens", "chest", "cup"], color: "#7aa2ff" },
};

export const CARD_KINDS = [
  { k: "T", name: "Теория", desc: "Короткое правило и схема" },
  { k: "P", name: "Пример", desc: "Разбор сценария" },
  { k: "R", name: "Решение", desc: "Сначала выбери — потом смотри" },
  { k: "D", name: "Разбор", desc: "Логика в R, не в PnL" },
  { k: "E", name: "Проверка", desc: "Мини-экзамен с ключом" },
] as const;

export function getLesson(id: number) {
  return lessons.find((l) => l.id === id);
}
export function satOf(id: number): Sat {
  return SAT[id];
}
export function lessonsOf(letter: string) {
  return lessons.filter((l) => l.module === letter);
}
export function moduleOf(letter: string) {
  return modules.find((m) => m.letter === letter);
}

/** Registry of "factors" — 777 course elements */
export function factorRegistry() {
  const cards = lessons.length * 5;
  const illus = lessons.length;
  const teasers = lessons.length;
  const gl = 77;
  const rows = [
    { name: "Учебные карточки [Т][П][Р][Д][Э]", n: cards },
    { name: "Иллюстрации уровней 500×500", n: illus },
    { name: "Тизеры-заголовки уровней", n: teasers },
    { name: "Ключевые термины глоссария", n: gl },
  ];
  const total = rows.reduce((a, r) => a + r.n, 0);
  const bonus = [
    { name: "Обложки модулей", n: modules.length },
    { name: "Иконки карточек", n: 5 },
    { name: "Иллюстрации абзацев", n: lessons.reduce((a, l) => a + l.visuals.length, 0) },
    { name: "Таблицы «миф / правда / цена»", n: lessons.length },
    { name: "Secret-glitch награды", n: glitches.length },
    { name: "Остальные термины глоссария", n: Math.max(0, glossary.length - gl) },
  ];
  return { rows, total, bonus };
}
