# M2 accessibility and responsive review

**Task:** FE-004  
**Scope:** M2 frontend implementation in `frontend/src`  
**Reviewed:** 2026-09-06  
**Boundary:** This review does not approve M3 screens, backend integration, real API calls, or product-domain workflows.

## Observed implementation evidence

- `ApplicationShell` renders the main landmark, named primary navigation, command-palette dialog, and route-progress status.
- `SidebarNavigation` exposes only Today as an active link. All nine future destinations are non-interactive unavailable items with visible `Coming soon` text and `aria-disabled="true"`.
- `TodayOverview` visibly displays `Prototype · Mock data`. Its seven M3-dependent actions are disabled buttons with accessible coming-soon names; none navigates or simulates work.
- `CommandPalette` uses `role="dialog"`, `aria-modal="true"`, an accessible heading, initial focus on the first enabled intention, a focus loop across enabled controls, Escape dismissal, and focus restoration to the invoking control. Future intentions are disabled and do not navigate.
- Theme, plain-English, and motion preferences persist in `localStorage` and update the root `data-mode`, `data-plain`, and `data-anim` attributes.
- Global keyboard focus uses a 2px accent outline with a 2px offset.
- `prefers-reduced-motion: reduce` and `[data-anim="off"]` both disable animations and transitions. The M2 motion layer contains only its thirteen consumed keyframes.
- `RouteProgress` now owns its fixed hairline styling in `RouteProgress.css`; `ApplicationShell.css` contains no duplicate selector.
- Button, ProgressBar, StatusIndicator, RouteProgress, ThemeProvider, ThemeToggle, SidebarNavigation, CommandPalette, ApplicationShell, and TodayOverview follow the canonical component/type/index structure. Components with component-specific styling have a matching non-empty CSS owner; component data is separated where required.

## Primitive reuse review

TodayOverview retains its bespoke buttons, run progress treatment, and contextual status marks. The shared Button, ProgressBar, and StatusIndicator primitives have different DOM structure, sizing, and semantic composition. Replacing the Today-specific elements would change the approved handoff design without eliminating a safe reusable behavior, so no refactor was made in M2. The primitives remain independently tested for later real consumers.

## Test evidence

`npm run test` passes: **6 test files, 19 tests**.

Focused coverage includes:

- Button loading/disabled semantics;
- ProgressBar determinate ARIA values;
- StatusIndicator visible status text;
- RouteProgress inactive/active status behavior;
- Today mock disclosure and unavailable actions;
- future navigation and command-palette intentions remaining non-navigating;
- persisted theme/plain-language/motion preferences;
- Ctrl/Meta+K, focus entry, focus return, focus loop, and Escape dismissal;
- shell landmarks and Today current-page state.

No Decisions approval-flow test exists because that surface remains M3.

## Rendered QA

Production-mode Chromium was exercised with existing local tooling. The machine-readable observations are stored in `docs/frontend/evidence/m2/qa-results.json`.

| Check | Result |
|---|---|
| Desktop Obsidian, 1440×1000 | Pass; layout intact, disclosure visible, only Today linked, no page overflow |
| Desktop Daylight, 1440×1000 | Pass; layout intact, disclosure visible, only Today linked, no page overflow |
| Tablet Daylight, 820×1180 | Pass; shell stacks, navigation scroll remains contained, content reflows, no page overflow |
| Mobile Obsidian, 390×844 | Pass; single-column content, 48px decision controls where applicable, no page overflow |
| 200% zoom equivalent | Pass; 1440×1000 physical viewport represented by a 720×500 CSS viewport at 2× scale; document and body widths remain 720px |
| Keyboard focus | Pass; rendered focus outline is solid 2px with 2px offset |
| Command palette | Pass; initial enabled-command focus, forward/reverse loop, Escape close, and invoker focus restoration verified |
| OS reduced motion | Pass; emulated media query matches and computed animations/transitions resolve to none/0s |
| In-app motion off | Pass; `data-anim="off"`, persisted `false`, and computed animations/transitions resolve to none/0s |
| Disabled future navigation | Pass; one active link (Today), nine unavailable navigation items, and seven disabled Today actions |
| Mock disclosure | Pass; exact visible text is `Prototype · Mock data` in every viewport |

## Contrast and type-size check

A computed-style audit checked visible, non-disabled text against its nearest opaque rendered background using WCAG relative-luminance thresholds: 4.5:1 for normal text and 3:1 for large text. It found no failures in either theme.

- Obsidian minimum observed ratio: **4.81:1**.
- Daylight minimum observed ratio: **4.78:1**.
- Minimum observed rendered font size: **12px**.

Disabled control text was excluded because disabled controls are exempt from WCAG text-contrast requirements; it remains visibly differentiated and paired with explicit coming-soon text.

## Evidence files

- `desktop-obsidian.png`
- `desktop-daylight.png`
- `tablet-daylight.png`
- `mobile-obsidian.png`
- `command-palette-focus.png`
- `zoom-200.png`
- `qa-results.json`

All files are under `docs/frontend/evidence/m2/`.

## Remaining limitations

- Rendered QA used the installed Chromium browser on macOS; Firefox, Safari, Windows, external screen readers, and physical touch devices were not exercised.
- The M3 decision workflow and its full mobile target-size contract remain unimplemented and unverified by design.
- RouteProgress is implemented and unit-tested, but the only available M2 route is `/`, so no live inter-route transition currently activates it.
