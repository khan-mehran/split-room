"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios";

const DISMISSED_KEY = "splitroom_install_dismissed";
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) return;

    // User dismissed recently
    const ts = localStorage.getItem(DISMISSED_KEY);
    if (ts && Date.now() - Number(ts) < DISMISS_TTL) return;

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isAndroid = /Android/.test(ua);

    if (!isIOS && !isAndroid) return; // desktop — skip

    if (isIOS) {
      setPlatform("ios");
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }

    // Android: wait for browser to fire beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
      setTimeout(() => setVisible(true), 1200);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
    setVisible(false);
  }

  if (!visible || !platform) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] animate-fade-in"
        onClick={dismiss}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-background rounded-t-3xl shadow-2xl animate-slide-up max-w-lg mx-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-6 pb-8 pt-2">
          {/* Dismiss button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* App identity */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-lg text-3xl flex-shrink-0">
              🏠
            </div>
            <div>
              <p className="font-bold text-lg">SplitRoom</p>
              <p className="text-sm text-muted-foreground">Free · Works offline</p>
              <div className="flex gap-1 mt-1">
                {["⭐","⭐","⭐","⭐","⭐"].map((s, i) => (
                  <span key={i} className="text-xs">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Android */}
          {platform === "android" && (
            <>
              <p className="font-semibold text-base">Add to Home Screen</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                Install SplitRoom for instant access — no app store, no updates, works offline.
              </p>
              <button
                onClick={handleInstall}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl text-sm transition-opacity active:opacity-80 shadow-lg shadow-primary/25"
              >
                Install App
              </button>
              <button
                onClick={dismiss}
                className="w-full text-muted-foreground text-sm py-3 mt-1"
              >
                Not now
              </button>
            </>
          )}

          {/* iOS */}
          {platform === "ios" && (
            <>
              <p className="font-semibold text-base">Add to Home Screen</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                Install SplitRoom on your iPhone in 3 quick steps using Safari.
              </p>
              <div className="space-y-2.5 mb-6">
                <IOSStep
                  number={1}
                  label="Tap the Share button"
                  sub="At the bottom of your Safari browser"
                  icon={<IOSShareIcon />}
                />
                <IOSStep
                  number={2}
                  label='Tap "Add to Home Screen"'
                  sub="Scroll down in the share sheet to find it"
                  icon={<IOSAddIcon />}
                />
                <IOSStep
                  number={3}
                  label='Tap "Add" to confirm'
                  sub="Top-right corner of the next screen"
                  icon={<IOSConfirmIcon />}
                />
              </div>
              <button
                onClick={dismiss}
                className="w-full border border-border text-foreground font-medium py-3 rounded-2xl text-sm"
              >
                Got it
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function IOSStep({
  number,
  label,
  sub,
  icon,
}: {
  number: number;
  label: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-muted/60 rounded-2xl p-3">
      <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </div>
  );
}

function IOSShareIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function IOSAddIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function IOSConfirmIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
