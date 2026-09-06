# Recipes Module — Security Threat Note

**Scope:** Read-only GET surface (list + detail). In-process seed data. No external I/O.
**Review date:** 2026-09-06

## Controls in place

| Threat | Control |
|---|---|
| Path traversal via `recipe_id` | Regex `^[a-z0-9][a-z0-9_-]{0,62}$` rejects `.`, `/`, `%`, uppercase, null bytes, over-length |
| Information disclosure | 404 returns a generic message; no stack traces, no seed internals, no internal field names |
| CORS cross-origin abuse | Deny-by-default at app level; allowlist via `NOETARCH_CORS_ALLOW_ORIGINS` only |
| Request amplification | Static Python literals; O(n) scan over 4 records; no DB, no external calls |
| External data ingestion | None — all data is in-process seed; no network calls |
| Request body attacks | App-level `content-length` middleware rejects bodies > 1 MiB |
| Recipe mutation abuse | No duplicate/customize/run endpoints exist; those actions stay local/simulated in the UI |

## Deferred threats (not in scope for this slice)

| Threat | Deferral reason |
|---|---|
| Authentication / authorization | No auth in M6 |
| Custom recipe persistence (duplicate/customize) | Deferred to a future write-milestone with its own review |
| Recipe execution endpoint | Deferred; running a recipe carries real egress/cost consequences and needs its own review |
| Rate limiting | Add before production exposure |
