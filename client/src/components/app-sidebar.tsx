import { 
  LayoutDashboard, 
  Sword, 
  Wallet, 
  Dices, 
  ShieldCheck,
  LogOut,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type DashboardStatsResponse } from "@shared/schema";

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: stats } = useQuery<DashboardStatsResponse>({
    queryKey: [api.dashboard.get.path],
  });

  const menuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Daily Quests", url: "/quests", icon: Sword },
    { title: "My Wallet", url: "/wallet", icon: Wallet },
    { title: "Roulette Game", url: "/roulette", icon: Dices },
  ];

  // Hidden admin link (as per request: "accessible seulement en tapant /admin")
  // We won't show it in the menu unless the user is admin
  const isAdmin = stats?.balance?.role === 'admin';

  return (
    <Sidebar className="border-r border-border/50 bg-card/30 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-foreground">QuestInvest</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Pro Edition</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3 pt-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="h-11 px-4 transition-all hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary rounded-lg"
                  >
                    <a 
                      href={item.url} 
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation(item.url);
                      }}
                      className="flex items-center gap-3"
                    >
                      <item.icon className={`w-[18px] h-[18px] ${location === item.url ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/admin"}
                    className="h-11 px-4 transition-all hover:bg-destructive/5 data-[active=true]:bg-destructive/10 data-[active=true]:text-destructive rounded-lg"
                  >
                    <a 
                      href="/admin" 
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation("/admin");
                      }}
                      className="flex items-center gap-3"
                    >
                      <ShieldCheck className={`w-[18px] h-[18px] ${location === "/admin" ? "text-destructive" : "text-muted-foreground"}`} />
                      <span className="font-medium">Admin Panel</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <Separator className="mb-4 bg-border/40" />
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold truncate text-foreground">
              {user?.firstName || user?.email}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Member
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
