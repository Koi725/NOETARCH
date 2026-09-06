"use client";

import { useEffect } from "react";
import { useTour } from "./TourProvider";
import { hasSeenTour, markTourSeen } from "./tour-storage";
import type { TourStep } from "./tour-types";

// Delay before an auto-run first-time tour opens, so the screen's target elements exist.
const AUTO_RUN_DELAY_MS = 350;

/**
 * Registers a screen's tour and auto-runs it exactly once (first visit), tracked in
 * guarded localStorage. After the first automatic run it never opens on its own again;
 * the user can always re-run it via the "Show me around" help button / command palette.
 *
 * Pass a stable (module-level) `steps` array.
 */
export function useScreenTour(key: string, steps: TourStep[]): void {
  const { registerTour, startTour } = useTour();

  useEffect(() => {
    registerTour(key, steps);
    if (hasSeenTour(key)) return;
    markTourSeen(key); // mark immediately so it is truly "once", even if skipped
    const timer = window.setTimeout(() => startTour(key), AUTO_RUN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [key, steps, registerTour, startTour]);
}
