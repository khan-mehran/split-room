"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}

export function PinInput({
  label,
  value,
  onChange,
  error,
  placeholder = "Enter PIN",
  autoComplete = "off",
}: PinInputProps) {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        {/* Lock icon on left */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Lock className="h-4 w-4" />
        </div>

        <input
          type={show ? "text" : "password"}
          inputMode="numeric"
          value={value}
          readOnly={!active}
          onFocus={() => setActive(true)}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          placeholder={placeholder}
          autoComplete={autoComplete}
          data-lpignore="true"
          data-form-type="other"
          className={cn(
            "flex h-11 w-full rounded-lg border border-input bg-background pl-9 pr-10 py-2 text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />

        {/* Show / hide toggle on right */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Hide PIN" : "Show PIN"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
