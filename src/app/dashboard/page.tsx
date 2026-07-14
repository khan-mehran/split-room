"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useExpenses } from "@/hooks/useExpenses";
import { useGroupMembers, computeBalances } from "@/hooks/useGroupMembers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Plus, TrendingUp, ChevronRight, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { user, currentGroup, isAdmin } = useAuth();
  const { data: expenses = [], isLoading: expLoading } = useExpenses(currentGroup?.id, currentGroup?.last_cleared_at);
  const { data: members = [] } = useGroupMembers(currentGroup?.id);
  const [copied, setCopied] = useState(false);

  const thisMonth = expenses;
  const monthTotal = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const activeMembers = members.filter((m) => m.status === "active");
  const balances = useMemo(() => computeBalances(members, expenses), [members, expenses]);
  const myBalance = balances.find((b) => b.userId === user?.id);

  const recentExpenses = expenses.slice(0, 5);

  const pendingCount = members.filter((m) => m.status === "pending").length;

  async function copyInviteCode() {
    if (!currentGroup) return;
    await navigator.clipboard.writeText(currentGroup.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold truncate max-w-[200px]">{currentGroup?.name}</h1>
          <p className="text-sm text-muted-foreground">Hi, {user?.name?.split(" ")[0]} 👋</p>
        </div>
        <button
          onClick={copyInviteCode}
          className="flex items-center gap-1.5 bg-muted rounded-xl px-3 py-2 text-xs font-mono font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          {currentGroup?.invite_code}
        </button>
      </div>

      {/* Monthly total hero card */}
      <Card className="bg-gradient-to-br from-teal-700 to-teal-800 border-0 text-white shadow-lg shadow-teal-900/20">
        <CardContent className="p-5">
          <p className="text-teal-100 text-sm font-medium">
            Current Period Total
          </p>
          <p className="text-4xl font-bold mt-1 tracking-tight">
            {formatCurrency(monthTotal)}
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <p className="text-teal-100 text-xs">Members</p>
              <p className="text-white font-bold text-lg">{activeMembers.length}</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <p className="text-teal-100 text-xs">Expenses</p>
              <p className="text-white font-bold text-lg">{thisMonth.length}</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <p className="text-teal-100 text-xs">Per Person</p>
              <p className="text-white font-bold text-lg">
                {activeMembers.length > 0 ? formatCurrency(monthTotal / activeMembers.length) : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My balance */}
      {myBalance && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p
                className={`text-xl font-bold mt-0.5 ${
                  myBalance.balance >= 0 ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {myBalance.balance >= 0
                  ? `+${formatCurrency(myBalance.balance)} back`
                  : `${formatCurrency(myBalance.balance)} owed`}
              </p>
            </div>
            <Link href="/equity">
              <Button variant="outline" size="sm" className="gap-1">
                <TrendingUp className="h-4 w-4" />
                View Equity
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Admin: pending approvals */}
      {isAdmin && pendingCount > 0 && (
        <Link href="/members">
          <Card className="border-amber-200 bg-amber-50 cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Badge variant="warning">{pendingCount} pending</Badge>
                <span className="text-sm font-medium">Members waiting for approval</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Add expense FAB (duplicate for easy access) */}
      <Link href="/add-expense">
        <Button size="lg" variant="accent" className="w-full shadow-md shadow-accent/20 gap-2">
          <Plus className="h-5 w-5" />
          Add Expense
        </Button>
      </Link>

      {/* Recent expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Expenses</h2>
          <Link href="/history" className="text-sm text-primary font-medium">See all</Link>
        </div>

        {expLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : recentExpenses.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-medium">No expenses yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first expense above</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-base flex-shrink-0">
                    {getCategoryEmoji(expense.description)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {expense.users?.name || "Unknown"} · {formatDateShort(expense.expense_date)}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground shrink-0">{formatCurrency(Number(expense.amount))}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryEmoji(description: string): string {
  const d = description.toLowerCase();
  if (d.includes("grocer") || d.includes("food") || d.includes("supermarket")) return "🛒";
  if (d.includes("gas") || d.includes("electric") || d.includes("bill") || d.includes("util")) return "💡";
  if (d.includes("water")) return "💧";
  if (d.includes("rent")) return "🏠";
  if (d.includes("internet") || d.includes("wifi")) return "📶";
  if (d.includes("clean") || d.includes("soap") || d.includes("detergent")) return "🧹";
  if (d.includes("restaurant") || d.includes("eat") || d.includes("lunch") || d.includes("dinner")) return "🍽️";
  if (d.includes("taxi") || d.includes("uber") || d.includes("transport")) return "🚗";
  return "💳";
}
