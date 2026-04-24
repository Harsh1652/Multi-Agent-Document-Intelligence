export type AgentStatus = "pending" | "running" | "done" | "error";

export interface ExtractedEntity {
  name: string;
  entity_type: string;
  value: string;
  location_in_doc?: string | null;
}

export interface ExtractedClause {
  clause_type: string;
  summary: string;
  verbatim_excerpt: string;
  page_reference?: string | null;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  clauses: ExtractedClause[];
  document_type: string;
  governing_law?: string | null;
}

export interface RiskFlag {
  flag_id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  related_clause_type?: string | null;
  recommendation: string;
}

export interface ComplianceResult {
  overall_risk_score: number;
  risk_flags: RiskFlag[];
  compliant_areas: string[];
  jurisdiction_notes?: string | null;
}

export type Recommendation =
  | "proceed"
  | "proceed_with_caution"
  | "do_not_proceed"
  | "seek_legal_review";

export interface SummaryResult {
  executive_summary_markdown: string;
  key_points: string[];
  recommendation: Recommendation;
  recommendation_rationale: string;
}

export interface AgentMetrics {
  cache_read_tokens: number;
  total_input_tokens: number;
  output_tokens: number;
}

export interface AgentState {
  status: AgentStatus;
  streamText: string;
  result: ExtractionResult | ComplianceResult | SummaryResult | null;
  metrics: AgentMetrics | null;
  error?: string;
}

export interface PipelineState {
  phase: "idle" | "uploading" | "streaming" | "done" | "error";
  agents: [AgentState, AgentState, AgentState];
  traceUrl: string | null;
  errorMessage: string | null;
}
