"use client";

import ReactMarkdown from "react-markdown";
import { SummaryResult, ComplianceResult, ExtractionResult } from "../types";
import { RECOMMENDATION_CONFIG, SEVERITY_COLORS } from "../lib/constants";

interface Props {
  extraction: ExtractionResult;
  compliance: ComplianceResult;
  summary: SummaryResult;
  traceUrl: string | null;
}

export default function FinalReport({ extraction, compliance, summary, traceUrl }: Props) {
  const recConfig = RECOMMENDATION_CONFIG[summary.recommendation]
    ?? RECOMMENDATION_CONFIG.seek_legal_review;

  return (
    <div className="rounded-2xl border border-[#262626] bg-[#1a1a1a] overflow-hidden">

      {/* ── Report header ── */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#262626] flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2
            className="text-base sm:text-lg font-bold text-[#e5e7eb] leading-snug"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Final Report
          </h2>
          <p className="text-xs text-[#6b7280] mt-0.5 truncate">{extraction.document_type}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Recommendation badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${recConfig.color} ${recConfig.bg} ${recConfig.border}`}
          >
            {recConfig.label}
          </span>

          {/* LangSmith trace link */}
          {traceUrl && (
            <a
              href={traceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#2d5bff]/10 text-[#3b82f6] border border-[#2d5bff]/30 hover:bg-[#2d5bff]/20 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View trace →
            </a>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5 sm:space-y-7">

        {/* ── Key points ── */}
        {summary.key_points.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest mb-3">
              Key Points
            </h3>
            <ul className="space-y-2">
              {summary.key_points.map((pt, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[#9ca3af]">
                  <span className="text-[#2d5bff] mt-0.5 shrink-0 text-xs">▸</span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Executive summary markdown ── */}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{summary.executive_summary_markdown}</ReactMarkdown>
        </div>

        {/* ── Risk flags ── */}
        {compliance.risk_flags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest mb-3">
              Risk Flags
              <span className="ml-2 font-normal text-[#4b5563] normal-case tracking-normal">
                overall score: {compliance.overall_risk_score}/10
              </span>
            </h3>
            <div className="space-y-2">
              {compliance.risk_flags.map((flag) => (
                <div
                  key={flag.flag_id}
                  className={`rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 text-xs ${SEVERITY_COLORS[flag.severity]}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold uppercase tracking-widest text-[9px] opacity-80">
                      {flag.severity}
                    </span>
                    <span className="font-semibold">{flag.title}</span>
                  </div>
                  <p className="opacity-80 leading-relaxed">{flag.description}</p>
                  <p className="mt-1.5 font-medium opacity-90">→ {flag.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Entities ── */}
        {extraction.entities.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest mb-3">
              Extracted Entities
            </h3>
            <div className="flex flex-wrap gap-2">
              {extraction.entities.map((e, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1f1f1f] border border-[#262626] text-xs"
                >
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest text-[#4b5563]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {e.entity_type}
                  </span>
                  <span className="text-[#9ca3af]">{e.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Recommendation rationale ── */}
        <div className="rounded-xl bg-[#1f1f1f] border border-[#262626] px-3 sm:px-4 py-3 text-xs sm:text-sm text-[#6b7280] leading-relaxed">
          <span className="font-semibold text-[#9ca3af]">Rationale: </span>
          {summary.recommendation_rationale}
        </div>

      </div>
    </div>
  );
}
