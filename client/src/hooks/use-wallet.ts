import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { DepositRequest, WithdrawRequest } from "@shared/schema";

export function useTransactions() {
  return useQuery({
    queryKey: [api.wallet.history.path],
    queryFn: async () => {
      const res = await fetch(api.wallet.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.wallet.history.responses[200].parse(await res.json());
    },
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: DepositRequest) => {
      const res = await fetch(api.wallet.deposit.path, {
        method: api.wallet.deposit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Deposit failed");
      return api.wallet.deposit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dashboard.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
      toast({
        title: "Deposit Successful",
        description: "Funds have been added to your wallet.",
      });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: WithdrawRequest) => {
      const res = await fetch(api.wallet.withdraw.path, {
        method: api.wallet.withdraw.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Withdrawal failed");
      }
      return api.wallet.withdraw.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dashboard.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
      toast({
        title: "Withdrawal Processed",
        description: "Funds have been sent to your external account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
