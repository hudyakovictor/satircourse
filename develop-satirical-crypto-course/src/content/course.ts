import { chaptersA } from "./pack-a";
import { chaptersB } from "./pack-b";
import type { Chapter, Lesson } from "./types";

export const chapters: Chapter[] = [...chaptersA, ...chaptersB];

export type LessonRef = {
  chapter: Chapter;
  lesson: Lesson;
  index: number;
};

export const allLessons: LessonRef[] = chapters.flatMap((chapter) =>
  chapter.lessons.map((lesson, index) => ({ chapter, lesson, index }))
);

export const totalLessons = allLessons.length;
export const totalQuizQuestions = allLessons.reduce(
  (sum, ref) => sum + ref.lesson.quiz.length,
  0
);
export const totalMinutes = allLessons.reduce(
  (sum, ref) => sum + ref.lesson.minutes,
  0
);

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function getLesson(chapterSlug: string, lessonSlug: string) {
  const chapter = getChapter(chapterSlug);
  if (!chapter) return undefined;
  const index = chapter.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index < 0) return undefined;
  return {
    chapter,
    lesson: chapter.lessons[index],
    index,
    prev: chapter.lessons[index - 1],
    next: chapter.lessons[index + 1],
  };
}

export function nextLessonRef(chapterSlug: string, lessonSlug: string) {
  const i = allLessons.findIndex(
    (r) => r.chapter.slug === chapterSlug && r.lesson.slug === lessonSlug
  );
  return i >= 0 ? allLessons[i + 1] : undefined;
}

export const tickerLines = [
  "СРОЧНО: КИТ ПРОСНУЛСЯ. МЕЛКИЕ ИНВЕСТОРЫ СНОВА СТАЛИ ЗАВТРАКОМ",
  "РЕГУЛЯТОРЫ ОБЕСПОКОЕНЫ. РЫНОК ДЕЛАЕТ ВИД, ЧТО УДИВЛЁН",
  "ВОЛАТИЛЬНОСТЬ ВРЕМЕННАЯ. ТВОЯ ОШИБКА — НАВСЕГДА",
  "ИНФЛЮЕНСЕР ОПУБЛИКОВАЛ ПРОГНОЗ. ПРЕДЫДУЩИЙ СЧИТАЕТСЯ АРТЕФАКТОМ",
  "РЫНОК НЕ ПАДАЕТ. ОН ПЕРЕСМАТРИВАЕТ РЕАЛЬНОСТЬ",
  "ДЕПАРТАМЕНТ УПРАВЛЯЕМОЙ ПАНИКИ ПЕЧАТАЕТ ПАНИКУ. БЛАГОДАРИМ ЗА СОТРУДНИЧЕСТВО",
  "ПАНИКА БЕСПЛАТНА. ВХОД — НЕТ",
  "ВСЁ ИДЁТ ПО ПЛАНУ. ПЛАН НЕ НАЙДЕН",
];

export const factions = [
  {
    name: "СТРОИТЕЛИ",
    line: "Мы строим. Ты используешь. Они копируют.",
    detail: "Верят в код. Это их главная уязвимость.",
  },
  {
    name: "СПЕКУЛЯНТЫ",
    line: "Дай мне волатильность — я дам тебе движение.",
    detail: "Не читают белые бумаги. Читают настроение.",
  },
  {
    name: "АРХИВИСТЫ",
    line: "Я это уже видел. В 2018-м. И в 2022-м.",
    detail: "Хранят память, которую никто не заказывал.",
  },
  {
    name: "РЕЙДЕРЫ",
    line: "Здесь дыра. Она уже в твоём кошельке.",
    detail: "Бесплатный аудит. Со счётом за услуги.",
  },
];

export const seasons = [
  {
    name: "БЫЧИЙ",
    line: "Всё растёт. Никто не спит.",
    task: "Фиксировать по правилу, а не по настроению.",
  },
  {
    name: "МЕДВЕЖИЙ",
    line: "Надежды мало. Статистика отличная.",
    task: "Сохранить капитал. Учиться. Дожить.",
  },
  {
    name: "РОТАЦИИ",
    line: "Деньги уходят. Нарративы меняются местами.",
    task: "Не гнаться. Ты уже опоздал — выдохни.",
  },
  {
    name: "ПРОВЕРОЧНЫЙ",
    line: "Пришли с проверкой. С документами.",
    task: "Соблюдать формальности. Это тоже стратегия.",
  },
];

export const stats = [
  { value: String(chapters.length), label: "ГЛАВЫ ХАОСА" },
  { value: String(totalLessons), label: "УРОКОВ-ОТЧЁТОВ" },
  { value: String(totalQuizQuestions), label: "ВОПРОСОВ ДОПРОСА" },
  { value: String(totalMinutes), label: "МИНУТ ПОД НАПРЯЖЕНИЕМ" },
];
