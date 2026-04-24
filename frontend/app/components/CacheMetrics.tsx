"use client";

import { AgentMetrics } from "../types";

interface Props {
  metrics: AgentMetrics | null;
  agentNumber: number;
}

export default function CacheMetrics({ metrics, agentNumber }: Props) {
  if (!metrics) return null;

  const hasCacheHit = metrics.cache_read_tokens > 0;

  return (
    <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-2 sm:mt-3 text-[10px] sm:text-xs">
      {hasCacheHit && agentNumber > 1 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/25 font-medium">
          ⚡ cache hit · {metrics.cache_read_tokens.toLocaleString()} tokens saved
        </span>
      )}
      <span className="text-[#4b5563] break-all" style={{ fontFamily: "var(--font-mono)" }}>
        {metrics.total_input_tokens.toLocaleString()} in · {metrics.output_tokens.toLocaleString()} out
      </span>
    </div>
  );
}
