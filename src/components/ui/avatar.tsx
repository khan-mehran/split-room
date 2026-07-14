import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colors = [
  "bg-slate-600 text-white",
  "bg-violet-600 text-white",
  "bg-blue-600 text-white",
  "bg-rose-500 text-white",
  "bg-amber-500 text-white",
  "bg-emerald-600 text-white",
];

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const colorIndex = name.charCodeAt(0) % colors.length;
  const sizeClasses = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold flex-shrink-0",
        colors[colorIndex],
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
