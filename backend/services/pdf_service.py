import io
import re
from pypdf import PdfReader
from pypdf.errors import PdfReadError


def extract_pdf_text(pdf_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
    except PdfReadError as e:
        raise ValueError(f"Could not read PDF: {e}")

    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        text = _clean_text(text)
        if text.strip():
            pages.append(f"[Page {i}]\n{text}")

    return "\n\n".join(pages)


def _clean_text(text: str) -> str:
    text = text.replace("\ufb01", "fi").replace("\ufb02", "fl")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
