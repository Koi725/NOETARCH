// Pure coachmark placement: position the card relative to its target with edge-flip so it
// is never off-screen and never obscures the highlighted element. Kept dependency-free and
// pure so the placement logic is unit-testable without a browser.

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export type Placement = "top" | "bottom" | "center";

export interface CoachmarkPosition {
  top: number;
  left: number;
  placement: Placement;
}

const GAP = 12;
const MARGIN = 12;

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.max(min, Math.min(value, max));
}

/**
 * Decide where to render the coachmark card.
 * - No/zero target ⇒ centered near the bottom (a safe fallback).
 * - Otherwise prefer below the target; flip above when there isn't room; then clamp both
 *   axes inside the viewport so the card is always fully visible.
 */
export function computeCoachmarkPosition(
  target: Box | null,
  card: Size,
  viewport: Viewport,
  gap: number = GAP,
  margin: number = MARGIN,
): CoachmarkPosition {
  if (!target || (target.width === 0 && target.height === 0)) {
    return {
      top: clamp(viewport.height - card.height - margin * 2, margin, viewport.height - margin),
      left: clamp((viewport.width - card.width) / 2, margin, viewport.width - card.width - margin),
      placement: "center",
    };
  }

  const spaceBelow = viewport.height - (target.top + target.height);
  const spaceAbove = target.top;

  let top: number;
  let placement: Placement;
  if (spaceBelow >= card.height + gap || spaceBelow >= spaceAbove) {
    top = target.top + target.height + gap;
    placement = "bottom";
  } else {
    top = target.top - card.height - gap;
    placement = "top";
  }
  top = clamp(top, margin, Math.max(margin, viewport.height - card.height - margin));

  const targetCenter = target.left + target.width / 2;
  const left = clamp(
    targetCenter - card.width / 2,
    margin,
    Math.max(margin, viewport.width - card.width - margin),
  );

  return { top, left, placement };
}
