# Decisions Module — Security Threat Note

**Scope:** Read GET surface (list + detail) **plus the first persisted write** (M8):
`POST /api/v1/decisions/{id}/action` and `GET /api/v1/decisions/{id}/audit`.
Data is DB-backed (M7). No external I/O.
**Review date:** 2026-09-06 (M8)

## ⚠️ Write path is LOCAL-ONLY and PRE-AUTH — blocking preconditions before any hosted use

The `POST .../action` endpoint mutates persisted state **with no authentication and no
authorization** (`actor` is the fixed placeholder `"local-user"`). This is acceptable ONLY
for a single-user, loopback, local-desktop context. The following are **blocking
preconditions** before this surface may be exposed on any public or multi-user interface:

1. **Authentication + authorization** must be added; `actor` must become the authenticated
   principal, not a placeholder.
2. **CSRF protection is required the moment cookie-based auth is introduced.** A state-changing
   POST driven by an ambient cookie is CSRF-exploitable. Until then, auth (if added) must be
   header/token-based, or CSRF tokens must be enforced. This is called out as a hard gate.
3. **No binding beyond loopback** without an approved threat review (per the security invariants).
4. CORS must remain deny-by-default; the allowlist (`NOETARCH_CORS_ALLOW_ORIGINS`) must contain
   only trusted first-party origins.

## Controls in place

| Threat | Control |
|---|---|
| Path traversal via `decision_id` | Regex `^[a-z0-9][a-z0-9_-]{0,62}$` rejects `.`, `/`, `%`, uppercase, null bytes, over-length → 422 |
| Invalid action / version | Pydantic body (`action` enum + `expected_version: int >= 0`) → 422 on bad input |
| Oversized request body | App-level `content-length` middleware rejects bodies > 1 MiB → 413 |
| Double-approve (two tabs / double-click) | Optimistic concurrency: `expected_version` must equal current version, else 409 |
| Re-resolving a resolved decision | Only `pending` decisions may be actioned; otherwise 409 (documented: conflict, not a silent no-op) |
| Missing provenance for a state change | State change + audit insert commit in **one transaction**; if either fails, both roll back |
| Audit tampering | `audit_log` is append-only — the repository exposes insert + read only; no update/delete code path exists |
| SQL injection | All reads and writes use SQLAlchemy constructs (parameterized); no raw/f-string SQL |
| Information disclosure | 404/409 return generic structured messages; no stack traces, no internal implementation detail |
| CORS cross-origin abuse | Deny-by-default at app level; allowlist via `NOETARCH_CORS_ALLOW_ORIGINS` only |
| External data ingestion / egress | None — DB-backed local seed; no outbound network calls |
| Secret exposure | No secrets in code or responses; `payload_hash` is a non-reversible SHA-256 fingerprint, not a secret |

## Deferred threats (not in scope for this milestone)

| Threat | Deferral reason |
|---|---|
| Authentication / authorization | Deferred; `actor` is a placeholder. Blocking precondition for hosted/multi-user use (see above). |
| CSRF protection | Becomes **required** with cookie-based auth; a blocking precondition for hosted deployment. |
| Rate limiting / abuse throttling | Add before production exposure. |
| Real downstream effects of "approve" (e.g. cloud egress) | Approving records intent + provenance only; it does not yet trigger the underlying action. That remains a later, separately-reviewed milestone. |
| Other surfaces' writes | Out of scope; M8 is Decisions-only. |
