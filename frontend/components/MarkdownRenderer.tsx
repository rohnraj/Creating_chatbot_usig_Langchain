"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

// ── Copy button used inside code blocks ──────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          Copy
        </>
      )}
    </button>
  );
}

// ── Markdown component map ────────────────────────────────────────────────────

const components: Components = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-chat-text mt-6 mb-3 pb-2 border-b border-chat-border leading-tight first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-chat-text mt-5 mb-2.5 leading-tight first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-bold text-chat-text mt-4 mb-2 leading-tight first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-bold text-chat-text mt-3 mb-1.5 leading-tight first:mt-0">
      {children}
    </h4>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="text-chat-text text-sm leading-7 mb-3 last:mb-0">
      {children}
    </p>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="mb-3 last:mb-0 space-y-1.5 pl-1">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 last:mb-0 space-y-1.5 pl-1 list-decimal list-inside [&>li]:pl-1">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2.5 text-sm text-chat-text leading-6">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-chat-green flex-shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-chat-green pl-4 py-1 my-3 bg-chat-green-dim/40 rounded-r-lg text-chat-muted italic text-sm">
      {children}
    </blockquote>
  ),

  // Inline code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const lang = match?.[1] ?? "";
    const isBlock = !!match;
    const codeString = String(children).replace(/\n$/, "");

    if (isBlock) {
      return (
        <div className="my-4 rounded-xl overflow-hidden border border-[#333] text-sm">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#333]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              {lang && (
                <span className="ml-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {lang}
                </span>
              )}
            </div>
            <CopyButton text={codeString} />
          </div>
          <SyntaxHighlighter
            language={lang || "text"}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "16px",
              background: "#141414",
              fontSize: "13px",
              lineHeight: "1.65",
            }}
            showLineNumbers={codeString.split("\n").length > 5}
            wrapLongLines={false}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }

    // Inline code
    return (
      <code
        className="font-mono text-[12.5px] bg-chat-surface-2 text-chat-green px-1.5 py-0.5 rounded-md border border-chat-border"
        {...props}
      >
        {children}
      </code>
    );
  },

  // Pre (wraps block code — handled inside code above, this just avoids double wrapping)
  pre: ({ children }) => <>{children}</>,

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-chat-green underline underline-offset-2 hover:text-chat-green-hover transition-colors"
    >
      {children}
    </a>
  ),

  // Bold / italic
  strong: ({ children }) => (
    <strong className="font-bold text-chat-text">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-chat-text/90">{children}</em>
  ),

  // Horizontal rule
  hr: () => <hr className="my-4 border-chat-border" />,

  // Tables (GFM)
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-chat-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-chat-surface-2 text-chat-text font-semibold">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-chat-border">{children}</tbody>
  ),
  tr: ({ children }) => <tr className="hover:bg-chat-surface/50">{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-chat-muted">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-chat-text">{children}</td>
  ),
};

// ── Main component ────────────────────────────────────────────────────────────

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
