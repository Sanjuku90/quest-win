import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Import auth models for relations
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===
export const userBalances = pgTable("user_balances", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  mainBalance: numeric("main_balance").notNull().default("0"),
  lockedBonus: numeric("locked_bonus").notNull().default("0"),
  questEarnings: numeric("quest_earnings").notNull().default("0"),
  investmentTier: integer("investment_tier").notNull().default(0),
  lastDailyReset: timestamp("last_daily_reset").defaultNow(),
  role: text("role").notNull().default("user"),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  rewardAmount: numeric("reward_amount").notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const usersRelations = relations(users, ({ one, many }) => ({
  balance: one(userBalances, {
    fields: [users.id],
    references: [userBalances.userId],
  }),
  quests: many(quests),
  transactions: many(transactions),
}));

export const userBalancesRelations = relations(userBalances, ({ one }) => ({
  user: one(users, {
    fields: [userBalances.userId],
    references: [users.id],
  }),
}));

export const questsRelations = relations(quests, ({ one }) => ({
  user: one(users, {
    fields: [quests.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// === SCHEMAS ===
export const insertQuestSchema = createInsertSchema(quests).omit({ 
  id: true, 
  createdAt: true, 
  completedAt: true 
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===

export type Quest = typeof quests.$inferSelect;
export type UserBalance = typeof userBalances.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export type CompleteQuestRequest = { questId: number };
export type PlayRouletteRequest = { betAmount: number };
export type DepositRequest = { amount: number };
export type WithdrawRequest = { amount: number };
export type AdminApproveRequest = { transactionId: number; action: "approve" | "reject" };

export type DashboardStatsResponse = {
  balance: UserBalance;
  completedQuestsCount: number;
  totalQuestsCount: number;
  nextResetTime: string;
};

export type RouletteResultResponse = {
  won: boolean;
  amount: number;
  newBalance: UserBalance;
};

export type UpsertUser = typeof users.$inferInsert;
