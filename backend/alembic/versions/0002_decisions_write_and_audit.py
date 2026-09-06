"""decisions write state + append-only audit log — additive, non-destructive

Revision ID: 0002_decisions_write_audit
Revises: 0001_initial
Create Date: 2026-09-06

Additive only:
  - ``upgrade()`` adds three columns to ``decisions`` (``version`` with a safe
    server_default of 1 so existing rows are valid, plus nullable ``resolved_at`` and
    ``resolution_action``) and creates the new ``audit_log`` table. No existing column
    or row is dropped or altered destructively.
  - ``downgrade()`` reverses exactly those additions.
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_decisions_write_audit"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("decisions") as batch:
        batch.add_column(
            sa.Column("version", sa.Integer(), nullable=False, server_default="1")
        )
        batch.add_column(sa.Column("resolved_at", sa.String(), nullable=True))
        batch.add_column(sa.Column("resolution_action", sa.String(), nullable=True))

    op.create_table(
        "audit_log",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("entity_type", sa.String(), nullable=False),
        sa.Column("entity_id", sa.String(), nullable=False),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("actor", sa.String(), nullable=False),
        sa.Column("from_status", sa.String(), nullable=True),
        sa.Column("to_status", sa.String(), nullable=True),
        sa.Column("request_id", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("payload_hash", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("audit_log")
    with op.batch_alter_table("decisions") as batch:
        batch.drop_column("resolution_action")
        batch.drop_column("resolved_at")
        batch.drop_column("version")
