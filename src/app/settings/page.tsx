"use client";

import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useEndPeriod } from "@/hooks/useExpenses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Sun, Moon, LogOut, RotateCcw, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, currentGroup, isAdmin, signOut, refreshGroup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const endPeriod = useEndPeriod();

  async function handleEndPeriod() {
    if (!currentGroup) return;
    if (!confirm("End this period?\n\nAll current expenses will be archived and a fresh period starts. This cannot be undone.")) return;
    await endPeriod.mutateAsync({ groupId: currentGroup.id });
    await refreshGroup();
  }

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Profile */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Profile</p>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar name={user?.name || "?"} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.phone_number}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Group */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Group</p>
        <Card>
          <Link href="/members">
            <CardContent className="flex items-center justify-between p-4 active:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium">{currentGroup?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Manage members &amp; invite code</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>
      </section>

      {/* Appearance */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Appearance</p>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {theme === "dark"
                ? <Sun className="h-4 w-4 text-amber-500" />
                : <Moon className="h-4 w-4 text-slate-500" />}
              <div>
                <p className="font-medium text-sm">Theme</p>
                <p className="text-xs text-muted-foreground capitalize">{theme} mode</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </CardContent>
        </Card>
      </section>

      {/* Admin: End Period */}
      {isAdmin && (
        <section className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Admin</p>
          <Card className="border-rose-200 dark:border-rose-900">
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="font-medium text-sm">End Current Period</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Archives all expenses so far. Every new expense after this starts a fresh record.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-2"
                loading={endPeriod.isPending}
                onClick={handleEndPeriod}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                End Period &amp; Clear Records
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Account */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Account</p>
        <Card>
          <CardContent className="p-2">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
