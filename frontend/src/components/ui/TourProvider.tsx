"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTheme } from "@/components/ThemeProvider";
import { SpotlightTour } from "./SpotlightTour";
import type { TourContextValue, TourStep } from "./tour-types";

// Default is a safe no-op so screens using useScreenTour render fine WITHOUT a provider
// (e.g. in isolated component tests). Tours only activate inside a real TourProvider.
const NOOP_CONTEXT: TourContextValue = {
  registerTour: () => {},
  startTour: () => {},
  startCurrentTour: () => {},
  hasCurrentTour: false,
};

const TourContext = createContext<TourContextValue>(NOOP_CONTEXT);

export function useTour(): TourContextValue {
  return useContext(TourContext);
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMedia(callback: () => void): () => void {
  const mq = window.matchMedia?.(REDUCED_QUERY);
  if (!mq) return () => {};
  mq.addEventListener?.("change", callback);
  return () => mq.removeEventListener?.("change", callback);
}

function mediaSnapshot(): boolean {
  try {
    return window.matchMedia?.(REDUCED_QUERY).matches ?? false;
  } catch {
    return false;
  }
}

function usePrefersReducedMotion(): boolean {
  const { motion } = useTheme();
  const mediaReduced = useSyncExternalStore(subscribeMedia, mediaSnapshot, () => false);
  // The app's own motion toggle (OFF => reduced) OR the OS preference.
  return !motion || mediaReduced;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const toursRef = useRef<Map<string, TourStep[]>>(new Map());
  const currentKeyRef = useRef<string | null>(null);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [activeSteps, setActiveSteps] = useState<TourStep[] | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const registerTour = useCallback((key: string, steps: TourStep[]) => {
    toursRef.current.set(key, steps);
    currentKeyRef.current = key;
    setCurrentKey(key);
  }, []);

  const startTour = useCallback((key: string) => {
    const steps = toursRef.current.get(key);
    if (steps && steps.length > 0) setActiveSteps(steps);
  }, []);

  const startCurrentTour = useCallback(() => {
    const key = currentKeyRef.current;
    if (!key) return;
    const steps = toursRef.current.get(key);
    if (steps && steps.length > 0) setActiveSteps(steps);
  }, []);

  const closeTour = useCallback(() => setActiveSteps(null), []);

  const value = useMemo<TourContextValue>(
    () => ({
      registerTour,
      startTour,
      startCurrentTour,
      hasCurrentTour: currentKey !== null,
    }),
    [registerTour, startTour, startCurrentTour, currentKey],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      {activeSteps && (
        <SpotlightTour steps={activeSteps} onClose={closeTour} reducedMotion={reducedMotion} />
      )}
    </TourContext.Provider>
  );
}
