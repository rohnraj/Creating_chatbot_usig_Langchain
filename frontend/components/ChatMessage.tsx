import MarkdownRenderer from "@/components/MarkdownRenderer";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 rounded-full bg-chat-muted animate-typing-dot"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-chat-white text-gray-900 shadow-sm">
      U
    </div>
  );
}

function AIAvatar() {
  return (
    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-chat-green to-emerald-500 shadow-sm shadow-chat-green/20">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M10.5 1.5a.75.75 0 0 1 .728.568l.73 3.285a3.75 3.75 0 0 0 2.69 2.69l3.284.73a.75.75 0 0 1 0 1.456l-3.285.73a3.75 3.75 0 0 0-2.689 2.69l-.73 3.284a.75.75 0 0 1-1.456 0l-.73-3.285a3.75 3.75 0 0 0-2.69-2.689l-3.284-.73a.75.75 0 0 1 0-1.456l3.285-.73a3.75 3.75 0 0 0 2.69-2.69l.73-3.284A.75.75 0 0 1 10.5 1.5Z" />
      </svg>
    </div>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const showTyping = !isUser && message.isLoading && !message.content;

  return (
    <div
      className={`flex gap-3 max-w-[63rem] w-full mx-auto animate-fade-slide-in ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {isUser ? <UserAvatar /> : <AIAvatar />}

      <div className={`flex flex-col gap-1 ${isUser ? "items-end max-w-[78%]" : "items-start flex-1 min-w-0"}`}>
        <span className="text-[10px] font-semibold text-chat-muted px-1 uppercase tracking-wide">
          {isUser ? "You" : "Assistant"}
        </span>

        {showTyping ? (
          /* State 1 — waiting for first chunk: animated dots, no background */
          <TypingDots />
        ) : isUser ? (
          /* User bubble — plain text, green pill */
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed whitespace-pre-wrap break-words bg-chat-green text-white font-medium shadow-sm shadow-chat-green/20">
            {message.content}
          </div>
        ) : (
          /* State 2 (streaming) or 3 (done) — markdown content */
          <div className="w-full">
            <MarkdownRenderer content={message.content} />
            {/* Blinking cursor while chunks are still arriving */}
            {message.isLoading && (
              <span className="cursor-blink inline-block w-[2px] h-[1em] bg-chat-text align-middle ml-0.5" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
