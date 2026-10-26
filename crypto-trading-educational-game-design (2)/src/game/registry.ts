export type Group = "memory" | "classify" | "chart" | "risk" | "desk" | "boss" | "reflect" | "arcade";

export const GROUPS: { id: Group; icon: string; name: string; color: string }[] = [
  { id: "memory", icon: "🧠", name: "Память", color: "#7c5cff" },
  { id: "classify", icon: "🔀", name: "Различение", color: "#00c2ff" },
  { id: "chart", icon: "📈", name: "График", color: "#2ee6a6" },
  { id: "risk", icon: "🛡️", name: "Риск", color: "#ffb020" },
  { id: "desk", icon: "🧭", name: "Анализ", color: "#4d8dff" },
  { id: "boss", icon: "👁️", name: "Враги", color: "#ff4d6d" },
  { id: "reflect", icon: "📓", name: "Рефлексия", color: "#c792ea" },
  { id: "arcade", icon: "🕹️", name: "Аркады", color: "#ff7ad9" },
];

export interface Mech { id: string; code: string; name: string; icon: string; group: Group; goal: string; skill: string; science: string }

export const MECHS: Mech[] = [
  { id: "m01", code: "M01", name: "Квиз 2.0", icon: "❓", group: "memory", goal: "Ответь, пока горит таймер", skill: "Любая карта", science: "Testing effect" },
  { id: "m02", code: "M02", name: "Спид-раунд", icon: "⚡", group: "memory", goal: "Правда или миф — 30 секунд", skill: "Правила дисциплины", science: "Retrieval под нагрузкой" },
  { id: "m03", code: "M03", name: "Пары", icon: "🃏", group: "memory", goal: "Найди термин и смысл", skill: "Глоссарий", science: "Associative recall" },
  { id: "m04", code: "M04", name: "Процедура", icon: "🧩", group: "memory", goal: "Собери шаги по порядку", skill: "Risk First Mode", science: "Procedural chunking" },
  { id: "m17", code: "M17", name: "Выше / Ниже", icon: "↕️", group: "memory", goal: "Угадай следующую свечу", skill: "Претест главы", science: "Pretesting effect" },
  { id: "m05", code: "M05", name: "Бык / Медведь", icon: "🐂", group: "classify", goal: "Свайпни новость", skill: "News Is Not a Signal", science: "Interleaving" },
  { id: "m06", code: "M06", name: "Корзины", icon: "🧺", group: "classify", goal: "Разложи графики по режимам", skill: "Out of Market Is Normal", science: "Category learning" },
  { id: "m07", code: "M07", name: "Охота на паттерн", icon: "🔎", group: "chart", goal: "Тапни аномалию", skill: "Volume Confirmation", science: "Perceptual learning" },
  { id: "m08", code: "M08", name: "Разметка зон", icon: "📏", group: "chart", goal: "Проведи уровень", skill: "Liquidity Map", science: "Generation effect" },
  { id: "m09", code: "M09", name: "Конструктор свечи", icon: "🕯️", group: "chart", goal: "Построй свечу из OHLC", skill: "Анатомия свечи", science: "Learning by making" },
  { id: "m10", code: "M10", name: "График-пазл", icon: "🧱", group: "chart", goal: "Собери тренд из кусков", skill: "Market Structure", science: "Schema building" },
  { id: "m11", code: "M11", name: "Оцени на глаз", icon: "👁‍🗨", group: "chart", goal: "Угадай RSI и ATR", skill: "Volatility Context", science: "Calibrated perception" },
  { id: "m16", code: "M16", name: "Прогноз + уверенность", icon: "🎯", group: "chart", goal: "Ставь уверенность, не деньги", skill: "Confidence Check", science: "Brier calibration" },
  { id: "m12", code: "M12", name: "Риск-менеджер", icon: "🧯", group: "risk", goal: "Поставь стоп и тейк", skill: "Set Structural Stop", science: "Worked → faded" },
  { id: "m13", code: "M13", name: "PnL-спринт", icon: "🧮", group: "risk", goal: "Посчитай размер позиции", skill: "Risk Cap", science: "Fluency drill" },
  { id: "m14", code: "M14", name: "Лимитная лесенка", icon: "🪜", group: "risk", goal: "Расставь лимитки в зоне", skill: "No Averaging Without a Plan", science: "Planning" },
  { id: "m15", code: "M15", name: "Лестница плеча", icon: "🎢", group: "risk", goal: "Забери или рискни", skill: "Derivatives Pulse", science: "Loss salience" },
  { id: "m18", code: "M18", name: "Стол аналитика", icon: "🧭", group: "desk", goal: "Реши по всем источникам", skill: "Интеграция", science: "Transfer, hidden future" },
  { id: "lens", code: "LNS", name: "Линзы", icon: "🔭", group: "desk", goal: "Надень индикатор-линзу", skill: "No Confirmation No Trade", science: "Anti-Indicator Cult" },
  { id: "m19", code: "M19", name: "Реплей рынка", icon: "⏯️", group: "desk", goal: "Торгуй в живом реплее", skill: "Полный цикл", science: "Simulation practice" },
  { id: "m20", code: "M20", name: "Стакан", icon: "📚", group: "desk", goal: "Читай bid, ask и стены", skill: "Liquidity Map", science: "Visual search" },
  { id: "m21", code: "M21", name: "Сценарный дрилл", icon: "🗓️", group: "desk", goal: "Реагируй на события", skill: "Unlock Calendar", science: "Decision under uncertainty" },
  { id: "m22", code: "M22", name: "Босс-бой", icon: "👹", group: "boss", goal: "Контрой искажение картой", skill: "40 карт × 40 Entities", science: "Transfer test" },
  { id: "shadow", code: "A4", name: "Демо: Тень", icon: "🌑", group: "boss", goal: "Единственный показательный бой", skill: "Worked example", science: "Modeling" },
  { id: "m23", code: "M23", name: "Boss Rush", icon: "☠️", group: "boss", goal: "5 врагов подряд", skill: "Интерливинг врагов", science: "Spaced mastery" },
  { id: "m24", code: "M24", name: "Пост-мортем", icon: "📓", group: "reflect", goal: "Оцени процесс, не исход", skill: "Discipline Over Profit", science: "Reflection" },
  { id: "b01", code: "Б01", name: "Candle Catcher", icon: "🧺", group: "arcade", goal: "Лови свечи с объёмом", skill: "Volume Confirmation", science: "Reward slot" },
  { id: "b02", code: "Б02", name: "Spin", icon: "🎡", group: "arcade", goal: "Крутить или забрать?", skill: "Expected value", science: "EV intuition" },
  { id: "b03", code: "Б03", name: "Scratch", icon: "🪙", group: "arcade", goal: "Прогноз → сотри будущее", skill: "Prediction", science: "Curiosity gap" },
  { id: "b04", code: "Б04", name: "Runner", icon: "🏃", group: "arcade", goal: "Перепрыгивай FOMO", skill: "Do Not Chase", science: "Reward slot" },
  { id: "b05", code: "Б05", name: "Snake", icon: "🐍", group: "arcade", goal: "Ешь профит, не риск", skill: "Risk Cap", science: "Reward slot" },
  { id: "b06", code: "Б06", name: "Aim", icon: "🎯", group: "arcade", goal: "Стреляй по сигналам, не шуму", skill: "Noise Quarantine", science: "Inhibition" },
  { id: "b07", code: "Б07", name: "Loot", icon: "🎁", group: "arcade", goal: "Выбери сундук по шансам", skill: "Odds literacy", science: "Transparent odds" },
];

export const MECH_BY_ID: Record<string, Mech> = Object.fromEntries(MECHS.map((m) => [m.id, m]));
export const groupOf = (g: Group) => GROUPS.find((x) => x.id === g)!;
export const starsFor = (score: number) => (score >= 90 ? 3 : score >= 60 ? 2 : score >= 30 ? 1 : 0);
