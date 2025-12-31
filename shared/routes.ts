import { z } from 'zod';
import { insertQuestSchema, quests, userBalances, transactions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  insufficientFunds: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  dashboard: {
    get: {
      method: 'GET' as const,
      path: '/api/dashboard',
      responses: {
        200: z.object({
          balance: z.custom<typeof userBalances.$inferSelect>(),
          completedQuestsCount: z.number(),
          totalQuestsCount: z.number(),
          nextResetTime: z.string(),
        }),
        401: z.object({ message: z.string() }),
      },
    },
  },
  quests: {
    list: {
      method: 'GET' as const,
      path: '/api/quests',
      responses: {
        200: z.array(z.custom<typeof quests.$inferSelect>()),
      },
    },
    complete: {
      method: 'POST' as const,
      path: '/api/quests/:id/complete',
      responses: {
        200: z.custom<typeof quests.$inferSelect>(),
        404: errorSchemas.notFound,
        400: z.object({ message: z.string() }),
      },
    },
  },
  roulette: {
    play: {
      method: 'POST' as const,
      path: '/api/roulette/play',
      input: z.object({}),
      responses: {
        200: z.object({
          won: z.boolean(),
          amount: z.number(),
          newBalance: z.custom<typeof userBalances.$inferSelect>(),
        }),
        400: z.object({ message: z.string() }),
      },
    },
  },
  wallet: {
    deposit: {
      method: 'POST' as const,
      path: '/api/wallet/deposit',
      input: z.object({ amount: z.number().min(20) }),
      responses: {
        200: z.custom<typeof transactions.$inferSelect>(),
      },
    },
    withdraw: {
      method: 'POST' as const,
      path: '/api/wallet/withdraw',
      input: z.object({ amount: z.number().min(50) }),
      responses: {
        200: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.insufficientFunds,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/wallet/history',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
  },
  admin: {
    pendingTransactions: {
      method: 'GET' as const,
      path: '/api/admin/transactions/pending',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect & { userEmail: string }>()),
        403: errorSchemas.unauthorized,
      },
    },
    approveTransaction: {
      method: 'POST' as const,
      path: '/api/admin/transactions/:id/approve',
      input: z.object({ action: z.enum(["approve", "reject"]) }),
      responses: {
        200: z.object({ success: z.boolean() }),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
