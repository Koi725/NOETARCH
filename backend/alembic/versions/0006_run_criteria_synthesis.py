"""run criteria + synthesis + planned queries + timing — additive, non-destructive

Revision ID: 0006_run_criteria_synthesis
Revises: 0005_runs
Create Date: 2026-09-07

Additive only: adds nullable columns to ``runs`` holding the WS2/WS3 artefacts — the derived
screening criteria (JSON text), the grounded synthesis (JSON text), the planned query strings
(JSON text), and wall-clock timing (ms). ``downgrade()`` drops exactly these columns.
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0006_run_criteria_synthesis"
down_revision: str | None = "0005_runs"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_COLUMNS = ("criteria", "synthesis", "planned_queries")


def upgrade() -> None:
    for name in _COLUMNS:
        op.add_column("runs", sa.Column(name, sa.Text(), nullable=True))
    op.add_column("runs", sa.Column("elapsed_ms", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("runs", "elapsed_ms")
    for name in reversed(_COLUMNS):
        op.drop_column("runs", name)
