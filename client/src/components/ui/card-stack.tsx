import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function GlassCard({ children, className, gradient = false }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-black/50 shadow-lg",
        gradient && "bg-gradient-to-br from-white/5 to-white/[0.02]",
        className
      )}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/5 opacity-50 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, trend }: any) {
  return (
    <GlassCard className="group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-2xl font-bold font-display tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80">
            {value}
          </h3>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs font-medium text-emerald-400">
          <span className="flex items-center">
            {trend}
          </span>
        </div>
      )}
    </GlassCard>
  );
}
