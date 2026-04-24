from dotenv import load_dotenv
load_dotenv()  # must run before ChatOpenAI reads OPENAI_API_KEY from env

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from graph.state import (
    DocumentState,
    ExtractionResult,
    ComplianceResult,
    SummaryResult,
    PipelineStatus,
)

_llm = ChatOpenAI(model="gpt-4o", temperature=0, max_tokens=4096)

_extractor_llm = _llm.with_structured_output(ExtractionResult, method="json_schema")
_compliance_llm = _llm.with_structured_output(ComplianceResult, method="json_schema")
_summarizer_llm = _llm.with_structured_output(SummaryResult, method="json_schema")

EXTRACT_SYSTEM = """\
You are a specialist legal document parser. Extract all structured data from the contract.

EXTRACTION TARGETS:
- PARTIES: All named entities and their roles (licensor, licensee, vendor, customer, etc.)
- KEY DATES: Effective date, expiry/renewal date, notice periods
- FINANCIAL TERMS: Contract value, payment schedule, currency, penalties
- GOVERNING LAW: Jurisdiction and applicable law

KEY CLAUSES TO IDENTIFY:
- Payment terms (how, when, penalties)
- Liability limitations or caps (LIABILITY_CAP)
- Termination conditions (TERMINATION)
- Intellectual property ownership (IP_OWNERSHIP)
- Confidentiality / NDA obligations (CONFIDENTIALITY)
- Indemnification obligations (INDEMNIFICATION)
- Warranty provisions (WARRANTY)
- Force majeure (FORCE_MAJEURE)
- Dispute resolution (DISPUTE_RESOLUTION)
- Data protection / privacy (DATA_PROTECTION)
- Non-compete / non-solicitation (NON_COMPETE)

Never invent information not present in the document. Use null for missing fields.\
"""

COMPLIANCE_SYSTEM = """\
You are a senior legal risk analyst specializing in contract compliance.
You have the full contract text AND a structured extraction of its entities and clauses.

Analyze for:
1. Missing clauses that are standard for this document type
2. Clauses that are present but unusually one-sided
3. Financial exposure without adequate caps
4. Jurisdiction-specific compliance requirements (GDPR, CCPA, SOX)
5. Non-standard language that deviates from market norms

SEVERITY:
- critical: Could void the contract, create criminal liability, or unlimited financial exposure
- high: Significant financial or legal risk requiring pre-signing resolution
- medium: Should be negotiated but not a blocker
- low: Minor improvement opportunity\
"""

SUMMARY_SYSTEM = """\
You are an expert legal counsel producing an executive briefing for a C-suite audience.
You have the full contract, structured entity/clause extraction, and a risk assessment.

Write in plain English, no legal jargon. Lead with the most important finding.
Be direct about risks — do not soften language.
The executive_summary_markdown should use Markdown headers and bullet points.\
"""


async def extract_node(state: DocumentState) -> dict:
    pdf_text = state["pdf_text"]
    messages = [
        SystemMessage(content=EXTRACT_SYSTEM),
        HumanMessage(content=(
            f"<document>\n{pdf_text}\n</document>\n\n"
            "Extract all entities and contractual clauses from the document above."
        )),
    ]
    result: ExtractionResult = await _extractor_llm.ainvoke(messages)
    return {
        "agent1_result": result,
        "current_agent": 2,
        "pipeline_status": PipelineStatus.RUNNING,
    }


async def analyze_node(state: DocumentState) -> dict:
    pdf_text = state["pdf_text"]
    agent1 = state["agent1_result"]
    messages = [
        SystemMessage(content=COMPLIANCE_SYSTEM),
        HumanMessage(content=(
            f"<document>\n{pdf_text}\n</document>\n\n"
            f"<extracted_data>\n{agent1.model_dump_json(indent=2)}\n</extracted_data>\n\n"
            "Identify all compliance gaps and risks in the document."
        )),
    ]
    result: ComplianceResult = await _compliance_llm.ainvoke(messages)
    return {
        "agent2_result": result,
        "current_agent": 3,
        "pipeline_status": PipelineStatus.RUNNING,
    }


async def summarize_node(state: DocumentState) -> dict:
    pdf_text = state["pdf_text"]
    agent1 = state["agent1_result"]
    agent2 = state["agent2_result"]
    messages = [
        SystemMessage(content=SUMMARY_SYSTEM),
        HumanMessage(content=(
            f"<document>\n{pdf_text}\n</document>\n\n"
            f"<entities_and_clauses>\n{agent1.model_dump_json(indent=2)}\n</entities_and_clauses>\n\n"
            f"<risk_assessment>\n{agent2.model_dump_json(indent=2)}\n</risk_assessment>\n\n"
            "Generate an executive summary with a clear recommendation."
        )),
    ]
    result: SummaryResult = await _summarizer_llm.ainvoke(messages)
    return {
        "agent3_result": result,
        "current_agent": None,
        "pipeline_status": PipelineStatus.COMPLETED,
    }
