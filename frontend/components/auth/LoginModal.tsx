"use client";

import { useState } from "react";
import SSOButton from "./SSOButton";

// ── Props ─────────────────────────────────────────────────────────────────────

interface LoginModalProps {
  onGoogleLogin: () => Promise<void>;
  onGithubLogin: () => Promise<void>;
  onEmailSignIn: (email: string, password: string) => Promise<void>;
  onEmailSignUp: (name: string, email: string, password: string) => Promise<void>;
  onContinueAsGuest: () => void;
}

type Tab = "signin" | "signup";

// ── Icons ─────────────────────────────────────────────────────────────────────

function EyeOpenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── Reusable input ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  error?: string;
  right?: React.ReactNode;
}

function Field({ label, type, value, onChange, placeholder, autoComplete, error, right }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-chat-muted">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full bg-chat-bg border rounded-xl px-3.5 py-2.5 text-sm text-chat-text placeholder:text-chat-muted/50
            outline-none transition-all duration-150
            focus:border-chat-green focus:ring-2 focus:ring-chat-green/15
            ${error ? "border-red-500/50" : "border-chat-border"}`}
        />
        {right && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-chat-muted">
            {right}
          </span>
        )}
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function LoginModal({
  onGoogleLogin,
  onGithubLogin,
  onEmailSignIn,
  onEmailSignUp,
  onContinueAsGuest,
}: LoginModalProps) {
  const [tab, setTab]             = useState<Tab>("signin");
  const [ssoLoading, setSsoLoading] = useState<"google" | "github" | null>(null);

  // form fields
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // form state
  const [formLoading, setFormLoading]   = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [serverError, setServerError]   = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ── SSO ───────────────────────────────────────────────────────────────────

  async function handleGoogle() {
    setSsoLoading("google");
    try { await onGoogleLogin(); } finally { setSsoLoading(null); }
  }
  async function handleGithub() {
    setSsoLoading("github");
    try { await onGithubLogin(); } finally { setSsoLoading(null); }
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validate() {
    const e: Record<string, string> = {};
    if (tab === "signup" && !name.trim())
      e.name = "Name is required.";
    if (!email.trim())
      e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email.";
    if (!password)
      e.password = "Password is required.";
    else if (password.length < 8)
      e.password = "Minimum 8 characters.";
    if (tab === "signup" && password !== confirm)
      e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");
    if (!validate()) return;
    setFormLoading(true);
    try {
      if (tab === "signin") {
        await onEmailSignIn(email, password);
      } else {
        await onEmailSignUp(name, email, password);
        // Account created — redirect to sign-in with email pre-filled
        const createdEmail = email;
        setName("");
        setPassword("");
        setConfirm("");
        setErrors({});
        setEmail(createdEmail);           // keep email so user doesn't retype it
        setTab("signin");
        setSuccessMessage("Account created! Please sign in to continue.");
      }
    } catch (err: unknown) {
      debugger;
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setFormLoading(false);
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    setErrors({});
    setServerError("");
    setSuccessMessage("");
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm my-auto bg-chat-surface border border-chat-border rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-in">

        {/* accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-chat-green via-emerald-400 to-chat-green" />

        <div className="px-7 py-7 flex flex-col gap-5">

          {/* Logo + heading */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-chat-green to-emerald-400 flex items-center justify-center shadow-lg shadow-chat-green/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M10.5 1.5a.75.75 0 0 1 .728.568l.73 3.285a3.75 3.75 0 0 0 2.69 2.69l3.284.73a.75.75 0 0 1 0 1.456l-3.285.73a3.75 3.75 0 0 0-2.689 2.69l-.73 3.284a.75.75 0 0 1-1.456 0l-.73-3.285a3.75 3.75 0 0 0-2.69-2.689l-3.284-.73a.75.75 0 0 1 0-1.456l3.285-.73a3.75 3.75 0 0 0 2.69-2.69l.73-3.284A.75.75 0 0 1 10.5 1.5Z" />
                <path d="M17.25 12a.75.75 0 0 1 .727.569l.337 1.521a1.875 1.875 0 0 0 1.345 1.344l1.521.337a.75.75 0 0 1 0 1.458l-1.521.337a1.875 1.875 0 0 0-1.345 1.345l-.337 1.521a.75.75 0 0 1-1.458 0l-.337-1.521a1.875 1.875 0 0 0-1.344-1.345l-1.521-.337a.75.75 0 0 1 0-1.458l1.521-.337a1.875 1.875 0 0 0 1.344-1.344l.337-1.521A.75.75 0 0 1 17.25 12Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-chat-text tracking-tight">Chat Assistant</h1>
              <p className="text-xs text-chat-muted mt-0.5">Sign in to save your history across sessions</p>
            </div>
          </div>

          {/* SSO */}
          <div className="flex flex-col gap-2.5">
            <SSOButton provider="google" onClick={handleGoogle} isLoading={ssoLoading === "google"} />
            <SSOButton provider="github" onClick={handleGithub} isLoading={ssoLoading === "github"} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-chat-border" />
            <span className="text-xs text-chat-muted">or continue with email</span>
            <div className="flex-1 h-px bg-chat-border" />
          </div>

          {/* Tabs */}
          <div className="flex bg-chat-bg border border-chat-border rounded-xl p-1 gap-1">
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  tab === t
                    ? "bg-chat-green text-white shadow-sm"
                    : "text-chat-muted hover:text-chat-text"
                }`}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

            {tab === "signup" && (
              <Field
                label="Full name"
                type="text"
                value={name}
                onChange={setName}
                placeholder="John Doe"
                autoComplete="name"
                error={errors.name}
              />
            )}

            <Field
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete={tab === "signin" ? "username" : "email"}
              error={errors.email}
            />

            <Field
              label="Password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder={tab === "signup" ? "Min. 8 characters" : "••••••••"}
              autoComplete={tab === "signin" ? "current-password" : "new-password"}
              error={errors.password}
              right={
                <button type="button" onClick={() => setShowPwd((p) => !p)} tabIndex={-1}
                  className="hover:text-chat-text transition-colors">
                  {showPwd ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              }
            />

            {tab === "signup" && (
              <Field
                label="Confirm password"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={setConfirm}
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.confirm}
                right={
                  <button type="button" onClick={() => setShowConfirm((p) => !p)} tabIndex={-1}
                    className="hover:text-chat-text transition-colors">
                    {showConfirm ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                }
              />
            )}

            {tab === "signin" && (
              <div className="flex justify-end -mt-1">
                <button type="button" className="text-[11px] text-chat-muted hover:text-chat-green transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-2 text-xs text-chat-green bg-chat-green/10 border border-chat-green/25 rounded-lg px-3 py-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-px">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {successMessage}
              </div>
            )}

            {serverError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                bg-chat-green text-white hover:bg-chat-green-hover active:scale-[0.98]
                shadow-md shadow-chat-green/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {formLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : tab === "signin" ? "Sign In" : "Create Account"
              }
            </button>
          </form>

          {/* Guest */}
          <div className="flex flex-col items-center gap-1.5 pt-1 border-t border-chat-border">
            <button
              onClick={onContinueAsGuest}
              className="text-xs text-chat-muted hover:text-chat-text transition-colors underline underline-offset-2"
            >
              Continue without signing in
            </button>
            <p className="text-[10px] text-chat-muted/50 text-center">
              Guest chats are saved locally and lost when you clear site data.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
