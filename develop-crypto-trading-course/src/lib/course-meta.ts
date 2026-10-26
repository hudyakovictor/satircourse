export type ModuleMeta = {
  id: string;
  file: string;
  title: string;
  short: string;
  from: number;
  to: number;
  outcome: string;
  color: string;
  art?: string;
  mascot: "teacher" | "happy" | "warning" | "thinking";
  cert: string;
};

export const MODULES: ModuleMeta[] = [
  { id: "A", file: "01-foundation.md", title: "Основы биржевой торговли", short: "Основы", from: 0, to: 9, outcome: "Механика рынка и риск 1%", color: "#22E0A1", mascot: "teacher", cert: "Основы биржевой торговли" },
  { id: "B", file: "02-chart-literacy.md", title: "Чтение графика", short: "График", from: 10, to: 19, outcome: "Чтение цены и контекста", color: "#4CC9F0", art: "/art/chart-city.jpg", mascot: "thinking", cert: "Чтение графика" },
  { id: "C", file: "03-core-indicators.md", title: "Технические индикаторы", short: "Индикаторы", from: 20, to: 29, outcome: "Индикаторы без магического мышления", color: "#8B7BFF", mascot: "warning", cert: "Технические индикаторы" },
  { id: "D", file: "04-patterns-price-action.md", title: "Паттерны и прайс-экшен", short: "Паттерны", from: 30, to: 39, outcome: "Паттерны с инвалидацией", color: "#F5C451", mascot: "thinking", cert: "Паттерны и прайс-экшен" },
  { id: "E", file: "05-structure-execution.md", title: "Структура рынка и исполнение ордеров", short: "Исполнение", from: 40, to: 49, outcome: "Режим, структура, исполнение", color: "#FF8A5B", mascot: "teacher", cert: "Структура и исполнение" },
  { id: "F", file: "06-fundamentals-context.md", title: "Фундаментальный анализ и криптоконтекст", short: "Крипто-контекст", from: 50, to: 59, outcome: "Токеномика, on-chain, деривативы", color: "#F7B538", art: "/art/coins.jpg", mascot: "happy", cert: "Фундаментальный анализ" },
  { id: "G", file: "07-strategy-families.md", title: "Семейства торговых стратегий", short: "Стратегии", from: 60, to: 69, outcome: "Карточка стратегии и тестирование", color: "#2DD4BF", mascot: "teacher", cert: "Торговые стратегии" },
  { id: "H", file: "08-risk-management.md", title: "Управление рисками", short: "Риск", from: 70, to: 79, outcome: "Выживание, размер, портфель", color: "#FF5470", art: "/art/shield.jpg", mascot: "warning", cert: "Управление рисками" },
  { id: "I", file: "09-psychology-process.md", title: "Психология трейдинга и торговый процесс", short: "Психология", from: 80, to: 89, outcome: "Дисциплина и метрики процесса", color: "#C084FC", art: "/art/brain.jpg", mascot: "thinking", cert: "Психология и процесс" },
  { id: "J", file: "10-research-capstone.md", title: "Исследования, торговая система и выпускной проект", short: "Capstone", from: 90, to: 99, outcome: "Исследование и 100 сделок paper trading", color: "#FBBF24", art: "/art/trophy.png", mascot: "happy", cert: "Исследования, торговая система и выпускной проект" },
];

export const moduleById = (id: string) => MODULES.find((m) => m.id === id);
export const moduleOfLevel = (n: number) => MODULES.find((m) => n >= m.from && n <= m.to) ?? MODULES[0];

export type DocMeta = { slug: string; title: string; file: string; group: "Методика" | "Приложения" | "Шаблоны"; desc: string; emoji: string };

export const DOCS: DocMeta[] = [
  { slug: "guide", title: "Методика курса и контроль качества", file: "course/00-guide.md", group: "Методика", desc: "Обозначения, правила решения карточек [Р], оценка и реализм paper-учёта.", emoji: "🧭" },
  { slug: "review", title: "Повторение и secret-glitch награды", file: "@review", group: "Методика", desc: "Интервальные повторения +1/+3/+7/+16/+35 и шесть юмористических карточек-наград.", emoji: "🔁" },
  { slug: "glossary", title: "Глоссарий трейдера", file: "appendices/glossary.md", group: "Приложения", desc: "Простые определения всех ключевых терминов.", emoji: "📖" },
  { slug: "workbook", title: "Рабочая тетрадь по расчётам", file: "appendices/calculation-workbook.md", group: "Приложения", desc: "Размер позиции, R, expectancy, funding rate и кластерный риск.", emoji: "🧮" },
  { slug: "evidence", title: "Протокол источников и кейсов", file: "appendices/evidence-and-data-protocol.md", group: "Приложения", desc: "Стандарт исторических сценариев и модель издержек.", emoji: "🔬" },
  { slug: "rubrics", title: "Рубрики освоения 100 уровней", file: "appendices/competency-rubrics.md", group: "Приложения", desc: "Артефакты, условия зачёта и критические ошибки каждого урока.", emoji: "✅" },
  { slug: "terminology", title: "Терминологический стандарт", file: "appendices/terminology-style-guide.md", group: "Приложения", desc: "Канонические русские и английские формы терминов.", emoji: "🔤" },
  { slug: "strategy-card", title: "Карточка торговой стратегии", file: "templates/strategy-card.md", group: "Шаблоны", desc: "Паспорт, сетап, исполнение, тестирование.", emoji: "🗂️" },
  { slug: "audit-30", title: "Аудит 30 сделок", file: "templates/audit-30-trades.md", group: "Шаблоны", desc: "Шаблон ревью журнала.", emoji: "🔍" },
  { slug: "capstone-defense", title: "Защита capstone", file: "templates/capstone-defense.md", group: "Шаблоны", desc: "Формат защиты и 20 проверочных вопросов.", emoji: "🎓" },
];

export const CSV_FILES = ["trade-journal.csv", "backtest-log.csv", "capstone-log.csv"];

export const CARD_META = [
  { key: "T", name: "Теория", emoji: "📘", hint: "Короткое правило и схема" },
  { key: "P", name: "Пример", emoji: "🔎", hint: "Разбор рыночного сценария" },
  { key: "R", name: "Решение", emoji: "🎯", hint: "Карточка решения — фиксируйте до разбора" },
  { key: "D", name: "Разбор", emoji: "🧠", hint: "Debrief логики в R" },
  { key: "E", name: "Проверка", emoji: "📝", hint: "Мини-экзамен с ключом" },
] as const;
export type CardKey = (typeof CARD_META)[number]["key"];

export function mapHref(href: string | undefined): string | undefined {
  if (!href) return href;
  if (/^https?:/.test(href)) return href;
  const hash = href.includes("#") ? "#" + href.split("#")[1] : "";
  const file = href.split("#")[0].split("/").pop() ?? "";
  const mod = MODULES.find((m) => m.file === file);
  if (mod) return `/module/${mod.id}${hash}`;
  if (file === "00-guide.md") return "/docs/guide";
  const doc = DOCS.find((d) => d.file.endsWith("/" + file));
  if (doc) return `/docs/${doc.slug}${hash}`;
  if (file.endsWith(".csv")) return `/api/download/${file}`;
  return href;
}
