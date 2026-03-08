"use client";

import { useEffect, useRef, useState } from "react";

export interface AuthUser {
  name: string;
  email: string;
  image?: string;
}

interface UserMenuProps {
  user: AuthUser;
  onLogout: () => void;
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Avatar({ user }: { user: AuthUser }) {
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name}
        className="w-7 h-7 rounded-full object-cover ring-2 ring-chat-green/30"
      />
    );
  }
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-chat-green to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-chat-green/30">
      {initials}
    </div>
  );
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-chat-surface-2 transition-colors group"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar user={user} />
        <span className="text-xs font-medium text-chat-text max-w-[90px] truncate hidden sm:block">
          {user.name}
        </span>
        <span className="text-chat-muted group-hover:text-chat-text transition-colors">
          <ChevronIcon open={open} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-chat-surface border border-chat-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fade-slide-in">

          {/* User info */}
          <div className="px-4 py-3 border-b border-chat-border flex items-center gap-3">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-chat-text truncate">{user.name}</p>
              <p className="text-xs text-chat-muted truncate">{user.email}</p>
            </div>
          </div>

          {/* Account badge */}
          <div className="px-4 py-2.5 border-b border-chat-border">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-chat-green animate-pulse flex-shrink-0" />
              <span className="text-xs text-chat-green font-medium">
                Signed in · History synced
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-chat-muted hover:text-chat-text hover:bg-chat-surface-2 transition-colors text-left"
            >
              <UserIcon />
              Profile
            </button>

            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors text-left"
            >
              <LogoutIcon />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
