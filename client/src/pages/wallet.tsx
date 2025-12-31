import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Transaction, type DashboardStatsResponse } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Loader2, 
  Copy, 
  CheckCircle2,
  Image as ImageIcon
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

const TRC20_ADDRESS = "TN9hjFHzszNdAk5n8Wt39X6KN72WaNmJM1";

const depositSchema = z.object({
  amount: z.coerce.number().min(20, "Minimum deposit is $20"),
});

const withdrawSchema = z.object({
  amount: z.coerce.number().min(50, "Minimum withdrawal is $50"),
});

export default function Wallet() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: stats } = useQuery<DashboardStatsResponse>({
    queryKey: [api.dashboard.get.path],
  });

  const { data: history, isLoading: historyLoading } = useQuery<Transaction[]>({
    queryKey: [api.wallet.history.path],
  });

  const depositForm = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: { amount: 100 },
  });

  const withdrawForm = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { amount: 100 },
  });

  const depositMutation = useMutation({
    mutationFn: async (values: z.infer<typeof depositSchema>) => {
      const res = await apiRequest("POST", api.wallet.deposit.path, values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
      toast({ title: "Request Sent", description: "Your deposit is pending admin validation." });
      depositForm.reset();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (values: z.infer<typeof withdrawSchema>) => {
      const res = await apiRequest("POST", api.wallet.withdraw.path, values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.get.path] });
      toast({ title: "Request Sent", description: "Your withdrawal is pending admin validation." });
      withdrawForm.reset();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(TRC20_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "USDT TRC20 address copied to clipboard." });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">FINANCIAL CENTER</h1>
          <p className="text-muted-foreground font-medium">Manage your capital and rewards.</p>
        </div>
        <div className="hidden md:block">
          <Badge variant="outline" className="text-[10px] font-black tracking-[0.2em] uppercase py-1 px-3 border-primary/20 bg-primary/5 text-primary">
            Secure Transactions
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-primary/20 shadow-2xl bg-card/40 backdrop-blur-md overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="h-6 w-6 text-primary" />
              Main Portfolio
            </CardTitle>
            <CardDescription>Available capital for investment and gaming.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black tracking-tight mb-8">
              {Number(stats?.balance?.mainBalance || 0).toLocaleString()} <span className="text-xl text-primary font-bold">USD</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Quest Earnings</p>
                <p className="text-xl font-black text-green-500">${Number(stats?.balance?.questEarnings || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Locked Bonus</p>
                <p className="text-xl font-black text-yellow-500">${Number(stats?.balance?.lockedBonus || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-xl bg-card/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Payment Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">USDT TRC20 Address</p>
              <div className="flex items-center gap-2">
                <code className="text-[11px] font-mono flex-1 break-all bg-background/80 p-2 rounded border border-border/40">
                  {TRC20_ADDRESS}
                </code>
                <Button size="icon" variant="ghost" onClick={copyAddress} className="h-8 w-8 text-primary">
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Send USDT and provide the screenshot/URL for validation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-card/50 p-1 rounded-2xl border border-border/40">
          <TabsTrigger value="deposit" className="rounded-xl font-black text-xs tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <ArrowDownLeft className="mr-2 h-4 w-4" /> Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="rounded-xl font-black text-xs tracking-widest uppercase data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground transition-all">
            <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="mt-6">
          <Card className="border-primary/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle>Inbound Request</CardTitle>
              <CardDescription>40% bonus applies to your FIRST deposit!</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...depositForm}>
                <form onSubmit={depositForm.handleSubmit((v) => depositMutation.mutate(v))} className="space-y-6">
                  <div className="grid grid-cols-1 gap-8">
                    <FormField
                      control={depositForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest">Amount (USD)</FormLabel>
                          <FormControl>
                            <Input placeholder="100" type="number" {...field} className="h-12 text-lg font-bold bg-background/50" />
                          </FormControl>
                          <FormDescription className="text-[10px]">Minimum deposit is $20.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
                    disabled={depositMutation.isPending}
                  >
                    {depositMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <WalletIcon className="mr-2 h-5 w-5" />}
                    Confirm Deposit Request
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="mt-6">
          <Card className="border-destructive/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-destructive/5 border-b border-destructive/10">
              <CardTitle>Outbound Request</CardTitle>
              <CardDescription>Funds will be sent to your registered USDT address.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...withdrawForm}>
                <form onSubmit={withdrawForm.handleSubmit((v) => withdrawMutation.mutate(v))} className="space-y-6">
                  <FormField
                    control={withdrawForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest">Amount (USD)</FormLabel>
                        <FormControl>
                          <Input placeholder="100" type="number" {...field} className="h-12 text-lg font-bold bg-background/50 border-destructive/20 focus-visible:ring-destructive" />
                        </FormControl>
                        <FormDescription className="flex items-center gap-1 text-[10px]">
                          Available: ${(Number(stats?.balance?.mainBalance || 0) + Number(stats?.balance?.questEarnings || 0)).toLocaleString()} USD | Min: $50
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    variant="destructive"
                    className="w-full h-14 text-lg font-black uppercase tracking-[0.2em] shadow-lg shadow-destructive/20"
                    disabled={withdrawMutation.isPending}
                  >
                    {withdrawMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowUpRight className="mr-2 h-5 w-5" />}
                    Request Withdrawal
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-border/40 shadow-xl bg-card/10 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Recent Operations
            </CardTitle>
            <Badge variant="outline" className="text-[9px] font-bold tracking-widest uppercase">Live Log</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {historyLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !history || history.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic text-sm">
                No transactions recorded yet.
              </div>
            ) : (
              history.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-primary/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 
                      tx.type === 'withdrawal' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="h-4 w-4" /> : 
                       tx.type === 'withdrawal' ? <ArrowUpRight className="h-4 w-4" /> : 
                       <TrendingUp className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight capitalize">{tx.type.replace('_', ' ')}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {new Date(tx.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className={`font-black text-base tracking-tighter ${
                      tx.type === 'deposit' || tx.type.includes('reward') ? 'text-green-500' : 'text-orange-500'
                    }`}>
                      {tx.type === 'deposit' || tx.type.includes('reward') ? '+$' : '-$'}{Number(tx.amount).toLocaleString()}
                    </p>
                    <Badge variant="outline" className={`text-[8px] font-black uppercase px-2 py-0 border-none rounded-full h-4 ${
                      tx.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                      tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { TrendingUp } from "lucide-react";
