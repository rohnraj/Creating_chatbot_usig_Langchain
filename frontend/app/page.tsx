"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Header from "@/components/Header";
import ChatInput from "@/components/ChatInput";
import ChatMessage, { Message } from "@/components/ChatMessage";
import UploadOverlay from "@/components/UploadOverlay";
import Sidebar, { ConversationMeta } from "@/components/Sidebar";
import LoginModal from "@/components/auth/LoginModal";
import { AuthUser } from "@/components/auth/UserMenu";
import Toaster from "@/components/Toaster";
import { useToast } from "@/hooks/useToast";
import { signIn, signOut, useSession } from "next-auth/react"

// ── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

// ── localStorage keys ─────────────────────────────────────────────────────────

const LS_CONVS   = "chat-conversations";
const LS_ACTIVE  = "chat-active-id";

// ── Helpers ──────────────────────────────────────────────────────────────────

function createConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    messages: [],
  };
}

function titleFrom(text: string): string {
  const t = text.trim();
  return t.length > 42 ? t.slice(0, 42) + "…" : t;
}

/** Clear any in-flight isLoading flags left from a mid-stream page close. */
function sanitize(convs: Conversation[]): Conversation[] {
  return convs.map((c) => ({
    ...c,
    messages: c.messages.map((m) =>
      m.isLoading ? { ...m, isLoading: false } : m
    ),
  }));
}

/** Read persisted conversations from localStorage (client-only). */
function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(LS_CONVS);
    if (raw) {
      const parsed = JSON.parse(raw) as Conversation[];
      if (Array.isArray(parsed) && parsed.length > 0) return sanitize(parsed);
    }
  } catch { /* ignore corrupt data */ }
  return [createConversation()];
}

/** Read persisted active-id, falling back to first conversation. */
function loadActiveId(convs: Conversation[]): string {
  try {
    const id = localStorage.getItem(LS_ACTIVE);
    if (id && convs.find((c) => c.id === id)) return id;
  } catch { /* ignore */ }
  return convs[0].id;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { toasts, showToast, dismiss } = useToast();
  const { data: session } = useSession();

  // Lazy initialisers read from localStorage on the very first render
  // (runs only on the client; typeof window check guards SSR).
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window === "undefined") return [createConversation()];
    return loadConversations();
  });
  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const convs = loadConversations();
    return loadActiveId(convs);
  });

  const [pdfName, setPdfName] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  // ── Auth state ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState<AuthUser | null>(null);
  // Show modal on first load unless the user previously chose "guest"
  const [showLoginModal, setShowLoginModal] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("auth-guest-mode");
  });

  // Upload overlay state
  const [uploadVisible, setUploadVisible] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState("");
  const [uploadStatus, setUploadStatus] = useState("Uploading PDF...");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Derived: active conversation
  const activeConv = conversations.find((c) => c.id === activeId)
    ?? conversations[0];

  // ── Persist to localStorage on every change ────────────────────────────────

  useEffect(() => {
    try {
      localStorage.setItem(LS_CONVS, JSON.stringify(conversations));
    } catch { /* quota exceeded — silently ignore */ }
  }, [conversations]);

  useEffect(() => {
    if (activeId) {
      try { localStorage.setItem(LS_ACTIVE, activeId); } catch { /* ignore */ }
    }
  }, [activeId]);

  // ── Scroll to bottom when active conversation messages change ──────────────

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  // ── Sync Google SSO session → user state ───────────────────────────────────
  // When NextAuth finishes the Google OAuth flow and returns to the page,
  // session.user is populated. Use it directly to mark the user as logged in.

  useEffect(() => {
    if (session?.user?.email) {
      setUser({
        name: session.user.name ?? session.user.email.split("@")[0],
        email: session.user.email,
        image: session.user.image ?? undefined,
      });
      setShowLoginModal(false);
      localStorage.removeItem("auth-guest-mode");
    }
  }, [session]);

  // ── Auth handlers ──────────────────────────────────────────────────────────

  async function handleGoogleLogin() {
    await signIn("google", { callbackUrl: "/" });
  }

  async function handleGithubLogin() {
    showToast("GitHub login coming soon.", "info");
  }

  function handleContinueAsGuest() {
    localStorage.setItem("auth-guest-mode", "true");
    setShowLoginModal(false);
    showToast("Continuing as guest. Chat history is browser-only.", "info");
  }

  function handleSignIn() {
    setShowLoginModal(true);
  }

  async function handleLogout() {
    // Clear custom JWT cookies (email/password users)
    try { await fetch("/api/logout", { method: "GET" }); } catch { /* ignore */ }
    // Sign out of NextAuth (Google SSO users)
    if (session) { await signOut({ redirect: false }); }
    setUser(null);
    localStorage.removeItem("auth-guest-mode");
    setShowLoginModal(true);
    showToast("You've been signed out.", "info");
  }

  // ── Conversation management ────────────────────────────────────────────────

  const handleNew = useCallback(() => {
    const conv = createConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (remaining.length === 0) {
          const fresh = createConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) {
          setActiveId(remaining[0].id);
        }
        return remaining;
      });
    },
    [activeId]
  );

  // ── Message helpers ────────────────────────────────────────────────────────

  function addMessage(msg: Omit<Message, "id">, convId = activeId): string {
    const id = crypto.randomUUID();
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const isFirstUserMsg =
          msg.role === "user" && c.title === "New Chat";
        return {
          ...c,
          title: isFirstUserMsg ? titleFrom(msg.content) : c.title,
          messages: [...c.messages, { ...msg, id }],
        };
      })
    );
    return id;
  }

  function updateMessage(
    msgId: string,
    content: string,
    isLoading?: boolean,
    convId = activeId
  ) {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  content,
                  ...(isLoading !== undefined ? { isLoading } : {}),
                }
              : m
          ),
        };
      })
    );
  }

  // ── Send message ───────────────────────────────────────────────────────────

  async function handleSend(text: string) {
    // Capture the conversation that was active when the user pressed send
    const convId = activeId;

    addMessage({ role: "user", content: text }, convId);
    const assistantId = addMessage(
      { role: "assistant", content: "", isLoading: true },
      convId
    );

    setIsDisabled(true);

    try {
      // Use the /api/chat route which pipes the Express stream without buffering
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: convId }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        // Keep isLoading: true so the streaming cursor stays visible
        updateMessage(assistantId, result, true, convId);
      }

      // Flush any remaining bytes; mark loading done
      result += decoder.decode();
      updateMessage(
        assistantId,
        result || "No reply from server.",
        false,
        convId
      );
    } catch (err) {
      console.error("Chat error:", err);
      updateMessage(
        assistantId,
        "Error contacting server. Make sure the Express backend is running on port 8080.",
        false,
        convId
      );
    } finally {
      setIsDisabled(false);
    }
  }

  // ── PDF upload ─────────────────────────────────────────────────────────────

  async function handleFileSelect(file: File) {
    setUploadFileName(file.name);
    setUploadFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
    setUploadStatus("Uploading PDF...");
    setUploadVisible(true);
    setIsDisabled(true);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      setUploadStatus("Processing PDF...");
      const response = await fetch("/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");

      setUploadStatus("Creating embeddings...");
      await new Promise((r) => setTimeout(r, 500));

      setUploadVisible(false);
      setPdfName(file.name);
      showToast(`"${file.name}" uploaded and ready.`, "success");

      addMessage({
        role: "assistant",
        content: `PDF "${file.name}" uploaded successfully! You can now ask questions about it.`,
      });
    } catch (err: unknown) {
      setUploadVisible(false);
      const msg = err instanceof Error ? err.message : "Unknown error";
      showToast(`Upload failed: ${msg}`, "error");
    } finally {
      setIsDisabled(false);
    }
  }

  // ── Sidebar meta (lightweight — avoids passing full messages) ──────────────

  const sidebarConvs: ConversationMeta[] = conversations.map((c) => ({
    id: c.id,
    title: c.title,
  }));

  // True when no user message has been sent yet in this conversation
  const isEmpty = !activeConv.messages.some((m) => m.role === "user");

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full w-full min-w-0">
      <Sidebar
        conversations={sidebarConvs}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
      />

      {/* Main chat panel */}
      <div className="flex flex-col flex-1 min-w-0 bg-chat-bg">
        <Header
          pdfName={pdfName}
          user={user}
          onSignIn={handleSignIn}
          onLogout={handleLogout}
        />

        {isEmpty ? (
          /* ── Empty / hero state — input centred like Perplexity ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16 gap-8">
            {/* Logo mark */}
            <div className="flex flex-col items-center gap-4 text-center select-none">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-chat-green to-emerald-400 flex items-center justify-center shadow-xl shadow-chat-green/30">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M10.5 1.5a.75.75 0 0 1 .728.568l.73 3.285a3.75 3.75 0 0 0 2.69 2.69l3.284.73a.75.75 0 0 1 0 1.456l-3.285.73a3.75 3.75 0 0 0-2.689 2.69l-.73 3.284a.75.75 0 0 1-1.456 0l-.73-3.285a3.75 3.75 0 0 0-2.69-2.689l-3.284-.73a.75.75 0 0 1 0-1.456l3.285-.73a3.75 3.75 0 0 0 2.69-2.69l.73-3.284A.75.75 0 0 1 10.5 1.5Z" />
                  <path d="M17.25 12a.75.75 0 0 1 .727.569l.337 1.521a1.875 1.875 0 0 0 1.345 1.344l1.521.337a.75.75 0 0 1 0 1.458l-1.521.337a1.875 1.875 0 0 0-1.345 1.345l-.337 1.521a.75.75 0 0 1-1.458 0l-.337-1.521a1.875 1.875 0 0 0-1.344-1.345l-1.521-.337a.75.75 0 0 1 0-1.458l1.521-.337a1.875 1.875 0 0 0 1.344-1.344l.337-1.521A.75.75 0 0 1 17.25 12Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-chat-text tracking-tight">
                  Chat Assistant
                </h1>
                <p className="text-chat-muted text-sm mt-1.5">
                  Ask anything, or attach a PDF to chat with your document
                </p>
              </div>
            </div>

            {/* Centred input */}
            <div className="w-full max-w-[63rem]">
              <ChatInput
                hero
                onSend={handleSend}
                onFileSelect={handleFileSelect}
                isDisabled={isDisabled}
                hasPdf={!!pdfName}
              />
            </div>

            {/* Suggested prompts */}
            <div className="flex flex-wrap gap-2 justify-center max-w-[63rem]">
              {[
                "Summarise the uploaded PDF",
                "What are the key topics?",
                "Explain in simple terms",
                "What are the main conclusions?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isDisabled}
                  className="px-4 py-2 rounded-full text-xs font-medium bg-chat-surface border border-chat-border text-chat-muted hover:text-chat-text hover:border-chat-green/40 hover:bg-chat-surface-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Normal chat state ── */
          <>
            <main className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5">
              {activeConv.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={chatEndRef} />
            </main>

            <ChatInput
              onSend={handleSend}
              onFileSelect={handleFileSelect}
              isDisabled={isDisabled}
              hasPdf={!!pdfName}
            />
          </>
        )}
      </div>

      <UploadOverlay
        isVisible={uploadVisible}
        fileName={uploadFileName}
        fileSize={uploadFileSize}
        status={uploadStatus}
      />

      <Toaster toasts={toasts} dismiss={dismiss} />

      {/* Login modal — shown on first visit or after sign-out */}
      {showLoginModal && (
        <LoginModal
          onGoogleLogin={handleGoogleLogin}
          onGithubLogin={handleGithubLogin}
          onEmailSignIn={async (email, password) => {
            const res = await fetch("/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Login failed.");
            setUser({
              name: data.user.name,
              email: data.user.email,
            });
            setShowLoginModal(false);
            localStorage.removeItem("auth-guest-mode");
            showToast(`Welcome back, ${data.user.name}!`, "success");
          }}
          onEmailSignUp={async (name, email, password) => {
            const res = await fetch("/api/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Sign-up failed.");
            // Do not auto-login — modal switches to Sign In tab
            showToast("Account created! Please sign in to continue.", "success");
          }}
          onContinueAsGuest={handleContinueAsGuest}
        />
      )}
    </div>
  );
}
