# M3 accessibility validation

**Task:** FE-006 (M3 frontend completion)  
**Scope:** All nine new M3 screen components plus updated M2 components  
**Date:** 2026-09-06  
**Method:** Static analysis (TypeScript, ESLint), unit tests (Testing Library), and code review. Live Chromium rendering not captured — CEO should run `npm run dev` in `frontend/` for visual verification.

## ARIA semantics inventory

### ApplicationShell (updated)

| Surface | ARIA |
|---|---|
| Shell root | `<div>` — no role change |
| Navigation | `<nav aria-label="Main navigation">` |
| Main content | `<main>` |
| Command palette dialog | `role="dialog" aria-modal="true" aria-label="Command palette"` |
| Route progress bar | `role="progressbar" aria-label="Page loading"` |
| ShellContext | Provides `openPalette` without prop drilling — no ARIA impact |

### TodayOverview (updated)

| Surface | ARIA |
|---|---|
| M3 navigation links | `<Link>` (Next.js) → `<a>` with accessible text |
| ⌘K button | `<button type="button">` |
| Prototype notice | `role="note"` |
| Run progress bar | `role="progressbar" aria-valuenow aria-valuemin aria-valuemax aria-label` |
| Coming-soon button | `disabled aria-label="... — coming soon"` |
| Sources aside | `<aside aria-label="Workspace details">` |

### LiveRun (new)

| Surface | ARIA |
|---|---|
| Step rail steps | `aria-label="Step N: ..."` |
| Current step indicator | `aria-current="step"` |
| Pause toggle | `aria-pressed` |
| Stop toggle | `aria-pressed` |
| Retry toggle | `aria-pressed` |
| Skip toggle | `aria-pressed` |
| Layout toggle | `aria-pressed` |
| Simulated notice | `role="status" aria-live="polite"` |
| Event ledger | `role="log" aria-live="polite"` |
| Model commentary entries | `aria-label="Model commentary"` (violet tone) |
| System fact entries | `aria-label="System event"` |
| Prototype notice | `role="note"` |

### DecisionCenter (new)

| Surface | ARIA |
|---|---|
| Decision list | `<ul aria-label="Pending decisions">` |
| No preselected action | Initial state: no `aria-pressed` is true |
| Approve-once button | `aria-pressed` |
| Use-local button | `aria-pressed` |
| Reject button | `aria-pressed` |
| Change-mind button | `aria-pressed` |
| Risk badge | `aria-label="Risk: ..."` |
| Confirmation notice | `role="status" aria-live="polite"` |
| Cloud/local indicator | `aria-label="Cloud operation"` / `aria-label="Local operation"` |
| Prototype notice | `role="note"` |

### EvidenceLibrary (new)

| Surface | ARIA |
|---|---|
| Search input | `<input type="search" aria-label="Search evidence records">` |
| Filter chips | `role="group" aria-label="Filter records"` · each chip `aria-pressed` |
| Record count | `role="status" aria-live="polite" aria-atomic="true"` |
| Record list | `<ul aria-label="Evidence records">` |
| Record row button | `aria-pressed aria-expanded aria-label="title — status"` |
| Inspector | `<aside aria-label="Record detail inspector">` |
| Close button | `aria-label="Close detail inspector"` |
| Source table | `<table><caption class="sr-only">Source verification results</caption>` |
| Provenance trail | `<ol>` with section `aria-labelledby` |
| Status badges | `aria-label="Status: ..."` |
| Source icons | `aria-label="source-name"` |
| Prototype notice | `role="note"` |

### GuidedReview (new)

| Surface | ARIA |
|---|---|
| Progress band | `role="region" aria-label="Review progress"` |
| Progress bar | `role="progressbar" aria-valuenow aria-valuemin aria-valuemax aria-label` |
| Progress text | `role="status" aria-live="polite" aria-atomic="true"` |
| Keyboard shortcuts toggle | `aria-pressed aria-expanded aria-label="Toggle keyboard shortcuts panel"` |
| Keyboard panel | `role="region" aria-label="Keyboard shortcuts"` |
| Decision buttons group | `role="group" aria-label="Decision options"` |
| Each decision button | `aria-pressed aria-label` |
| Include button | `aria-label="Include"` |
| Exclude button | `aria-label="Exclude"` |
| Uncertain button | `aria-label="Uncertain"` |
| Needs-human button | `aria-label="Needs human review"` |
| Exclusion reasons fieldset | `<fieldset aria-label="..."><legend>Reason(s) for exclusion</legend>` |
| Each reason checkbox | `<input type="checkbox" aria-label>` |
| Decision note | `<p>` (not live — visible in sync with button press) |
| Confirm button | `aria-label="Confirm decision: ..."` |
| History list | `<ol aria-label="Decision history">` |
| Undo button | `aria-label="Undo last decision"` `disabled` when empty |
| Abstract section | `<section aria-labelledby>` |
| Paper index | `aria-label="Paper N of total"` |
| Prototype notice | `role="note"` |

### RecipeLibrary (new)

| Surface | ARIA |
|---|---|
| Recipe cards grid | `role="list"` |
| Each card | `role="listitem"` |
| Expand/collapse button | `aria-expanded` `aria-controls` |
| Collapsed content | `aria-hidden` when collapsed |
| Duplicate button | `aria-label="Duplicate recipe: ..."` |
| Toast notice | `role="status" aria-live="polite"` |
| Name edit input | `aria-label="Recipe name"` |
| Save name button | `aria-label="Save recipe name"` |
| Prototype notice | `role="note"` |

### RunHistory (new)

| Surface | ARIA |
|---|---|
| Filter tabs | `role="tablist" aria-label="Filter runs"` |
| Each tab | `role="tab" aria-selected` |
| Run list | `role="list" aria-label="Run history"` |
| Run select checkbox | `aria-label="Select run N for comparison"` |
| Compare panel | `role="region" aria-label="Run comparison"` |
| Replay confirmation | `role="alertdialog" aria-label="Confirm replay"` |
| Replay notice | `role="status" aria-live="polite"` |
| Diff panel | `role="region" aria-label="Differences"` |
| Evidence links | `aria-disabled="true"` (mock-only) |
| Prototype notice | `role="note"` |

### ModelsPolicy (new)

| Surface | ARIA |
|---|---|
| Provider cards | `role="list" aria-label="Model providers"` |
| Enable/disable toggle | `aria-pressed` `aria-label="Enable provider-name"` |
| Cost limit input | `aria-label="Monthly cost limit for provider-name"` |
| Saved notice | `role="status" aria-live="polite"` |
| Routing preference group | `role="group" aria-label="Routing preference"` |
| Routing buttons | `aria-pressed` |
| Approval toggle | `aria-pressed` `aria-label="Require manual approval for provider-name"` |
| Provider down alert | `role="alert" aria-live="assertive"` |
| Prototype notice | `role="note"` |

### FirstRun (new)

| Surface | ARIA |
|---|---|
| Wizard container | `role="main" aria-label="First-run setup"` |
| Step indicator | `aria-label="Step N of 7"` |
| Prev/Next buttons | `<button type="button">` |
| Step 6 egress policy | `role="group" aria-label="Data egress policy"` |
| Egress options | `<input type="radio">` — no default checked |
| Validation error | `role="alert" aria-live="assertive"` — shown when Next pressed without selection |
| Review summary | `<dl>` with `<dt>`/`<dd>` pairs |
| Finish button | `<button type="button">` (simulated) |
| Finish notice | `role="status" aria-live="polite"` |
| Prototype notice | `role="note"` |

### StateGallery (new)

| Surface | ARIA |
|---|---|
| Gallery grid | `role="list" aria-label="UI state inventory"` |
| Each state card | `role="listitem"` |
| Production ProgressBar | Inherits component ARIA from M2 |
| Production StatusIndicator | Inherits component ARIA from M2 |
| Prototype notice | `role="note"` |

## Keyboard behavior

| Surface | Behavior |
|---|---|
| All buttons/links | Tab focus; Enter/Space activation |
| CommandPalette | Ctrl/Cmd+K opens; Escape closes; Tab cycles items; Enter selects |
| GuidedReview | I=include, E=exclude, U=uncertain, H=needs-human-review, Z=undo, ?=toggle hints |
| SidebarNavigation | All 10 destinations are focusable real links |
| DecisionCenter | No action auto-focused; user must press a button |
| FirstRun step 6 | No radio auto-selected; Next is disabled until radio chosen |

## Interaction contracts

### Critical: no preselected risky consent

Two screens require explicit user action before any consequence:

**DecisionCenter** — Initial state: `selectedAction: null`. Every decision card shows action buttons but none is `aria-pressed`. The confirm action is not rendered until the user presses an action button.

**FirstRun step 6 (egress policy)** — Initial state: `egressDefault: null`. The Next button is disabled and shows a validation error (`role="alert"`) if pressed. The user must select an egress policy before advancing.

This implements the CEO requirement: "No action preselected in DecisionCenter. FirstRun step 6 (egress policy): nothing preselected, validation blocks advance."

## Focus management

- **Dialog/palette open**: focus moves to the first item in CommandPalette
- **Dialog/palette close**: focus returns to the trigger button
- **GuidedReview confirm**: after confirm, state updates in place; focus remains on the confirm button until user navigates
- **FirstRun Next**: after a valid step, focus moves to the first interactive element on the new step

## Visible disclosure

Every new M3 screen shows one of:

- `<div class="no-prototype-notice" role="note">Prototype · Mock data</div>` — persistent header notice
- `role="status" aria-live="polite"` — "Simulated · no backend" after action buttons on LiveRun, RunHistory replay, FirstRun finish

## Responsive and motion

| Feature | Implementation |
|---|---|
| Reduced motion | `@media (prefers-reduced-motion: reduce)` + `[data-anim="off"]` — global, inherited from M2 |
| Mobile touch targets | `min-height: 48px; min-width: 48px` at `@media (max-width: 480px)` in every new CSS file |
| Responsive layouts | Tailwind `md:` / custom breakpoints — no horizontal page overflow |

## Testing coverage

| Test | Coverage |
|---|---|
| `routes.test.tsx` | `aria-current="page"` on correct nav link for all 10 M3 routes; root `/` redirects marks Today active |
| `today-overview.test.tsx` | M3 action links present (`/guided-review`, `/live-run`, `/decisions`, `/history`, `/models-policy`); ⌘K still works via ShellContext |
| `application-shell.test.tsx` | All 10 nav items render as real links; all M3 palette items enabled |
| `sidebar-navigation.test.tsx` | All 10 M3 routes render as links; `aria-current` correct |
| `command-palette.test.tsx` | All palette items enabled; navigation hrefs correct |

## Known limitations

- Live Chromium rendering not captured for M3; CEO should run `npm run dev` for visual verification
- External screen readers (NVDA, JAWS, VoiceOver on iOS/Android) not tested
- Firefox, Safari, and Windows not tested
- Physical touch devices not tested
- `RouteProgress` animation not observable in unit tests
- StateGallery state 15 (narrow viewport) is a descriptive card, not a live narrow-viewport simulation
