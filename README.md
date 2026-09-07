# NOETARCH

NOETARCH—"Chief of the realm of thought"—is an open-source, security-first project for governed multi-agent work.

## Getting Started (run the app)

NOETARCH ships **real by default**: a plain build brings up a clean, empty research app
(no demo rows) with external sources (OpenAlex) **on**. The whole flow is UI-driven — no
terminal, no `curl`, no CLI in your path.

### Quickstart — clone → build → open → connect key → run

```bash
git clone <this-repo> && cd NOETARCH
./scripts/build.sh          # real/empty DB, external sources ON, health-gated
# open http://localhost:3000
```

1. **Open** http://localhost:3000. On first load the app checks for a provider key.
2. **Connect your API key.** With no key yet, you land on a clean *Connect your API key*
   screen. Paste your Anthropic key and continue — it is encrypted in a local vault and
   never written to logs, `.env`, or the browser. (A key already present? You skip straight
   in.) You can rotate, disable, set a budget, or remove it any time under **Models & Policy**.
3. **Start a run.** Go to **Live run**, enter a research question, optional year range, max
   papers, and an optional budget, then **Start run**. NOETARCH searches OpenAlex, freezes the
   evidence, and screens each abstract with your model.
4. **See results.** The run summary shows frozen / screened / include-exclude-uncertain /
   tokens / cost, and deep-links straight into **Evidence** and **Decisions** filtered to that
   run. Past runs live under **History**.

Prefer the demo dataset or a local (non-container) dev loop?

```bash
./scripts/build.sh --seed   # load the demo dataset instead of an empty workspace
make dev                    # local dev (requires uv + Node) → http://localhost:3000
```

All one-command paths pre-wire everything: backend CORS is set to the frontend origin and the
frontend's `NEXT_PUBLIC_API_BASE` is set to the backend — zero manual env editing.

### Security posture (unchanged)

- **Keys** live only in the encrypted vault (BYOK). They are never placed in `.env`, logs,
  fixtures, or any response — the API returns a masked `sk-…last4` only.
- **Egress is on by default but constrained**: all outbound traffic (OpenAlex + Anthropic)
  flows through a single guarded client with a host allowlist and SSRF defenses. Nothing binds
  beyond `127.0.0.1`. Turn egress off entirely with `NOETARCH_EXTERNAL_SOURCES_ENABLED=false`.
- **Injection defense**: model output is stored only as provenance-tagged *pending claims* and
  never auto-executed; the **budget guard** halts a run cleanly at its cap and is surfaced in
  the run summary.

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
./scripts/build.sh                 # REAL/empty DB, external sources ON (defaults)
./scripts/build.sh --seed          # load the DEMO dataset (populated screens)
./scripts/build.sh --fresh         # reset the DB volume first, then rebuild
# (or: make build ARGS="--seed --fresh")
```

- `--fresh` runs `docker compose down -v` first to reset the DB volume (clean slate).
- `--seed` exports `NOETARCH_SEED_DEMO=true` for the run → loads the demo dataset.
- External sources are **on** by default; turn them off with
  `NOETARCH_EXTERNAL_SOURCES_ENABLED=false ./scripts/build.sh`.

Stop the stack with `docker compose down` (add `-v` to also drop the DB volume). Follow logs
with `docker compose logs -f`.

### Where real data comes from

Real research data (evidence, runs, decisions, history) is produced by starting a run from the
**Live run** screen: the run executor searches OpenAlex, freezes evidence, and screens each
abstract with your connected model. A fresh build starts intentionally empty — the screens show
onboarding empty-states ("No runs yet — start one"), not errors — and fill in as you run.

The demo dataset is still available for a fully-populated offline tour via `--seed`
(`NOETARCH_SEED_DEMO=true`). The seed code is never removed; the flag only decides whether the
demo rows are loaded.

## Current phase

Alongside the governance foundation — agent roles, RBAC, coordination protocols, a
source-backed threat model, and a quarantined Ruflo integration assessment — the repository now
ships a runnable, security-first research flow: BYOK onboarding, a UI run launcher, and
evidence/decisions/history populated by real runs. `AGENTS.md` remains the canonical governance
source; scope changes still require a maintainer decision record.

## Start here

1. Read `AGENTS.md`.
2. Check `coordination/STATUS.md` and `coordination/TASKS.md`.
3. Confirm the action is allowed by `agents/rbac/permissions.yaml` and any gate in `agents/rbac/approval-gates.yaml`.
4. Record material decisions and evidence using the templates under `agents/templates/`.

## Ruflo status

Ruflo is not installed in this repository. The evaluated release is pinned in `orchestration/ruflo/VERSION.md`; activation is blocked pending dependency remediation and maintainer approval. Do not run an unpinned initializer here.

## Contribution and security

See `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`. The project license is intentionally not assumed; the maintainer must select and add one before the first public release.

