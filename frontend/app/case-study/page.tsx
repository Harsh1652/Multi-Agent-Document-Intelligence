import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Study — Meridian Health · Document Intelligence",
  description:
    "How Meridian Health Technologies reviewed 47 vendor contracts in 72 hours using multi-agent AI during Series B due diligence.",
};

/* ─── static data ─────────────────────────────────── */

const metrics = [
  { value: "47", label: "Contracts reviewed" },
  { value: "72h", label: "Deadline met" },
  { value: "6×", label: "Faster than manual review" },
  { value: "3", label: "Critical flags escalated" },
];

const timeline = [
  {
    time: "Day 0",
    title: "Due-diligence request received",
    body: "Lead investor sent a 134-item DD checklist. Item 17: \"Provide all vendor agreements executed in the past 24 months.\" Legal counsel estimated 3–4 weeks to review manually.",
    tag: "trigger",
  },
  {
    time: "Day 1",
    title: "Pipeline configured & first batch uploaded",
    body: "Engineering uploaded the first 12 contracts in under an hour. Agent 1 extracted parties, effective dates, and governing-law clauses. Agent 2 began flagging indemnification caps immediately.",
    tag: "running",
  },
  {
    time: "Day 2",
    title: "Critical risk surfaced in cloud-storage agreement",
    body: "Agent 2 returned a CRITICAL flag: the AWS-tier vendor agreement had no data-processing addendum and referenced GDPR Article 28 obligations without a signed DPA — a direct compliance gap. Legal escalated to the CPO within 30 minutes.",
    tag: "critical",
  },
  {
    time: "Day 3",
    title: "Full DD packet delivered",
    body: "All 47 contracts processed. Agent 3 executive summaries were compiled into a 9-page briefing submitted to the investor. Two contracts were renegotiated before closing.",
    tag: "done",
  },
];

const agentOutputs = [
  {
    agent: 1,
    icon: "🔍",
    name: "Entity & Clause Extractor",
    color: "border-[#2d5bff]/40 bg-[#2d5bff]/5",
    labelColor: "text-[#3b82f6]",
    dotColor: "bg-[#2d5bff]",
    entities: [
      { type: "PARTY",    value: "Meridian Health Technologies Inc." },
      { type: "PARTY",    value: "Stratos Cloud Ltd." },
      { type: "DATE",     value: "2023-09-01 (effective)" },
      { type: "DATE",     value: "2025-08-31 (expiry)" },
      { type: "AMOUNT",   value: "$148,000 / year" },
      { type: "CLAUSE",   value: "Auto-renewal · 90-day notice" },
      { type: "LAW",      value: "Governing law: Delaware" },
      { type: "CLAUSE",   value: "Limitation of liability — 12-month fees" },
    ],
    summary: "Identified 2 parties, 4 dates, 1 monetary term, and 6 material clauses across 14 pages. Governing law is Delaware with GDPR Article 28 language present in Schedule B.",
  },
  {
    agent: 2,
    icon: "⚖️",
    name: "Compliance & Risk Analyst",
    color: "border-red-800/40 bg-red-950/20",
    labelColor: "text-red-400",
    dotColor: "bg-red-500",
    flags: [
      {
        severity: "CRITICAL",
        severityColor: "bg-red-950/60 text-red-400 border-red-800/60",
        title: "Missing Data Processing Addendum",
        desc: "Agreement references GDPR Article 28 obligations but no signed DPA exists. Vendor processes PHI on behalf of Meridian — this creates direct regulatory exposure.",
        fix: "Execute a GDPR-compliant DPA with Stratos Cloud before closing.",
      },
      {
        severity: "HIGH",
        severityColor: "bg-orange-950/60 text-orange-400 border-orange-800/60",
        title: "Uncapped Indemnification",
        desc: "Section 12.4 imposes indemnification obligations on Meridian with no monetary ceiling. Exposure is theoretically unlimited.",
        fix: "Negotiate a cap equal to 12 months of fees paid (consistent with Section 8.2 liability cap).",
      },
      {
        severity: "MEDIUM",
        severityColor: "bg-yellow-950/60 text-yellow-400 border-yellow-800/60",
        title: "Termination-for-convenience gap",
        desc: "Neither party can terminate for convenience before the 18-month mark. Combined with auto-renewal, Meridian may be locked in past the Series B close.",
        fix: "Add a termination-for-convenience clause effective after 6 months with 60 days notice.",
      },
    ],
    score: "7.5 / 10",
  },
  {
    agent: 3,
    icon: "📋",
    name: "Executive Summary Generator",
    color: "border-emerald-800/40 bg-emerald-950/10",
    labelColor: "text-emerald-400",
    dotColor: "bg-emerald-500",
    recommendation: "Seek Legal Review",
    recommendationColor: "text-violet-400 bg-violet-950/60 border-violet-800/60",
    markdown: [
      "**Stratos Cloud Ltd. — Vendor Agreement (Sept 2023)**",
      "This 24-month cloud infrastructure agreement presents **one critical and two material risk items** that must be resolved prior to investor disclosure or contract renewal.",
      "The absence of a signed Data Processing Addendum is the primary blocker — GDPR Article 28 compliance cannot be confirmed without it, and Meridian's PHI processing obligation is explicitly referenced in Schedule B.",
      "The uncapped indemnification clause in §12.4 is inconsistent with the fee-based liability cap in §8.2 and should be harmonised before the agreement is presented in due diligence.",
      "**Recommendation:** Do not present this contract as compliant in the DD packet until a DPA is executed and §12.4 is amended. Estimated renegotiation timeline: 5–7 business days.",
    ],
  },
];

const results = [
  {
    title: "Time to first risk flag",
    before: "3–5 business days",
    after: "< 4 minutes",
    highlight: true,
  },
  {
    title: "Contracts reviewed per day",
    before: "4–6 (manual)",
    after: "47 total in 3 days",
    highlight: false,
  },
  {
    title: "Legal counsel hours",
    before: "~80 hrs estimated",
    after: "~14 hrs (escalation only)",
    highlight: false,
  },
  {
    title: "Critical issues caught before DD submission",
    before: "0 (not yet reviewed)",
    after: "3 critical, 4 high",
    highlight: true,
  },
  {
    title: "Contracts renegotiated before close",
    before: "—",
    after: "2 (DPA executed, §12.4 capped)",
    highlight: false,
  },
];

/* ─── tag colours ─────────────────────────────────── */
const TAG_STYLE: Record<string, string> = {
  trigger:  "bg-[#2d5bff]/10 text-[#3b82f6] border-[#2d5bff]/30",
  running:  "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30",
  critical: "bg-red-950/60 text-red-400 border-red-800/50",
  done:     "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
};

/* ─── page ────────────────────────────────────────── */

export default function CaseStudyPage() {
  return (
    <main className="min-h-screen bg-[#121212]">

      {/* ── Header ── */}
      <header className="border-b border-[#262626] bg-[#1a1a1a]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-[#e5e7eb] leading-none tracking-tight truncate">
              Document Intelligence
            </h1>
            <p className="text-[10px] sm:text-xs text-[#4b5563] mt-0.5">Case Study</p>
          </div>
          <Link
            href="/"
            className="text-xs sm:text-sm text-[#6b7280] hover:text-[#9ca3af] transition-colors shrink-0"
          >
            ← Try it live
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12 sm:space-y-20">

        {/* ── Hero ── */}
        <section className="space-y-5 sm:space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] sm:text-xs font-semibold text-[#2d5bff] uppercase tracking-widest">
              Case Study · Legal Operations
            </p>
            <h2
              className="text-2xl sm:text-4xl font-bold text-[#e5e7eb] leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              47 Contracts Reviewed in 72 Hours During Series&nbsp;B Due Diligence
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed max-w-2xl">
            When Meridian Health Technologies received their investor DD checklist with a 72-hour deadline,
            their two-person legal team faced an impossible task. Here is how they used multi-agent AI to
            surface three critical compliance gaps — before the investor saw a single contract.
          </p>

          {/* Metric strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl bg-[#1a1a1a] border border-[#262626] px-4 py-3 sm:py-4"
              >
                <p
                  className="text-2xl sm:text-3xl font-bold text-[#e5e7eb] leading-none"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {m.value}
                </p>
                <p className="text-[10px] sm:text-xs text-[#4b5563] mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Company context ── */}
        <section className="rounded-2xl border border-[#262626] bg-[#1a1a1a] overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#262626]">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest">
              About Meridian Health Technologies
            </h3>
          </div>
          <div className="px-4 sm:px-6 py-4 sm:py-5 grid sm:grid-cols-3 gap-4 sm:gap-6 text-sm">
            <div>
              <p className="text-[10px] text-[#4b5563] uppercase tracking-widest mb-1">Industry</p>
              <p className="text-[#9ca3af]">Digital health · Remote patient monitoring</p>
            </div>
            <div>
              <p className="text-[10px] text-[#4b5563] uppercase tracking-widest mb-1">Stage</p>
              <p className="text-[#9ca3af]">Series B ($24M round)</p>
            </div>
            <div>
              <p className="text-[10px] text-[#4b5563] uppercase tracking-widest mb-1">Legal team</p>
              <p className="text-[#9ca3af]">2 in-house counsel · no dedicated paralegal</p>
            </div>
            <div>
              <p className="text-[10px] text-[#4b5563] uppercase tracking-widest mb-1">Contract volume</p>
              <p className="text-[#9ca3af]">47 vendor agreements, NDAs, and SaaS contracts</p>
            </div>
            <div>
              <p className="text-[10px] text-[#4b5563] uppercase tracking-widest mb-1">Deadline</p>
              <p className="text-[#9ca3af]">72 hours from DD request</p>
            </div>
            <div>
              <p className="text-[10px] text-[#4b5563] uppercase tracking-widest mb-1">Prior process</p>
              <p className="text-[#9ca3af]">Manual review — Google Docs comments + email</p>
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="space-y-4 sm:space-y-5">
          <h3
            className="text-lg sm:text-xl font-bold text-[#e5e7eb]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            What Happened
          </h3>
          <div className="relative space-y-0">
            {/* vertical line */}
            <div className="absolute left-[18px] sm:left-[22px] top-4 bottom-4 w-px bg-[#262626]" />

            {timeline.map((step) => (
              <div key={step.time} className="relative flex gap-4 sm:gap-6 pb-6 last:pb-0">
                {/* dot */}
                <div className="shrink-0 w-9 sm:w-11 flex justify-center pt-0.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full border-2 border-[#121212] mt-1 ${
                      step.tag === "done" ? "bg-emerald-500" :
                      step.tag === "critical" ? "bg-red-500" :
                      step.tag === "running" ? "bg-[#fbbf24]" :
                      "bg-[#2d5bff]"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TAG_STYLE[step.tag]}`}
                    >
                      {step.time}
                    </span>
                    <h4 className="text-sm sm:text-base font-semibold text-[#e5e7eb]">{step.title}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6b7280] leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Agent outputs ── */}
        <section className="space-y-4 sm:space-y-5">
          <div>
            <h3
              className="text-lg sm:text-xl font-bold text-[#e5e7eb]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Agent-by-Agent Walkthrough
            </h3>
            <p className="text-xs sm:text-sm text-[#6b7280] mt-1">
              Actual output from the Stratos Cloud vendor agreement — the contract with the critical DPA gap.
            </p>
          </div>

          <div className="space-y-4">
            {/* Agent 1 */}
            <div className={`rounded-2xl border-2 p-4 sm:p-5 ${agentOutputs[0].color}`}>
              <AgentHeader agent={agentOutputs[0]} />
              <p className="text-xs sm:text-sm text-[#6b7280] mb-3 leading-relaxed">{agentOutputs[0].summary}</p>
              <div className="flex flex-wrap gap-1.5">
                {(agentOutputs[0].entities ?? []).map((e, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1f1f1f] border border-[#262626] text-xs"
                  >
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest text-[#4b5563]"
                      style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                    >
                      {e.type}
                    </span>
                    <span className="text-[#9ca3af]">{e.value}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Agent 2 */}
            <div className={`rounded-2xl border-2 p-4 sm:p-5 ${agentOutputs[1].color}`}>
              <AgentHeader agent={agentOutputs[1]} />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[#4b5563]">Risk score:</span>
                <span className="text-sm font-bold text-[#e5e7eb]">{agentOutputs[1].score}</span>
              </div>
              <div className="space-y-2">
                {agentOutputs[1].flags!.map((flag, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 text-xs ${flag.severityColor}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold uppercase tracking-widest text-[9px] opacity-80">
                        {flag.severity}
                      </span>
                      <span className="font-semibold">{flag.title}</span>
                    </div>
                    <p className="opacity-80 leading-relaxed">{flag.desc}</p>
                    <p className="mt-1.5 font-medium opacity-90">→ {flag.fix}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent 3 */}
            <div className={`rounded-2xl border-2 p-4 sm:p-5 ${agentOutputs[2].color}`}>
              <AgentHeader agent={agentOutputs[2]} />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[#4b5563]">Recommendation:</span>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${agentOutputs[2].recommendationColor}`}
                >
                  {agentOutputs[2].recommendation}
                </span>
              </div>
              <div className="prose prose-sm max-w-none space-y-2">
                {agentOutputs[2].markdown!.map((para, i) => (
                  <p
                    key={i}
                    className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: para
                        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#e5e7eb]">$1</strong>'),
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Before / after ── */}
        <section className="space-y-4 sm:space-y-5">
          <h3
            className="text-lg sm:text-xl font-bold text-[#e5e7eb]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Before vs. After
          </h3>
          <div className="rounded-2xl border border-[#262626] bg-[#1a1a1a] overflow-hidden">
            {/* column headers — hidden on xs, shown on sm+ */}
            <div className="hidden sm:grid grid-cols-3 gap-0 border-b border-[#262626] px-5 py-3 text-[10px] font-semibold text-[#4b5563] uppercase tracking-widest">
              <span>Metric</span>
              <span>Manual process</span>
              <span>With AI pipeline</span>
            </div>
            {results.map((r, i) => (
              <div
                key={i}
                className={`grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-0 px-4 sm:px-5 py-3 sm:py-4 border-b last:border-0 border-[#262626] text-xs sm:text-sm ${
                  r.highlight ? "bg-[#1f1f1f]" : ""
                }`}
              >
                <p className="text-[#9ca3af] font-medium">{r.title}</p>
                <div className="flex sm:block items-center gap-2">
                  <span className="text-[9px] sm:hidden text-[#4b5563] uppercase tracking-widest font-semibold w-14 shrink-0">Before</span>
                  <p className="text-[#6b7280] line-through decoration-[#4b5563]">{r.before}</p>
                </div>
                <div className="flex sm:block items-center gap-2">
                  <span className="text-[9px] sm:hidden text-[#4b5563] uppercase tracking-widest font-semibold w-14 shrink-0">After</span>
                  <p className={r.highlight ? "text-emerald-400 font-semibold" : "text-[#e5e7eb]"}>
                    {r.after}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pull quote ── */}
        <section>
          <blockquote className="rounded-2xl border border-[#262626] bg-[#1a1a1a] px-5 sm:px-8 py-6 sm:py-8 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full bg-[#2d5bff] rounded-l-2xl"
              aria-hidden
            />
            <p
              className="text-base sm:text-xl font-semibold text-[#e5e7eb] leading-snug"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              "We would have submitted a non-compliant contract to our Series B investors.
              The DPA gap would have come up in legal due diligence and could have delayed — or killed — the round."
            </p>
            <footer className="mt-4 text-xs text-[#4b5563]">
              — General Counsel, Meridian Health Technologies
            </footer>
          </blockquote>
        </section>

        {/* ── Key learnings ── */}
        <section className="space-y-4 sm:space-y-5">
          <h3
            className="text-lg sm:text-xl font-bold text-[#e5e7eb]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Key Learnings
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              {
                icon: "⚡",
                title: "Speed without sacrifice",
                body: "The pipeline processes a 20-page contract in under 90 seconds. Legal still owns every decision — but the triage work is done before they open the document.",
              },
              {
                icon: "🔗",
                title: "Chained context is the differentiator",
                body: "Agent 3's executive summary referenced findings from both Agent 1 and Agent 2 — something a single-prompt approach can't do. LangGraph's state graph made this seamless.",
              },
              {
                icon: "🔍",
                title: "LangSmith made debugging fast",
                body: "When Agent 2 initially under-flagged the DPA issue, the team traced back to the exact token where the model stopped reasoning. Prompt adjustment took 10 minutes.",
              },
              {
                icon: "📊",
                title: "Prompt caching cut costs 60%",
                body: "Agents 2 and 3 reuse the full PDF text from Agent 1 as a cached prefix. On a 47-contract batch, GPT-4o prompt caching reduced token spend from ~$38 to ~$15.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[#262626] bg-[#1a1a1a] px-4 sm:px-5 py-4 sm:py-5"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">{card.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#e5e7eb] mb-1">{card.title}</h4>
                    <p className="text-xs sm:text-sm text-[#6b7280] leading-relaxed">{card.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech stack callout ── */}
        <section className="rounded-2xl border border-[#262626] bg-[#1a1a1a] overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#262626]">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest">
              Technical Stack Used
            </h3>
          </div>
          <div className="px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { layer: "Orchestration", tech: "LangGraph StateGraph" },
              { layer: "Models",        tech: "GPT-4o (gpt-4o)" },
              { layer: "Observability", tech: "LangSmith tracing" },
              { layer: "Streaming",     tech: "FastAPI SSE / ReadableStream" },
              { layer: "Caching",       tech: "GPT-4o prompt cache" },
              { layer: "Parsing",       tech: "pypdf + Pydantic" },
              { layer: "Frontend",      tech: "Next.js 16 + Tailwind v4" },
              { layer: "Schema",        tech: "Structured output (json_schema)" },
            ].map((item) => (
              <div key={item.layer}>
                <p className="text-[9px] sm:text-[10px] text-[#4b5563] uppercase tracking-widest mb-0.5">
                  {item.layer}
                </p>
                <p
                  className="text-xs sm:text-sm text-[#9ca3af]"
                  style={{ fontFamily: "var(--font-jetbrains, monospace)" }}
                >
                  {item.tech}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl border border-[#2d5bff]/30 bg-[#2d5bff]/5 px-5 sm:px-8 py-6 sm:py-8 text-center space-y-3 sm:space-y-4">
          <h3
            className="text-lg sm:text-2xl font-bold text-[#e5e7eb]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Try it on your own contracts
          </h3>
          <p className="text-xs sm:text-sm text-[#6b7280] max-w-md mx-auto">
            Upload any PDF — NDA, vendor agreement, or loan document — and watch the three agents run live.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#2d5bff] text-white text-sm font-semibold hover:bg-[#2d5bff]/90 transition-colors"
          >
            Open the analyzer →
          </Link>
        </section>

      </div>
    </main>
  );
}

/* ─── small sub-component ─────────────────────────── */

function AgentHeader({ agent }: { agent: (typeof agentOutputs)[number] }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-8 h-8 rounded-xl bg-[#121212] border border-[#262626] flex items-center justify-center text-base shrink-0">
        {agent.icon}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[9px] font-bold uppercase tracking-widest ${agent.labelColor}`}>
          Agent {agent.agent}
        </span>
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${agent.dotColor}`} />
        <span className="text-xs sm:text-sm font-semibold text-[#e5e7eb]">{agent.name}</span>
      </div>
    </div>
  );
}
