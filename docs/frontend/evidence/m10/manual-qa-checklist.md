# M10 Manual Visual QA Checklist

**Automated gates (done, green):** lint, type-check, 103 tests, production build (12 routes).

**Pixel screenshots were not captured in the build environment** — no headless browser is
installed and installing one needs network egress (out of scope for this frontend-only
milestone). Run the checklist below with `npm run dev` to capture PNGs into
`docs/frontend/evidence/m10/`.

## Matrix — all 10 screens × 3 widths × 2 themes + 200% zoom

Routes: `/today` `/live-run` `/decisions` `/evidence` `/guided-review` `/recipes`
`/history` `/models-policy` `/first-run` `/states`

For each route, verify at **1440px**, **820px**, **390px**, and **200% zoom**, in both
**Obsidian (night)** and **Daylight (day)**:

- [ ] No horizontal overflow (page does not scroll sideways).
- [ ] Text contrast is legible (headings, body, badges) in both themes.
- [ ] Focus rings visible on all interactive controls (Tab through).
- [ ] The "Show me around" help button is reachable and does not overlap content.

## Tour + tooltip kit

- [ ] First visit to Today/Live Run/Decisions/Evidence auto-opens the tour once.
- [ ] Re-loading the same screen does NOT auto-open the tour again.
- [ ] "Show me around" (help button and ⌘K palette entry) re-opens the tour any time.
- [ ] Tour: Next/Back/Skip/Done, ArrowLeft/ArrowRight, Escape all work.
- [ ] Tour: focus is trapped in the coachmark; Tab cycles; focus restores on close.
- [ ] Tour: the spotlight highlights the correct element and dims the rest.
- [ ] Reduced motion (toggle motion OFF, or OS prefers-reduced-motion): no spotlight
      animation, steps change instantly.
- [ ] "Explain this" (?) tooltips open on hover AND keyboard focus, close on Escape/blur.
- [ ] Screen reader announces "Step X of N: <title>" on each step.

## Mock-safe

- [ ] With the backend OFF (no `NEXT_PUBLIC_API_BASE`), every screen still renders and the
      tours/tooltips work (kit is pure frontend, no network).
