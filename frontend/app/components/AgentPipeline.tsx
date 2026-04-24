"use client";

import { PipelineState } from "../types";
import AgentCard from "./AgentCard";

interface Props {
  pipelineState: PipelineState;
}

export default function AgentPipeline({ pipelineState }: Props) {
  const { agents } = pipelineState;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 relative">
        {([1, 2, 3] as const).map((n, idx) => (
          <div key={n} className="relative flex flex-col md:flex-row md:items-stretch">
            <AgentCard agentNumber={n} agentState={agents[n - 1]} />

            {idx < 2 && (
              <>
                {/* Connector arrow — desktop (horizontal) */}
                <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 items-center">
                  <div
                    className={`w-10 h-px transition-colors duration-500 ${
                      agents[n - 1].status === "done"
                        ? "bg-[#2d5bff]/60"
                        : "bg-[#262626]"
                    }`}
                  />
                  <svg
                    className={`w-3 h-3 -ml-0.5 transition-colors duration-500 ${
                      agents[n - 1].status === "done"
                        ? "text-[#2d5bff]/60"
                        : "text-[#262626]"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 8 8"
                  >
                    <path d="M0 0 L8 4 L0 8 Z" />
                  </svg>
                </div>

                {/* Connector arrow — mobile (vertical) */}
                <div className="flex md:hidden justify-center py-1 items-center gap-1 flex-col">
                  <div
                    className={`w-px h-4 transition-colors duration-500 ${
                      agents[n - 1].status === "done"
                        ? "bg-[#2d5bff]/60"
                        : "bg-[#262626]"
                    }`}
                  />
                  <svg
                    className={`w-3 h-3 -mt-0.5 transition-colors duration-500 ${
                      agents[n - 1].status === "done"
                        ? "text-[#2d5bff]/60"
                        : "text-[#262626]"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 8 8"
                    style={{ transform: "rotate(90deg)" }}
                  >
                    <path d="M0 0 L8 4 L0 8 Z" />
                  </svg>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
