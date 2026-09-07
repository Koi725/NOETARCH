"""provider credentials (BYOK key vault) — additive, non-destructive

Revision ID: 0004_provider_credentials
Revises: 0003_evidence_provenance
Create Date: 2026-09-07

Additive only: creates the ``provider_credentials`` table that stores the Fernet ciphertext
of a BYOK provider key plus a masked ``last4`` and policy flags (enabled, daily_budget).
No plaintext key is ever stored. ``downgrade()`` drops exactly this table.
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004_provider_credentials"
down_revision: str | None = "0003_evidence_provenance"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "provider_credentials",
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("ciphertext", sa.String(), nullable=False),
        sa.Column("last4", sa.String(), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("daily_budget", sa.Float(), nullable=True),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("provider"),
    )


def downgrade() -> None:
    op.drop_table("provider_credentials")
