"use client";

import { AgentState } from "../types";
import { AGENT_META } from "../lib/constants";
import StreamingText from "./StreamingText";
import CacheMetrics from "./CacheMetrics";

interface Props {
  agentNumber: 1 | 2 | 3;
  agentState: AgentState;
}

const STATUS_RING: Record<string, string> = {
  pending: "border-[#262626] bg-[#1f1f1f]",
  running: "border-[#2d5bff]/60 bg-[#1f1f1f] animate-pulse-border",
  done:    "border-[#262626] bg-[#1f1f1f]",
  error:   "border-red-800/60 bg-[#1f1f1f]",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-[#4b5563]",
  running: "bg-[#2d5bff] animate-ping-slow",
  done:    "bg-emerald-500",
  error:   "bg-red-500",
};

const STATUS_BADGE: Record<string, string> = {
  running: "bg-[#2d5bff]/15 text-[#3b82f6] border border-[#2d5bff]/30",
  done:    "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50",
  error:   "bg-red-950/60 text-red-400 border border-red-800/50",
};

export default function AgentCard({ agentNumber, agentState }: Props) {
  const meta = AGENT_META[agentNumber - 1];
  const { status, streamText, result, metrics, error } = agentState;

  return (
    <div className={`relative w-full rounded-2xl border-2 p-3 sm:p-5 transition-all duration-500 ${STATUS_RING[status]}`}>

      {/* Header */}
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#121212] border border-[#262626] flex items-center justify-center text-base sm:text-lg shrink-0">
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] font-semibold text-[#4b5563] uppercase tracking-widest">
              Agent {agentNumber}
            </span>
            <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status]}`} />
          </div>
          <h3 className="font-semibold text-[#e5e7eb] text-xs sm:text-sm leading-snug mt-0.5">
            {meta.name}
          </h3>
          {status === "pending" && (
            <p className="text-[10px] sm:text-xs text-[#4b5563] mt-0.5 leading-snug">{meta.description}</p>
          )}
        </div>

        {/* Status badge */}
        {STATUS_BADGE[status] && (
          <span className={`shrink-0 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide px-1.5 sm:px-2 py-0.5 rounded-full ${STATUS_BADGE[status]}`}>
            {status}
          </span>
        )}
      </div>

      {/* Streaming text */}
      {(status === "running" || (status === "done" && streamText)) && (
        <StreamingText text={streamText} isStreaming={status === "running"} />
      )}

      {/* Error */}
      {status === "error" && error && (
        <p className="text-xs text-red-400 mt-2 bg-red-950/40 rounded-lg p-2 border border-red-800/40">
          {error}
        </p>
      )}

      {/* Agent 2 risk summary */}
      {status === "done" && result && agentNumber === 2 && (
        <ResultSummaryAgent2 result={result as import("../types").ComplianceResult} />
      )}

      {/* Cache metrics */}
      {status === "done" && (
        <CacheMetrics metrics={metrics} agentNumber={agentNumber} />
      )}
    </div>
  );
}

function ResultSummaryAgent2({ result }: { result: import("../types").ComplianceResult }) {
  const criticalCount = result.risk_flags.filter((f) => f.severity === "critical").length;
  const highCount     = result.risk_flags.filter((f) => f.severity === "high").length;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] border border-[#262626] text-[#6b7280]">
        Risk score: <strong className="text-[#e5e7eb]">{result.overall_risk_score}/10</strong>
      </span>
      {criticalCount > 0 && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/50 text-red-400">
          {criticalCount} critical
        </span>
      )}
      {highCount > 0 && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-950/60 border border-orange-800/50 text-orange-400">
          {highCount} high
        </span>
      )}
    </div>
  );
}
