import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Replit Auth ID
  email: text("email").unique(),
  password: text("password"),
  username: text("username"),
  firstName: text("firstName"),
  lastName: text("lastName"),
  profileImageUrl: text("profileImageUrl"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

export const userBalances = sqliteTable("user_balances", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  mainBalance: text("main_balance").notNull().default("0"),
  lockedBonus: text("locked_bonus").notNull().default("0"),
  questEarnings: text("quest_earnings").notNull().default("0"),
  investmentTier: text("investment_tier").notNull().default("0"),
  lastDailyReset: integer("last_daily_reset", { mode: 'timestamp' }).default(new Date()),
  role: text("role").notNull().default("user"),
});

export const quests = sqliteTable("quests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  rewardAmount: text("reward_amount").notNull(),
  isCompleted: integer("is_completed", { mode: 'boolean' }).default(false),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  amount: text("amount").notNull(),
  status: text("status").default("pending"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

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

export const insertQuestSchema = createInsertSchema(quests).omit({ 
  id: true, 
  createdAt: true, 
  completedAt: true 
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true 
});

export type Quest = typeof quests.$inferSelect;
export type UserBalance = typeof userBalances.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type RouletteResultResponse = {
  won: boolean;
  amount: number;
  newBalance: UserBalance;
};

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
