# Multi-Agent Document Intelligence

A full-stack application that analyzes PDF contracts in real time using a three-agent pipeline built with **LangGraph**, **GPT-4o**, and **LangSmith**. Upload a contract, watch three AI agents work sequentially with live token streaming, then read an executive summary with risk flags and a proceed/do-not-proceed recommendation.

---

## What It Does

```
User uploads PDF
       │
       ▼
┌──────────────────────┐
│  Agent 1 · extract   │  Identifies parties, dates, amounts, key clauses
└──────────┬───────────┘
           │  ExtractionResult (JSON)
           ▼
┌──────────────────────┐
│  Agent 2 · analyze   │  Flags compliance gaps, risk items (CRITICAL/HIGH/MEDIUM/LOW)
└──────────┬───────────┘
           │  ComplianceResult (JSON)
           ▼
┌──────────────────────┐
│  Agent 3 · summarize │  Generates executive briefing + PROCEED / DO NOT SIGN
└──────────────────────┘
           │
           ▼
  Final Report + LangSmith trace link
```

Each agent card on the frontend shows live token streaming, a cache-hit badge (⚡ tokens saved), and structured results — visible as they happen.

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI agents | [LangGraph](https://github.com/langchain-ai/langgraph) `>=0.3` — `StateGraph` with sequential nodes |
| LLM | OpenAI `gpt-4o` via `langchain-openai` |
| Prompt caching | GPT-4o automatic prefix caching (≥ 1024 tokens) |
| Observability | [LangSmith](https://smith.langchain.com) — trace per pipeline run |
| Backend | FastAPI + SSE (`text/event-stream`) |
| PDF extraction | pypdf |
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 |
| API docs | Swagger UI (`/docs`) · ReDoc (`/redoc`) |

---

## Project Structure

```
MultiAgentDocumentIntelligence/
│
├── backend/
│   ├── main.py                  # FastAPI app — POST /api/analyze (SSE) + GET /api/health
│   ├── config.py                # Pydantic settings — reads .env
│   ├── requirements.txt
│   ├── .env.example
│   │
│   ├── graph/
│   │   ├── state.py             # DocumentState (TypedDict) + all 3 Pydantic output schemas
│   │   ├── nodes.py             # extract_node, analyze_node, summarize_node (async)
│   │   ├── graph.py             # StateGraph wiring + compiled_graph singleton
│   │   └── __init__.py
│   │
│   └── services/
│       └── pdf_service.py       # pypdf text extraction + cleaning
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Main page — upload zone + pipeline + final report
│   │   ├── layout.tsx           # Root layout + metadata
│   │   ├── globals.css          # Tailwind base + custom animations
│   │   │
│   │   ├── hooks/
│   │   │   └── usePipeline.ts   # useReducer state machine — drives all SSE events
│   │   │
│   │   ├── components/
│   │   │   ├── UploadZone.tsx   # Drag-and-drop + "Try with sample" buttons
│   │   │   ├── AgentPipeline.tsx# 3 agent cards + animated connector arrows
│   │   │   ├── AgentCard.tsx    # Per-agent card: pending / running / done / error
│   │   │   ├── StreamingText.tsx# Token-by-token text with blinking cursor
│   │   │   ├── CacheMetrics.tsx # ⚡ cache hit · N tokens saved badge
│   │   │   └── FinalReport.tsx  # Markdown report + risk flags + "View trace →"
│   │   │
│   │   ├── types/index.ts       # TypeScript interfaces mirroring backend schemas
│   │   └── lib/
│   │       ├── constants.ts     # API_BASE, agent metadata, severity colours
│   │       └── api.ts           # fetch wrappers + async SSE stream parser
│   │
│   └── public/samples/
│       ├── nda-sample.pdf
│       ├── vendor-agreement-sample.pdf
│       └── loan-document-sample.pdf
│
└── generate_samples.py          # Script that produced the 3 sample PDFs (fpdf2)
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/account/api-keys)
- *(Optional)* A [LangSmith API key](https://smith.langchain.com) for traces

---

### 1 · Clone & configure

```bash
git clone <repo-url>
cd MultiAgentDocumentIntelligence
```

Copy the environment template and fill in your keys:

```bash
cp backend/.env.example backend/.env
```

```dotenv
# backend/.env
OPENAI_API_KEY=sk-...               # required
LANGSMITH_API_KEY=ls__...           # optional — enables "View trace →" button
LANGSMITH_PROJECT=document-intelligence
LANGSMITH_TRACING=true
```

---

### 2 · Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8001
```

| URL | Purpose |
|---|---|
| `http://localhost:8001/api/health` | Liveness check |
| `http://localhost:8001/docs` | Swagger UI |
| `http://localhost:8001/redoc` | ReDoc (recommended for reading SSE protocol) |

---

### 3 · Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:3000`** (or 3001 if 3000 is taken).

---

### 4 · Try it

1. Drag in any text-based PDF contract — or click one of the **sample** buttons:
   - **NDA** — mutual NDA with uncapped indemnification (expect CRITICAL flag)
   - **Vendor Agreement** — SaaS contract with missing DPA (expect HIGH/CRITICAL flags)
   - **Loan Document** — commercial loan with unlimited personal guaranty
2. Watch three agent cards light up sequentially with live token streaming
3. See the cache-hit badge appear on Agents 2 and 3 (⚡ N tokens saved)
4. Read the final report with risk flags and executive summary
5. Click **View trace →** to open the LangSmith run (requires `LANGSMITH_API_KEY`)

---

## Agent Details

### Agent 1 — Entity & Clause Extractor (`extract` node)

Parses the raw PDF text and returns structured data.

**Extracts:**
- **Parties** — name, role (licensor/licensee/vendor/customer), jurisdiction
- **Dates** — effective date, expiry/renewal, notice periods
- **Financial terms** — contract value, payment schedule, currency, penalties
- **Governing law** — jurisdiction and applicable law
- **Key clauses** — one of: `PAYMENT_TERMS`, `LIABILITY_CAP`, `TERMINATION`, `IP_OWNERSHIP`, `CONFIDENTIALITY`, `INDEMNIFICATION`, `WARRANTY`, `FORCE_MAJEURE`, `DISPUTE_RESOLUTION`, `DATA_PROTECTION`, `NON_COMPETE`

**Output schema:**

```json
{
  "entities": [
    { "name": "Acme Corp", "entity_type": "PARTY", "value": "Licensor", "location_in_doc": "Preamble" }
  ],
  "clauses": [
    { "clause_type": "PAYMENT_TERMS", "summary": "Net-30 invoicing", "verbatim_excerpt": "...", "page_reference": "§4.2" }
  ],
  "document_type": "Software License Agreement",
  "governing_law": "State of New York"
}
```

---

### Agent 2 — Compliance & Risk Analyst (`analyze` node)

Receives the full PDF text **and** Agent 1's extraction. Checks for compliance gaps, one-sided clauses, and financial exposure.

**Frameworks applied:** GDPR · CCPA · SOX · industry-specific regulations

**Severity levels:**

| Level | Meaning |
|---|---|
| `critical` | Could void the contract, create criminal liability, or unlimited financial exposure |
| `high` | Significant risk — must resolve before signing |
| `medium` | Should be negotiated but not a blocker |
| `low` | Minor improvement opportunity |

**Output schema:**

```json
{
  "overall_risk_score": 8,
  "risk_flags": [
    {
      "flag_id": "RF-001",
      "title": "Missing Data Processing Agreement",
      "description": "No DPA exists for EU data subjects — violates GDPR Article 28.",
      "severity": "critical",
      "related_clause_type": "DATA_PROTECTION",
      "recommendation": "Add a GDPR-compliant DPA before execution."
    }
  ],
  "compliant_areas": ["Payment terms", "Governing law clause"],
  "jurisdiction_notes": "Delaware choice-of-law is standard."
}
```

---

### Agent 3 — Executive Summary Generator (`summarize` node)

Receives all prior outputs and writes a plain-English briefing for a C-suite audience.

**Recommendation values:**

| Value | Display |
|---|---|
| `proceed` | ✅ Proceed |
| `proceed_with_caution` | ⚠️ Proceed with Caution |
| `do_not_proceed` | 🚫 Do Not Proceed |
| `seek_legal_review` | ⚖️ Seek Legal Review |

**Output schema:**

```json
{
  "executive_summary_markdown": "## Executive Summary\n\n**Document:** ...\n\n### Key Findings\n...",
  "key_points": ["Uncapped indemnification poses significant financial risk"],
  "recommendation": "do_not_proceed",
  "recommendation_rationale": "Three critical compliance gaps must be resolved before signing."
}
```

---

## SSE Event Protocol

The `POST /api/analyze` endpoint returns a **`text/event-stream`** response. The frontend reads it via `fetch()` + `ReadableStream` (not `EventSource`, which only supports GET).

Each frame follows the standard format:
```
event: <type>
data: <json>

```

### Event reference

| Event | Fired when | Key payload fields |
|---|---|---|
| `agent_status` | An agent node starts | `agent: 1│2│3`, `status: "running"` |
| `agent_token` | Each streamed token | `agent`, `token: string` |
| `agent_result` | An agent node completes | `agent`, `status: "completed"`, `result: object` |
| `agent_metrics` | After each LLM call | `agent`, `cache_read_tokens`, `total_input_tokens`, `output_tokens` |
| `pipeline_done` | All three agents finish | `status: "completed"`, `trace_url: string │ null` |
| `pipeline_error` | Any agent throws | `failed_agent: 1│2│3`, `error: string` |

### curl example

```bash
curl -N -X POST http://localhost:8001/api/analyze \
  -F "file=@contract.pdf"
```

---

## Prompt Caching

GPT-4o caches the longest matching prompt prefix automatically for prompts ≥ 1024 tokens.

All three agents receive the full PDF text at the start of their message. After Agent 1 processes it, Agents 2 and 3 get a **cache hit** on that block — reducing input token costs by 50% per cached call.

The `agent_metrics` SSE event reports:
- `cache_read_tokens` — tokens served from cache (cost ≈ 0.25× normal)
- `total_input_tokens` — total input including cached
- `output_tokens` — completion tokens generated

The frontend displays this as: **⚡ cache hit · 6,842 tokens saved**

---

## Observability with LangSmith

When `LANGSMITH_TRACING=true` and `LANGSMITH_API_KEY` are set, every pipeline run is traced automatically. No code changes needed — LangChain's callback system instruments LangGraph transparently.

### What you see per trace

```
[Trace] doc-analysis-a1b2c3d4 — 38.4s
  ├── [Node] extract    — 12.1s — 8,421 input (0 cached)   — 892 output
  │     └── [LLM] gpt-4o — json_schema tool call
  ├── [Node] analyze    — 14.8s — 9,204 input (6,842 cached) — 1,104 output
  │     └── [LLM] gpt-4o — json_schema tool call
  └── [Node] summarize  — 11.5s — 10,811 input (6,842 cached) — 2,341 output
        └── [LLM] gpt-4o — json_schema tool call
```

After the pipeline finishes, `main.py` calls `langsmith.Client().share_run(root_run_id)` to generate a public shareable link, which appears as the **View trace →** button in the final report.

---

## API Reference

### `GET /api/health`

Returns current configuration and liveness status.

**Response `200`:**
```json
{
  "status": "ok",
  "model": "gpt-4o",
  "langsmith_enabled": true,
  "max_pdf_size_mb": 10
}
```

---

### `POST /api/analyze`

Accepts a PDF file and returns a real-time SSE stream.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | `File` | Text-based PDF, max 10 MB |

**Response headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
X-Accel-Buffering: no
Connection: keep-alive
```

**Error responses:**

| Code | When |
|---|---|
| `400` | File is not a `.pdf` |
| `413` | PDF exceeds 10 MB |
| `422` | Text extraction failed — likely a scanned/encrypted PDF |

Full interactive docs: **`http://localhost:8001/docs`**
Full readable docs: **`http://localhost:8001/redoc`**

---

## Data Flow

```
POST /api/analyze (multipart PDF)
        │
        ▼
  pdf_service.extract_pdf_text()
        │  plain text string
        ▼
  compiled_graph.astream_events()
        │
        ├── on_chain_start "extract"  ──► SSE: agent_status {agent:1, running}
        │       │
        │   ChatOpenAI (gpt-4o) stream ──► SSE: agent_token {agent:1, token}...
        │       │
        │   → ExtractionResult (JSON Schema output)
        │       │
        ├── on_chain_end "extract"    ──► SSE: agent_result {agent:1, result}
        │                               SSE: agent_metrics {cache_read_tokens}
        │
        ├── on_chain_start "analyze"  ──► SSE: agent_status {agent:2, running}
        │       │
        │   ChatOpenAI stream (cache hit on PDF text)
        │       │
        │   → ComplianceResult
        │       │
        ├── on_chain_end "analyze"    ──► SSE: agent_result {agent:2, result}
        │                               SSE: agent_metrics {cache_read_tokens: N}
        │
        ├── on_chain_start "summarize" ─► SSE: agent_status {agent:3, running}
        │       │
        │   ChatOpenAI stream (cache hit on PDF text)
        │       │
        │   → SummaryResult
        │       │
        └── on_chain_end "summarize"  ──► SSE: agent_result {agent:3, result}
                                         SSE: agent_metrics {cache_read_tokens: N}
                                         SSE: pipeline_done {trace_url}
```

---

## Configuration Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | OpenAI API key |
| `OPENAI_MODEL` | — | `gpt-4o` | Model to use for all three agents |
| `LANGSMITH_API_KEY` | — | — | LangSmith API key; enables trace links |
| `LANGSMITH_PROJECT` | — | `document-intelligence` | Groups traces in LangSmith |
| `LANGSMITH_TRACING` | — | `false` | Set to `true` to enable tracing |
| `LANGSMITH_ENDPOINT` | — | `https://api.smith.langchain.com` | LangSmith API endpoint |
| `MAX_PDF_SIZE_MB` | — | `10` | Maximum PDF upload size |

### Frontend

`API_BASE` is hardcoded in [`frontend/app/lib/constants.ts`](frontend/app/lib/constants.ts):

```ts
export const API_BASE = "http://localhost:8001";
```

Change this if your backend runs on a different host or port.

---

## PDF Requirements

| Requirement | Detail |
|---|---|
| Format | `.pdf` extension, `application/pdf` MIME type |
| Content | Text-based (not scanned / image-only) |
| Max size | 10 MB (configurable via `MAX_PDF_SIZE_MB`) |
| Language | English (system prompts are English) |
| Min extracted text | 100 characters — shorter extractions are rejected with HTTP 422 |

> **Scanned PDFs** (image-only, no embedded text layer) will return HTTP 422. Use OCR tooling (e.g., Adobe Acrobat, AWS Textract) to add a text layer before uploading.

---

## Generating New Sample PDFs

The three sample documents in `frontend/public/samples/` were created by `generate_samples.py`. To regenerate or create new ones:

```bash
pip install fpdf2
python generate_samples.py
```

Each sample is crafted to trigger realistic agent output:
- **nda-sample.pdf** — uncapped indemnification → CRITICAL flag
- **vendor-agreement-sample.pdf** — missing DPA + asymmetric liability → CRITICAL + HIGH flags
- **loan-document-sample.pdf** — unlimited personal guaranty + jury waiver → HIGH flags

---

## Development Notes

### Running the backend with auto-reload

```bash
cd backend
uvicorn main:app --port 8001 --reload
```

> On Windows, the `--reload` flag can leave orphaned processes. If port 8001 is stuck, find and kill the process:
> ```powershell
> Get-NetTCPConnection -LocalPort 8001 -State Listen |
>   ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
> ```

### TypeScript type checking

```bash
cd frontend
npx tsc --noEmit
```

### Backend import verification

```bash
cd backend
python -c "from graph import compiled_graph; print(type(compiled_graph).__name__)"
# → CompiledStateGraph
```

---

## Limitations

- **Scanned PDFs** are not supported (no OCR layer)
- **Non-English contracts** — agents will attempt analysis but quality is reduced
- **Very large PDFs** (> ~600,000 characters after extraction) are truncated silently
- **Streaming tokens** from structured-output agents (1 & 2) are partial JSON fragments, not prose — this is expected behaviour from GPT-4o tool-use mode
- **LangSmith trace link** requires both `LANGSMITH_API_KEY` and `LANGSMITH_TRACING=true`; the button is silently omitted otherwise
- **Session state** uses `MemorySaver` (in-process memory) — restarts clear all sessions
