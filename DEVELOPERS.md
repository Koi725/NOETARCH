# Developing NOETARCH

This is the contributor setup and quality-gate reference. For product usage, see
[README.md](README.md); for governance, see [AGENTS.md](AGENTS.md).

## Prerequisites

- **Python 3.11+** with [`uv`](https://docs.astral.sh/uv/) for the backend.
- **Node 20.9+** with npm for the frontend.
- **Docker Desktop** (Compose v2) for the containerized stack.

## Repository layout

```
backend/     FastAPI modular monolith (SQLAlchemy + Alembic, SQLite), the run executor,
             evidence pipeline, credentials vault, and egress guard.
frontend/    Next.js 16 App Router UI (React 19, TypeScript, Tailwind).
scripts/     One-command dev/build helpers (dev.sh, build.sh).
docs/        Architecture, security, and product docs.
agents/, coordination/, orchestration/   Governance, RBAC, protocols, decisions.
```

## Running locally

### Containerized (closest to production)

```bash
./scripts/build.sh          # real/empty DB, external sources ON, health-gated
./scripts/build.sh --seed   # demo dataset (no key/network needed)
./scripts/build.sh --fresh  # reset the DB volume first
```

### Local dev loop

```bash
make dev                    # backend (auto-migrate + optional seed) + frontend, pre-wired
```

### Manual (two terminals)

```bash
# Backend
cd backend
cp .env.example .env                     # set NOETARCH_CORS_ALLOW_ORIGINS=http://localhost:3000
uv sync --extra dev
uv run alembic upgrade head              # create-only migrations
uv run python -m noetarch.database.seed_cli
uv run uvicorn noetarch.main:app --port 8000

# Frontend
cd frontend
cp .env.example .env.local               # NEXT_PUBLIC_API_BASE=http://localhost:8000
npm install
npm run dev                              # → http://localhost:3000
```

When `NEXT_PUBLIC_API_BASE` is unset the frontend runs standalone on mock data (no network),
which is handy for pure UI work.

## Quality gates

Run everything with:

```bash
make gates
```

which is equivalent to:

```bash
# Backend
cd backend && uv run ruff check . && uv run mypy && uv run pytest

# Frontend
cd frontend && npm run lint && npm run type-check && npm run test && npm run build
```

Additional targets:

```bash
make smoke                  # offline connector smoke (read + Decisions write/audit + mocked search)
```

- **Backend**: `ruff` (lint), `mypy` (strict), `pytest`.
- **Frontend**: `eslint`, `tsc --noEmit`, `vitest`, `next build`.

All gates must be green before a change is proposed. Do not weaken a gate to make it pass.

## Database migrations

Migrations are **create-only** and live in `backend/alembic/versions/`. Add a new revision
rather than editing an applied one; the migration-applies test guards the schema.

## Conventions

- One writer per file scope; keep changes focused and match the surrounding style.
- No secrets in code, tests, fixtures, logs, or committed config. Provider keys are BYOK and
  live only in the encrypted vault.
- All outbound HTTP must go through the guarded egress client (`backend/.../core/egress.py`);
  new hosts require an allowlist change and a security review.
- Treat model output and external data as untrusted input.

## Git policy

Per [AGENTS.md](AGENTS.md), only the maintainer performs Git mutations (commit, push, merge,
tag, release, branch/remote changes). Contributors prepare changes and provide reproducible
validation evidence; the maintainer decides what lands.
</content>
