"""SQLAlchemy ORM model for encrypted BYOK provider credentials.

Only the Fernet ciphertext and a masked ``last4`` are stored — never the plaintext key.
There is no seed builder: credentials are user-supplied at runtime and this table is
always empty in demo mode.
"""
from sqlalchemy import Boolean, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from noetarch.core.database import Base


class ProviderCredentialORM(Base):
    __tablename__ = "provider_credentials"

    provider: Mapped[str] = mapped_column(String, primary_key=True)
    # Fernet token of the API key. Encrypted at rest; never the plaintext.
    ciphertext: Mapped[str] = mapped_column(String)
    # Last 4 chars of the key for masked display (e.g. "sk-…ab12"). Not sensitive.
    last4: Mapped[str] = mapped_column(String)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    daily_budget: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[str] = mapped_column(String)
    updated_at: Mapped[str] = mapped_column(String)
