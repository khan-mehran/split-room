"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";


export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border pb-safe">
      <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto relative">
        {/* Home */}
        <NavItem href="/dashboard" icon={Home} label="Home" active={pathname === "/dashboard"} />

        {/* History */}
        <NavItem href="/history" icon={History} label="History" active={pathname === "/history"} />

        {/* Center FAB — Add Expense */}
        <div className="flex flex-col items-center -mt-6">
          <Link
            href="/add-expense"
            className={cn(
              "w-14 h-14 rounded-full bg-accent text-white shadow-lg shadow-accent/30",
              "flex items-center justify-center",
              "active:scale-95 transition-transform",
              pathname === "/add-expense" && "ring-4 ring-accent/30"
            )}
          >
            <Plus className="h-6 w-6 strokeWidth={2.5}" />
          </Link>
          <span className="text-[10px] text-muted-foreground mt-1">Add</span>
        </div>

        {/* Members */}
        <NavItem href="/members" icon={Users} label="Members" active={pathname === "/members"} />

        {/* Equity */}
        <NavItem href="/equity" icon={EquityIcon} label="Equity" active={pathname === "/equity"} />
      </div>
    </nav>
  );
}

function NavItem({
  href, icon: Icon, label, active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[52px]">
      <Icon
        className={cn(
          "h-5 w-5 transition-colors",
          active ? "text-primary" : "text-muted-foreground"
        )}
      />
      <span className={cn("text-[10px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
        {label}
      </span>
    </Link>
  );
}

function EquityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-6" />
    </svg>
  );
}
