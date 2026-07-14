"use client";

import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "fixed top-4 right-4 z-50",
        "w-11 h-11 rounded-full shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-200 active:scale-90",
        theme === "dark"
          ? "bg-slate-500 hover:bg-slate-400"
          : "bg-slate-800 hover:bg-slate-700"
      )}
    >
      {theme === "dark"
        ? <Sun className="h-5 w-5 text-white" />
        : <Moon className="h-5 w-5 text-white" />
      }
    </button>
  );
}
