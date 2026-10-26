import { boolean, integer, jsonb, pgTable, primaryKey, real, serial, text, timestamp } from "drizzle-orm/pg-core";

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    learnerId: text("learner_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    done: boolean("done").notNull().default(false),
    examScore: integer("exam_score"),
    examTotal: integer("exam_total"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.learnerId, t.lessonId] })],
);

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  learnerId: text("learner_id").notNull(),
  pair: text("pair").notNull().default("BTC/USDT"),
  side: text("side").notNull().default("long"),
  entry: real("entry"),
  stop: real("stop"),
  exit: real("exit"),
  riskUsd: real("risk_usd"),
  rMultiple: real("r_multiple").notNull().default(0),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
