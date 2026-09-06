// Data-driven tour + tooltip kit types.

export interface TourStep {
  /** id of the element to highlight (document.getElementById). */
  targetId: string;
  title: string;
  explanation: string;
  /** Preferred coachmark placement relative to the target. */
  placement?: "top" | "bottom" | "auto";
}

export interface TourContextValue {
  /** A mounted screen registers its tour; the most recent registration is "current". */
  registerTour: (key: string, steps: TourStep[]) => void;
  /** Start a specific registered tour by key. */
  startTour: (key: string) => void;
  /** Start whichever tour the current screen registered (help button / palette). */
  startCurrentTour: () => void;
  /** True when a tour is available to run (used to show the help affordances). */
  hasCurrentTour: boolean;
}
