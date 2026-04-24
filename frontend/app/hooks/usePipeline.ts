"use client";

import { useReducer, useCallback } from "react";
import { PipelineState, AgentState, AgentMetrics } from "../types";
import { analyzeDocument, parseSSEStream } from "../lib/api";

const initialAgentState = (): AgentState => ({
  status: "pending",
  streamText: "",
  result: null,
  metrics: null,
});

const initialState: PipelineState = {
  phase: "idle",
  agents: [initialAgentState(), initialAgentState(), initialAgentState()],
  traceUrl: null,
  errorMessage: null,
};

type Action =
  | { type: "UPLOAD_START" }
  | { type: "STREAM_START" }
  | { type: "AGENT_STATUS"; agent: number; status: "running" }
  | { type: "AGENT_TOKEN"; agent: number; token: string }
  | { type: "AGENT_RESULT"; agent: number; result: unknown }
  | { type: "AGENT_METRICS"; agent: number; metrics: AgentMetrics }
  | { type: "PIPELINE_DONE"; traceUrl: string | null }
  | { type: "PIPELINE_ERROR"; failedAgent: number; error: string }
  | { type: "RESET" };

function agentIndex(agent: number): 0 | 1 | 2 {
  return (agent - 1) as 0 | 1 | 2;
}

function reducer(state: PipelineState, action: Action): PipelineState {
  switch (action.type) {
    case "UPLOAD_START":
      return { ...initialState, phase: "uploading" };

    case "STREAM_START":
      return { ...state, phase: "streaming" };

    case "AGENT_STATUS": {
      const agents = [...state.agents] as PipelineState["agents"];
      const i = agentIndex(action.agent);
      agents[i] = { ...agents[i], status: "running" };
      return { ...state, agents };
    }

    case "AGENT_TOKEN": {
      const agents = [...state.agents] as PipelineState["agents"];
      const i = agentIndex(action.agent);
      agents[i] = { ...agents[i], streamText: agents[i].streamText + action.token };
      return { ...state, agents };
    }

    case "AGENT_RESULT": {
      const agents = [...state.agents] as PipelineState["agents"];
      const i = agentIndex(action.agent);
      agents[i] = {
        ...agents[i],
        status: "done",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: action.result as any,
      };
      return { ...state, agents };
    }

    case "AGENT_METRICS": {
      const agents = [...state.agents] as PipelineState["agents"];
      const i = agentIndex(action.agent);
      agents[i] = { ...agents[i], metrics: action.metrics };
      return { ...state, agents };
    }

    case "PIPELINE_DONE":
      return { ...state, phase: "done", traceUrl: action.traceUrl };

    case "PIPELINE_ERROR": {
      const agents = [...state.agents] as PipelineState["agents"];
      const i = agentIndex(action.failedAgent);
      agents[i] = { ...agents[i], status: "error", error: action.error };
      return {
        ...state,
        phase: "error",
        errorMessage: action.error,
        agents,
      };
    }

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

export function usePipeline() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startPipeline = useCallback(async (file: File) => {
    dispatch({ type: "UPLOAD_START" });

    let response: Response;
    try {
      response = await analyzeDocument(file);
    } catch {
      dispatch({ type: "PIPELINE_ERROR", failedAgent: 0, error: "Network error — is the backend running?" });
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({ detail: "Unknown error" }));
      dispatch({ type: "PIPELINE_ERROR", failedAgent: 0, error: body.detail ?? "Upload failed" });
      return;
    }

    dispatch({ type: "STREAM_START" });

    for await (const event of parseSSEStream(response)) {
      switch (event.type) {
        case "agent_status":
          dispatch({ type: "AGENT_STATUS", agent: event.data.agent as number, status: "running" });
          break;
        case "agent_token":
          dispatch({ type: "AGENT_TOKEN", agent: event.data.agent as number, token: event.data.token as string });
          break;
        case "agent_result":
          dispatch({ type: "AGENT_RESULT", agent: event.data.agent as number, result: event.data.result });
          break;
        case "agent_metrics":
          dispatch({
            type: "AGENT_METRICS",
            agent: event.data.agent as number,
            metrics: {
              cache_read_tokens: event.data.cache_read_tokens as number,
              total_input_tokens: event.data.total_input_tokens as number,
              output_tokens: event.data.output_tokens as number,
            },
          });
          break;
        case "pipeline_done":
          dispatch({ type: "PIPELINE_DONE", traceUrl: (event.data.trace_url as string) ?? null });
          break;
        case "pipeline_error":
          dispatch({
            type: "PIPELINE_ERROR",
            failedAgent: event.data.failed_agent as number,
            error: event.data.error as string,
          });
          break;
      }
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return { state, startPipeline, reset };
}
