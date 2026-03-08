import UserMenu, { AuthUser } from "@/components/auth/UserMenu";

interface HeaderProps {
  pdfName: string | null;
  user: AuthUser | null;
  onSignIn: () => void;
  onLogout: () => void;
}

function FileIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M10.5 1.5a.75.75 0 0 1 .728.568l.73 3.285a3.75 3.75 0 0 0 2.69 2.69l3.284.73a.75.75 0 0 1 0 1.456l-3.285.73a3.75 3.75 0 0 0-2.689 2.69l-.73 3.284a.75.75 0 0 1-1.456 0l-.73-3.285a3.75 3.75 0 0 0-2.69-2.689l-3.284-.73a.75.75 0 0 1 0-1.456l3.285-.73a3.75 3.75 0 0 0 2.69-2.69l.73-3.284A.75.75 0 0 1 10.5 1.5Z" />
    </svg>
  );
}

export default function Header({ pdfName, user, onSignIn, onLogout }: HeaderProps) {
  return (
    <header className="flex-shrink-0 bg-chat-sidebar border-b border-chat-border px-5 py-3 flex items-center justify-between">
      {/* Logo + title */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-chat-green to-emerald-400 flex items-center justify-center shadow-sm shadow-chat-green/30 flex-shrink-0">
          <SparkleIcon />
        </div>
        <div>
          <h1 className="text-sm font-bold text-chat-text leading-none tracking-tight">
            Chat Assistant
          </h1>
          <p className="text-[10px] text-chat-muted mt-0.5 leading-none">
            Mistral · Ollama · LangChain
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* PDF badge */}
        {pdfName ? (
          <div className="flex items-center gap-1.5 bg-chat-green-dim border border-chat-green/30 text-chat-green text-xs font-semibold px-3 py-1.5 rounded-full max-w-[180px]">
            <span className="w-1.5 h-1.5 rounded-full bg-chat-green flex-shrink-0 animate-pulse" />
            <FileIcon />
            <span className="truncate">{pdfName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-chat-muted text-xs px-3 py-1.5 rounded-full border border-chat-border">
            <FileIcon />
            <span>No PDF loaded</span>
          </div>
        )}

        {/* Auth: UserMenu if signed in, Sign In button if guest */}
        {user ? (
          <UserMenu user={user} onLogout={onLogout} />
        ) : (
          <button
            onClick={onSignIn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-chat-white text-gray-900 hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
