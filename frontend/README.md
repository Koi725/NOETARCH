# NOETARCH frontend

The CEO initially authorized M0 and M1 on 2026-09-05. M2 implementation crossed the intended M1 stop and was identified during a recovery audit. After reviewing that audit, the CEO prospectively authorized M2 completion and remediation. This was not retroactive authorization.

This directory contains the completed and validated M0-M2 local-first interface foundation. M3, backend integration, real API calls, desktop-shell packaging, and product-domain workflows remain blocked.

## Stack

- Next.js App Router
- React
- strict TypeScript
- Tailwind CSS
- Vitest and Testing Library
- npm with exact dependency versions and a reviewed lockfile

## Commands

```bash
npm run dev
npm run lint
npm run type-check
npm run test
npm run build
```

## Canonical component layout

```text
src/components/ComponentName/
├── ComponentName.tsx
├── ComponentName_types.ts
└── index.ts

src/data/ComponentName/
└── ComponentName-data.ts

src/tailwind/components/ComponentName/
└── ComponentName.css
```

Component styles are imported by `src/tailwind/components.css`, which is imported by `src/app/globals.css`. Do not introduce dotted component filenames, colocated CSS Modules, empty abstraction layers, or speculative dependencies.

## Current boundary

M2 includes the design tokens, Obsidian and Daylight themes, reusable presentation primitives, responsive application shell, keyboard command palette, and a representative Today prototype with an explicit mock-data disclosure. Only `/` is available. Future destinations are presented as unavailable rather than as links, and their screens remain blocked until M3 or later receives separate approval.

## Validation

The M2 checkpoint passes lint, strict type-check, 6 files/19 tests, production build, and full npm dependency-tree resolution. Production-mode Chromium checks cover desktop Obsidian and Daylight, tablet, mobile, keyboard and command-palette focus, both reduced-motion controls, page overflow, a 200% zoom equivalent, computed contrast, disabled future navigation, and the visible `Prototype · Mock data` disclosure.

The review and compact evidence are in `docs/frontend/M2_ACCESSIBILITY.md` and `docs/frontend/evidence/m2/`. Browser coverage is limited to the installed Chromium on macOS; M3 screens and real integration behavior are intentionally not represented.
