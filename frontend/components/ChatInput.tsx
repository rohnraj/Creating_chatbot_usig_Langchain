"use client";

import { useRef, KeyboardEvent, ChangeEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileSelect: (file: File) => void;
  isDisabled: boolean;
  hasPdf: boolean;
  /** When true, renders without the bottom-bar wrapper (used in the hero/empty state) */
  hero?: boolean;
}

function AttachIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function ChatInput({
  onSend,
  onFileSelect,
  isDisabled,
  hasPdf,
  hero = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const value = textareaRef.current?.value.trim();
    if (!value || isDisabled) return;
    onSend(value);
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      e.target.value = "";
      return;
    }
    onFileSelect(file);
    e.target.value = "";
  }

  const inputGroup = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Input container */}
      <div className={`flex items-end gap-2 bg-chat-surface border border-chat-border rounded-2xl px-3 py-2 focus-within:border-chat-green/50 focus-within:ring-2 focus-within:ring-chat-green/10 transition-all duration-200 ${hero ? "shadow-lg" : ""}`}>

        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          title="Attach a PDF"
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 mb-0.5
            ${hasPdf
              ? "bg-chat-green text-white shadow-sm shadow-chat-green/30"
              : "text-chat-muted hover:text-chat-text hover:bg-chat-surface-2"
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <AttachIcon />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          disabled={isDisabled}
          onInput={autoResize}
          onKeyDown={handleKeyDown}
          placeholder={hero ? "Ask anything, or attach a PDF…" : "Ask anything…"}
          rows={1}
          className="flex-1 bg-transparent text-chat-text text-sm resize-none outline-none placeholder:text-chat-muted py-1.5 min-h-[34px] max-h-[180px] leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Send button — white */}
        <button
          onClick={handleSend}
          disabled={isDisabled}
          title="Send message"
          className="flex-shrink-0 w-8 h-8 rounded-xl bg-chat-white text-gray-900 flex items-center justify-center transition-all duration-150 hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm mb-0.5"
        >
          <SendIcon />
        </button>
      </div>

      {/* Hint row */}
      <p className="text-[10px] text-chat-muted text-center mt-2 tracking-wide">
        <kbd className="px-1 py-0.5 rounded bg-chat-surface border border-chat-border font-mono text-[9px]">Enter</kbd>
        {" "}send &nbsp;·&nbsp;{" "}
        <kbd className="px-1 py-0.5 rounded bg-chat-surface border border-chat-border font-mono text-[9px]">Shift+Enter</kbd>
        {" "}new line
      </p>
    </>
  );

  // Hero mode: just the input group, no bottom-bar wrapper
  if (hero) {
    return <div className="w-full">{inputGroup}</div>;
  }

  // Normal mode: wrapped in the sticky bottom bar
  return (
    <div className="flex-shrink-0 bg-chat-bg border-t border-chat-border px-4 py-4">
      <div className="max-w-[63rem] mx-auto">{inputGroup}</div>
    </div>
  );
}
