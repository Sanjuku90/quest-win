import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { StatCard } from "@/components/ui/card-stack";
import { Wallet, Lock, Trophy, Timer, Target as TargetIcon, Gamepad as GamepadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-20 w-1/3 bg-white/5 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-white/5 rounded-2xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const resetDate = dashboard ? new Date(dashboard.nextResetTime) : new Date();
  const timeLeft = Math.max(0, Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60)));

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display text-white">
              Welcome back, <span className="text-gradient">{user?.firstName || 'Investor'}</span>
            </h1>
            <p className="mt-2 text-muted-foreground">Here's your daily performance summary.</p>
          </div>
          <Link href="/wallet">
            <Button size="lg" className="rounded-xl font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              Deposit Funds
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Main Balance"
              value={`$${dashboard?.balance.mainBalance}`}
              icon={Wallet}
              trend="Available to withdraw"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Locked Bonus"
              value={`$${dashboard?.balance.lockedBonus}`}
              icon={Lock}
              trend="Unlock via Roulette"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Quest Earnings"
              value={`$${dashboard?.balance.questEarnings}`}
              icon={Trophy}
              trend={`${dashboard?.completedQuestsCount}/${dashboard?.totalQuestsCount} Quests Done`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Next Reset"
              value={`${timeLeft}h`}
              icon={Timer}
              trend="Until new quests"
            />
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-purple-900/20 border border-primary/20 p-8"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Daily Quests</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Complete today's tasks to earn guaranteed rewards added directly to your main balance.</p>
              <Link href="/quests">
                <Button variant="secondary" className="rounded-xl">View Quests</Button>
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <TargetIcon className="w-64 h-64 text-primary" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 to-yellow-900/20 border border-accent/20 p-8"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2 text-accent">Play Roulette</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Use your locked bonus to spin the wheel. Win and it moves to your main balance instantly!</p>
              <Link href="/roulette">
                <Button className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">Play Now</Button>
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <GamepadIcon className="w-64 h-64 text-accent" />
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
