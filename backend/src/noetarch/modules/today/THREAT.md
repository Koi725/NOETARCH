# Today Module — Security Threat Note

**Scope:** Read-only GET surface (single workspace snapshot). In-process seed data. No external I/O.
**Review date:** 2026-09-06

## Controls in place

| Threat | Control |
|---|---|
| Injection via params | No path or query parameters on this route — no injection surface |
| Information disclosure | Response is the typed `TodayData` schema only; no stack traces, no seed internals, no internal field names |
| CORS cross-origin abuse | Deny-by-default at app level; allowlist via `NOETARCH_CORS_ALLOW_ORIGINS` only |
| Request amplification | Static Python literal; no DB, no external calls; O(1) return |
| External data ingestion | None — all data is in-process seed; no OpenAlex/Crossref/network calls |
| Request body attacks | App-level `content-length` middleware rejects bodies > 1 MiB |

## Deferred threats (not in scope for this slice)

| Threat | Deferral reason |
|---|---|
| Authentication / authorization | No auth in M6; required before exposing to untrusted users |
| External egress (live source status) | Blocked until a separate egress-reviewed milestone |
| Rate limiting | Add before production exposure |
| Write / mutation endpoints | Not present; interactive actions remain local/simulated per M6 scope |
