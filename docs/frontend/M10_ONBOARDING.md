# M10 — Onboarding Tour + Tooltip Kit

Frontend-only. Adds a reusable, accessible guidance kit and wires per-panel tours. No
backend, egress, or Git changes. Fully mock-safe (works with the backend off).

## The kit (`frontend/src/components/ui/`)

| Export | What it is |
|---|---|
| `TourProvider` | Context provider. Holds registered tours, renders the active `SpotlightTour`, computes reduced-motion (app motion toggle OR `prefers-reduced-motion`). Wraps the app inside `ApplicationShell`. |
| `useTour()` | `{ registerTour, startTour, startCurrentTour, hasCurrentTour }`. Safe **no-op default** when no provider is present, so isolated component tests render unchanged. |
| `useScreenTour(key, steps)` | A screen registers its tour and auto-runs it **once** (first visit, guarded localStorage). Never auto-runs again; re-runnable on demand. |
| `SpotlightTour` | The coachmark dialog: highlights one target, dims the rest, Next/Back/Skip/Done, ArrowLeft/Right, Esc, focus-trap, SR step announcements. Props: `{ steps, onClose, reducedMotion? }`. |
| `ExplainTip` | An "explain this" `?` control: tooltip on hover **and** focus, `role="tooltip"`, `aria-describedby`, Escape/blur to dismiss. Available anytime. |
| `TourHelpButton` | The floating "Show me around" button (renders only when the current screen has a tour). |
| `hasSeenTour / markTourSeen / resetTourSeen` | localStorage-guarded "shown once" helpers (`noetarch.tour.<key>`). |
| `TourStep` | `{ targetId, title, explanation, placement? }`. |

### Data-driven step definitions (`ui/tours.ts`)
Tours target elements by DOM `id`: `TODAY_TOUR_STEPS`, `LIVE_RUN_TOUR_STEPS`,
`DECISIONS_TOUR_STEPS`, `EVIDENCE_TOUR_STEPS` (module constants, stable references).

## Tours wired
- **Today** — waiting / happening-now / sources.
- **Live Run** — step rail / pending decisions / event ledger.
- **Decisions** — pending cards / your recorded choices.
- **Evidence** — fetch from OpenAlex / filters / record list.

Each screen calls `useScreenTour(KEY, STEPS)` and exposes target ids. The shell renders the
help button and the command palette gains a **"Show me around"** entry (both call
`startCurrentTour()`).

## Accessibility
- Tooltip: `role="tooltip"`, hover + focus triggers, Escape/blur dismiss, `aria-describedby`.
- Tour dialog: `role="dialog"`, `aria-modal`, labelled by the step title, described by the
  explanation; **does not `aria-hide` the rest of the app** (underlying content stays in the
  a11y tree and queryable).
- Full keyboard nav + focus-trap + focus restore on close.
- Respects reduced motion: no spotlight animation, instant steps.
- SR announcement: `role="status"` `aria-live="polite"` — "Step X of N: <title>".

## First-run behavior
On first visit a screen's tour auto-opens once (after a short delay so targets exist) and is
immediately marked seen (so "once" holds even if skipped). All access is try/catch-guarded —
blocked/unavailable storage never breaks rendering.

## Tests
`spotlight-tour.test.tsx` (7) and `tour-kit.test.tsx` (4): stepping, keyboard, dismiss,
reduced-motion, tooltip a11y, shown-once, on-demand re-trigger.

## Visual QA
Automated gates green. Pixel screenshots were **not** captured in the build environment (no
headless browser; installing one needs egress). See
`docs/frontend/evidence/m10/qa-results.json` and `manual-qa-checklist.md`.
