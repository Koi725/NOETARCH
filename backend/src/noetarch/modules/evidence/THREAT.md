# Evidence Module — Security Threat Note

**Scope:** Read-only GET surface (list + detail). In-process seed data. No external I/O.
**Review date:** 2026-09-06

## Controls in place

| Threat | Control |
|---|---|
| Path traversal via `record_id` | Regex `^[a-z][a-z0-9_-]{0,62}$` rejects `.`, `/`, `%`, uppercase, null bytes, over-length values |
| Information disclosure | 404 returns a generic message (`"Evidence record '<id>' not found."`); no stack traces, no seed implementation details, no internal field names in any response body |
| CORS cross-origin abuse | Deny-by-default at app level; allowlist via `NOETARCH_CORS_ALLOW_ORIGINS` env var only |
| Request amplification | Seed is static Python literals; no DB queries, no external calls, O(n) scan over 10 records |
| Log injection | `record_id` is regex-validated before use; not interpolated into log messages |
| External data ingestion | None — all data is in-process seed; no network calls to OpenAlex, Crossref, or any external source |
| Request body attacks | App-level `content-length` middleware rejects bodies > 1 MiB (see `main.py`) |
| Oversized `record_id` | `max_length=63` enforced by FastAPI path validation before handler is reached |
| Malformed `record_id` (SQL, shell meta-chars) | Pattern rejects all non-`[a-z0-9_-]` characters; additionally the repository uses equality comparison, not string interpolation |

## Deferred threats (not in scope for this slice)

| Threat | Deferral reason |
|---|---|
| Authentication / authorization | No auth in M5; required before exposing to untrusted users |
| External egress (OpenAlex, Crossref) | Blocked until a separate egress-reviewed milestone with threat model and CEO approval |
| Rate limiting | Not present; add before production exposure |
| Write endpoints (POST/PUT/DELETE) | Not present in this slice |
| Response schema validation on frontend | Frontend does a type cast; Zod or equivalent validation deferred to a future hardening milestone |
| TLS termination | Handled at infrastructure / reverse-proxy layer, not by the application |
