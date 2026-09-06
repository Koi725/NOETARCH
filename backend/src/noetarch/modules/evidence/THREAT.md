# Evidence Module — Security Threat Note

**Scope:** Read GET surface (list + detail) plus the **first external-source fetch** (M9):
`POST /api/v1/evidence/search`. Data is DB-backed (M7). External egress is **feature-flagged
OFF by default**.
**Review date:** 2026-09-06 (M9)

## ⚠️ SSRF is the core threat — mitigation model

The application **never fetches a URL supplied by a user, by request input, or by retrieved
content.** The only external input is a **query string**, which is sent to OpenAlex as a
url-encoded query *parameter* — never concatenated into a host, path, or URL.

Every external call goes through the single guarded client `core/egress.py`. **No other
module imports `httpx`/`requests`.** Its layered controls:

| SSRF / egress threat | Control (in `core/egress.py`) |
|---|---|
| Fetching arbitrary/internal hosts | **Hardcoded host allowlist** (`api.openalex.org`, `api.crossref.org`); non-allowlisted host → `DisallowedHostError` |
| `http://` / scheme downgrade | **HTTPS only** — scheme is fixed, never taken from input |
| Allowlisted name → internal IP (DNS) | Host is resolved and **refused if any address is private/loopback/link-local/reserved/multicast/unspecified** → `PrivateAddressError` |
| Redirect to an internal/other host | **Redirects not auto-followed**; a redirect off the origin allowlisted host or off https → `CrossHostRedirectError` |
| Slowloris / hanging peer | **Hard connect/read/write/pool timeouts** |
| Response-bomb / memory exhaustion | **Response-size cap** enforced while streaming (Content-Length pre-check + byte cap) → `ResponseTooLargeError` |
| Connection exhaustion | **Connection-pool cap** |
| Abuse / rate limits | **Backoff on 429** (bounded retries) |
| Identity / politeness | **Polite User-Agent** with optional contact email (OpenAlex polite pool) |

**Residual (accepted for this milestone, documented honestly):** a TOCTOU gap exists
between our DNS pre-check and httpx's own resolution at connect time (DNS-rebinding could
differ). Pinning the validated IP for the connection is a **future hardening**; the
allowlist + https-only + no-redirect + timeouts + size-cap are the layered defense now.

## Untrusted-content handling

All retrieved text (titles, authors, journal, DOI) is treated as **untrusted data**:
validated against strict Pydantic models with `extra="ignore"` (**unexpected fields are
dropped**), length-truncated, and stored via **parameterized ORM writes only**. It is never
executed, evaluated, templated into SQL, or fed back as instructions.

## Fetch-and-freeze (provenance / reproducibility)

Fetched records are frozen to the DB with `source` and `retrieved_at`, **deduplicated by
DOI**, and a **fetch audit entry is written in the same transaction** (atomic — a freeze can
never exist without its audit record). This is the reproducibility guarantee.

## Feature flag

`NOETARCH_EXTERNAL_SOURCES_ENABLED` defaults **OFF**. When OFF, `/search` returns a clear
"external sources disabled" state and makes **zero network calls**; the app runs fully on
local DB/seed data. There are **no API keys or secrets** — OpenAlex/Crossref are keyless; no
credential surface exists.

## Read-path controls (unchanged from M5/M7)

| Threat | Control |
|---|---|
| Path traversal via `record_id` | Regex `^[a-z][a-z0-9_-]{0,62}$`; equality comparison, no interpolation |
| Information disclosure | Generic structured 404/502; no stack traces or internals |
| CORS cross-origin abuse | Deny-by-default; allowlist via `NOETARCH_CORS_ALLOW_ORIGINS` |
| Request body attacks | App-level 1 MiB body cap; `query` bounded to 1–500 chars |
| SQL injection | All reads/writes use SQLAlchemy constructs (parameterized) |

## Deferred threats

| Threat | Deferral reason |
|---|---|
| Authentication / authorization | Still no auth; required before hosted/multi-user exposure |
| IP-pinned connections (TOCTOU close) | Future egress hardening |
| Crossref adapter | Host is allowlisted but no adapter is wired yet |
| Rate limiting of `/search` itself | Add before production exposure |
| Binding beyond loopback | Requires an approved threat review |
