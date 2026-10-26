import { pgTable, serial, text, integer, boolean, timestamp, jsonb, real, uniqueIndex, index } from "drizzle-orm/pg-core";

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    clientId: text("client_id").notNull(),
    code: text("code").notNull(),
    cardsSeen: jsonb("cards_seen").$type<string[]>().notNull().default([]),
    decision: jsonb("decision").$type<Record<string, string>>().notNull().default({}),
    quizScore: integer("quiz_score"),
    quizTotal: integer("quiz_total"),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("lesson_progress_client_code").on(t.clientId, t.code)],
);

export const trades = pgTable(
  "trades",
  {
    id: serial("id").primaryKey(),
    clientId: text("client_id").notNull(),
    date: text("date").notNull(),
    market: text("market").notNull(),
    side: text("side").notNull(),
    setup: text("setup").notNull().default(""),
    riskUsd: real("risk_usd").notNull().default(0),
    netR: real("net_r").notNull().default(0),
    processPass: boolean("process_pass").notNull().default(true),
    emotion: text("emotion").notNull().default(""),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("trades_client_idx").on(t.clientId)],
);
