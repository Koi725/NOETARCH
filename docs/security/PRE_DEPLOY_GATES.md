# Pre-Deployment Security Gates

**Status as of M12.** This records the security controls confirmed in place and the gates
that remain **blocking preconditions** before any hosted / multi-user / public exposure.
NOETARCH today is a local-first, single-user app; the deferred gates below are safe to defer
only in that context.

## Confirmed in place (re-verified at M12, no regressions)

| Control | State |
|---|---|
| Parameterized queries only | ✅ All reads/writes use SQLAlchemy constructs; no raw/f-string SQL anywhere. |
| CORS deny-by-default | ✅ Empty allowlist by default; only `NOETARCH_CORS_ALLOW_ORIGINS` origins permitted. |
| Egress guard (SSRF) intact | ✅ All external I/O flows through `core/egress.py`: hardcoded host allowlist, HTTPS-only, private/loopback/link-local IP refusal, no cross-host redirects, timeouts, response-size cap, 429 backoff. No other module imports `httpx`. |
| External sources default OFF | ✅ `NOETARCH_EXTERNAL_SOURCES_ENABLED=false` by default; `/search` makes zero network calls when off (asserted). |
| No secrets / keys | ✅ Providers are keyless; no secret is referenced in client or server code; readiness never leaks the DSN. |
| Migrations create-only / additive | ✅ `0001` create-only; `0002`/`0003` additive with safe defaults; no destructive upgrade ops. |
| Append-only audit for writes | ✅ Decisions write path records an audit entry atomically (one transaction). |
| Frontend: no injection sinks | ✅ No `dangerouslySetInnerHTML`/`eval`; untrusted provider text rendered via React escaping only; no unguarded `target="_blank"`; guarded localStorage; no `console.*`. (See `docs/frontend/SECURITY_REVIEW.md`.) |
| Request body size limit | ✅ App-level 1 MiB cap. |

**Gate commands:** `make gates` (frontend lint/type-check/test/build + backend
ruff/mypy --strict/pytest). Offline end-to-end: `make smoke`.

## Blocking preconditions before hosted / multi-user / public deployment

These are **required**, not optional, before binding beyond loopback or serving untrusted users:

1. **Authentication + authorization.** There is no auth. The Decisions write path uses a
   placeholder `actor = "local-user"`. Real principals and access control are required.
2. **CSRF protection.** The moment cookie-based auth is introduced, state-changing POSTs
   (Decisions actions, future writes) become CSRF-exploitable. Enforce CSRF tokens, or use
   header/token auth. This is a hard gate. (See `modules/decisions/THREAT.md`.)
3. **Egress IP-pinning (SSRF TOCTOU).** The egress guard resolves + validates the host, but a
   TOCTOU gap remains between our DNS check and the client's own connect-time resolution.
   Pin the validated IP for the connection before exposing `/search` to untrusted input at
   scale. (See `modules/evidence/THREAT.md`.)
4. **No bind beyond loopback without a threat review.** Per the security invariants.
5. **Rate limiting** on write and `/search` endpoints.
6. **TLS termination** at the infrastructure/reverse-proxy layer.

## Explicitly out of scope for M12
The AI workflow engine, additional external providers, and auth were **not** built in M12
(finalization only) and remain future, separately-authorized milestones.
