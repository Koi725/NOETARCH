#!/usr/bin/env bash
# One-command local dev: brings up the backend (auto-migrate + seed) and the frontend,
# pre-wired so the app connects with zero manual env editing.
#
#   scripts/dev.sh                       # app on http://localhost:3000, external sources OFF
#   NOETARCH_EXTERNAL_SOURCES_ENABLED=true scripts/dev.sh   # enable OpenAlex /search
#
# Requires: uv (https://docs.astral.sh/uv/) and Node/npm. No API keys are needed — with
# external sources OFF (default) the app runs fully on local seed data.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
EXTERNAL="${NOETARCH_EXTERNAL_SOURCES_ENABLED:-false}"

# ── Backend: env pre-wired, migrate, seed, serve ────────────────────────────
cd "$ROOT/backend"
export NOETARCH_CORS_ALLOW_ORIGINS="http://localhost:${FRONTEND_PORT}"
export NOETARCH_EXTERNAL_SOURCES_ENABLED="$EXTERNAL"
export NOETARCH_DATABASE_URL="${NOETARCH_DATABASE_URL:-sqlite:///./noetarch.db}"

echo "› Installing backend deps (uv sync)…"
uv sync --extra dev
echo "› Applying migrations (create-only) + seeding…"
uv run alembic upgrade head
uv run python -m noetarch.database.seed_cli
echo "› Starting backend on :${BACKEND_PORT} (external sources: ${EXTERNAL})…"
uv run uvicorn noetarch.main:app --host 127.0.0.1 --port "${BACKEND_PORT}" &
BACKEND_PID=$!
trap 'kill "${BACKEND_PID}" 2>/dev/null || true' EXIT

# ── Frontend: point at the backend, run ─────────────────────────────────────
cd "$ROOT/frontend"
export NEXT_PUBLIC_API_BASE="http://localhost:${BACKEND_PORT}"
echo "› Installing frontend deps (npm install)…"
npm install
echo "› Starting frontend on :${FRONTEND_PORT} → API ${NEXT_PUBLIC_API_BASE}"
npm run dev -- --port "${FRONTEND_PORT}"
