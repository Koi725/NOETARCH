# M3 implementation record

**Task:** FE-006 (M3 frontend completion)  
**Owner:** Claude Senior Co-CTO  
**Authorization:** CEO explicit M3 authorization per session 2026-09-06  
**Date completed:** 2026-09-06  
**Boundary:** Frontend only — no backend, no real APIs, no authentication, no desktop packaging, no Ruflo configuration changes, no Git mutations.

## Executive summary

M3 implements all ten App Router destinations established in the M0 design-handoff freeze. Nine new screen components with typed mock data replace the shell placeholder stubs. The `/today` route is now canonical; the root `/` redirects to it. The `ApplicationShell` exposes a `ShellContext` so child screens can access `openPalette` without prop drilling. All quality gates pass: zero lint errors, zero TypeScript errors, 37 tests, 11-route production build.

## Routes implemented

| Route | Component | Status |
|---|---|---|
| `/` | redirect → `/today` | complete |
| `/today` | TodayOverview (M2 preserved) | complete |
| `/live-run` | LiveRun | complete |
| `/decisions` | DecisionCenter | complete |
| `/evidence` | EvidenceLibrary | complete |
| `/guided-review` | GuidedReview | complete |
| `/recipes` | RecipeLibrary | complete |
| `/history` | RunHistory | complete |
| `/models-policy` | ModelsPolicy | complete |
| `/first-run` | FirstRun | complete |
| `/states` | StateGallery | complete |

## Routing architecture

A Next.js App Router route group `src/app/(shell)/` provides a shared layout wrapping every destination in `ThemeProvider > ApplicationShell`. The root `page.tsx` uses `redirect('/today')` (server-side, zero JS). Pages are thin server components that import and render their screen component.

The `ApplicationShell` now provides a `ShellContext` (exported as `useShell()`) that exposes `openPalette`. This lets the TodayOverview's ⌘K button work without prop drilling and keeps the shell API extensible for future screens.

## Component inventory

### New M3 components

| Component | Route | Key interactions |
|---|---|---|
| `LiveRun` | `/live-run` | pause/stop/retry/skip (simulated), layout toggle, event ledger with model vs. system distinction |
| `DecisionCenter` | `/decisions` | approve-once / use-local / reject / change-mind — no action preselected |
| `EvidenceLibrary` | `/evidence` | search + filter chips, detail inspector, provenance trail |
| `GuidedReview` | `/guided-review` | include/exclude/uncertain, reason checkboxes, undo (3-deep), keyboard shortcuts I/E/U/H/Z |
| `RecipeLibrary` | `/recipes` | expand/collapse cards, duplicate (aria-live toast), inline name edit |
| `RunHistory` | `/history` | filter tabs, select-to-compare (max 2), diff panel, replay with confirmation |
| `ModelsPolicy` | `/models-policy` | enable/disable toggle, cost input with saved notice, routing button group, approval toggle |
| `FirstRun` | `/first-run` | 7-step wizard, step 6 egress validation (required, not preselected), review summary |
| `StateGallery` | `/states` | 15 production state cards reusing ProgressBar and StatusIndicator |

### Modified M2 components

| Component | Change |
|---|---|
| `ApplicationShell` | Added `ShellContext` / `useShell()`, removed TodayOverview fallback |
| `SidebarNavigation` | All 10 routes marked available; Today href updated to `/today`; `isCurrentPath` handles both `/` and `/today` |
| `CommandPalette` | All palette items enabled in M3 |
| `TodayOverview` | Uses `useShell()` instead of prop; action buttons converted to navigation links where the target routes now exist |

## Mock-data structure

Each component has a canonical data file under `src/data/ComponentName/ComponentName-data.ts`. All data is typed, deterministic, and covers the edge cases specified in the M3 brief:

- Successful and failed sources (LiveRun event ledger, EvidenceLibrary source failure)
- Free/local and paid/cloud operations (RecipeLibrary, FirstRun source selection, ModelsPolicy)
- Pending and rejected decisions (DecisionCenter)
- Conflicting evidence (EvidenceLibrary records 2, 5, 8)
- Missing DOI (EvidenceLibrary records 3, 9)
- Long titles (GuidedReview current paper, StateGallery card 12)
- Zero and large result counts (RunHistory failed run, StateGallery card 13)
- Retries (LiveRun step 5, RunHistory interrupted run)
- Partial workflow completion (RunHistory partial run 5)
- Unavailable providers (ModelsPolicy Ollama — provider down state)
- Budget limits (ModelsPolicy cost limits)
- Model commentary versus verified system facts (LiveRun event ledger — model notes in violet, system events in default ink)

## Interaction model

All interactions use local React state only. No `fetch`, Axios, XHR, WebSocket, EventSource, external URL, backend call, or secret access occurs at any point. Every simulated action shows a visible "Simulated · no backend" or "Prototype · Mock data" notice.

## Keyboard behavior

| Surface | Shortcuts |
|---|---|
| Global | Ctrl/Cmd+K opens command palette |
| CommandPalette | Tab / Shift+Tab focus loop; Escape close |
| GuidedReview | I=include, E=exclude, U=uncertain, H=needs-human, Z=undo, ?=toggle hints |
| All controls | Standard Tab navigation, Enter/Space for buttons |

## Responsive behavior

| Breakpoint | Behavior |
|---|---|
| ≥ 1180px | Three-pane eligible layouts (LiveRun, EvidenceLibrary) |
| ≥ 1120px | Wide supporting rails and tables |
| < 900px | ApplicationShell stacks; LiveRun, GuidedReview go single-column |
| < 820px | EvidenceLibrary inspector becomes overlay |
| ≤ 480px | Mobile: 48px touch targets enforced on all interactive controls; decision buttons full-width |

No horizontal page overflow. Internal scrolling allowed only inside the event ledger and record list panels.

## Accessibility

- Every interactive control has an accessible name (label, aria-label, or aria-labelledby)
- `aria-pressed` on all toggle buttons (routing preference, enable/disable, filter chips)
- `aria-expanded` on collapsible recipe cards
- `aria-selected` on RunHistory filter tabs with `role="tablist"`
- `aria-live="polite"` with `role="status"` for dynamic notices (toast, saved, replay started, etc.)
- `aria-live="assertive"` with `role="alert"` for FirstRun step 6 validation error
- DecisionCenter: no action preselected; user must actively choose
- FirstRun step 6: egress policy starts null; Next is blocked with a validation message
- Focus ring: 2px accent outline, 2px offset (global, inherited)
- Reduced motion: `prefers-reduced-motion` and `[data-anim="off"]` inherited globally from M2

## Remaining limitations

- Rendered browser QA (screenshots) not captured — requires a running dev server. The CEO should run `npm run dev` in `frontend/` and verify each route visually. Static analysis and unit tests confirm correctness; visual verification confirms appearance.
- Firefox, Safari, Windows, external screen readers, and physical touch devices not exercised (same limitation as M2).
- The `RouteProgress` hairline animation activates on inter-route navigation but cannot be observed in unit tests.
- StateGallery state 15 (narrow viewport) is a descriptive card, not a live narrow-viewport render.
- Some StateGallery states (e.g., offline, budget-exhausted) are represented as data displays rather than live simulation states, since they require backend state that does not exist.

## Backend integration boundary

Nothing in M3 touches backend code, API contracts, database schemas, server configuration, or deployment pipelines. The integration boundary is:

- All data consumed by M3 screens must come through `src/data/` as typed constants
- When backend integration is authorized, replace data imports with typed API clients — the component interfaces remain unchanged
- Decision approval, evidence verification, recipe execution, model policy enforcement, and first-run configuration persistence all require backend integration that is explicitly not authorized in M3

## Quality gate results

| Gate | Result |
|---|---|
| `npm run lint` | Pass — 0 errors, 0 warnings |
| `npm run type-check` | Pass — 0 errors |
| `npm run test` | Pass — 7 files, 37 tests |
| `npm run build` | Pass — 11 routes built |
| `git diff --check` | Pass |
| `npm ls --all` | Pass — 1 pre-existing unmet optional dep (yaml), no new deps added |
