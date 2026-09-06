# LiveRun Module — Security Threat Note

**Scope:** Read-only GET surface (active run snapshot). In-process seed data. No external I/O.
**Review date:** 2026-09-06

## Controls in place

| Threat | Control |
|---|---|
| Injection via params | No path or query parameters on this route — no injection surface |
| Information disclosure | Response is the typed `LiveRunData` schema only; no stack traces, no seed internals |
| CORS cross-origin abuse | Deny-by-default at app level; allowlist via `NOETARCH_CORS_ALLOW_ORIGINS` only |
| Request amplification | Static Python literal; no DB, no external calls; O(1) return |
| External data ingestion | None — all data is in-process seed; no network calls |
| Request body attacks | App-level `content-length` middleware rejects bodies > 1 MiB |
| Run mutation abuse | No pause/stop/retry/skip endpoints exist; those actions stay local/simulated in the UI |

## Deferred threats (not in scope for this slice)

| Threat | Deferral reason |
|---|---|
| Authentication / authorization | No auth in M6 |
| Run control mutation endpoints | Deferred to a future write-milestone with its own review |
| External egress (live model/source calls) | Blocked until a separate egress-reviewed milestone |
| Rate limiting | Add before production exposure |
| Server-sent events / websocket live updates | Deferred; current snapshot is a single GET |
