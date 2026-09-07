import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TodayOverview } from "@/components/TodayOverview";
import { LiveRun } from "@/components/LiveRun";
import { GuidedReview } from "@/components/GuidedReview";

// Empty payloads mirror the backend `.empty()` shapes returned in real mode
// (NOETARCH_SEED_DEMO=false, unseeded DB). Each screen must render an intentional
// empty state — not a skeleton, not a crash — when the service resolves these.

const EMPTY_TODAY = {
  project: "",
  question: "",
  waiting: { title: "", detail: "", next: "" },
  run: { title: "", meta: "", current: "", progress: 0, kpis: [] },
  failure: { title: "", body: "" },
  finished: [],
  sources: [],
  files: [],
};

const EMPTY_LIVE_RUN = {
  meta: { runId: "", title: "", started: "", elapsed: "" },
  steps: [],
  stepInspector: {
    stepIndex: 0,
    label: "",
    method: "",
    locality: "",
    status: "",
    input: "",
    outputSoFar: "",
  },
  kpis: [],
  events: [],
  decisions: [],
  evidenceCards: [],
};

const EMPTY_GUIDED_REVIEW = {
  project: "",
  progress: { reviewed: 0, total: 0, remaining: 0 },
  currentPaper: {
    id: "",
    index: 0,
    title: "",
    authors: "",
    year: 0,
    journal: "",
    doi: "",
    abstract: "",
    initialStatus: null,
    initialStatusNote: null,
  },
  nextPapers: [],
  excludeReasons: [],
  previousDecisions: [],
};

function stubEmptyFetch(payload: unknown) {
  vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => payload }),
  );
}

describe("Real/empty mode — screens render an intentional empty state, not a skeleton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("TodayOverview shows the empty workspace state", async () => {
    stubEmptyFetch(EMPTY_TODAY);
    render(
      <ThemeProvider>
        <TodayOverview />
      </ThemeProvider>,
    );
    expect(await screen.findByText(/No runs yet\./i)).toBeInTheDocument();
    // The loading skeleton is gone once ready.
    await waitFor(() =>
      expect(
        screen.queryByRole("status", { name: "Loading today's workspace" }),
      ).not.toBeInTheDocument(),
    );
  });

  test("LiveRun shows the no-active-run empty state", async () => {
    stubEmptyFetch(EMPTY_LIVE_RUN);
    render(
      <ThemeProvider>
        <LiveRun />
      </ThemeProvider>,
    );
    expect(await screen.findByRole("heading", { name: "No run is active" })).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("status", { name: "Loading the active run" }),
      ).not.toBeInTheDocument(),
    );
  });

  test("GuidedReview shows the empty review-queue state", async () => {
    stubEmptyFetch(EMPTY_GUIDED_REVIEW);
    render(
      <ThemeProvider>
        <GuidedReview />
      </ThemeProvider>,
    );
    expect(
      await screen.findByRole("heading", { name: "No papers to review yet" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("status", { name: "Loading the review" }),
      ).not.toBeInTheDocument(),
    );
  });
});
