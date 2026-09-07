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

## BYOK provider keys — key-at-rest caveat (v1)

The v1 BYOK layer stores each provider API key **encrypted at rest** (Fernet / `cryptography`)
in the `provider_credentials` table. The write-only API never returns the plaintext (GET
returns only `sk-…last4`), the key is redacted from logs (defensive filter + never passed to
the logger), and it never enters the audit log (audit stores a `provider|action` hash only).
Outbound provider calls (`api.anthropic.com`) go through the single `core/egress.py` guard —
no new unguarded egress path. Real runs are doubly gated: `NOETARCH_EXTERNAL_SOURCES_ENABLED=true`
**and** an enabled key; with no key the app runs normally and only real runs are blocked.

**Blocking precondition — master-key custody.** The Fernet master key comes from
`NOETARCH_SECRET_KEY`; if unset, a key file is generated at `NOETARCH_SECRET_KEY_PATH`
(default `/data/secret.key`, mode 0600) and reused.

1. **Key-in-volume is acceptable only for local/single-user.** Before any hosted/multi-user
   deployment, source `NOETARCH_SECRET_KEY` from a secrets manager (KMS/Vault) — do **not**
   bake the key file into an image or a shared volume.
2. **Losing the master key = losing every stored provider key** (ciphertext becomes
   unreadable). Rotating the master key requires re-entering provider keys. Back up / escrow
   the master key out of band.
3. **Provider egress is real network I/O.** Enabling a key + external sources makes outbound
   calls to the provider with the user's key and (for screening) untrusted abstract text —
   which is delimited as data and never executed. Rate limiting on `/runs` remains a hosted
   precondition (see gate 5 above).

## Explicitly out of scope for M12
The AI workflow engine and auth were finalized/extended in later work. The v1 run executor
(provider layer + linear executor) is additive and flag-gated; multi-provider support beyond
the documented Anthropic adapter remains future work.
