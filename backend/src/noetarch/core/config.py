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
    # Load the demo seed rows on the seed/startup path. Default ON for now so demo
    # deployments stay populated. Set NOETARCH_SEED_DEMO=false for "real mode": the
    # schema is still created/migrated, but no seed rows are inserted (clean, empty DB).
    # The seed code itself is never removed — real data will come from the future
    # workflow engine; this flag only gates whether the demo rows are loaded.
    seed_demo: bool = True
    # External data sources (M9). Default OFF: the app runs fully offline on DB/seed
    # data and never makes an outbound network call unless this is explicitly enabled.
    external_sources_enabled: bool = False
    # Contact email for the polite User-Agent (OpenAlex polite pool). Not a secret.
    egress_contact_email: str = ""
    # BYOK key vault master key (Fernet, urlsafe-base64). If unset, a key file is
    # generated at ``secret_key_path`` (0600) and reused. Losing the master key makes
    # every stored provider key unreadable — see docs/security/PRE_DEPLOY_GATES.md.
    # NEVER commit a real value; this is read from the environment only.
    secret_key: str = ""
    # Where the generated master key is persisted when NOETARCH_SECRET_KEY is unset.
    # Defaults to the container data volume; override for local/dev or tests.
    secret_key_path: str = "/data/secret.key"  # noqa: S105 - a filesystem path, not a secret
    # Default provider + model for real runs. BYOK: a key must be configured and enabled
    # before any real run executes. The provider layer is OFF unless a key is present.
    llm_provider: str = "anthropic"
    llm_model: str = "claude-haiku-4-5"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_allow_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
