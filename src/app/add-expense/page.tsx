"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAddExpense } from "@/hooks/useExpenses";
import { useGroupMembers } from "@/hooks/useGroupMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const QUICK_AMOUNTS = [10, 25, 50, 100, 200];

const CATEGORIES = [
  { emoji: "🛒", label: "Groceries" },
  { emoji: "💡", label: "Utilities" },
  { emoji: "🏠", label: "Rent" },
  { emoji: "🍽️", label: "Food" },
  { emoji: "🚗", label: "Transport" },
  { emoji: "📶", label: "Internet" },
  { emoji: "🧹", label: "Cleaning" },
  { emoji: "💊", label: "Medical" },
];

export default function AddExpensePage() {
  const router = useRouter();
  const { user, currentGroup } = useAuth();
  const { data: members = [] } = useGroupMembers(currentGroup?.id);
  const addExpense = useAddExpense();

  const activeMembers = members.filter((m) => m.status === "active");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidById, setPaidById] = useState(user?.id || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) e.amount = "Enter a valid amount greater than 0";
    if (!description.trim()) e.description = "Description is required";
    if (!date) e.date = "Date is required";
    if (!paidById) e.paidBy = "Select who paid";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !currentGroup) return;

    try {
      await addExpense.mutateAsync({
        group_id: currentGroup.id,
        paid_by_user_id: paidById,
        amount: parseFloat(parseFloat(amount).toFixed(2)),
        description: description.trim(),
        expense_date: date,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      setErrors({ submit: (err as Error).message || "Failed to add expense." });
    }
  }

  return (
    <div className="p-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pt-6">
        <Link href="/dashboard">
          <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <h1 className="text-xl font-bold">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">QAR</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  "flex h-14 w-full rounded-lg border border-input bg-background pl-12 pr-3 text-3xl font-bold",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  errors.amount && "border-destructive"
                )}
                step="0.01"
                min="0.01"
              />
            </div>
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            {/* Quick amounts */}
            <div className="flex gap-2 flex-wrap">
              {QUICK_AMOUNTS.map((qa) => (
                <button
                  key={qa}
                  type="button"
                  onClick={() => setAmount(String(qa))}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    amount === String(qa)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  QR {qa}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">What was it for?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Category quick-select */}
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setDescription(cat.label)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-colors",
                    description === cat.label
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            <Input
              placeholder="Or type a custom description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              leftIcon={<FileText className="h-4 w-4" />}
            />
          </CardContent>
        </Card>

        {/* Date & Paid By */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date</label>
              <div className={cn(
                "relative flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-background px-3",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                errors.date && "border-destructive"
              )}>
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm flex-1 text-foreground">
                  {date
                    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" })
                        .format(new Date(date + "T00:00:00"))
                    : "Select date"}
                </span>
                {/* Invisible native date input — opens the system picker on tap */}
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Paid by</label>
              {errors.paidBy && <p className="text-xs text-destructive">{errors.paidBy}</p>}
              <div className="space-y-2">
                {activeMembers.map((m) => (
                  <button
                    key={m.user_id}
                    type="button"
                    onClick={() => setPaidById(m.user_id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left",
                      paidById === m.user_id
                        ? "bg-primary/5 border-primary"
                        : "bg-background border-border hover:border-primary/40"
                    )}
                  >
                    <Avatar name={m.users?.name || "?"} size="sm" />
                    <span className="font-medium text-sm">
                      {m.users?.name}{m.user_id === user?.id ? " (me)" : ""}
                    </span>
                    {paidById === m.user_id && (
                      <span className="ml-auto text-primary text-xs font-semibold">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {errors.submit && (
          <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{errors.submit}</p>
        )}

        <Button
          type="submit"
          size="xl"
          variant="accent"
          className="w-full shadow-md shadow-accent/20"
          loading={addExpense.isPending}
        >
          Save Expense
        </Button>
      </form>
    </div>
  );
}
