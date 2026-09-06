# NOETARCH Platform Overview

**Audience:** the maintainer and anyone who wants to understand the whole system in plain language.
**Accurate as of:** M10 (2026-09-06). Written by reading the actual repository, not assumptions.

**What changed since M6:** the backend now serves all read surfaces from a real database
(M7); the Decisions surface has a persisted approve/reject write path with an append-only
audit trail (M8); the Evidence surface can fetch-and-freeze from an external source
(OpenAlex) behind a default-OFF feature flag through a single SSRF-guarded egress client
(M9); and the frontend ships an accessible onboarding tour + "explain this" tooltip kit with
per-panel guided tours (M10). See `docs/frontend/M10_ONBOARDING.md` and the milestone THREAT
notes for details.

---

## 1. What NOETARCH is and the problem it solves

NOETARCH ("Chief of the realm of thought") is a **security-first research assistant for
systematic literature reviews**. A researcher asks a question (e.g. *"How do human-centric
Industry 5.0 practices affect employee well-being?"*), and NOETARCH helps them find papers,
remove duplicates, verify each paper against external catalogues, screen abstracts, and
export a defensible evidence set — while keeping the human in control of every step that
costs money or sends data off the device.

The core problem it solves: **systematic reviews are slow, error-prone, and hard to audit.**
NOETARCH makes the work faster *and* keeps a clear provenance trail, and — critically — it
never sends data to a paid cloud provider without the researcher explicitly approving that
exact step. Privacy and cost control are first-class, not afterthoughts.

The current build is a **working prototype with a real backend for read data.** It shows real
UI, real API endpoints serving seed data, and honest "simulated" labels wherever an action
would have real-world consequences (spending money, calling an external service). Those
consequential actions are deliberately **not wired to real effects yet** — see §6.

---

## 2. Every route/screen and what it does

All screens live under a shared application shell (sidebar navigation + command palette).
The routes are Next.js App Router pages under `frontend/src/app/(shell)/`.

| Route | Screen | What it does | Backend-backed (M6)? |
|---|---|---|---|
| `/` → `/today` | **Today** | Status board: what's running now, what's waiting on a decision, what finished, source health, files made today. | ✅ `GET /api/v1/today` |
| `/live-run` | **Live Run** | Live view of one run: step rail, current-step inspector, KPIs, a system-vs-model event ledger, pending decisions, evidence cards. Pause/stop/retry/skip are **simulated**. | ✅ `GET /api/v1/live-run` |
| `/decisions` | **Decision Center** | Queue of actions awaiting human approval (e.g. "send 38 abstracts to the cloud"), each with cost, reversibility, and alternatives. Approve/reject is **local/simulated**. | ✅ `GET /api/v1/decisions` |
| `/evidence` | **Evidence Library** | Every collected paper with verification status (checked / conflicting / cannot-check), per-source results, and a provenance trail. (Delivered in M5.) | ✅ `GET /api/v1/evidence` |
| `/guided-review` | **Guided Review** | One-paper-at-a-time abstract screening with keyboard shortcuts (include/exclude/uncertain/needs-human-review). Decisions are **local/simulated**. | ✅ `GET /api/v1/guided-review` |
| `/recipes` | **Recipe Library** | Reusable workflow templates (local vs cloud), each with steps, inputs, outputs, cost, and a privacy policy. Duplicate/customize is **local/simulated**. | ✅ `GET /api/v1/recipes` |
| `/history` | **History & Replay** | Recent runs (running/complete/interrupted/failed/partial) with compare-two-runs. Replay is **local/simulated**. | ✅ `GET /api/v1/history` |
| `/models-policy` | **Models & Policy** | Per-provider controls: enable/disable, daily cost limit, task-routing preference, approval requirement, data-egress policy. Edits are **local/simulated**. No credentials are entered here. | ✅ `GET /api/v1/models-policy/providers` |
| `/first-run` | **First Run / Onboarding** | Onboarding wizard config (steps, source options, spending limits, egress choices). | ⬜ Static config (frontend mock) |
| `/states` | **State Gallery** | Internal reference screen showing loading/empty/error UI states. | ⬜ Inline catalog (no service) |

Two supporting surfaces are **static application config**, not user data, so they intentionally
stay on the frontend with no backend endpoint: the **Application Shell / Sidebar / Command
Palette** navigation structure, and the **First Run** onboarding config.

---

## 3. End-to-end data flow

The same seam is used on every backend-backed screen. Using Evidence as the example:

```
[ Screen component ]        EvidenceLibrary.tsx   (useEffect on mount)
        │  calls
        ▼
[ Frontend service ]        fetchEvidenceData()   in EvidenceService.ts
        │  if NEXT_PUBLIC_API_BASE is set → real fetch; else → mock fallback
        ▼
   HTTP GET /api/v1/evidence   (only when NEXT_PUBLIC_API_BASE is set)
        │
        ▼
[ Backend router ]          modules/evidence/router.py   (thin: validates input)
        │  calls
        ▼
[ Backend service ]         modules/evidence/service.py   (orchestration)
        │  calls
        ▼
[ Backend repository ]      modules/evidence/repository.py   (data access)
        │  reads
        ▼
[ In-process seed ]         modules/evidence/seed.py   (static Python literals)
        │
        ▼  Pydantic serializes to JSON (camelCase, matching the TS contract)
   response travels back up the same path to the screen, which renders it.
```

Every backend-backed screen has **three visible states**: a loading state while the fetch is
in flight, an error state if the request fails, and the normal data view. If the backend is
not configured (`NEXT_PUBLIC_API_BASE` unset), the service returns mock data instead, so the
app runs standalone with no backend at all and never crashes.

---

## 4. Frontend / backend architecture and the contract seam

### The contract seam (single source of truth)

`frontend/src/contracts/*` holds canonical TypeScript types for every domain object. Both the
frontend components and the frontend services import these types. The **backend Pydantic
schemas mirror these contracts exactly**, field-for-field, including camelCase names — so the
JSON the backend emits is directly consumable by the typed frontend with no translation layer.

```
frontend/src/contracts/   ← the shared "language" (types)
   ▲                    ▲
   │ imports            │ mirrored by
[ frontend/src/services ]   [ backend .../modules/*/schemas.py ]
   ▲
   │ imports
[ frontend/src/components ]   (screens; never import src/data directly)
```

### Frontend layering

- **`contracts/`** — types only. The single source of truth.
- **`services/`** — one module per surface. Each exports a `mock*Service` (synchronous, reads
  `src/data/*` seed) **and** an async `fetch*` client. The client calls the real API when
  `NEXT_PUBLIC_API_BASE` is set and falls back to the mock otherwise.
- **`components/`** — screens. They call the async `fetch*` client, hold loading/error state,
  and render. **No component imports `src/data/*` directly** (enforced: a repo grep must be
  empty).

### Backend layering (modular monolith, FastAPI)

Each surface is a self-contained module under `backend/src/noetarch/modules/<surface>/`:

- **`schemas.py`** — Pydantic v2 response models mirroring the TS contract. Response-only;
  internal models are never exposed.
- **`seed.py`** — in-process static data, ported exactly from the frontend mock.
- **`repository.py`** — data access (currently reads the seed; the swap point for a real DB).
- **`service.py`** — orchestration between router and repository.
- **`router.py`** — thin HTTP layer: validates input, maps not-found to 404, returns schemas.
- **`THREAT.md`** — a per-module security threat note.

The aggregate router (`api/router.py`) mounts each module under `/api/v1/<surface>`. The app
factory (`main.py`) wires deny-by-default CORS, a request-ID middleware, a 1 MiB request-body
limit, and a structured error handler.

**Why this shape matters:** to connect a real data source later, you change **one file** —
the module's `repository.py` — and nothing else. The router, service, schema, and the entire
frontend stay untouched.

---

## 5. Security posture

NOETARCH is built least-privilege and deny-by-default. Concretely, in the code today:

- **Deny-by-default CORS.** Cross-origin requests are refused unless the origin is in the
  `NOETARCH_CORS_ALLOW_ORIGINS` allowlist (empty by default). Set via environment only.
- **Input validation on every id parameter.** Detail routes validate the `{id}` against a
  strict regex (lowercase alphanumerics, hyphen, underscore, bounded length) — rejecting
  path traversal, uppercase, dots, null bytes, and over-length input before any handler runs.
- **No information leakage.** 404s return a generic structured message; no stack traces, no
  seed internals, no internal field names. A request ID is attached for traceability.
- **Request-size limit.** Bodies over 1 MiB are rejected (413) at the middleware layer.
- **No external egress.** Nothing in the backend makes an outbound network call. All data is
  in-process seed. There is no HTTP client (`httpx`/`requests`/`urllib`) used in any module.
- **No secrets served.** The Models & Policy schema carries policy metadata only — never API
  keys. Credentials are read from the shell environment by the app and never stored or returned.
- **Approval-gated egress by design.** Every action that would send data to a paid cloud
  provider is surfaced to the human as an explicit decision with cost and reversibility. In
  M6 these approvals are still simulated (no real effect), which is the safe default.
- **Per-module threat notes.** Each backend module ships a `THREAT.md` documenting its
  controls and its explicitly deferred threats.

---

## 6. Current state vs. what's deferred

### Working today (M0–M6)

- All ten screens implemented behind a shared shell, with Daylight/Obsidian themes,
  reduced-motion support, a command palette, and accessibility work.
- A typed contract seam (`contracts/` ↔ Pydantic schemas) shared front-to-back.
- **Eight read surfaces served by the real FastAPI backend** from seed data: Evidence (M5),
  then Today, Live Run, Decisions, Guided Review, Recipes, History, and Models & Policy (M6).
- Loading and error states on every backend-backed screen.
- Mock fallback so the app runs with or without a backend.
- Deny-by-default CORS, id validation, structured errors, body-size limit, no egress.

### Deliberately deferred (each needs its own maintainer-authorized milestone + review)

- **External data sources.** No calls to OpenAlex, Crossref, Semantic Scholar, Anthropic,
  etc. Real fetching is blocked until an egress-reviewed milestone. (The seed *describes*
  these sources; it does not contact them.)
- **Real writes / mutations.** Approving a decision, recording a review decision, customizing
  or running a recipe, replaying a run, and changing a provider policy are all **local/
  simulated** — there are no POST/PUT/DELETE endpoints for them. Real writes carry cost and
  egress consequences and are a separate future milestone.
- **Authentication / authorization.** There is no auth yet. Required before exposing any
  surface to untrusted users, and before any real mutation.
- **A real database.** Repositories read in-process seed. Swapping to a database is a
  per-module `repository.py` change.
- **Rate limiting and production hardening.** Noted in the module threat files.

In short: **NOETARCH today is a fully navigable, real-API, read-only slice of the product with
honest boundaries.** The consequential parts — spending money, leaving the device, writing
data — are visible in the UI but intentionally inert until each is authorized and reviewed.
