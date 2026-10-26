import { boolean, integer, jsonb, pgTable, real, serial, text, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("Мелкая рыбёшка"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessonState = pgTable(
  "lesson_state",
  {
    playerId: text("player_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    decision: jsonb("decision").$type<Record<string, string>>(),
    decisionLockedAt: timestamp("decision_locked_at"),
    examScore: integer("exam_score"),
    examTotal: integer("exam_total"),
    passed: boolean("passed").notNull().default(false),
    completedAt: timestamp("completed_at"),
    recallStage: integer("recall_stage").notNull().default(0),
    recallDue: timestamp("recall_due"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.playerId, t.lessonId] })],
);

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull(),
  pair: text("pair").notNull(),
  side: text("side").notNull(),
  setup: text("setup").notNull().default(""),
  entry: real("entry"),
  stop: real("stop"),
  riskR: real("risk_r").notNull().default(1),
  resultR: real("result_r").notNull(),
  followedProcess: boolean("followed_process").notNull().default(true),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
