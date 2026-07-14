"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useExpenses } from "@/hooks/useExpenses";
import { useGroupMembers, computeBalances } from "@/hooks/useGroupMembers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { simplifyDebts } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowRight } from "lucide-react";
import { isSameMonth } from "date-fns";

export default function EquityPage() {
  const { currentGroup, user } = useAuth();
  const { data: expenses = [] } = useExpenses(currentGroup?.id);
  const { data: members = [] } = useGroupMembers(currentGroup?.id);
  const [scope, setScope] = useState<"all" | "month">("month");

  const filteredExpenses = useMemo(() => {
    if (scope === "all") return expenses;
    return expenses.filter((e) => isSameMonth(new Date(e.expense_date), new Date()));
  }, [expenses, scope]);

  const balances = useMemo(
    () => computeBalances(members, filteredExpenses),
    [members, filteredExpenses]
  );

  const transactions = useMemo(() => simplifyDebts(balances), [balances]);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const fairShare = balances.length > 0 ? totalExpenses / balances.length : 0;

  const chartData = balances.map((b) => ({
    name: b.name.split(" ")[0],
    paid: b.totalPaid,
    fairShare: b.fairShare,
  }));

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold">Equity</h1>
        <div className="flex rounded-xl overflow-hidden border border-border">
          {(["month", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                scope === s ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {s === "month" ? "This Month" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-br from-teal-700 to-teal-800 border-0 text-white">
        <CardContent className="p-5">
          <p className="text-teal-100 text-sm">{scope === "month" ? "This month's" : "Total"} expenses</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
          <p className="text-teal-200 text-sm mt-2">
            Fair share per person: <span className="font-bold text-white">{formatCurrency(fairShare)}</span>
          </p>
        </CardContent>
      </Card>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Paid vs Fair Share</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={chartData.map((d) => ({
                  ...d,
                  paidMore: d.paid >= d.fairShare ? d.paid : 0,
                  paidLess: d.paid < d.fairShare ? d.paid : 0,
                }))}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const paid = chartData.find((d) => d.name === label)?.paid ?? 0;
                    const share = chartData.find((d) => d.name === label)?.fairShare ?? 0;
                    return (
                      <div className="rounded-xl border bg-background shadow-sm p-2 text-xs space-y-0.5">
                        <p className="font-semibold">{label}</p>
                        <p>Paid: {formatCurrency(paid)}</p>
                        <p>Fair share: {formatCurrency(share)}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="paidMore" name="Paid (over)" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="paidLess" name="Paid (under)" stackId="b" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fairShare" name="Fair Share" fill="#0f766e" opacity={0.2} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-center text-muted-foreground mt-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-1" />paid more
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500 ml-3 mr-1" />paid less
            </p>
          </CardContent>
        </Card>
      )}

      {/* Member balances */}
      <div>
        <h2 className="font-semibold mb-3">Member Balances</h2>
        {balances.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-3xl mb-2">⚖️</p>
              <p className="font-medium">No data yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add expenses to see equity</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {balances.map((b) => (
              <Card key={b.userId}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={b.name} size="md" />
                    <div className="flex-1">
                      <p className="font-semibold">{b.name}{b.userId === user?.id ? " (you)" : ""}</p>
                      <p className="text-xs text-muted-foreground">Paid {formatCurrency(b.totalPaid)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${b.balance >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        {b.balance >= 0 ? "+" : ""}{formatCurrency(b.balance)}
                      </p>
                      <Badge variant={b.balance >= 0 ? "success" : "destructive"} className="text-[10px] mt-0.5">
                        {b.balance >= 0 ? "Gets back" : "Owes"}
                      </Badge>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Paid {Math.round((b.totalPaid / (b.fairShare || 1)) * 100)}% of fair share</span>
                      <span>Fair: {formatCurrency(b.fairShare)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${b.balance >= 0 ? "bg-emerald-500" : "bg-rose-400"}`}
                        style={{ width: `${Math.min((b.totalPaid / Math.max(b.fairShare * 2, 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Settle-up transactions */}
      {transactions.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Settle Up</h2>
          <div className="space-y-2">
            {transactions.map((t, i) => (
              <Card key={i} className="border-amber-200 bg-amber-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar name={t.fromName} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">{t.fromName}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-semibold">{t.toName}</span>
                    </div>
                  </div>
                  <span className="font-bold text-amber-700">{formatCurrency(t.amount)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
