import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/card-stack";
import { Button } from "@/components/ui/button";
import { usePlayRoulette } from "@/hooks/use-roulette";
import { useDashboard } from "@/hooks/use-dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Trophy, Frown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Roulette() {
  const { data: dashboard } = useDashboard();
  const { mutate: play, isPending, data: result } = usePlayRoulette();
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    setIsSpinning(true);
    play(undefined, {
      onSettled: () => setTimeout(() => setIsSpinning(false), 2000), // Min spin time
    });
  };

  const hasBonus = Number(dashboard?.balance.lockedBonus || 0) > 0;
  const lockedBonus = Number(dashboard?.balance.lockedBonus || 0).toFixed(2);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient">
            Bonus Roulette
          </h1>
          <p className="text-muted-foreground text-lg">
            Spin the wheel to unlock your pending bonus balance!
          </p>
        </div>

        <GlassCard className="p-8 md:p-12 relative overflow-hidden flex flex-col items-center gap-8">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-sm text-muted-foreground uppercase tracking-wider block text-center mb-1">
                Locked Bonus Available
              </span>
              <span className="text-3xl font-mono font-bold text-white block text-center">
                ${lockedBonus}
              </span>
            </div>

            {/* The Wheel/Game Area */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
              <motion.div
                className="w-full h-full rounded-full border-4 border-accent/30 bg-black/50 relative overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]"
                animate={{ rotate: isSpinning ? 360 * 5 : 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                {/* Decorative segments */}
                <div className="absolute inset-0 bg-[conic-gradient(var(--accent)_0deg_90deg,transparent_90deg_180deg,var(--accent)_180deg_270deg,transparent_270deg_360deg)] opacity-20" />
                
                {/* Center Content */}
                <div className="absolute inset-4 rounded-full bg-card border border-white/10 flex items-center justify-center z-10">
                  <AnimatePresence mode="wait">
                    {isSpinning || isPending ? (
                      <motion.div
                        key="spinning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="w-12 h-12 text-accent animate-spin" />
                      </motion.div>
                    ) : result ? (
                      <motion.div
                        key="result"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                      >
                        {result.won ? (
                          <>
                            <Trophy className="w-12 h-12 text-accent mx-auto mb-2" />
                            <p className="text-accent font-bold">WON!</p>
                            <p className="text-sm text-white">${result.amount}</p>
                          </>
                        ) : (
                          <>
                            <Frown className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground font-bold">LOST</p>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-muted-foreground font-medium"
                      >
                        READY
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
              
              {/* Pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-white z-20 filter drop-shadow-lg">
                ▼
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleSpin}
              disabled={!hasBonus || isSpinning || isPending}
              className={cn(
                "w-full max-w-xs text-lg h-14 rounded-xl font-bold transition-all duration-300 transform",
                hasBonus 
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSpinning ? "Spinning..." : hasBonus ? "SPIN TO WIN" : "No Bonus Available"}
            </Button>
            
            {!hasBonus && (
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Deposit more funds to increase your bonus balance.
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
