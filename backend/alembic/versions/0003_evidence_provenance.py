"""evidence provenance columns (source, retrieved_at) — additive, non-destructive

Revision ID: 0003_evidence_provenance
Revises: 0002_decisions_write_audit
Create Date: 2026-09-06

Additive only: ``upgrade()`` adds ``source`` (NOT NULL, server_default 'seed' so existing
rows stay valid) and nullable ``retrieved_at`` to ``evidence_records``. No existing column
or row is dropped or altered destructively. ``downgrade()`` removes exactly those columns.
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_evidence_provenance"
down_revision: str | None = "0002_decisions_write_audit"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("evidence_records") as batch:
        batch.add_column(
            sa.Column("source", sa.String(), nullable=False, server_default="seed")
        )
        batch.add_column(sa.Column("retrieved_at", sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("evidence_records") as batch:
        batch.drop_column("retrieved_at")
        batch.drop_column("source")
