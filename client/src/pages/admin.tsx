import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Transaction } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, User, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Admin() {
  const { toast } = useToast();

  const { data: pendingTxs, isLoading } = useQuery<(Transaction & { userEmail: string })[]>({
    queryKey: [api.admin.pendingTransactions.path],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "approve" | "reject" }) => {
      const res = await apiRequest("POST", buildUrl(api.admin.approveTransaction.path, { id }), { action });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.pendingTransactions.path] });
      toast({ title: "Success", description: "Transaction updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Validate user deposits and withdrawals.</p>
      </div>

      <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              Pending Requests
            </CardTitle>
            <CardDescription>
              Awaiting verification for USDT TRC20 transfers.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="px-3 py-1 font-bold">
            {pendingTxs?.length || 0} Pending
          </Badge>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {!pendingTxs || pendingTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-xl">
                <CheckCircle className="h-10 w-10 mb-2 opacity-20" />
                <p>No pending transactions to verify.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingTxs.map((tx) => (
                  <Card key={tx.id} className="border-border/60 hover:border-primary/30 transition-colors bg-background/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{tx.userEmail}</span>
                              </div>
                              <div className="text-2xl font-black text-foreground">
                                ${Number(tx.amount).toLocaleString()} <span className="text-xs font-bold text-primary">USD</span>
                              </div>
                            </div>
                            <Badge 
                              variant={tx.type === 'deposit' ? 'default' : 'outline'} 
                              className={tx.type === 'deposit' ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20"}
                            >
                              {tx.type.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>ID: {tx.id}</span>
                            <span>•</span>
                            <span>{new Date(tx.createdAt!).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex md:flex-col gap-2 justify-center">
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]" 
                            disabled={approveMutation.isPending}
                            onClick={() => approveMutation.mutate({ id: tx.id, action: "approve" })}
                          >
                            {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="min-w-[120px]"
                            disabled={approveMutation.isPending}
                            onClick={() => approveMutation.mutate({ id: tx.id, action: "reject" })}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
