import { Quest } from "@shared/schema";
import { GlassCard } from "@/components/ui/card-stack";
import { Button } from "@/components/ui/button";
import { Video, BrainCircuit, Link2, Users, CheckCircle2 } from "lucide-react";
import { useCompleteQuest } from "@/hooks/use-quests";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const icons = {
  video: Video,
  quiz: BrainCircuit,
  link: Link2,
  referral: Users,
};

export function QuestCard({ quest, disabled }: { quest: Quest; disabled?: boolean }) {
  const { mutate: complete, isPending } = useCompleteQuest();
  const Icon = icons[quest.type as keyof typeof icons] || Link2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className={cn(
        "group h-full flex flex-col justify-between",
        quest.isCompleted ? "opacity-60 grayscale" : "hover:border-primary/50",
        disabled && !quest.isCompleted && "grayscale opacity-50"
      )}>
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className={cn(
              "p-3 rounded-xl transition-colors",
              quest.isCompleted ? "bg-white/5 text-muted-foreground" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="text-right">
              <span className="block text-2xl font-bold font-display text-accent">
                ${quest.rewardAmount}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Reward</span>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
            {quest.type.charAt(0).toUpperCase() + quest.type.slice(1)} Quest
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {quest.description}
          </p>
        </div>

        <Button
          onClick={() => complete(quest.id)}
          disabled={quest.isCompleted || isPending || disabled}
          className={cn(
            "w-full rounded-xl h-12 font-semibold transition-all duration-300",
            quest.isCompleted 
              ? "bg-secondary text-muted-foreground hover:bg-secondary cursor-default"
              : "bg-gradient-to-r from-primary to-primary/80 hover:to-primary hover:shadow-lg hover:shadow-primary/25"
          )}
        >
          {isPending ? (
            "Verifying..."
          ) : quest.isCompleted ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </span>
          ) : (
            "Start Quest"
          )}
        </Button>
      </GlassCard>
    </motion.div>
  );
}
