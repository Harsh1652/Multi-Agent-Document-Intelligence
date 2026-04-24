"use client";

import Link from "next/link";
import { usePipeline } from "./hooks/usePipeline";
import UploadZone from "./components/UploadZone";
import AgentPipeline from "./components/AgentPipeline";
import FinalReport from "./components/FinalReport";

export default function Home() {
  const { state, startPipeline, reset } = usePipeline();
  const { phase, agents, traceUrl } = state;

  const isbusy = phase === "uploading" || phase === "streaming";
  const isDone = phase === "done";

  const agent1Result = agents[0].result as import("./types").ExtractionResult | null;
  const agent2Result = agents[1].result as import("./types").ComplianceResult | null;
  const agent3Result = agents[2].result as import("./types").SummaryResult | null;

  return (
    <main className="min-h-screen bg-[#121212]">

      {/* ── Header ── */}
      <header className="border-b border-[#262626] bg-[#1a1a1a]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-[#e5e7eb] leading-none tracking-tight truncate">
              Document Intelligence
            </h1>
            <p className="text-[10px] sm:text-xs text-[#4b5563] mt-0.5">
              LangGraph · GPT-4o · LangSmith
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link
              href="/case-study"
              className="text-xs sm:text-sm text-[#4b5563] hover:text-[#6b7280] transition-colors hidden sm:block"
            >
              Case study
            </Link>
            {phase !== "idle" && (
              <button
                onClick={reset}
                disabled={isbusy}
                className="text-xs sm:text-sm text-[#6b7280] hover:text-[#9ca3af] disabled:opacity-40 transition-colors min-h-[44px] flex items-center"
              >
                ← New document
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-10">

        {/* ── Upload section ── */}
        {(phase === "idle" || phase === "uploading" || phase === "error") && (
          <section className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight animate-shimmer px-2">
                Analyze any contract in seconds
              </h2>
              <p className="text-[#6b7280] text-xs sm:text-sm max-w-md mx-auto px-4">
                Three AI agents extract entities, assess risk, and generate an executive summary — live.
              </p>
            </div>

            <UploadZone onFile={startPipeline} disabled={isbusy} />

            {phase === "uploading" && (
              <p className="text-center text-sm text-[#2d5bff] animate-pulse">
                Uploading and extracting text…
              </p>
            )}
            {phase === "error" && state.errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-sm text-red-400 text-center">
                {state.errorMessage}
              </div>
            )}
          </section>
        )}

        {/* ── Agent pipeline ── */}
        {(phase === "streaming" || phase === "done") && (
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-5">
              <h2 className="text-xs sm:text-sm font-semibold text-[#9ca3af] uppercase tracking-widest">
                {phase === "streaming" ? "Agents processing…" : "Analysis complete"}
              </h2>
              {phase === "streaming" && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#2d5bff]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2d5bff] animate-ping-slow" />
                  Live
                </span>
              )}
            </div>
            <AgentPipeline pipelineState={state} />
          </section>
        )}

        {/* ── Final report ── */}
        {isDone && agent1Result && agent2Result && agent3Result && (
          <FinalReport
            extraction={agent1Result}
            compliance={agent2Result}
            summary={agent3Result}
            traceUrl={traceUrl}
          />
        )}

      </div>
    </main>
  );
}
