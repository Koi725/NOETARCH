export interface GalleryStateEntry {
  id: string;
  title: string;
  description: string;
}

export const galleryStates: GalleryStateEntry[] = [
  {
    id: "loading",
    title: "Loading",
    description: "Progress bar in indeterminate mode with skeleton placeholder rows",
  },
  {
    id: "empty",
    title: "Empty",
    description: "A research library with zero records",
  },
  {
    id: "offline",
    title: "Offline",
    description: "Semantic Scholar showing offline / unavailable status",
  },
  {
    id: "source-failure",
    title: "Source failure",
    description: "A source returning an unrecoverable error status",
  },
  {
    id: "partial-results",
    title: "Partial results",
    description: "Run completed but with one source gap noted",
  },
  {
    id: "permission-denied",
    title: "Permission denied",
    description: "A cloud step blocked, waiting for user approval",
  },
  {
    id: "waiting-approval",
    title: "Waiting for approval",
    description: "Decision card pending action from the user",
  },
  {
    id: "budget-exhausted",
    title: "Budget exhausted",
    description: "Daily spending limit reached — all cloud steps blocked",
  },
  {
    id: "rate-limited",
    title: "Rate limited",
    description: "A source returned HTTP 429 Too Many Requests",
  },
  {
    id: "conflicting-evidence",
    title: "Conflicting evidence",
    description: "Two sources disagree on metadata for the same record",
  },
  {
    id: "missing-doi",
    title: "Missing DOI",
    description: "An evidence record without a DOI identifier",
  },
  {
    id: "long-title",
    title: "Long-title overflow",
    description: "A paper with a title exceeding 200 characters",
  },
  {
    id: "large-count",
    title: "Large record counts",
    description: "Evidence list showing 12,847 records",
  },
  {
    id: "reduced-motion",
    title: "Reduced motion",
    description: "Visual representation of the animations-disabled state",
  },
  {
    id: "narrow-viewport",
    title: "Narrow viewport",
    description: "Layout note for mobile screens at ≤ 390 px",
  },
];

export const LONG_TITLE_EXAMPLE =
  "Longitudinal trajectories of subjective well-being and burnout in knowledge-intensive firms during enforced hybrid and remote work transitions: a multi-wave panel study with structural equation modelling across seven European countries (2019–2023)";

export const CONFLICTING_DOI = "10.1016/j.jbusres.2023.114422";

export const CONFLICT_RECORD = {
  title: "Remote work and knowledge worker productivity",
  sources: [
    { name: "OpenAlex", year: 2023, citationCount: 148 },
    { name: "Semantic Scholar", year: 2022, citationCount: 312 },
  ],
  conflict: "Year and citation count differ between sources",
};
