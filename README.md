# NOETARCH

NOETARCH—"Chief of the realm of thought"—is an open-source, security-first project for governed multi-agent work.

## Getting Started (run the app)

**No API key? Use local models.** With external sources **off** (the default), NOETARCH runs
entirely on local seed data — no API keys, no network. Enable OpenAlex fetching only when you
want it.

### One command

```bash
# Local (requires uv + Node): backend auto-migrates + seeds, frontend connects automatically.
make dev            # → http://localhost:3000   (or: ./scripts/dev.sh)

# Or containerized:
make up             # docker compose up --build → http://localhost:3000

# Enable external sources (OpenAlex /search):
NOETARCH_EXTERNAL_SOURCES_ENABLED=true make dev
```

The one-command paths pre-wire everything: backend CORS is set to the frontend origin and the
frontend's `NEXT_PUBLIC_API_BASE` is set to the backend — zero manual env editing.

### Manual fallback

```bash
# Backend
cd backend
cp .env.example .env                     # set NOETARCH_CORS_ALLOW_ORIGINS=http://localhost:3000
uv sync --extra dev
uv run alembic upgrade head              # create-only migrations
uv run python -m noetarch.database.seed_cli
uv run uvicorn noetarch.main:app --port 8000

# Frontend (new terminal)
cd frontend
cp .env.example .env.local               # NEXT_PUBLIC_API_BASE=http://localhost:8000
npm install
npm run dev                              # → http://localhost:3000
```

Config reference: `backend/.env.example` and `frontend/.env.example`. Health check:
`GET http://localhost:8000/api/v1/health/ready`. Offline connector smoke: `make smoke`.
All gates: `make gates`. Pre-deployment security gates: `docs/security/PRE_DEPLOY_GATES.md`.

### Build & run (one command, containerized)

`scripts/build.sh` builds and starts the whole stack via docker compose, then **health-gates**
(polls the backend `/api/v1/health/ready` and the frontend) and only prints the ready banner
once both actually respond. Ports bind to `127.0.0.1` only.

```bash
./scripts/build.sh                 # DEMO seed (populated), external sources OFF
./scripts/build.sh --no-seed --fresh   # clean "real mode": empty DB, volume reset
# (or: make build ARGS="--no-seed --fresh")
```

- `--fresh` runs `docker compose down -v` first to reset the DB volume (clean slate).
- `--no-seed` exports `NOETARCH_SEED_DEMO=false` for the run → migrations only, no seed rows.
- External sources stay off unless you pass `NOETARCH_EXTERNAL_SOURCES_ENABLED=true`.

Stop the stack with `docker compose down` (add `-v` to also drop the DB volume). Follow logs
with `docker compose logs -f`.

### Where real data will come from

The demo seed populates every screen so the app is explorable offline. Populated **research**
data (evidence, runs, decisions, history) will be produced by the **workflow engine** — the
provider layer plus the run executor — which is a future phase. Until then, `--no-seed`
(`NOETARCH_SEED_DEMO=false`) yields an intentionally empty app: the screens show onboarding
empty-states ("No runs yet — start one"), not errors. The seed code is never removed; the flag
only decides whether the demo rows are loaded.

## Current phase

This repository currently contains governance, agent roles, RBAC, coordination protocols, a source-backed threat model, and a quarantined Ruflo integration assessment. Frontend and backend product development is intentionally out of scope.

## Start here

1. Read `AGENTS.md`.
2. Check `coordination/STATUS.md` and `coordination/TASKS.md`.
3. Confirm the action is allowed by `agents/rbac/permissions.yaml` and any gate in `agents/rbac/approval-gates.yaml`.
4. Record material decisions and evidence using the templates under `agents/templates/`.

## Ruflo status

Ruflo is not installed in this repository. The evaluated release is pinned in `orchestration/ruflo/VERSION.md`; activation is blocked pending dependency remediation and maintainer approval. Do not run an unpinned initializer here.

## Contribution and security

See `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`. The project license is intentionally not assumed; the maintainer must select and add one before the first public release.

