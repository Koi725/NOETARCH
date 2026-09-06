// Data-driven tour definitions per panel. Variable length: each meaningful section of a
// screen is its own step with a real plain-language explanation. Target elements by id.
// Keep these as module constants so their reference is stable across renders.
import type { TourStep } from "./tour-types";

export const TODAY_TOUR_KEY = "today";
export const TODAY_TOUR_STEPS: TourStep[] = [
  {
    targetId: "today-waiting",
    title: "Things waiting on you",
    explanation:
      "Anything that needs your decision before it runs shows up here first. Nothing leaves your device until you approve it.",
  },
  {
    targetId: "today-run",
    title: "What's happening now",
    explanation:
      "The active run and its progress bar. Click it any time to watch each step live.",
  },
  {
    targetId: "today-failure",
    title: "When a source stumbles",
    explanation:
      "If a source fails, the run keeps the work it already did and carries on — the gap is written into your export, not hidden.",
  },
  {
    targetId: "today-sources",
    title: "Where your data comes from",
    explanation:
      "Live status of each source. If one is down, runs that need it wait in line — they don't fail.",
  },
  {
    targetId: "today-files",
    title: "Files made today",
    explanation:
      "Everything produced today, including files still waiting on a decision from you.",
  },
  {
    targetId: "today-data-location",
    title: "Your data stays put",
    explanation:
      "Everything lives in your workspace folder. The only thing that ever leaves is what you approve.",
  },
];

export const LIVE_RUN_TOUR_KEY = "live-run";
export const LIVE_RUN_TOUR_STEPS: TourStep[] = [
  {
    targetId: "live-run-kpis",
    title: "The numbers that matter",
    explanation:
      "Papers found, comparisons made, money spent, and retries — updated as the run works. Retries are flagged so surprises are visible.",
  },
  {
    targetId: "live-run-steps",
    title: "The workflow, step by step",
    explanation:
      "All nine steps of the run. The current one is highlighted; finished ones are checked off; upcoming ones are queued.",
  },
  {
    targetId: "live-run-inspector",
    title: "Inside the current step",
    explanation:
      "Exactly what this step is doing right now — the method, whether it's local or cloud, its status, and its inputs and outputs so far.",
  },
  {
    targetId: "live-run-decisions",
    title: "Decisions the run needs",
    explanation:
      "When a step needs your approval — like sending data to the cloud — it pauses and asks here.",
  },
  {
    targetId: "live-run-evidence",
    title: "Evidence as it's found",
    explanation:
      "Verified papers appear here with their DOI and which source confirmed them.",
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
      "Each card shows the cost, whether it's reversible, and exactly what data is involved. Nothing happens until you choose.",
  },
  {
    targetId: "decisions-first-actions",
    title: "Your three choices",
    explanation:
      "Approve once, use a local alternative, or reject. There's no pre-selected option — the decision is always yours.",
  },
  {
    targetId: "decisions-explain",
    title: "What approving really does",
    explanation:
      "Approving records your intent with an audit trail. It does not yet trigger the underlying action — that's a separately-reviewed step.",
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
    targetId: "evidence-search",
    title: "Find within your set",
    explanation:
      "Filter the records you already have by title, author, journal, or DOI.",
  },
  {
    targetId: "evidence-filters",
    title: "Filter by verification status",
    explanation:
      "Checked means sources agree. Conflicting means they disagree. Cannot-check means there was no DOI to verify against. Missing-DOI isolates records with no identifier.",
  },
  {
    targetId: "evidence-list",
    title: "Every record, with provenance",
    explanation:
      "Each row shows its status and which sources (O, C, S) were checked. Open a record to see the full source-verification table and provenance trail — including where and when it was fetched.",
  },
];

export const GUIDED_REVIEW_TOUR_KEY = "guided-review";
export const GUIDED_REVIEW_TOUR_STEPS: TourStep[] = [
  {
    targetId: "gr-progress",
    title: "How far you've come",
    explanation: "Your progress through the set, and how many papers remain.",
  },
  {
    targetId: "gr-paper",
    title: "One paper at a time",
    explanation:
      "The title, authors, journal, DOI, and abstract for the paper in front of you. Papers flagged for human review say why.",
  },
  {
    targetId: "gr-decision",
    title: "Include, exclude, or set aside",
    explanation:
      "Choose a decision — and for exclusions, the reason(s). Keyboard shortcuts make this fast: I, E, U, H.",
  },
  {
    targetId: "gr-history",
    title: "Undo anything",
    explanation: "Your recent decisions, with a one-press undo if you change your mind.",
  },
];

export const RECIPES_TOUR_KEY = "recipes";
export const RECIPES_TOUR_STEPS: TourStep[] = [
  {
    targetId: "recipes-header",
    title: "Reusable workflows",
    explanation:
      "Each recipe is a saved workflow. The badge shows whether it runs locally or in the cloud.",
  },
  {
    targetId: "recipes-grid",
    title: "Open one to see inside",
    explanation:
      "Expand a recipe to see its steps, inputs, outputs, estimated cost and time, providers, and privacy policy.",
  },
];

export const HISTORY_TOUR_KEY = "history";
export const HISTORY_TOUR_STEPS: TourStep[] = [
  {
    targetId: "history-filters",
    title: "Filter your runs",
    explanation:
      "Show all runs or narrow to complete, running, interrupted, or failed.",
  },
  {
    targetId: "history-list",
    title: "Every run, explained",
    explanation:
      "Each row shows status, recipe, timing, cost, and papers. Interrupted and failed runs say exactly why. Select two to compare them side by side.",
  },
];

export const MODELS_POLICY_TOUR_KEY = "models-policy";
export const MODELS_POLICY_TOUR_STEPS: TourStep[] = [
  {
    targetId: "policy-credentials",
    title: "Keys live in your shell",
    explanation:
      "API credentials are never entered or stored here — NOETARCH reads them from your environment at startup.",
  },
  {
    targetId: "policy-providers",
    title: "Control every provider",
    explanation:
      "Enable or disable each provider, set a daily cost limit, choose task-routing preference, and require approval before use. Cloud providers show their data-egress policy plainly.",
  },
  {
    targetId: "policy-routing",
    title: "How routing works",
    explanation:
      "Prefer, prefer-with-local-fallback, allow, or disabled — this decides which provider a task goes to first.",
  },
];

export const FIRST_RUN_TOUR_KEY = "first-run";
export const FIRST_RUN_TOUR_STEPS: TourStep[] = [
  {
    targetId: "first-run-steps",
    title: "A guided setup",
    explanation:
      "A few short steps to set your workspace, research question, sources, and spending limit before your first real run.",
  },
];
