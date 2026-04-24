import json
import uuid
from typing import AsyncIterator

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import AIMessageChunk
from pydantic import BaseModel

from graph import compiled_graph
from graph.state import DocumentState, PipelineStatus
from services.pdf_service import extract_pdf_text
from config import settings

# ── OpenAPI metadata ────────────────────────────────────────────────────────

TAGS = [
    {
        "name": "pipeline",
        "description": (
            "The core multi-agent analysis pipeline. "
            "Accepts a PDF and streams Server-Sent Events (SSE) as three LangGraph agents "
            "process the document sequentially."
        ),
    },
    {
        "name": "health",
        "description": "Liveness and configuration checks.",
    },
]

SSE_EVENT_DOCS = """
### Server-Sent Event protocol

The response body is a **`text/event-stream`** (SSE) stream.
Each frame follows the standard `event: <type>\\ndata: <json>\\n\\n` format.

| Event | When fired | Payload fields |
|---|---|---|
| `agent_status` | An agent node starts | `agent` (1/2/3), `status: "running"` |
| `agent_token` | Each streamed token from GPT-4o | `agent`, `token: str` |
| `agent_result` | An agent node completes | `agent`, `status: "completed"`, `result: object` |
| `agent_metrics` | After each LLM call | `agent`, `cache_read_tokens`, `total_input_tokens`, `output_tokens` |
| `pipeline_done` | All three agents finished | `status: "completed"`, `trace_url: str \\| null` |
| `pipeline_error` | Any agent throws | `failed_agent` (1/2/3), `error: str` |

### Agent result schemas

**Agent 1 — Entity & Clause Extractor** (`extract` node):
```json
{
  "entities": [{"name": "Acme Corp", "entity_type": "PARTY", "value": "Licensor", "location_in_doc": "Preamble"}],
  "clauses": [{"clause_type": "PAYMENT_TERMS", "summary": "Net-30 invoicing", "verbatim_excerpt": "...", "page_reference": "§4.2"}],
  "document_type": "Software License Agreement",
  "governing_law": "State of New York"
}
```

**Agent 2 — Compliance & Risk Analyst** (`analyze` node):
```json
{
  "overall_risk_score": 8,
  "risk_flags": [{"flag_id": "RF-001", "title": "Missing DPA", "description": "...", "severity": "critical", "related_clause_type": "DATA_PROTECTION", "recommendation": "Add GDPR-compliant DPA"}],
  "compliant_areas": ["Payment terms", "Governing law"],
  "jurisdiction_notes": "Delaware choice-of-law is standard."
}
```

**Agent 3 — Executive Summary Generator** (`summarize` node):
```json
{
  "executive_summary_markdown": "## Executive Summary\\n...",
  "key_points": ["Uncapped indemnification poses high financial risk"],
  "recommendation": "do_not_proceed",
  "recommendation_rationale": "Three critical compliance gaps must be resolved before signing."
}
```

> **Note:** Because SSE is a streaming format, Swagger UI cannot execute this endpoint interactively.
> Use **curl**, the frontend at `http://localhost:3001`, or a tool like Postman with SSE support.
>
> **curl example:**
> ```bash
> curl -N -X POST http://localhost:8000/api/analyze \\
>   -F "file=@contract.pdf"
> ```
"""

app = FastAPI(
    title="Multi-Agent Document Intelligence API",
    description=(
        "A three-agent LangGraph pipeline that processes PDF contracts in real time.\n\n"
        "**Agents:**\n"
        "1. **Entity & Clause Extractor** — identifies parties, dates, amounts, key clauses\n"
        "2. **Compliance & Risk Analyst** — flags risks with CRITICAL / HIGH / MEDIUM / LOW severity\n"
        "3. **Executive Summary Generator** — produces an actionable Markdown executive briefing\n\n"
        "**Observability:** Every pipeline run is traced in LangSmith (if `LANGSMITH_API_KEY` is set). "
        "The `pipeline_done` event includes a public shareable trace URL.\n\n"
        "**Prompt caching:** GPT-4o automatically caches the PDF text prefix. "
        "Agents 2 and 3 report `cache_read_tokens` in their `agent_metrics` events."
    ),
    version="1.0.0",
    openapi_tags=TAGS,
    contact={"name": "Document Intelligence", "url": "http://localhost:3001"},
    license_info={"name": "MIT"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NODE_TO_AGENT: dict[str, int] = {"extract": 1, "analyze": 2, "summarize": 3}
MAX_PDF_BYTES = settings.max_pdf_size_mb * 1024 * 1024


# ── Response models (for Swagger schema display) ────────────────────────────

class HealthResponse(BaseModel):
    status: str
    model: str
    langsmith_enabled: bool
    max_pdf_size_mb: int


class ErrorResponse(BaseModel):
    detail: str


# ── SSE helper ───────────────────────────────────────────────────────────────

def _sse(event_type: str, data: dict) -> str:
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"


# ── Pipeline stream generator ────────────────────────────────────────────────

async def _stream_pipeline(request: Request, pdf_text: str, session_id: str) -> AsyncIterator[str]:
    initial_state: DocumentState = {
        "pdf_text": pdf_text,
        "session_id": session_id,
        "agent1_result": None,
        "agent2_result": None,
        "agent3_result": None,
        "current_agent": 1,
        "pipeline_status": PipelineStatus.RUNNING,
        "error": None,
        "failed_agent": None,
    }

    config = {
        "configurable": {"thread_id": session_id},
        "run_name": f"doc-analysis-{session_id[:8]}",
        "recursion_limit": 10,
    }

    current_agent: int = 1
    root_run_id: str | None = None
    first_event = True

    try:
        async for event in compiled_graph.astream_events(
            initial_state, version="v2", config=config
        ):
            if await request.is_disconnected():
                break

            if first_event:
                root_run_id = event.get("run_id")
                first_event = False

            event_name: str = event["event"]
            component_name: str = event["name"]

            if event_name == "on_chain_start" and component_name in NODE_TO_AGENT:
                current_agent = NODE_TO_AGENT[component_name]
                yield _sse("agent_status", {"agent": current_agent, "status": "running"})

            elif event_name == "on_chat_model_stream":
                chunk: AIMessageChunk = event["data"]["chunk"]
                token = ""
                if isinstance(chunk.content, str):
                    token = chunk.content
                elif isinstance(chunk.content, list):
                    for block in chunk.content:
                        if isinstance(block, dict):
                            token += block.get("text", "")
                if token:
                    yield _sse("agent_token", {"agent": current_agent, "token": token})

            elif event_name == "on_chat_model_end":
                output = event["data"].get("output")
                if output and hasattr(output, "usage_metadata") and output.usage_metadata:
                    usage = output.usage_metadata
                    input_details = usage.get("input_token_details", {})
                    cache_read = (
                        input_details.get("cache_read", 0)
                        if isinstance(input_details, dict)
                        else 0
                    )
                    yield _sse("agent_metrics", {
                        "agent": current_agent,
                        "cache_read_tokens": cache_read,
                        "total_input_tokens": usage.get("input_tokens", 0),
                        "output_tokens": usage.get("output_tokens", 0),
                    })

            elif event_name == "on_chain_end" and component_name in NODE_TO_AGENT:
                agent_num = NODE_TO_AGENT[component_name]
                output: dict = event["data"].get("output", {})
                result_key = f"agent{agent_num}_result"
                result_obj = output.get(result_key)
                result_data = result_obj.model_dump() if result_obj is not None else None
                yield _sse("agent_result", {
                    "agent": agent_num,
                    "status": "completed",
                    "result": result_data,
                })

        trace_url = None
        if root_run_id and settings.langsmith_api_key:
            try:
                from langsmith import Client as LangSmithClient
                ls = LangSmithClient()
                trace_url = ls.share_run(root_run_id)
            except Exception:
                pass

        yield _sse("pipeline_done", {"status": "completed", "trace_url": trace_url})

    except Exception as exc:
        yield _sse("pipeline_error", {
            "failed_agent": current_agent,
            "error": str(exc),
        })


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get(
    "/api/health",
    tags=["health"],
    summary="Health check",
    response_model=HealthResponse,
)
async def health():
    """Returns API configuration and liveness status."""
    return HealthResponse(
        status="ok",
        model=settings.openai_model,
        langsmith_enabled=bool(settings.langsmith_api_key and settings.langsmith_tracing),
        max_pdf_size_mb=settings.max_pdf_size_mb,
    )


@app.post(
    "/api/analyze",
    tags=["pipeline"],
    summary="Analyze a PDF contract",
    description=SSE_EVENT_DOCS,
    responses={
        200: {
            "description": (
                "Server-Sent Event stream. Each `event:` / `data:` frame corresponds to "
                "one pipeline event. See the description above for the full event schema."
            ),
            "content": {
                "text/event-stream": {
                    "example": (
                        "event: agent_status\ndata: {\"agent\": 1, \"status\": \"running\"}\n\n"
                        "event: agent_token\ndata: {\"agent\": 1, \"token\": \"{\\\"entities\\\":\"}\n\n"
                        "event: agent_result\ndata: {\"agent\": 1, \"status\": \"completed\", \"result\": {...}}\n\n"
                        "event: pipeline_done\ndata: {\"status\": \"completed\", \"trace_url\": null}\n\n"
                    )
                }
            },
        },
        400: {"description": "File is not a PDF.", "model": ErrorResponse},
        413: {"description": "PDF exceeds the configured size limit.", "model": ErrorResponse},
        422: {"description": "PDF text could not be extracted (scanned/encrypted).", "model": ErrorResponse},
    },
)
async def analyze_document(request: Request, file: UploadFile = File(..., description="A text-based PDF contract (max 10 MB).")):
    """
    Upload a PDF and receive a real-time SSE stream as three AI agents process it:

    1. **Agent 1** extracts entities and clauses → `agent_result` with `ExtractionResult`
    2. **Agent 2** assesses compliance and risk → `agent_result` with `ComplianceResult`
    3. **Agent 3** generates an executive summary → `agent_result` with `SummaryResult`

    Each agent emits `agent_status` when it starts, `agent_token` events while
    GPT-4o streams, `agent_metrics` after the LLM call completes, and
    `agent_result` when its structured output is ready.
    """
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_PDF_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"PDF exceeds {settings.max_pdf_size_mb} MB limit.",
        )

    try:
        pdf_text = extract_pdf_text(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if len(pdf_text.strip()) < 100:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text. The PDF may be scanned or image-based.",
        )

    session_id = str(uuid.uuid4())

    return StreamingResponse(
        _stream_pipeline(request, pdf_text, session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
