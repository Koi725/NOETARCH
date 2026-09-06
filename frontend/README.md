# NOETARCH frontend

The CEO initially authorized M0 and M1 on 2026-09-05. M2 implementation crossed the intended M1 stop and was identified during a recovery audit. After reviewing that audit, the CEO prospectively authorized M2 completion and remediation. This was not retroactive authorization. M3 was explicitly authorized on 2026-09-06 and is now complete.

This directory contains the completed and validated M0-M3 local-first interface. Backend integration, real API calls, desktop-shell packaging, and product-domain workflows remain blocked until separately authorized.

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

## Current boundary (M3 complete)

M3 adds nine new screen components with typed mock data and real App Router routes for all ten destinations. All navigation items are real links. The root `/` redirects to `/today`. The `ApplicationShell` provides a `ShellContext` so child components can access `openPalette`. All interactions use local React state; no fetch, XHR, WebSocket, or external URL is used.

Routes: `/today`, `/live-run`, `/decisions`, `/evidence`, `/guided-review`, `/recipes`, `/history`, `/models-policy`, `/first-run`, `/states`.

## Validation

The M3 checkpoint passes lint, strict type-check, 7 files/37 tests, production build (11 routes), and full npm dependency-tree resolution. No new dependencies were added. `git diff --check` passes.

M2 Chromium evidence is in `docs/frontend/evidence/m2/` and `docs/frontend/M2_ACCESSIBILITY.md`. M3 static-analysis evidence is in `docs/frontend/evidence/m3/qa-results.json`. M3 implementation details and accessibility inventory are in `docs/frontend/M3_IMPLEMENTATION.md` and `docs/frontend/M3_ACCESSIBILITY.md`.

Live browser QA for M3 requires `npm run dev` — screenshots were not captured to avoid leaving background processes. The CEO should verify each route visually.
