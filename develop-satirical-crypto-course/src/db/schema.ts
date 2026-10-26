import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  alias: text("alias").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const progress = pgTable(
  "progress",
  {
    id: serial("id").primaryKey(),
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    chapterSlug: text("chapter_slug").notNull(),
    lessonSlug: text("lesson_slug").notNull(),
    quizScore: integer("quiz_score").default(0).notNull(),
    quizTotal: integer("quiz_total").default(0).notNull(),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("progress_session_lesson").on(t.sessionId, t.lessonSlug)]
);

export const journal = pgTable("journal", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  mood: varchar("mood", { length: 24 }).notNull(),
  damage: integer("damage").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const simRuns = pgTable("sim_runs", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  alias: text("alias").notNull(),
  pnl: integer("pnl").notNull(),
  correct: integer("correct").notNull(),
  rounds: integer("rounds").notNull(),
  verdict: text("verdict").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SessionRow = typeof sessions.$inferSelect;
export type ProgressRow = typeof progress.$inferSelect;
export type JournalRow = typeof journal.$inferSelect;
export type SimRunRow = typeof simRuns.$inferSelect;
