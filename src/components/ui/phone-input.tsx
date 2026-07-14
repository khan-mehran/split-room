"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const COUNTRIES = [
  { code: "+974", flag: "🇶🇦", name: "Qatar",        digits: 8 },
  { code: "+971", flag: "🇦🇪", name: "UAE",           digits: 9 },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia", digits: 9 },
  { code: "+973", flag: "🇧🇭", name: "Bahrain",       digits: 8 },
  { code: "+965", flag: "🇰🇼", name: "Kuwait",        digits: 8 },
  { code: "+968", flag: "🇴🇲", name: "Oman",          digits: 8 },
  { code: "+962", flag: "🇯🇴", name: "Jordan",        digits: 9 },
  { code: "+961", flag: "🇱🇧", name: "Lebanon",       digits: 8 },
  { code: "+20",  flag: "🇪🇬", name: "Egypt",         digits: 10 },
  { code: "+92",  flag: "🇵🇰", name: "Pakistan",      digits: 10 },
  { code: "+91",  flag: "🇮🇳", name: "India",         digits: 10 },
  { code: "+44",  flag: "🇬🇧", name: "UK",            digits: 10 },
  { code: "+1",   flag: "🇺🇸", name: "USA / Canada",  digits: 10 },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

export function PhoneInput({ value, onChange, error, label }: PhoneInputProps) {
  const [country, setCountry] = useState(COUNTRIES[0]); // Qatar default
  const [digits, setDigits] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync external value → local state on first mount
  useEffect(() => {
    if (!value) return;
    const match = COUNTRIES.find((c) => value.startsWith(c.code));
    if (match) {
      setCountry(match);
      setDigits(value.slice(match.code.length).replace(/\D/g, "").slice(0, match.digits));
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDigits(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, country.digits);
    setDigits(raw);
    onChange(country.code + raw);
  }

  function selectCountry(c: typeof COUNTRIES[0]) {
    setCountry(c);
    setDigits("");
    onChange(c.code);
    setOpen(false);
  }

  const isComplete = digits.length === country.digits;

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div
        ref={ref}
        className={cn(
          "flex rounded-lg border border-input bg-background overflow-hidden",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
          error && "border-destructive"
        )}
      >
        {/* Flag + code selector */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
              "h-11 flex items-center gap-1.5 px-3 border-r border-input bg-muted",
              "hover:bg-muted/70 transition-colors text-sm font-medium min-w-[90px]",
              "focus:outline-none"
            )}
          >
            <span className="text-lg leading-none">{country.flag}</span>
            <span className="text-xs text-muted-foreground font-mono">{country.code}</span>
            <ChevronDown className={cn("h-3 w-3 text-muted-foreground ml-auto transition-transform", open && "rotate-180")} />
          </button>

          {open && (
            <div className="absolute top-full left-0 z-50 mt-1 w-60 rounded-xl border border-border bg-background shadow-xl">
              <div className="max-h-60 overflow-y-auto p-1">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => selectCountry(c)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-left",
                      c.code === country.code && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Digits input */}
        <input
          type="tel"
          inputMode="numeric"
          value={digits}
          onChange={handleDigits}
          maxLength={country.digits}
          placeholder={"•".repeat(country.digits)}
          className={cn(
            "flex-1 h-11 bg-background px-3 text-sm",
            "focus:outline-none",
            "placeholder:text-muted-foreground/40 tracking-widest font-mono"
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        {error
          ? <p className="text-xs text-destructive">{error}</p>
          : <p className="text-xs text-muted-foreground">{country.code} + {country.digits} digits</p>
        }
        <p className={cn("text-xs font-medium", isComplete ? "text-emerald-600" : "text-muted-foreground")}>
          {digits.length}/{country.digits}
        </p>
      </div>
    </div>
  );
}
