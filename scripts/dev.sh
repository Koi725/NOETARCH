#!/usr/bin/env bash
# One-command local dev: brings up the backend (auto-migrate + seed) and the frontend,
# pre-wired so the app connects with zero manual env editing.
#
#   scripts/dev.sh                       # real/empty app on http://localhost:3000, external ON
#   NOETARCH_SEED_DEMO=true scripts/dev.sh                  # load the demo dataset instead
#   NOETARCH_EXTERNAL_SOURCES_ENABLED=false scripts/dev.sh  # run fully offline (no OpenAlex)
#
# Requires: uv (https://docs.astral.sh/uv/) and Node/npm. The app runs with no key — real
# runs stay gated until you connect a provider key in the UI (Models & Policy). Egress is on
# by default but constrained to the allowlist.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
EXTERNAL="${NOETARCH_EXTERNAL_SOURCES_ENABLED:-true}"
SEED_DEMO="${NOETARCH_SEED_DEMO:-false}"

# ── Backend: env pre-wired, migrate, seed, serve ────────────────────────────
cd "$ROOT/backend"
export NOETARCH_CORS_ALLOW_ORIGINS="http://localhost:${FRONTEND_PORT}"
export NOETARCH_EXTERNAL_SOURCES_ENABLED="$EXTERNAL"
export NOETARCH_SEED_DEMO="$SEED_DEMO"
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
