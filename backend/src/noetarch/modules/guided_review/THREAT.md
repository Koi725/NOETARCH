# GuidedReview Module — Security Threat Note

**Scope:** Read-only GET surface (current review state). In-process seed data. No external I/O.
**Review date:** 2026-09-06

## Controls in place

| Threat | Control |
|---|---|
| Injection via params | No path or query parameters on this route — no injection surface |
| Information disclosure | Response is the typed `GuidedReviewData` schema only; no stack traces, no seed internals |
| CORS cross-origin abuse | Deny-by-default at app level; allowlist via `NOETARCH_CORS_ALLOW_ORIGINS` only |
| Request amplification | Static Python literals; no DB, no external calls; O(1) return |
| External data ingestion | None — all data is in-process seed; no network calls |
| Request body attacks | App-level `content-length` middleware rejects bodies > 1 MiB |
| Decision mutation abuse | No include/exclude/decide endpoints exist; those actions stay local/simulated in the UI |

## Deferred threats (not in scope for this slice)

| Threat | Deferral reason |
|---|---|
| Authentication / authorization | No auth in M6 |
| Decision-recording (POST /decide) endpoint | Deferred to a future write-milestone with its own review |
| Rate limiting | Add before production exposure |
| Pagination of the review queue | Deferred; current snapshot returns a single paper + a short lookahead |
