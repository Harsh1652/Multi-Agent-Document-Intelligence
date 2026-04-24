from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-4o"
    langsmith_api_key: Optional[str] = None
    langsmith_project: str = "document-intelligence"
    langsmith_tracing: bool = False
    max_pdf_size_mb: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
