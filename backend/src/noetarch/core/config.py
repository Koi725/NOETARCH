"""Application configuration, loaded from the environment (deny-by-default)."""
from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="NOETARCH_", env_file=".env", extra="ignore"
    )

    app_name: str = "noetarch-backend"
    environment: str = "development"
    # Explicit CORS allowlist (comma-separated). Empty = deny all cross-origin.
    cors_allow_origins: str = ""
    # Database URL. Local default is a gitignored SQLite file; Postgres-compatible.
    # Read from NOETARCH_DATABASE_URL or a bare DATABASE_URL. Never committed.
    database_url: str = Field(
        default="sqlite:///./noetarch.db",
        validation_alias=AliasChoices("NOETARCH_DATABASE_URL", "DATABASE_URL"),
    )
    # External data sources (M9). Default OFF: the app runs fully offline on DB/seed
    # data and never makes an outbound network call unless this is explicitly enabled.
    external_sources_enabled: bool = False
    # Contact email for the polite User-Agent (OpenAlex polite pool). Not a secret.
    egress_contact_email: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_allow_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
