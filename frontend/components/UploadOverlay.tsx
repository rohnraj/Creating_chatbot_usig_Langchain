const STEPS = [
  { label: "Uploading PDF",       match: "Uploading" },
  { label: "Processing document", match: "Processing" },
  { label: "Creating embeddings", match: "Creating" },
];

function getStepIndex(status: string) {
  if (status.includes("Creating"))   return 2;
  if (status.includes("Processing")) return 1;
  return 0;
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface UploadOverlayProps {
  isVisible: boolean;
  fileName: string;
  fileSize: string;
  status: string;
}

export default function UploadOverlay({ isVisible, fileName, fileSize, status }: UploadOverlayProps) {
  if (!isVisible) return null;

  const currentStep = getStepIndex(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-chat-bg/90 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-chat-surface border border-chat-border rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6">

        {/* Spinner with file icon */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-chat-border" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-chat-green animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-chat-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        </div>

        {/* File info */}
        <div className="text-center">
          <h3 className="text-base font-semibold text-chat-text">Processing your PDF</h3>
          {fileName && (
            <p className="text-sm text-chat-muted mt-1 truncate max-w-[220px]">
              {fileName}
              {fileSize && <span className="ml-1 opacity-60">({fileSize})</span>}
            </p>
          )}
        </div>

        {/* Step progress */}
        <ol className="w-full flex flex-col gap-3">
          {STEPS.map((step, i) => {
            const isDone   = i < currentStep;
            const isActive = i === currentStep;

            return (
              <li
                key={step.label}
                className={`flex items-center gap-3 text-sm font-medium transition-colors duration-300 ${
                  isDone   ? "text-chat-green" :
                  isActive ? "text-chat-text"  : "text-chat-muted"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border text-[10px] font-bold transition-all duration-300 ${
                  isDone   ? "bg-chat-green border-chat-green text-white" :
                  isActive ? "border-chat-green bg-chat-green-dim text-chat-green" :
                             "border-chat-border2 text-chat-muted"
                }`}>
                  {isDone ? <CheckIcon /> : i + 1}
                </span>

                <span>{step.label}</span>

                {isActive && (
                  <span className="ml-auto flex gap-0.5">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1 h-1 rounded-full bg-chat-green animate-typing-dot"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
