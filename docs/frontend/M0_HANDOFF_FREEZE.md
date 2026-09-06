# M0 design handoff freeze

**Task:** FE-000
**Owner:** frontend reviewer
**Initial approval:** M0 and M1 authorized 2026-09-05; M2 was paused
**Recovery decision:** M2 work crossed the intended stop, was identified by audit, and was prospectively authorized for completion/remediation after review
**Requested source:** the `design_handoff_report` source directory is absent
**Canonical surviving source directory:** `design_handoff_noetarch/` (an external, un-tracked handoff source provided to the project)
**Missing source:** `README.md` was named by the earlier recovery record and by `PROMPTS.md`, but it is no longer present in either design-handoff location. It was not recreated, and claims that depended only on it are not treated as independently verified.

## Canonical source manifest

Verified using SHA-256. Sources are external handoff files (not tracked in this repo); only their filenames and hashes are recorded here.

| Source | Source (relative) | SHA-256 | Role |
|---|---|---|---|
| `NOETARCH.dc.html` | `design_handoff_noetarch/NOETARCH.dc.html` | `b296fcb834871200088f118fc01fc4c7f7446cf7aaf35a989e81cbf941f84942` | Current visual and interaction prototype |
| `PROMPTS.md` | `design_handoff_noetarch/PROMPTS.md` | `89cd4dc15b1d911f4b3d42ffd7890b35999de4a4e45bc2fcda48233ae46489aa` | Implementation and validation guidance |
| `predecessor-prototype.dc.html` | `design_handoff_noetarch/predecessor-prototype.dc.html` | `2276b6237cd5afeddc48be9b71b093a99e838d71f3e653737861457832af3cf8` | Historical predecessor; not current visual authority |
| `support.js` | `design_handoff_noetarch/support.js` | `8fe7df74405f3c55f49b7249c74ea1397e65d07dea2b1bd3b4a489bec2e28cbe` | Generated Design Canvas runtime; not product specification |
| `README.md` | Missing | Not available | Previously referenced supporting narrative; no substitute was invented |

## Product and visual thesis

NOETARCH is a local-first research evidence workbench for researchers who need an auditable path from question to defensible evidence. The visual thesis is a precise research control surface: Obsidian black or Daylight paper, sharp zero-radius geometry, hairline grids, and restrained semantic colour. Human authority, provenance, cost, privacy, and reversibility must remain visible.

## Frozen routes

| Route | Screen | M2 status |
|---|---|---|
| `/` | Today | representative surface with explicit prototype/mock-data disclosure |
| `/live-run` | Live run | shell destination; M3 screen |
| `/decisions` | Decisions | shell destination; M3 screen |
| `/evidence` | Evidence and provenance | shell destination; M3 screen |
| `/guided-review` | Guided review | shell destination; M3 screen |
| `/recipes` | Recipes | shell destination; M3 screen |
| `/history` | History and replay | shell destination; M3 screen |
| `/models-policy` | Models and policy | shell destination; M3 screen |
| `/first-run` | First run | shell destination; M3 screen |
| `/states` | Loading and empty states | shell destination; M3 screen |

## Frozen token system

The authoritative colour values are the complete Obsidian `:root` and Daylight `[data-mode="day"]` tables in the handoff. Semantic use is fixed: cyan/red for primary and live state, amber for human decisions, green for verified state, coral/red for failure only, and violet only for unverified model narration. There is no decorative gradient, no radius except circular spinners, and only the declared `--glow` shadow.

Archivo weights 400, 600, and 800 are bundled locally. Typography, spacing, borders, focus rings, selection, and the thirteen motion keyframes used by the M2 implementation are centralized under `src/tailwind/`. The source prototype defines sixteen keyframes; `noShimmer`, `noCaret`, and `noDots` belong to deferred loading/onboarding surfaces and are intentionally omitted until a real consumer exists. Both `prefers-reduced-motion` and `[data-anim="off"]` disable motion.

## Component inventory

M2 owns the theme provider and controls, button/status/progress primitives, route-progress hairline, sidebar navigation, command palette, application shell, and a representative Today overview. M3 owns screen-specific tables, approval cards, provenance inspector, live-run panes and event log, review stepper, recipe cards, replay diff, policy table, onboarding, and the twelve-state gallery.

## Interaction and mock-state inventory

M2 implements persisted theme, plain-English, and motion preferences; responsive navigation; active-route state for Today; Command/Ctrl+K open and Escape close; palette intention rows; and a clearly disclosed mock-only dashboard. Mock runs, costs, decisions, outages, and files are labelled as prototype data. It does not simulate backend work, typing, replies, progress, approvals, or timers. Live run state, shared decision state, evidence selection, review/onboarding steppers, and real loading gates remain M3 integration work.

## Responsive and accessibility strategy

CSS media/container queries own all layout changes: three-pane eligibility at 1180px, wide supporting rails/tables at 1120px, and stacked application rail/run timeline below 900px. No JavaScript viewport measurement is allowed.

Body text must meet 4.5:1 contrast in both themes, headings 3:1, interactive focus uses a 2px accent outline with 2px offset, status is never colour-only, mobile decision targets are at least 48px, and the interface type floor is 12px. Semantic landmarks, accessible names, keyboard dismissal, current-page state, and motion controls are required.

## Canonical source tree

```text
frontend/
├── src/app/
├── src/components/ComponentName/{ComponentName.tsx,ComponentName_types.ts,index.ts}
├── src/data/ComponentName/ComponentName-data.ts
├── src/tailwind/{tokens.css,motion.css,components.css}
└── src/tailwind/components/ComponentName/ComponentName.css
```

## Resolved conflicts and deferred choices

- The project convention overrides dotted filenames and colocated CSS Modules.
- Prototype inline styles and `ResizeObserver` breakpoints are tooling artifacts and are not ported.
- Next.js is authoritative for this phase; Tauri/Electron is a later desktop-shell decision.
- The handoff's simulated 900ms run tick is not implemented in M2 because it would fake backend behaviour.
- `support.js` is generated Design Canvas runtime infrastructure, not application code.
- The predecessor prototype file is historical reference only; `NOETARCH.dc.html` and the handoff README are visual truth.
- M0 and M1 were initially authorized. The recovery audit found that M2 implementation had crossed the intended M1 stop. Completion/remediation of M2 was subsequently authorized prospectively; M3 remains blocked.

## M1 and M2 boundary

M1 establishes the exact-pinned Next.js/React/Tailwind/TypeScript toolchain, npm lockfile, lint, strict type-check, unit test, and production build commands. M2 establishes shared tokens and themes, foundational primitives, responsive shell/navigation, command palette, and one mock-only Today composition sufficient for visual verification. No backend file, API integration, external-orchestration action, Git mutation, deployment, or M3 route implementation is permitted.

## Verification result

The four surviving files were inspected and hashed. `NOETARCH.dc.html` directly verifies the complete Obsidian and Daylight colour tables, sixteen source-prototype keyframes, 900/1120/1180px responsive thresholds, ten-screen inventory, shell structure, interaction model, and both motion kill switches. `PROMPTS.md` independently confirms the ten-screen order, the same three responsive thresholds, and the required OS-level and in-app motion checks. The predecessor prototype is the earlier single-theme version and is not current visual authority. `support.js` identifies itself as generated Design Canvas runtime infrastructure and contains no NOETARCH product specification. The missing `README.md` prevents re-verifying any narrative unique to that file, but no frozen M0 claim above relies solely on it. No binary design asset was required or copied.
