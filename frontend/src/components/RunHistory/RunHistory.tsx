"use client";

import { useState, useEffect, useId } from "react";
import { Play, Check, Square, X, CircleDot } from "lucide-react";
import { fetchRuns } from "@/services/HistoryService";
import type {
  Run,
  RunHistoryProps,
  FilterTab,
  RunStatus,
} from "./RunHistory_types";
import { useScreenTour, HistorySkeleton, HISTORY_TOUR_KEY, HISTORY_TOUR_STEPS } from "@/components/ui";
import "@/tailwind/components/RunHistory/RunHistory.css";

function RunStatusGlyph({ status }: { status: RunStatus }) {
  const props = { size: 15, strokeWidth: 2, "aria-hidden": true } as const;
  if (status === "running") return <Play {...props} />;
  if (status === "complete") return <Check {...props} />;
  if (status === "interrupted") return <Square {...props} />;
  if (status === "failed") return <X {...props} />;
  return <CircleDot {...props} />;
}

const STATUS_LABEL: Record<RunStatus, string> = {
  running: "Running",
  complete: "Complete",
  interrupted: "Interrupted",
  failed: "Failed",
  partial: "Partial",
};

const FILTER_LABELS: Record<FilterTab, string> = {
  all: "All",
  complete: "Complete",
  running: "Running",
  interrupted: "Interrupted",
  failed: "Failed",
};

const FILTER_TABS: FilterTab[] = ["all", "complete", "running", "interrupted", "failed"];

function matchesFilter(run: Run, filter: FilterTab): boolean {
  if (filter === "all") return true;
  if (filter === "failed") return run.status === "failed" || run.status === "partial";
  return run.status === filter;
}

function ComparisonPanel({ runA, runB }: { runA: Run; runB: Run }) {
  return (
    <aside className="no-run-compare-panel" aria-label="Run comparison">
      <h2 className="no-run-compare-title">Comparing 2 runs</h2>
      <table className="no-run-compare-table">
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">
              <span className="no-run-id">{runA.id}</span>
            </th>
            <th scope="col">
              <span className="no-run-id">{runB.id}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Status</td>
            <td>{STATUS_LABEL[runA.status]}</td>
            <td>{STATUS_LABEL[runB.status]}</td>
          </tr>
          <tr>
            <td>Papers</td>
            <td>{runA.papers}</td>
            <td>{runB.papers}</td>
          </tr>
          <tr>
            <td>Cost</td>
            <td>{runA.cost}</td>
            <td>{runB.cost}</td>
          </tr>
          <tr>
            <td>Duration</td>
            <td>{runA.duration}</td>
            <td>{runB.duration}</td>
          </tr>
          <tr>
            <td>Recipe</td>
            <td>{runA.recipe}</td>
            <td>{runB.recipe}</td>
          </tr>
          <tr>
            <td>Providers</td>
            <td>{runA.providers.join(", ")}</td>
            <td>{runB.providers.join(", ")}</td>
          </tr>
        </tbody>
      </table>
    </aside>
  );
}

function RunRow({
  run,
  isSelected,
  onSelect,
  canSelect,
}: {
  run: Run;
  isSelected: boolean;
  onSelect: () => void;
  canSelect: boolean;
}) {
  const detailsId = useId();
  const [replayState, setReplayState] = useState<"idle" | "confirming" | "started">("idle");

  const handleReplayClick = () => {
    if (replayState === "idle") setReplayState("confirming");
  };
  const handleConfirmReplay = () => {
    setReplayState("started");
    setTimeout(() => setReplayState("idle"), 4000);
  };
  const handleCancelReplay = () => setReplayState("idle");

  const selectDisabled = !canSelect && !isSelected;

  return (
    <li className={`no-run-row no-run-row--${run.status}`}>
      <div className="no-run-row__main">
        <div className="no-run-row__select">
          <input
            type="checkbox"
            id={`select-${run.id}`}
            checked={isSelected}
            onChange={onSelect}
            disabled={selectDisabled}
            aria-label={`Select run ${run.id} for comparison`}
            className="no-run-checkbox"
          />
        </div>

        <span
          className={`no-run-status-icon no-run-status-icon--${run.status}`}
          aria-label={STATUS_LABEL[run.status]}
          role="img"
        >
          <RunStatusGlyph status={run.status} />
        </span>

        <div className="no-run-row__info">
          <div className="no-run-row__top">
            <span className="no-run-title">{run.title}</span>
            <span className="no-run-id" aria-label={`Run ID: ${run.id}`}>
              {run.id}
            </span>
          </div>
          <div className="no-run-row__meta">
            <span className="no-run-recipe">{run.recipe}</span>
            <span className="no-run-started">{run.started}</span>
            <span aria-label={`Duration: ${run.duration}`}>{run.duration}</span>
            <span aria-label={`Cost: ${run.cost}`}>{run.cost}</span>
            <span aria-label={`${run.papers} papers`}>{run.papers} papers</span>
          </div>
          {(run.notes || run.stopReason || run.failureReason) && (
            <div id={detailsId} className="no-run-row__note">
              {run.notes ?? run.stopReason ?? run.failureReason}
            </div>
          )}
          <div className="no-run-row__providers">
            {run.providers.map((p) => (
              <span key={p} className="no-run-provider-tag">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="no-run-row__actions">
          {run.status !== "running" && (
            <>
              {replayState === "idle" && (
                <button
                  type="button"
                  className="no-run-action-btn"
                  onClick={handleReplayClick}
                  aria-label={`Replay run ${run.id}`}
                >
                  Replay
                </button>
              )}
              {replayState === "confirming" && (
                <div className="no-run-replay-confirm" role="group" aria-label="Confirm replay">
                  <p className="no-run-replay-note">
                    Replay will create a new run with the same recipe and parameters.
                  </p>
                  <button
                    type="button"
                    className="no-run-action-btn no-run-action-btn--primary"
                    onClick={handleConfirmReplay}
                  >
                    Start replay (simulated)
                  </button>
                  <button
                    type="button"
                    className="no-run-action-btn"
                    onClick={handleCancelReplay}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {replayState === "started" && (
                <div role="status" aria-live="polite" className="no-run-replay-started">
                  Replay started (simulated)
                </div>
              )}
            </>
          )}
          <button
            type="button"
            className="no-run-action-btn"
            disabled
            aria-disabled="true"
            aria-label="Export evidence (export only — no backend)"
          >
            Evidence <span className="no-run-export-note">(export only)</span>
          </button>
        </div>
      </div>
    </li>
  );
}

export function RunHistory({ runs: runsProp }: RunHistoryProps) {
  useScreenTour(HISTORY_TOUR_KEY, HISTORY_TOUR_STEPS);
  const [runs, setRuns] = useState<Run[] | null>(runsProp ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (runsProp) return;
    let cancelled = false;
    fetchRuns()
      .then((data) => {
        if (!cancelled) setRuns(data as Run[]);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load run history.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [runsProp]);

  if (error) {
    return (
      <main className="no-run-history" aria-label="Run history">
        <div role="alert" className="no-run-error">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!runs) {
    return (
      <main className="no-run-history" aria-label="Run history">
        <div role="status" aria-label="Loading run history">
          <HistorySkeleton />
        </div>
      </main>
    );
  }

  return <RunHistoryView runs={runs} />;
}

function RunHistoryView({ runs }: { runs: Run[] }) {
  const effectiveRuns = runs;
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = effectiveRuns.filter((r) => matchesFilter(r, activeFilter));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const compareRuns: [Run, Run] | null =
    selectedIds.length === 2
      ? (() => {
          const a = effectiveRuns.find((r) => r.id === selectedIds[0]);
          const b = effectiveRuns.find((r) => r.id === selectedIds[1]);
          return a && b ? [a, b] : null;
        })()
      : null;

  return (
    <main className="no-run-history" aria-label="Run history">
      <header className="no-page-header">
        <h1 className="no-page-title">History & replay · recent runs</h1>
        <p className="no-prototype-notice" role="note">
          Simulated · no backend
        </p>
      </header>

      <div
        id="history-filters"
        className="no-run-filter-tabs"
        role="tablist"
        aria-label="Filter runs by status"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            type="button"
            className={`no-run-filter-tab${activeFilter === tab ? " is-active" : ""}`}
            aria-selected={activeFilter === tab}
            onClick={() => setActiveFilter(tab)}
          >
            {FILTER_LABELS[tab]}
          </button>
        ))}
      </div>

      {selectedIds.length > 0 && selectedIds.length < 2 && (
        <p className="no-run-select-hint" role="status" aria-live="polite">
          Select one more run to compare (max 2)
        </p>
      )}
      {selectedIds.length === 2 && (
        <p className="no-run-select-hint" role="status" aria-live="polite">
          2 runs selected · comparison shown below
        </p>
      )}

      <ul id="history-list" className="no-run-list" role="list" aria-label="Run list">
        {filtered.map((run) => (
          <RunRow
            key={run.id}
            run={run}
            isSelected={selectedIds.includes(run.id)}
            onSelect={() => toggleSelect(run.id)}
            canSelect={selectedIds.length < 2 || selectedIds.includes(run.id)}
          />
        ))}
        {filtered.length === 0 && (
          <li className="no-run-empty">No runs match this filter.</li>
        )}
      </ul>

      {compareRuns && compareRuns.length === 2 && (
        <ComparisonPanel runA={compareRuns[0] as Run} runB={compareRuns[1] as Run} />
      )}
    </main>
  );
}
