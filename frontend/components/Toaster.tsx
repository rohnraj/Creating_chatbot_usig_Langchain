"use client";

import { useEffect, useState } from "react";
import type { Toast } from "@/hooks/useToast";

// ── Per-type config ───────────────────────────────────────────────────────────

const CONFIG = {
  success: {
    bar:  "bg-chat-green",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="text-chat-green flex-shrink-0">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    label: "text-chat-green",
  },
  error: {
    bar:  "bg-red-500",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="text-red-400 flex-shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    label: "text-red-400",
  },
  warning: {
    bar:  "bg-amber-500",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="text-amber-400 flex-shrink-0">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    label: "text-amber-400",
  },
  info: {
    bar:  "bg-blue-500",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="text-blue-400 flex-shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    label: "text-blue-400",
  },
} as const;

// ── Single toast card ─────────────────────────────────────────────────────────

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  // Animate in immediately, animate out when "exiting"
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Tiny delay so the entering transition plays
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const cfg = CONFIG[toast.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]
        bg-chat-surface border border-chat-border rounded-xl shadow-2xl
        overflow-hidden pr-9 pl-4 py-3.5
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      {/* Coloured left bar */}
      <div className={`absolute left-0 inset-y-0 w-1 rounded-l-xl ${cfg.bar}`} />

      {/* Icon */}
      {cfg.icon}

      {/* Message */}
      <p className="text-sm text-chat-text leading-snug flex-1">{toast.message}</p>

      {/* Dismiss × */}
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="absolute top-2.5 right-2.5 text-chat-muted hover:text-chat-text transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ── Container ─────────────────────────────────────────────────────────────────

export default function Toaster({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
