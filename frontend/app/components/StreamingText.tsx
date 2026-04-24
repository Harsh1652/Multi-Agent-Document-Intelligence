"use client";

interface Props {
  text: string;
  isStreaming: boolean;
}

export default function StreamingText({ text, isStreaming }: Props) {
  if (!text && !isStreaming) return null;

  return (
    <div
      className="text-[10px] sm:text-xs text-[#9ca3af] bg-[#121212] border border-[#262626] rounded-lg p-2.5 sm:p-3 max-h-32 sm:max-h-40 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {text || (
        <span className="text-[#4b5563] italic">Waiting for response…</span>
      )}
      {isStreaming && (
        <span className="inline-block w-1.5 h-3.5 bg-[#2d5bff] ml-0.5 align-text-bottom animate-pulse rounded-sm" />
      )}
    </div>
  );
}
