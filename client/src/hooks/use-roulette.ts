import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePlayRoulette() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.roulette.play.path, {
        method: api.roulette.play.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Empty object as per schema
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to play roulette");
      }

      return api.roulette.play.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.dashboard.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
      
      if (data.won) {
        toast({
          title: "JACKPOT! 🎉",
          description: `You won $${data.amount}!`,
          className: "bg-accent text-accent-foreground border-none font-bold",
        });
      } else {
        toast({
          title: "Better luck next time",
          description: "Try again tomorrow for another chance!",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Cannot Play",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
