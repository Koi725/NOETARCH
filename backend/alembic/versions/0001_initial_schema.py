"""initial schema — create-only (read-model tables for all 8 domains)

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-06

This migration is purely additive: ``upgrade()`` contains only ``create_table``
statements and no destructive operations (no drop/alter of pre-existing data).
``downgrade()`` reverses exactly the tables this migration created.
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "evidence_records",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("project", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("authors", sa.String(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("journal", sa.String(), nullable=False),
        sa.Column("doi", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("sources", sa.JSON(), nullable=False),
        sa.Column("provenance", sa.JSON(), nullable=False),
        sa.Column("agreement_count", sa.Integer(), nullable=False),
        sa.Column("total_sources", sa.Integer(), nullable=False),
        sa.Column("missing_doi", sa.Boolean(), nullable=True),
        sa.Column("conflict_note", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "decisions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("risk", sa.String(), nullable=False),
        sa.Column("payload", sa.String(), nullable=True),
        sa.Column("cost", sa.String(), nullable=False),
        sa.Column("time", sa.String(), nullable=False),
        sa.Column("reversible", sa.Boolean(), nullable=False),
        sa.Column("detail", sa.String(), nullable=False),
        sa.Column("alternatives", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("rejected_at", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "recipes",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("execution", sa.String(), nullable=False),
        sa.Column("steps", sa.JSON(), nullable=False),
        sa.Column("inputs", sa.JSON(), nullable=False),
        sa.Column("outputs", sa.JSON(), nullable=False),
        sa.Column("estimated_cost", sa.String(), nullable=False),
        sa.Column("estimated_time", sa.String(), nullable=False),
        sa.Column("providers", sa.JSON(), nullable=False),
        sa.Column("privacy_policy", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "history_runs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("recipe", sa.String(), nullable=False),
        sa.Column("started", sa.String(), nullable=False),
        sa.Column("stopped_at", sa.String(), nullable=True),
        sa.Column("duration", sa.String(), nullable=False),
        sa.Column("cost", sa.String(), nullable=False),
        sa.Column("papers", sa.Integer(), nullable=False),
        sa.Column("providers", sa.JSON(), nullable=False),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("stop_reason", sa.String(), nullable=True),
        sa.Column("failure_reason", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "policy_providers",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("status_note", sa.String(), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("daily_cost_limit", sa.Float(), nullable=True),
        sa.Column("data_retention", sa.String(), nullable=False),
        sa.Column("egress_policy", sa.String(), nullable=False),
        sa.Column("capabilities", sa.JSON(), nullable=False),
        sa.Column("routing_preference", sa.String(), nullable=False),
        sa.Column("requires_approval", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "today_snapshot",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("project", sa.String(), nullable=False),
        sa.Column("question", sa.String(), nullable=False),
        sa.Column("waiting", sa.JSON(), nullable=False),
        sa.Column("run", sa.JSON(), nullable=False),
        sa.Column("failure", sa.JSON(), nullable=False),
        sa.Column("finished", sa.JSON(), nullable=False),
        sa.Column("sources", sa.JSON(), nullable=False),
        sa.Column("files", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "live_run_snapshot",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("meta", sa.JSON(), nullable=False),
        sa.Column("steps", sa.JSON(), nullable=False),
        sa.Column("step_inspector", sa.JSON(), nullable=False),
        sa.Column("kpis", sa.JSON(), nullable=False),
        sa.Column("events", sa.JSON(), nullable=False),
        sa.Column("decisions", sa.JSON(), nullable=False),
        sa.Column("evidence_cards", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "guided_review_snapshot",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("project", sa.String(), nullable=False),
        sa.Column("progress", sa.JSON(), nullable=False),
        sa.Column("current_paper", sa.JSON(), nullable=False),
        sa.Column("next_papers", sa.JSON(), nullable=False),
        sa.Column("exclude_reasons", sa.JSON(), nullable=False),
        sa.Column("previous_decisions", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    # Reverse only the tables this migration created (safe: they are new here).
    op.drop_table("guided_review_snapshot")
    op.drop_table("live_run_snapshot")
    op.drop_table("today_snapshot")
    op.drop_table("policy_providers")
    op.drop_table("history_runs")
    op.drop_table("recipes")
    op.drop_table("decisions")
    op.drop_table("evidence_records")
