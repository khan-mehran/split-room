"use client";

import { useAuth } from "@/lib/auth-context";
import LandingScreen from "@/components/auth/LandingScreen";
import GroupSetup from "@/components/groups/GroupSetup";
import BottomNav from "./BottomNav";

interface Props {
  children: React.ReactNode;
}

export default function AppShell({ children }: Props) {
  const { user, currentGroup, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <span className="text-3xl">🏠</span>
          </div>
          <p className="text-muted-foreground text-sm">Loading SplitRoom...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LandingScreen />;
  if (!currentGroup) return <GroupSetup />;

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 pt-safe max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
