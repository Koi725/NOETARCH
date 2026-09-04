# NOETARCH

NOETARCH—"Chief of the realm of thought"—is an open-source, security-first project for governed multi-agent work.

## Current phase

This repository currently contains governance, agent roles, RBAC, coordination protocols, a source-backed threat model, and a quarantined Ruflo integration assessment. Frontend and backend product development is intentionally out of scope.

## Start here

1. Read `AGENTS.md`.
2. Check `coordination/STATUS.md` and `coordination/TASKS.md`.
3. Confirm the action is allowed by `agents/rbac/permissions.yaml` and any gate in `agents/rbac/approval-gates.yaml`.
4. Record material decisions and evidence using the templates under `agents/templates/`.

## Ruflo status

Ruflo is not installed in this repository. The evaluated release is pinned in `orchestration/ruflo/VERSION.md`; activation is blocked pending dependency remediation and CEO approval. Do not run an unpinned initializer here.

## Contribution and security

See `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`. The project license is intentionally not assumed; the CEO must select and add one before the first public release.

