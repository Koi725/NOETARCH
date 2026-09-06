import type {
  RunStep,
  RunKPI,
  RunEvent,
  RunDecision,
  EvidenceCard,
  CurrentStepInspector,
} from "@/components/LiveRun/LiveRun_types";

export const liveRunMeta = {
  runId: "0f3a·91",
  title: "Human-Centric Industry 5.0 Evidence Review",
  started: "14:02",
  elapsed: "8 min 12 s",
} as const;

export const liveRunSteps: RunStep[] = [
  { index: 1, label: "Search planning", state: "done" },
  { index: 2, label: "OpenAlex query", state: "done" },
  { index: 3, label: "Crossref enrichment", state: "done" },
  {
    index: 4,
    label: "Deduplication",
    state: "partial",
    note: "118 of 214 processed before Semantic Scholar failed",
  },
  { index: 5, label: "Semantic Scholar query", state: "running" },
  { index: 6, label: "Abstract screening", state: "waiting" },
  { index: 7, label: "Full-text retrieval", state: "queued" },
  { index: 8, label: "Evidence scoring", state: "queued" },
  { index: 9, label: "Export", state: "queued" },
];

export const currentStepInspector: CurrentStepInspector = {
  stepIndex: 5,
  label: "Semantic Scholar query",
  method: "Semantic Scholar API",
  locality: "cloud · external",
  status: "3rd attempt · timeout 12 s",
  input: "214 paper DOIs",
  outputSoFar: "0 of 214 enriched",
};

export const liveRunKPIs: RunKPI[] = [
  { label: "Papers", value: "214" },
  { label: "Comparisons", value: "47" },
  { label: "Spent", value: "$0.41" },
  { label: "Retries", value: "3", tone: "warn" },
];

export const liveRunEvents: RunEvent[] = [
  {
    id: "evt-1",
    time: "14:10:12",
    message: "Step 5 retry 3 started",
    kind: "system",
  },
  {
    id: "evt-2",
    time: "14:09:58",
    message:
      "Semantic Scholar often throttles batch DOI requests over 200 items — consider splitting",
    kind: "model",
  },
  {
    id: "evt-3",
    time: "14:09:45",
    message: "Step 5 retry 2 timed out after 12 s",
    kind: "system",
  },
  {
    id: "evt-4",
    time: "14:09:30",
    message: "Step 5 retry 1 timed out after 12 s",
    kind: "system",
  },
  {
    id: "evt-5",
    time: "14:09:15",
    message: "Step 4 complete: 24 duplicates removed, 190 unique papers",
    kind: "system",
  },
  {
    id: "evt-6",
    time: "14:08:42",
    message:
      "Duplicate rate 11.2% is within normal range for multi-source literature search",
    kind: "model",
  },
  {
    id: "evt-7",
    time: "14:08:00",
    message: "Step 3 complete: 96 of 100 papers enriched via Crossref",
    kind: "system",
  },
  {
    id: "evt-8",
    time: "14:07:30",
    message: "Step 2 complete: 214 papers found via OpenAlex",
    kind: "system",
  },
];

export const liveRunDecisions: RunDecision[] = [
  {
    id: "dec-1",
    description:
      "Send 190 unique DOIs to Semantic Scholar — cloud, $0.00 estimated, reversible",
    kind: "pending",
  },
];

export const liveRunEvidenceCards: EvidenceCard[] = [
  {
    id: "ev-1",
    title:
      "Worker well-being in Industry 5.0: A systematic review",
    doi: "10.1016/j.techsoc.2023.102089",
    source: "OpenAlex",
    verifiedBy: "OpenAlex",
  },
  {
    id: "ev-2",
    title: "Human-robot collaboration and job satisfaction",
    doi: "10.3390/su14031234",
    source: "Crossref",
    verifiedBy: "Crossref",
  },
];
