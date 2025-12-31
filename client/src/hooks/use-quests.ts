import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useQuests() {
  return useQuery({
    queryKey: [api.quests.list.path],
    queryFn: async () => {
      const res = await fetch(api.quests.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch quests");
      return api.quests.list.responses[200].parse(await res.json());
    },
  });
}

export function useCompleteQuest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (questId: number) => {
      const url = buildUrl(api.quests.complete.path, { id: questId });
      const res = await fetch(url, {
        method: api.quests.complete.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to complete quest");
      }
      
      return api.quests.complete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quests.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.get.path] }); // Update balance
      toast({
        title: "Quest Completed!",
        description: "Your reward has been added to your balance.",
        variant: "default",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
