"""run records (linear executor state) — additive, non-destructive

Revision ID: 0005_runs
Revises: 0004_provider_credentials
Create Date: 2026-09-07

Additive only: creates the ``runs`` table storing a run's replay inputs/params and its
outcome counters + token/cost accounting. ``downgrade()`` drops exactly this table.
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0005_runs"
down_revision: str | None = "0004_provider_credentials"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "runs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("question", sa.String(), nullable=False),
        sa.Column("year_from", sa.Integer(), nullable=True),
        sa.Column("year_to", sa.Integer(), nullable=True),
        sa.Column("max_results", sa.Integer(), nullable=False),
        sa.Column("budget_usd", sa.Float(), nullable=True),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("frozen", sa.Integer(), nullable=False),
        sa.Column("deduplicated", sa.Integer(), nullable=False),
        sa.Column("screened", sa.Integer(), nullable=False),
        sa.Column("included", sa.Integer(), nullable=False),
        sa.Column("excluded", sa.Integer(), nullable=False),
        sa.Column("uncertain", sa.Integer(), nullable=False),
        sa.Column("off_schema", sa.Integer(), nullable=False),
        sa.Column("input_tokens", sa.Integer(), nullable=False),
        sa.Column("output_tokens", sa.Integer(), nullable=False),
        sa.Column("cost_usd", sa.Float(), nullable=False),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("finished_at", sa.String(), nullable=True),
        sa.Column("error", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("runs")
