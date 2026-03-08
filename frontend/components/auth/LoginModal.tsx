"use client";

import { useState } from "react";
import SSOButton from "./SSOButton";

interface LoginModalProps {
  onGoogleLogin: () => Promise<void>;
  onGithubLogin: () => Promise<void>;
  onContinueAsGuest: () => void;
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
    </svg>
  );
}

function DevicesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

const PERKS = [
  { icon: <HistoryIcon />, text: "Unlimited chat history, forever" },
  { icon: <DevicesIcon />, text: "Sync across all your devices" },
  { icon: <ShieldIcon />,  text: "Secure, private conversations" },
];

export default function LoginModal({
  onGoogleLogin,
  onGithubLogin,
  onContinueAsGuest,
}: LoginModalProps) {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  async function handleGoogle() {
    setLoading("google");
    try { await onGoogleLogin(); } finally { setLoading(null); }
  }

  async function handleGithub() {
    setLoading("github");
    try { await onGithubLogin(); } finally { setLoading(null); }
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Card */}
      <div className="w-full max-w-sm bg-chat-surface border border-chat-border rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-in">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-chat-green via-emerald-400 to-chat-green" />

        <div className="px-8 py-8 flex flex-col gap-6">

          {/* Logo + heading */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-chat-green to-emerald-400 flex items-center justify-center shadow-lg shadow-chat-green/30">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M10.5 1.5a.75.75 0 0 1 .728.568l.73 3.285a3.75 3.75 0 0 0 2.69 2.69l3.284.73a.75.75 0 0 1 0 1.456l-3.285.73a3.75 3.75 0 0 0-2.689 2.69l-.73 3.284a.75.75 0 0 1-1.456 0l-.73-3.285a3.75 3.75 0 0 0-2.69-2.689l-3.284-.73a.75.75 0 0 1 0-1.456l3.285-.73a3.75 3.75 0 0 0 2.69-2.69l.73-3.284A.75.75 0 0 1 10.5 1.5Z" />
                <path d="M17.25 12a.75.75 0 0 1 .727.569l.337 1.521a1.875 1.875 0 0 0 1.345 1.344l1.521.337a.75.75 0 0 1 0 1.458l-1.521.337a1.875 1.875 0 0 0-1.345 1.345l-.337 1.521a.75.75 0 0 1-1.458 0l-.337-1.521a1.875 1.875 0 0 0-1.344-1.345l-1.521-.337a.75.75 0 0 1 0-1.458l1.521-.337a1.875 1.875 0 0 0 1.344-1.344l.337-1.521A.75.75 0 0 1 17.25 12Z" />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold text-chat-text tracking-tight">
                Welcome to Chat Assistant
              </h1>
              <p className="text-sm text-chat-muted mt-1">
                Sign in to save your chat history across sessions
              </p>
            </div>
          </div>

          {/* Perks */}
          <ul className="flex flex-col gap-2.5">
            {PERKS.map((perk) => (
              <li key={perk.text} className="flex items-center gap-2.5 text-sm text-chat-muted">
                <span className="text-chat-green flex-shrink-0">{perk.icon}</span>
                {perk.text}
              </li>
            ))}
          </ul>

          {/* SSO buttons */}
          <div className="flex flex-col gap-3">
            <SSOButton
              provider="google"
              onClick={handleGoogle}
              isLoading={loading === "google"}
            />
            <SSOButton
              provider="github"
              onClick={handleGithub}
              isLoading={loading === "github"}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-chat-border" />
            <span className="text-xs text-chat-muted">or</span>
            <div className="flex-1 h-px bg-chat-border" />
          </div>

          {/* Guest */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onContinueAsGuest}
              className="text-sm text-chat-muted hover:text-chat-text transition-colors underline underline-offset-2"
            >
              Continue without signing in
            </button>
            <p className="text-[11px] text-chat-muted/60 text-center">
              Guest chats are saved only in this browser and will be lost if you clear site data.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
