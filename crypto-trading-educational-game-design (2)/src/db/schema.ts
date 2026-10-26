import { pgTable, text, jsonb, timestamp, serial, integer, boolean, index } from "drizzle-orm/pg-core";

// Player: authoritative state lives on the server (not in localStorage).
export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("Кадет"),
  state: jsonb("state").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Scenario: the future candles are stored ONLY here and are never sent before commit.
export const scenarios = pgTable(
  "scenarios",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id").notNull(),
    mode: text("mode").notNull(), // practice | battle | exam-trade
    seed: integer("seed").notNull(),
    payload: jsonb("payload").notNull(), // full scenario incl. hidden future
    futureHash: text("future_hash").notNull(),
    committed: boolean("committed").notNull().default(false),
    decision: jsonb("decision"),
    decisionHash: text("decision_hash"),
    result: jsonb("result"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    committedAt: timestamp("committed_at"),
  },
  (t) => [index("scenarios_player_idx").on(t.playerId)],
);

// Mechanics-lab runs (Telegram-verified user or anonymous cookie).
export const runs = pgTable(
  "runs",
  {
    id: serial("id").primaryKey(),
    userKey: text("user_key").notNull(),
    mechanic: text("mechanic").notNull(),
    score: integer("score").notNull(),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("runs_user_idx").on(t.userKey)],
);

// Append-only telemetry / evidence log.
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    playerId: text("player_id").notNull(),
    type: text("type").notNull(),
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("events_player_idx").on(t.playerId)],
);
