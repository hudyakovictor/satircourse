export type Sat = {
  /** tabloid headline */
  h: string;
  /** banner slogan for illustration */
  s: string;
  /** two signboard labels for illustration */
  l: [string, string];
  /** chronicle: expanded satirical explanation */
  c: string;
  /** meme / easter egg line */
  m: string;
  /** cold final punch */
  p: string;
  /** myth / truth / price table rows */
  t: [string, string, string][];
  /** illustration motifs */
  k: string[];
};

export type Visual = { kind: string; prompt: string; before: string };

export type Lesson = {
  id: number;
  code: string;
  module: string;
  title: string;
  isExam: boolean;
  theory: string;
  schema: string;
  example: string;
  decision: string;
  debrief: string;
  examQ: string;
  examKey: string;
  footer: string;
  visuals: Visual[];
};

export type CourseModule = {
  letter: string;
  title: string;
  range: string;
  goal: string;
  support: string;
};
