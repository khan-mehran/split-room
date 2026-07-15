"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import RegisterForm from "./RegisterForm";
import SignInForm from "./SignInForm";

type View = "landing" | "register" | "signin";

export default function LandingScreen() {
  const [view, setView] = useState<View>("landing");

  if (view === "register") return <RegisterForm onBack={() => setView("landing")} />;
  if (view === "signin") return <SignInForm onBack={() => setView("landing")} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center animate-fade-in">
        <img
          src="/logo-icon.svg"
          alt="SplitRoom"
          className="w-[80px] h-[80px] mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold text-white tracking-tight">SplitRoom</h1>
        <p className="text-slate-300 mt-2 text-base">Shared expenses, zero drama.</p>
      </div>

      {/* Feature bullets */}
      <div className="w-full max-w-sm mb-10 space-y-3 animate-fade-in">
        {[
          { icon: "💸", text: "Track every shared expense" },
          { icon: "⚖️", text: "See who owes whom at a glance" },
          { icon: "📱", text: "Works offline, installable on mobile" },
        ].map((f) => (
          <div key={f.text} className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-xl px-4 py-3">
            <span className="text-xl">{f.icon}</span>
            <span className="text-white/90 text-sm font-medium">{f.text}</span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="w-full max-w-sm space-y-3 animate-fade-in">
        <Button
          size="xl"
          className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg"
          onClick={() => setView("register")}
        >
          <Plus className="mr-2 h-5 w-5" />
          Get Started
        </Button>
        <Button
          size="xl"
          variant="outline"
          className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold"
          onClick={() => setView("signin")}
        >
          <Users className="mr-2 h-5 w-5" />
          Sign In
        </Button>
      </div>

      <p className="text-slate-500 text-xs mt-8">No password needed — just your phone number + PIN</p>
    </div>
  );
}
