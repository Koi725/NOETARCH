#!/usr/bin/env bash
# One-command containerized build: bring the whole NOETARCH stack up via docker compose
# and health-gate until the backend and frontend are actually ready before returning.
#
#   scripts/build.sh                       # DEMO seed, external sources OFF (defaults)
#   scripts/build.sh --no-seed             # real/empty DB (NOETARCH_SEED_DEMO=false)
#   scripts/build.sh --fresh               # reset the DB volume first, then rebuild
#   scripts/build.sh --no-seed --fresh     # clean slate + real/empty mode
#
# Flags may also come from the environment:
#   NOETARCH_SEED_DEMO=false                # same as --no-seed
#   NOETARCH_EXTERNAL_SOURCES_ENABLED=true  # enable OpenAlex /search (default false)
#   NOETARCH_BUILD_TIMEOUT=60               # per-service health-gate timeout, seconds
#
# Security: ports are bound to loopback only (see docker-compose.yml); nothing binds to
# 0.0.0.0 on the host. No secrets are baked in or echoed — any provider key must come from
# the environment, never this script.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BACKEND_URL="http://127.0.0.1:8000"
FRONTEND_URL="http://127.0.0.1:3000"
HEALTH_URL="${BACKEND_URL}/api/v1/health/ready"
TIMEOUT="${NOETARCH_BUILD_TIMEOUT:-60}"

FRESH=0
NO_SEED=0

usage() {
  sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

for arg in "$@"; do
  case "$arg" in
    --fresh) FRESH=1 ;;
    --no-seed) NO_SEED=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "error: unknown argument '$arg' (try --help)" >&2; exit 2 ;;
  esac
done

# ── Preflight: docker + compose + curl ──────────────────────────────────────
command -v docker >/dev/null 2>&1 || {
  echo "error: 'docker' not found. Install Docker Desktop / Engine and retry." >&2; exit 1; }
docker compose version >/dev/null 2>&1 || {
  echo "error: the 'docker compose' plugin is not available. Install Compose v2 and retry." >&2; exit 1; }
command -v curl >/dev/null 2>&1 || {
  echo "error: 'curl' not found; it is required for the health-gate." >&2; exit 1; }

# ── Mode: seed + external sources (env-overridable, safe defaults) ───────────
if [ "$NO_SEED" -eq 1 ]; then
  export NOETARCH_SEED_DEMO=false
else
  export NOETARCH_SEED_DEMO="${NOETARCH_SEED_DEMO:-true}"
fi
export NOETARCH_EXTERNAL_SOURCES_ENABLED="${NOETARCH_EXTERNAL_SOURCES_ENABLED:-false}"

if [ "${NOETARCH_SEED_DEMO}" = "false" ]; then
  SEED_MODE="REAL (empty DB — no seed rows)"
else
  SEED_MODE="DEMO (seed rows loaded)"
fi

# ── Fresh: tear down and drop the DB volume for a clean slate ────────────────
if [ "$FRESH" -eq 1 ]; then
  echo "› --fresh: stopping stack and removing the DB volume…"
  docker compose down -v || true
fi

# ── Build + start (detached, so we can health-gate and return) ──────────────
echo "› Building images and starting containers (seed: ${SEED_MODE})…"
docker compose up --build -d

# ── Health-gate: don't declare ready until the services actually are ────────
wait_for_ready() {
  # $1 url, $2 label — succeeds on HTTP 200 within $TIMEOUT seconds.
  local url="$1" label="$2" code deadline
  deadline=$(( $(date +%s) + TIMEOUT ))
  while true; do
    code="$(curl -fsS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)"
    [ "$code" = "200" ] && { echo "  ✓ ${label} ready"; return 0; }
    if [ "$(date +%s)" -ge "$deadline" ]; then
      echo "error: ${label} did not become healthy within ${TIMEOUT}s (last HTTP: ${code:-none})." >&2
      echo "       Inspect logs with: docker compose logs -f" >&2
      return 1
    fi
    sleep 2
  done
}

wait_for_response() {
  # $1 url, $2 label — succeeds as soon as the URL returns any HTTP response.
  local url="$1" label="$2" deadline
  deadline=$(( $(date +%s) + TIMEOUT ))
  while true; do
    if curl -sS -o /dev/null "$url" >/dev/null 2>&1; then
      echo "  ✓ ${label} responding"; return 0
    fi
    if [ "$(date +%s)" -ge "$deadline" ]; then
      echo "error: ${label} did not respond within ${TIMEOUT}s." >&2
      echo "       Inspect logs with: docker compose logs -f" >&2
      return 1
    fi
    sleep 2
  done
}

echo "› Waiting for backend health at ${HEALTH_URL}…"
wait_for_ready "$HEALTH_URL" "backend"
echo "› Waiting for frontend at ${FRONTEND_URL}…"
wait_for_response "$FRONTEND_URL" "frontend"

# ── Final banner ────────────────────────────────────────────────────────────
DOCS_LINE="  Backend docs: ${BACKEND_URL}/docs"
cat <<BANNER

────────────────────────────────────────────────────────────
 NOETARCH is up and healthy.

  Frontend:     ${FRONTEND_URL}
  Backend API:  ${BACKEND_URL}
${DOCS_LINE}

  Data mode:        ${SEED_MODE}
  External sources: ${NOETARCH_EXTERNAL_SOURCES_ENABLED}

  Follow logs:  docker compose logs -f
  Stop:         docker compose down        (add -v to also drop the DB volume)
────────────────────────────────────────────────────────────
BANNER
