"""Application configuration, loaded from the environment (deny-by-default)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="NOETARCH_", env_file=".env", extra="ignore"
    )

    app_name: str = "noetarch-backend"
    environment: str = "development"
    # Explicit CORS allowlist (comma-separated). Empty = deny all cross-origin.
    cors_allow_origins: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_allow_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
