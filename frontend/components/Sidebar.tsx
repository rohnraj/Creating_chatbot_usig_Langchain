"use client";

import { useState } from "react";

export interface ConversationMeta {
  id: string;
  title: string;
}

interface SidebarProps {
  conversations: ConversationMeta[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M10.5 1.5a.75.75 0 0 1 .728.568l.73 3.285a3.75 3.75 0 0 0 2.69 2.69l3.284.73a.75.75 0 0 1 0 1.456l-3.285.73a3.75 3.75 0 0 0-2.689 2.69l-.73 3.284a.75.75 0 0 1-1.456 0l-.73-3.285a3.75 3.75 0 0 0-2.69-2.689l-3.284-.73a.75.75 0 0 1 0-1.456l3.285-.73a3.75 3.75 0 0 0 2.69-2.69l.73-3.284A.75.75 0 0 1 10.5 1.5Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChatBubbleIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? "text-chat-green" : ""}
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

interface ConvItemProps {
  conv: ConversationMeta;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function ConvItem({ conv, isActive, onSelect, onDelete }: ConvItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(conv.id)}
      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
        isActive
          ? "bg-chat-surface text-chat-text"
          : "text-chat-muted hover:bg-chat-surface/50 hover:text-chat-text"
      }`}
    >
      {/* Green left bar for active */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-chat-green rounded-r-full" />
      )}

      <ChatBubbleIcon active={isActive} />

      <span className="flex-1 text-sm truncate pr-5 font-medium">
        {conv.title}
      </span>

      {(hovered || isActive) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conv.id);
          }}
          title="Delete chat"
          className="absolute right-2 p-1 rounded-md text-chat-muted hover:text-red-400 hover:bg-chat-border transition-colors"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 bg-chat-sidebar border-r border-chat-border flex flex-col h-full">

      {/* Branding */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-chat-border flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-chat-green to-emerald-400 flex items-center justify-center shadow-md shadow-chat-green/20 flex-shrink-0">
          <SparkleIcon />
        </div>
        <span className="font-bold text-sm text-chat-text tracking-tight">
          Chat Assistant
        </span>
      </div>

      {/* New Chat — white button like daily.dev "New post" */}
      <div className="px-3 pt-3 pb-1 flex-shrink-0">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-chat-white text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm"
        >
          <PlusIcon />
          New chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.length > 0 && (
          <p className="text-[10px] font-semibold text-chat-muted uppercase tracking-widest px-3 py-2">
            Recent
          </p>
        )}
        <div className="flex flex-col gap-0.5">
          {conversations.map((conv) => (
            <ConvItem
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-chat-border flex-shrink-0">
        <p className="text-[11px] text-chat-muted text-center">
          Powered by Ollama &amp; LangChain
        </p>
      </div>
    </aside>
  );
}
