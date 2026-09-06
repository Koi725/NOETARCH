# NOETARCH Status

**Updated:** 2026-09-06
**Phase:** Governance, communication verification, frontend M0-M4, and backend read-integration M5-M7
**Product development:** Frontend M0-M4 complete. Backend read surfaces integrated end-to-end (M5 Evidence, M6 remaining seven read surfaces) and now served from a real database (M7). Real writes/mutations, external data sources, and auth remain blocked pending per-milestone maintainer authorization.

## Current state

- Repository safety gate: PASS — path and origin matched; repository had no files and no commits before bootstrap.
- Governance foundation: CREATED; pending the maintainer review.
- Ruflo repository installation: BLOCKED — isolated dependency audit has unresolved critical/high advisories and the initializer violates NOETARCH instruction/pinning defaults.
- Codex MCP registration: PARTIAL — a pre-existing global `ruflo` entry is enabled but invokes `ruflo@latest`; it was not created or modified and is not approved for NOETARCH.
- Shared-memory cross-agent round trip: BLOCKED — nonce generated but not stored because the approved pinned repository runtime is absent.
- Headless dual-mode worker test: BLOCKED — test fixture and procedure prepared, not executed.
- Background processes: none reported by Ruflo after audit cleanup.
- Frontend authorization history: M0 and M1 were initially authorized. M2 work crossed the intended M1 stop and was identified by the recovery audit. After reviewing that audit, the maintainer authorized M2 completion and remediation prospectively; this was not retroactive authorization.
- Frontend phase: COMPLETE through M4 — all ten App Router routes implemented; M4 adds a typed integration contract layer: `src/contracts/` (10 canonical domain type files), `src/services/` (10 service interfaces + synchronous mock implementations), all 15 components refactored to the service seam (zero direct `src/data/` imports in components or pages).
- Frontend validation: lint 0 errors, strict type-check 0 errors, 9 files/52 tests, 11-route production build, `git diff --check` pass, no new dependencies. M4 contract documentation in `docs/architecture/API_CONTRACTS.md`. M3 evidence preserved in `docs/frontend/evidence/m3/`.
- M0 source limitation: the requested `design_handoff_report` directory and the fallback README are absent; four surviving canonical sources are recorded with SHA-256 hashes and no missing content was recreated.
- Backend phase (M5-M7): The FastAPI backend now serves all eight read surfaces (evidence, today, live-run, decisions, guided-review, recipes, history, models-policy). M5 delivered the Evidence slice; M6 replicated it across the remaining seven; M7 replaced in-process seed with a real relational store.
- Backend persistence (M7): SQLAlchemy 2.0 ORM models live in each module's `infrastructure/`; repositories map ORM rows to the existing Pydantic response schemas (ORM never leaks into responses). Alembic is configured with a create-only initial migration. The DB URL comes from `NOETARCH_DATABASE_URL`/`DATABASE_URL` (default: gitignored SQLite file; Postgres-compatible). Seed data is loaded via `python -m noetarch.database.seed_cli`. Every read endpoint's response is byte-identical to the prior seed serialization (guarded by parity tests).
- Backend validation (M7): `ruff` clean, `mypy --strict` clean (118 files), `pytest` 177 passed (DB-backed repository/service tests, API/contract tests against a seeded temp DB, a migration-applies test, a downgrade test, and byte-parity tests). Frontend remains green (79 tests, build ok) and unaffected.
- Readiness: `GET /api/v1/health/ready` now verifies database connectivity (constant `SELECT 1`) and returns a generic 503 on failure — the connection string is never surfaced.
- Backend boundary still enforced: no external network, no user-write/mutation endpoints, no auth. Real writes (roadmap M8: Decisions approve, with audit) and external sources (roadmap M9: OpenAlex for Evidence, egress/SSRF-reviewed) remain future milestones pending maintainer authorization. The mock→real swap points per surface are documented in `docs/architecture/API_CONTRACTS.md`.

## Pending approvals

The maintainer must review governance, select a project license and private security contact, decide whether to accept or wait on Ruflo dependency risk, and explicitly authorize any local installation or MCP configuration change.

## Ruflo activation

Ruflo remains disabled for this repository. The machine-local `.mcp.json` launch configuration is ignored, is not a repository artifact, and must not be activated. No Ruflo command was executed during frontend remediation.
