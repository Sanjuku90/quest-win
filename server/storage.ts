import { 
  users, type User, type UpsertUser,
  userBalances, type UserBalance,
  quests, type Quest,
  transactions, type Transaction,
  type RouletteResultResponse
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ne } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  getUserBalance(userId: string): Promise<UserBalance>;
  getTransactionHistory(userId: string): Promise<Transaction[]>;
  createDepositRequest(userId: string, amount: number): Promise<Transaction>;
  createWithdrawalRequest(userId: string, amount: number): Promise<Transaction>;
  getPendingTransactions(): Promise<(Transaction & { userEmail: string })[]>;
  handleTransactionApproval(txId: number, action: "approve" | "reject"): Promise<void>;
  getUserQuests(userId: string): Promise<Quest[]>;
  completeQuest(userId: string, questId: number): Promise<Quest>;
  playRoulette(userId: string): Promise<RouletteResultResponse>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserBalance(userId: string): Promise<UserBalance> {
    let [balance] = await db.select().from(userBalances).where(eq(userBalances.userId, userId));
    
    if (!balance) {
      const [newBalance] = await db.insert(userBalances).values({
        userId,
        mainBalance: "0",
        lockedBonus: "0",
        questEarnings: "0",
        investmentTier: 0,
        role: "user",
      }).returning();
      balance = newBalance;
      await this.generateDailyQuests(userId);
    }

    const now = new Date();
    const lastReset = balance.lastDailyReset ? new Date(balance.lastDailyReset) : new Date(0);
    if (now.getUTCDate() !== lastReset.getUTCDate()) {
      await this.resetDailyQuests(userId);
      await db.update(userBalances).set({ lastDailyReset: now }).where(eq(userBalances.id, balance.id));
    }

    return balance;
  }

  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async createDepositRequest(userId: string, amount: number): Promise<Transaction> {
    if (amount < 20) {
      throw new Error("Minimum deposit amount is $20");
    }
    const [tx] = await db.insert(transactions).values({
      userId,
      type: "deposit",
      amount: amount.toString(),
      status: "pending",
    }).returning();
    return tx;
  }

  async createWithdrawalRequest(userId: string, amount: number): Promise<Transaction> {
    if (amount < 50) {
      throw new Error("Minimum withdrawal amount is $50");
    }
    const balance = await this.getUserBalance(userId);
    const available = Number(balance.mainBalance) + Number(balance.questEarnings);
    if (available < amount) {
      throw new Error("Insufficient funds");
    }

    const [tx] = await db.insert(transactions).values({
      userId,
      type: "withdrawal",
      amount: amount.toString(),
      status: "pending",
    }).returning();
    return tx;
  }

  async getPendingTransactions(): Promise<(Transaction & { userEmail: string })[]> {
    const results = await db.select({
      tx: transactions,
      email: users.email
    })
    .from(transactions)
    .innerJoin(users, eq(transactions.userId, users.id))
    .where(eq(transactions.status, "pending"))
    .orderBy(desc(transactions.createdAt));

    console.log("Pending transactions found:", results.length);
    return results.map(r => ({ ...r.tx, userEmail: r.email }));
  }

  async handleTransactionApproval(txId: number, action: "approve" | "reject"): Promise<void> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.id, txId));
    if (!tx) throw new Error("Transaction not found");
    if (tx.status !== 'pending') return;

    if (action === 'reject') {
      await db.update(transactions).set({ status: 'failed' }).where(eq(transactions.id, txId));
      return;
    }

    // Approve logic
    const userId = tx.userId;
    const amount = Number(tx.amount);
    const balance = await this.getUserBalance(userId);

    if (tx.type === 'deposit') {
      const history = await this.getTransactionHistory(userId);
      const isFirstDeposit = !history.some(h => h.type === 'deposit' && h.status === 'completed');
      const bonus = isFirstDeposit ? amount * 0.40 : 0;

      await db.update(userBalances).set({
        mainBalance: (Number(balance.mainBalance) + amount).toString(),
        lockedBonus: (Number(balance.lockedBonus) + bonus).toString(),
      }).where(eq(userBalances.userId, userId));
    } else if (tx.type === 'withdrawal') {
      let rem = amount;
      let qE = Number(balance.questEarnings);
      let mB = Number(balance.mainBalance);
      
      if (qE >= rem) { qE -= rem; rem = 0; }
      else { rem -= qE; qE = 0; mB -= rem; }

      await db.update(userBalances).set({
        mainBalance: mB.toString(),
        questEarnings: qE.toString(),
      }).where(eq(userBalances.userId, userId));
    }

    await db.update(transactions).set({ status: 'completed' }).where(eq(transactions.id, txId));
  }

  async getUserQuests(userId: string): Promise<Quest[]> {
    await this.getUserBalance(userId);
    return db.select().from(quests).where(eq(quests.userId, userId));
  }

  async completeQuest(userId: string, questId: number): Promise<Quest> {
    const balance = await this.getUserBalance(userId);
    if (Number(balance.mainBalance) <= 0) {
      throw new Error("Investment required to complete quests");
    }

    const [quest] = await db.select().from(quests).where(and(eq(quests.id, questId), eq(quests.userId, userId)));
    if (!quest || quest.isCompleted) throw new Error("Quest not found or completed");

    const [updated] = await db.update(quests).set({ isCompleted: true, completedAt: new Date() }).where(eq(quests.id, questId)).returning();
    await db.update(userBalances).set({
      questEarnings: (Number(balance.questEarnings) + Number(quest.rewardAmount)).toString()
    }).where(eq(userBalances.userId, userId));

    return updated;
  }

  private async generateDailyQuests(userId: string) {
    const [balance] = await db.select().from(userBalances).where(eq(userBalances.userId, userId));
    const base = Number(balance?.mainBalance) || 10000;
    const reward = base * 0.35;
    const types = ['video', 'quiz', 'link', 'referral'] as const;
    for (const type of types) {
      await db.insert(quests).values({ userId, type, description: `Task: ${type}`, rewardAmount: reward.toString() });
    }
  }

  private async resetDailyQuests(userId: string) {
    await db.delete(quests).where(eq(quests.userId, userId));
    await this.generateDailyQuests(userId);
  }

  async playRoulette(userId: string): Promise<RouletteResultResponse> {
    const balance = await this.getUserBalance(userId);
    const locked = Number(balance.lockedBonus);
    if (locked <= 0) throw new Error("No locked bonus");

    const won = Math.random() > 0.5;
    const newMain = won ? Number(balance.mainBalance) + locked : Number(balance.mainBalance);
    const [updated] = await db.update(userBalances).set({ mainBalance: newMain.toString(), lockedBonus: "0" }).where(eq(userBalances.userId, userId)).returning();
    return { won, amount: won ? locked : 0, newBalance: updated };
  }
}

export const storage = new DatabaseStorage();
