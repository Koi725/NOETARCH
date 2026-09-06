# ModelsPolicy Module — Security Threat Note

**Scope:** Read-only GET surface (provider list + detail). In-process seed data. No external I/O.
**Review date:** 2026-09-06

## Controls in place

| Threat | Control |
|---|---|
| Path traversal via `provider_id` | Regex `^[a-z0-9][a-z0-9_-]{0,62}$` rejects `.`, `/`, `%`, uppercase, null bytes, over-length |
| Information disclosure | 404 returns a generic message; no stack traces, no seed internals, no internal field names |
| Credential leakage | No API keys or secrets are modeled or served — the schema carries policy metadata only; credentials are read from the shell environment by the app, never stored or returned |
| CORS cross-origin abuse | Deny-by-default at app level; allowlist via `NOETARCH_CORS_ALLOW_ORIGINS` only |
| Request amplification | Static Python literals; O(n) scan over 4 records; no DB, no external calls |
| External data ingestion | None — all data is in-process seed; no network calls to any provider |
| Request body attacks | App-level `content-length` middleware rejects bodies > 1 MiB |
| Policy mutation abuse | No enable/disable/cost/routing/approval write endpoints exist; those actions stay local/simulated in the UI |

## Deferred threats (not in scope for this slice)

| Threat | Deferral reason |
|---|---|
| Authentication / authorization | No auth in M6; changing a provider policy must be authenticated |
| Policy mutation endpoints | Deferred to a future write-milestone with its own review (routing/egress policy changes carry security weight) |
| Credential management | Explicitly out of scope; NOETARCH reads keys from the environment and never persists them |
| Rate limiting | Add before production exposure |
