import { pgTable, serial, text, integer, boolean, jsonb, timestamp, real, uniqueIndex } from "drizzle-orm/pg-core";

export const progress = pgTable(
  "progress",
  {
    id: serial("id").primaryKey(),
    playerId: text("player_id").notNull(),
    lessonId: integer("lesson_id").notNull(),
    decision: jsonb("decision"),
    examScore: integer("exam_score"),
    examMax: integer("exam_max"),
    completed: boolean("completed").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("progress_player_lesson").on(t.playerId, t.lessonId)],
);

export const journalTrades = pgTable("journal_trades", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull(),
  pair: text("pair").notNull(),
  side: text("side").notNull(),
  setup: text("setup").notNull().default(""),
  entry: real("entry").notNull(),
  stop: real("stop").notNull(),
  exit: real("exit").notNull(),
  rResult: real("r_result").notNull(),
  emotion: text("emotion").notNull().default(""),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
