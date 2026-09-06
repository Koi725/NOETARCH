// Data-driven tour definitions per panel. Each step targets an element by id and carries
// plain-language { title, explanation } copy. Keep these as module constants so their
// reference is stable across renders.
import type { TourStep } from "./tour-types";

export const TODAY_TOUR_KEY = "today";
export const TODAY_TOUR_STEPS: TourStep[] = [
  {
    targetId: "today-waiting",
    title: "Things waiting on you",
    explanation:
      "Anything that needs your decision before it runs shows up here first — nothing leaves your device until you approve it.",
  },
  {
    targetId: "today-run",
    title: "What's happening now",
    explanation:
      "The active run and its progress. Click it any time to watch each step live.",
  },
  {
    targetId: "today-sources",
    title: "Where your data comes from",
    explanation:
      "Live status of each source. If one is down, runs wait in line — they don't fail.",
  },
];

export const LIVE_RUN_TOUR_KEY = "live-run";
export const LIVE_RUN_TOUR_STEPS: TourStep[] = [
  {
    targetId: "live-run-steps",
    title: "The workflow, step by step",
    explanation:
      "Every step the run goes through. The current one is highlighted; finished ones are checked off.",
  },
  {
    targetId: "live-run-decisions",
    title: "Decisions the run needs",
    explanation:
      "When a step needs your approval — like sending data to the cloud — it pauses and asks here.",
  },
  {
    targetId: "live-run-ledger",
    title: "A clear record of events",
    explanation:
      "Verified system facts and clearly-labelled model notes, newest first — your audit trail for the run.",
  },
];

export const DECISIONS_TOUR_KEY = "decisions";
export const DECISIONS_TOUR_STEPS: TourStep[] = [
  {
    targetId: "decisions-pending",
    title: "Approve before anything runs",
    explanation:
      "Each card shows the cost, whether it's reversible, and what data is involved. Nothing happens until you choose.",
  },
  {
    targetId: "decisions-first-actions",
    title: "Your choices are recorded",
    explanation:
      "Approve, reject, or use a local alternative. When connected, every choice is saved with an audit trail.",
  },
];

export const EVIDENCE_TOUR_KEY = "evidence";
export const EVIDENCE_TOUR_STEPS: TourStep[] = [
  {
    targetId: "evidence-external-search",
    title: "Fetch new papers",
    explanation:
      "Search an external source (OpenAlex) to pull in new records. Fetched papers are frozen with their source and time for reproducibility.",
  },
  {
    targetId: "evidence-filters",
    title: "Focus the list",
    explanation:
      "Filter by verification status — checked, conflicting, cannot-check, or missing DOI.",
  },
  {
    targetId: "evidence-list",
    title: "Every record, with provenance",
    explanation:
      "Open any record to see its source verification and full provenance trail.",
  },
];
