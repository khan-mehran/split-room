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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <img
          src="/logo-icon.svg"
          alt="SplitRoom"
          className="w-[80px] h-[80px] animate-pulse"
        />
      </div>
    );
  }

  if (!user) return <LandingScreen />;

  return (
    <>
      {!currentGroup ? (
        <GroupSetup />
      ) : (
        <div className="min-h-screen bg-background">
          <main className="pb-24 pt-safe max-w-lg mx-auto">
            {children}
          </main>
          <BottomNav />
        </div>
      )}
    </>
  );
}
