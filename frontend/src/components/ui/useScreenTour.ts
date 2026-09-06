"use client";

import { useEffect } from "react";
import { useTour } from "./TourProvider";
import type { TourStep } from "./tour-types";

/**
 * Registers a screen's tour so it is available on demand (Help menu / command palette).
 * The tour is NOT auto-launched — first-run guidance is a single dismissible welcome
 * coach-mark instead (see WelcomeCoachmark). Pass a stable (module-level) `steps` array.
 */
export function useScreenTour(key: string, steps: TourStep[]): void {
  const { registerTour } = useTour();

  useEffect(() => {
    registerTour(key, steps);
  }, [key, steps, registerTour]);
}
