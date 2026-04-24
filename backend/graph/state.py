from __future__ import annotations

from enum import Enum
from typing import Optional
from typing_extensions import TypedDict
from pydantic import BaseModel, Field


# ── Agent 1 Schema ─────────────────────────────────────────────────────────

class ExtractedEntity(BaseModel):
    name: str
    entity_type: str
    value: str
    location_in_doc: Optional[str] = None


class ExtractedClause(BaseModel):
    clause_type: str
    summary: str
    verbatim_excerpt: str
    page_reference: Optional[str] = None


class ExtractionResult(BaseModel):
    entities: list[ExtractedEntity] = Field(default_factory=list)
    clauses: list[ExtractedClause] = Field(default_factory=list)
    document_type: str
    governing_law: Optional[str] = None


# ── Agent 2 Schema ─────────────────────────────────────────────────────────

class RiskSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskFlag(BaseModel):
    flag_id: str
    title: str
    description: str
    severity: RiskSeverity
    related_clause_type: Optional[str] = None
    recommendation: str


class ComplianceResult(BaseModel):
    overall_risk_score: int = Field(ge=1, le=10)
    risk_flags: list[RiskFlag] = Field(default_factory=list)
    compliant_areas: list[str] = Field(default_factory=list)
    jurisdiction_notes: Optional[str] = None


# ── Agent 3 Schema ─────────────────────────────────────────────────────────

class Recommendation(str, Enum):
    PROCEED = "proceed"
    PROCEED_WITH_CAUTION = "proceed_with_caution"
    DO_NOT_PROCEED = "do_not_proceed"
    SEEK_LEGAL_REVIEW = "seek_legal_review"


class SummaryResult(BaseModel):
    executive_summary_markdown: str
    key_points: list[str] = Field(default_factory=list)
    recommendation: Recommendation
    recommendation_rationale: str


# ── Pipeline Status ─────────────────────────────────────────────────────────

class PipelineStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


# ── LangGraph State ─────────────────────────────────────────────────────────

class DocumentState(TypedDict):
    pdf_text: str
    session_id: str
    agent1_result: Optional[ExtractionResult]
    agent2_result: Optional[ComplianceResult]
    agent3_result: Optional[SummaryResult]
    current_agent: Optional[int]
    pipeline_status: PipelineStatus
    error: Optional[str]
    failed_agent: Optional[int]
