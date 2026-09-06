# NOETARCH Backend

Secure modular monolith (FastAPI). Owned by the Claude backend + security team.

## Requirements
- Python >= 3.11
- [uv](https://docs.astral.sh/uv/)

## Setup
    uv sync --extra dev
    cp .env.example .env
    uv run uvicorn noetarch.main:app --reload

Health checks: `GET /api/v1/health/live` and `GET /api/v1/health/ready`.

## Quality gates
    uv run pytest
    uv run ruff check .
    uv run mypy

## Scope note
Foundation scaffold only — **no domain models or endpoints yet** (awaiting SRS +
maintainer authorization per the Backend Charter). `database/` and `modules/` are
intentionally omitted until the first confirmed domain, to avoid empty
architecture for appearance.
