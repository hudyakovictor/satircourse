export type FigureKind =
  | "candles"
  | "risk"
  | "cycle"
  | "cascade"
  | "psych"
  | "orderbook"
  | "flow";

export type Block =
  | { type: "lead"; text: string }
  | { type: "h"; text: string }
  | { type: "p"; text: string }
  | { type: "slogan"; lines: string[]; tone?: "lime" | "magenta" | "cream" }
  | { type: "list"; title?: string; items: string[] }
  | { type: "quote"; text: string; source?: string }
  | { type: "memo"; title: string; body: string; stamp: string }
  | { type: "truth"; text: string }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "formula"; expr: string; note: string }
  | { type: "figure"; kind: FigureKind; title: string; caption: string };

export type Question = {
  q: string;
  options: string[];
  correct: number;
  onRight: string;
  onWrong: string;
};

export type Lesson = {
  slug: string;
  title: string;
  kicker: string;
  tagline: string;
  minutes: number;
  level: "ВХОД" | "ОСНОВА" | "УГЛУБЛЕНИЕ" | "ВЫЖИВАНИЕ";
  blocks: Block[];
  quiz: Question[];
};

export type Chapter = {
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  cover: string;
  ink: "magenta" | "lime" | "cyan" | "cream";
  brief: string;
  lessons: Lesson[];
};

export type GlossaryTerm = {
  term: string;
  official: string;
  real: string;
  danger: "НИЗКИЙ" | "СРЕДНИЙ" | "ВЫСОКИЙ" | "ЛЕТАЛЬНЫЙ";
};
