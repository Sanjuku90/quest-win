import { AppLayout } from "@/components/layout/app-layout";
import { useQuests } from "@/hooks/use-quests";
import { QuestCard } from "@/components/quests/quest-card";
import { Target, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type DashboardStatsResponse } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

export default function Quests() {
  const { data: quests, isLoading } = useQuests();
  const { data: stats } = useQuery<DashboardStatsResponse>({
    queryKey: [api.dashboard.get.path],
  });

  const hasInvestment = Number(stats?.balance?.mainBalance || 0) > 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Target className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display font-bold">Daily Quests</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Complete tasks to earn real rewards. Resets daily at midnight.
          </p>
        </div>

        {!hasInvestment && (
          <Card className="border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-widest text-yellow-500">Investment Required</p>
                <p className="text-sm text-muted-foreground">You need an active investment balance to complete daily quests and earn rewards.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests?.map((quest) => (
              <QuestCard key={quest.id} quest={quest} disabled={!hasInvestment} />
            ))}
            {quests?.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No quests available right now. Check back later!
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
