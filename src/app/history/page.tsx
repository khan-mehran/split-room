"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useExpenses, useDeleteExpense } from "@/hooks/useExpenses";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { format, subMonths, addMonths, isSameMonth } from "date-fns";

export default function HistoryPage() {
  const { currentGroup, user, isAdmin } = useAuth();
  const { data: expenses = [], isLoading } = useExpenses(currentGroup?.id, currentGroup?.last_cleared_at);
  const deleteExpense = useDeleteExpense();
  const [viewDate, setViewDate] = useState(new Date());
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(
    () => expenses.filter((e) => isSameMonth(new Date(e.expense_date), viewDate)),
    [expenses, viewDate]
  );

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const key = e.expense_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const monthTotal = filtered.reduce((s, e) => s + Number(e.amount), 0);

  async function handleDelete(id: string) {
    if (!currentGroup) return;
    if (!confirm("Delete this expense?")) return;
    setDeleting(id);
    try {
      await deleteExpense.mutateAsync({ id, groupId: currentGroup.id });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Month navigator */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold">History</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewDate((d) => subMonths(d, 1))}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold min-w-[100px] text-center">
            {format(viewDate, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setViewDate((d) => addMonths(d, 1))}
            disabled={isSameMonth(viewDate, new Date())}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Month summary */}
      <Card className="bg-muted/50 border-0">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-muted-foreground">Total this month</p>
            <p className="text-2xl font-bold">{formatCurrency(monthTotal)}</p>
          </div>
          <Badge variant="secondary">{filtered.length} expense{filtered.length !== 1 ? "s" : ""}</Badge>
        </CardContent>
      </Card>

      {/* Expense list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-4xl">📭</p>
          <p className="font-semibold">No expenses in {format(viewDate, "MMMM")}</p>
          <p className="text-sm text-muted-foreground">Try navigating to a different month</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dateStr, items]) => (
            <div key={dateStr}>
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">
                {formatDate(dateStr)}
              </p>
              <div className="space-y-2">
                {items.map((expense) => {
                  const canDelete = expense.paid_by_user_id === user?.id || isAdmin;
                  return (
                    <Card key={expense.id} className="overflow-hidden">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-base flex-shrink-0">
                          {getCategoryEmoji(expense.description)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{expense.description}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Avatar name={expense.users?.name || "?"} size="sm" className="h-4 w-4 text-[8px]" />
                            <p className="text-xs text-muted-foreground truncate">
                              {expense.users?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold">{formatCurrency(Number(expense.amount))}</p>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(expense.id)}
                              disabled={deleting === expense.id}
                              className="text-muted-foreground hover:text-destructive transition-colors mt-1 disabled:opacity-40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
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
