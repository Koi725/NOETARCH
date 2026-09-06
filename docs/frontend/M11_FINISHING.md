# M11 — Frontend Finishing (final frontend milestone)

Frontend only. No backend/egress/Git. All prior behavior, the service seam, and passing
tests preserved.

## Tour overlay fixes
- Compact coachmark (≤320px, tighter padding) positioned relative to its target with
  **edge-flip**: prefers below, flips above when there's no room, and clamps both axes so
  it is never off-screen and never obscures the highlighted element. Placement is a pure,
  unit-tested function (`components/ui/tour-position.ts`).
- "Show me around" help button docked bottom-right (clear of the left sidebar/footer),
  label hidden below 520px.

## Deeper, variable-length tours (no fixed cap)
Per-screen step counts: **Today 6, Live Run 6, Evidence 4, Guided Review 4, Decisions 3,
Models & Policy 3, Recipes 2, History 2, First Run 1.** Each meaningful section is its own
step with a real plain-language explanation. Data-driven in `components/ui/tours.ts`; every
screen exposes matching target ids.

## Per-section skeletons
`components/ui/Skeleton.tsx`: `EvidenceListSkeleton`, `TodaySkeleton`, `LiveRunSkeleton`
(9-step rail), `HistorySkeleton`, `ProviderGridSkeleton`, `DecisionsSkeleton`,
`RecipesSkeleton`, `GuidedReviewSkeleton` — each matched to its section's real layout and
wired into that screen's loading branch (replacing the generic spinner). Shapes are
decorative (`aria-hidden`) inside the screen's labelled `role="status"` wrapper. The shimmer
is an animation, so it is automatically **static when motion is off / prefers-reduced-motion**.

## Motion
`tailwind/components/Motion/Motion.css` (imported globally): subtle card/row/button hover
lift, status-badge color easing, coachmark enter, help-button hover, skeleton shimmer. All
are transitions/animations, so the existing global gate (`[data-anim="off"]` and
`prefers-reduced-motion` in `motion.css`) removes **all** of them — zero animation when off.

## Security
See `docs/frontend/SECURITY_REVIEW.md`. Clean: no `dangerouslySetInnerHTML`/`eval`, untrusted
provider text renders via React escaping only, no secrets in the bundle, no unguarded
`target="_blank"`, guarded localStorage, no `console.*`. Invariants are asserted by tests.

## Tests added (M11)
`tour-position` (edge-flip), `tour-steps` (expanded counts + uniqueness), `skeletons`
(per-section render), `frontend-security` (static scans + React-escaping render).
