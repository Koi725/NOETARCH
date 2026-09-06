# History Module — Security Threat Note

**Scope:** Read-only GET list surface. In-process seed data. No external I/O.
**Review date:** 2026-09-06

## Controls in place

| Threat | Control |
|---|---|
| Injection via params | No path or query parameters on this route — no injection surface |
| Non-URL-safe identifiers | Run IDs are display strings containing a middot ("0f3a·91"); no detail-by-id route is exposed, so no non-ASCII path input is ever accepted |
| Information disclosure | Response is the typed `HistoryRun` list only; no stack traces, no seed internals |
| CORS cross-origin abuse | Deny-by-default at app level; allowlist via `NOETARCH_CORS_ALLOW_ORIGINS` only |
| Request amplification | Static Python literals; O(1) return; no DB, no external calls |
| External data ingestion | None — all data is in-process seed; no network calls |
| Request body attacks | App-level `content-length` middleware rejects bodies > 1 MiB |
| Replay mutation abuse | No replay endpoint exists; replay stays local/simulated in the UI |

## Deferred threats (not in scope for this slice)

| Threat | Deferral reason |
|---|---|
| Authentication / authorization | No auth in M6 |
| Per-run detail-by-id | Deferred: run IDs are not URL-safe slugs; a stable slug scheme is needed first |
| Replay endpoint | Deferred to a future write-milestone (a real replay starts a new run with cost/egress) |
| Pagination / `limit` query param | Deferred; current list returns a small fixed set |
| Rate limiting | Add before production exposure |
