export const API_BASE = "http://localhost:8001";

export const AGENT_META = [
  {
    number: 1,
    name: "Entity & Clause Extractor",
    description: "Identifies parties, dates, amounts, and key contractual clauses",
    icon: "🔍",
    color: "blue",
  },
  {
    number: 2,
    name: "Compliance & Risk Analyst",
    description: "Flags compliance gaps and risk items with severity ratings",
    icon: "⚖️",
    color: "amber",
  },
  {
    number: 3,
    name: "Executive Summary Generator",
    description: "Synthesizes findings into an actionable executive briefing",
    icon: "📋",
    color: "green",
  },
] as const;

export const SAMPLE_DOCS = [
  { label: "NDA", filename: "nda-sample.pdf" },
  { label: "Vendor Agreement", filename: "vendor-agreement-sample.pdf" },
  { label: "Loan Document", filename: "loan-document-sample.pdf" },
] as const;

/* Dark-mode severity colours */
export const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-950/60 text-red-400 border-red-800/60",
  high:     "bg-orange-950/60 text-orange-400 border-orange-800/60",
  medium:   "bg-yellow-950/60 text-yellow-400 border-yellow-800/60",
  low:      "bg-blue-950/60 text-blue-400 border-blue-800/60",
};

/* Dark-mode recommendation colours */
export const RECOMMENDATION_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  proceed: {
    label: "Proceed",
    color: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-800/60",
  },
  proceed_with_caution: {
    label: "Proceed with Caution",
    color: "text-[#fbbf24]",
    bg: "bg-yellow-950/60",
    border: "border-yellow-800/60",
  },
  do_not_proceed: {
    label: "Do Not Proceed",
    color: "text-red-400",
    bg: "bg-red-950/60",
    border: "border-red-800/60",
  },
  seek_legal_review: {
    label: "Seek Legal Review",
    color: "text-violet-400",
    bg: "bg-violet-950/60",
    border: "border-violet-800/60",
  },
};
