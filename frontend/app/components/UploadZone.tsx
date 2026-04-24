"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { SAMPLE_DOCS } from "../lib/constants";
import { loadSampleFile } from "../lib/api";

interface Props {
  onFile: (file: File) => void;
  disabled: boolean;
}

export default function UploadZone({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") onFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  }

  async function handleSample(filename: string) {
    if (disabled) return;
    setLoadingSample(filename);
    try {
      const file = await loadSampleFile(filename);
      onFile(file);
    } catch {
      alert("Could not load sample document.");
    } finally {
      setLoadingSample(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "relative flex flex-col items-center justify-center gap-3 sm:gap-4",
          "rounded-2xl border-2 border-dashed px-4 sm:px-8 py-8 sm:py-14 text-center",
          "transition-all duration-200 cursor-pointer select-none",
          disabled
            ? "opacity-40 cursor-not-allowed border-[#262626] bg-[#1a1a1a]"
            : isDragging
              ? "border-[#2d5bff] bg-[#2d5bff]/10 scale-[1.01]"
              : "border-[#262626] bg-[#1a1a1a] hover:border-[#2d5bff]/50 hover:bg-[#1f1f1f]",
        ].join(" ")}
      >
        {/* Icon */}
        <div className={[
          "w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl",
          "border border-[#262626] transition-colors duration-200",
          isDragging ? "bg-[#2d5bff]/20 border-[#2d5bff]/40" : "bg-[#1f1f1f]",
        ].join(" ")}>
          {isDragging ? "📂" : "📄"}
        </div>

        <div>
          <p className="font-semibold text-[#e5e7eb] text-sm">
            {isDragging ? "Drop your PDF here" : "Upload a contract PDF"}
          </p>
          <p className="text-xs text-[#4b5563] mt-1">
            Drag & drop or tap to browse · max 10 MB
          </p>
        </div>

        {/* Blue CTA button */}
        {!disabled && !isDragging && (
          <span className="text-xs font-medium px-4 py-2 rounded-full bg-[#2d5bff] text-white min-h-[44px] flex items-center">
            Choose file
          </span>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
      </div>

      {/* Sample documents */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#4b5563] font-medium shrink-0">Try a sample:</span>
        {SAMPLE_DOCS.map((doc) => (
          <button
            key={doc.filename}
            onClick={() => handleSample(doc.filename)}
            disabled={disabled || loadingSample !== null}
            className={[
              "text-xs px-3 py-2 sm:py-1 rounded-full border transition-colors min-h-[36px] sm:min-h-0",
              "border-[#262626] text-[#6b7280] bg-[#1a1a1a]",
              "hover:border-[#2d5bff]/60 hover:text-[#3b82f6] hover:bg-[#2d5bff]/10",
              "disabled:opacity-30 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            {loadingSample === doc.filename ? "Loading…" : doc.label}
          </button>
        ))}
      </div>
    </div>
  );
}
