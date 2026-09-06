"use client";

import { useState, useCallback, useEffect, useId } from "react";
import {
  guidedReviewProject,
  reviewProgress,
  currentPaper,
  nextPapers,
  excludeReasons,
  previousDecisions,
} from "@/data/GuidedReview/GuidedReview-data";
import type {
  Decision,
  HistoryEntry,
  ReviewPaper,
} from "./GuidedReview_types";
import "@/tailwind/components/GuidedReview/GuidedReview.css";

function decisionLabel(d: Exclude<Decision, null>): string {
  if (d === "include") return "Include";
  if (d === "exclude") return "Exclude";
  if (d === "uncertain") return "Uncertain";
  return "Needs human review";
}

function decisionTone(d: Exclude<Decision, null>): string {
  if (d === "include") return "ok";
  if (d === "exclude") return "bad";
  if (d === "uncertain") return "warn";
  return "violet";
}

type ReviewState = {
  paper: ReviewPaper;
  decision: Decision;
  selectedReasons: string[];
  confirmed: boolean;
  reviewedCount: number;
  history: HistoryEntry[];
  nextPaperIndex: number;
};

export function GuidedReview() {
  const abstractId = useId();
  const doiId = useId();

  const [state, setState] = useState<ReviewState>({
    paper: currentPaper,
    decision: null,
    selectedReasons: [],
    confirmed: false,
    reviewedCount: reviewProgress.reviewed,
    history: previousDecisions,
    nextPaperIndex: 0,
  });

  const [showKeyHints, setShowKeyHints] = useState(false);

  const setDecision = useCallback((d: Decision) => {
    setState((s) => ({ ...s, decision: d, selectedReasons: [], confirmed: false }));
  }, []);

  const toggleReason = useCallback((label: string) => {
    setState((s) => ({
      ...s,
      selectedReasons: s.selectedReasons.includes(label)
        ? s.selectedReasons.filter((r) => r !== label)
        : [...s.selectedReasons, label],
    }));
  }, []);

  const confirm = useCallback(() => {
    setState((s) => {
      if (!s.decision) return s;
      const entry: HistoryEntry = {
        id: `hist-new-${Date.now()}`,
        paperTitle: s.paper.title.slice(0, 60) + (s.paper.title.length > 60 ? "…" : ""),
        decision: s.decision as Exclude<Decision, null>,
        reasons: s.selectedReasons,
      };
      const newHistory = [entry, ...s.history].slice(0, 3);
      const safeIndex = s.nextPaperIndex % nextPapers.length;
      const nextPaper = nextPapers[safeIndex] ?? s.paper;
      return {
        ...s,
        paper: nextPaper,
        decision: null,
        selectedReasons: [],
        confirmed: false,
        reviewedCount: s.reviewedCount + 1,
        history: newHistory,
        nextPaperIndex: (s.nextPaperIndex + 1) % nextPapers.length,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((s) => {
      if (s.history.length === 0) return s;
      const [, ...rest] = s.history;
      return {
        ...s,
        history: rest,
        reviewedCount: Math.max(reviewProgress.reviewed, s.reviewedCount - 1),
        paper: currentPaper,
        decision: null,
        selectedReasons: [],
        confirmed: false,
      };
    });
  }, []);

  // Keyboard bindings
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "i" || e.key === "I") { setDecision("include"); return; }
      if (e.key === "e" || e.key === "E") { setDecision("exclude"); return; }
      if (e.key === "u" || e.key === "U") { setDecision("uncertain"); return; }
      if (e.key === "h" || e.key === "H") { setDecision("needs-human-review"); return; }
      if (e.key === "z" || e.key === "Z") { undo(); return; }
      if (e.key === "?") { setShowKeyHints((v) => !v); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDecision, undo]);

  const { paper, decision, selectedReasons, reviewedCount, history } = state;

  const remaining = reviewProgress.total - reviewedCount;
  const progressPct = Math.round((reviewedCount / reviewProgress.total) * 100);

  const showReasons = decision === "exclude";
  const showConfirm = decision !== null && decision !== "needs-human-review";

  return (
    <div className="no-gr-page">
      {/* Top bar */}
      <div className="no-gr-topbar">
        <div className="no-gr-topbar-left">
          <div className="no-eyebrow no-gr-eyebrow">{guidedReviewProject}</div>
          <h1 className="no-gr-title">Guided abstract review</h1>
        </div>
        <div className="no-gr-topbar-right">
          <button
            type="button"
            className="no-secondary-button no-gr-key-btn"
            onClick={() => setShowKeyHints((v) => !v)}
            aria-pressed={showKeyHints}
            aria-expanded={showKeyHints}
            aria-label="Toggle keyboard shortcuts panel"
          >
            Keyboard shortcuts
          </button>
          <div className="no-prototype-notice" role="note">Prototype · Mock data</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="no-gr-progress-band" role="region" aria-label="Review progress">
        <div
          className="no-gr-progress-track"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${reviewedCount} of ${reviewProgress.total} papers reviewed`}
        >
          <span className="no-gr-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div
          className="no-gr-progress-label"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {reviewedCount} of {reviewProgress.total} · {remaining} remaining
        </div>
      </div>

      {/* Keyboard hints panel */}
      {showKeyHints && (
        <div className="no-gr-key-panel" role="region" aria-label="Keyboard shortcuts">
          <div className="no-gr-key-row"><kbd>I</kbd> Include</div>
          <div className="no-gr-key-row"><kbd>E</kbd> Exclude</div>
          <div className="no-gr-key-row"><kbd>U</kbd> Uncertain</div>
          <div className="no-gr-key-row"><kbd>H</kbd> Needs human review</div>
          <div className="no-gr-key-row"><kbd>Z</kbd> Undo last decision</div>
          <div className="no-gr-key-row"><kbd>?</kbd> Toggle this panel</div>
        </div>
      )}

      {/* Body */}
      <div className="no-gr-body">
        {/* Left: paper details */}
        <div className="no-gr-paper-col">
          <div className="no-gr-paper-index" aria-label={`Paper ${paper.index} of ${reviewProgress.total}`}>
            Paper {paper.index} of {reviewProgress.total}
          </div>

          {paper.initialStatus === "needs-human-review" && paper.initialStatusNote && (
            <p className="no-gr-flag-note" role="note">{paper.initialStatusNote}</p>
          )}

          <h2 className="no-gr-paper-title">{paper.title}</h2>
          <p className="no-gr-paper-authors">{paper.authors}</p>
          <p className="no-gr-paper-meta">
            {paper.year} · <span>{paper.journal}</span>
          </p>
          <p className="no-gr-paper-doi" id={doiId}>
            <span className="no-gr-doi-label">DOI</span>
            <span className="no-gr-doi-value">{paper.doi}</span>
          </p>

          <section aria-labelledby={abstractId} className="no-gr-abstract-section">
            <h3 id={abstractId} className="no-gr-abstract-label">Abstract</h3>
            <p className="no-gr-abstract">{paper.abstract}</p>
          </section>
        </div>

        {/* Right: decision panel */}
        <div className="no-gr-decision-col">
          <div className="no-gr-decision-panel">
            <div className="no-gr-decision-heading">Your decision</div>

            <div className="no-gr-decision-buttons" role="group" aria-label="Decision options">
              {(["include", "exclude", "uncertain", "needs-human-review"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`no-gr-decision-btn is-${d}${decision === d ? " is-selected" : ""}`}
                  onClick={() => setDecision(d)}
                  aria-pressed={decision === d}
                  aria-label={decisionLabel(d)}
                >
                  <span className="no-gr-decision-icon" aria-hidden="true">
                    {d === "include" ? "✓" : d === "exclude" ? "✕" : d === "uncertain" ? "?" : "H"}
                  </span>
                  {decisionLabel(d)}
                </button>
              ))}
            </div>

            {/* Exclusion reasons */}
            {showReasons && (
              <fieldset className="no-gr-reasons-fieldset" aria-label="Exclusion reasons (select all that apply)">
                <legend className="no-gr-reasons-legend">
                  Reason(s) for exclusion
                </legend>
                {excludeReasons.map((r) => {
                  const checked = selectedReasons.includes(r.label);
                  return (
                    <label key={r.id} className={`no-gr-reason-label${checked ? " is-checked" : ""}`}>
                      <input
                        type="checkbox"
                        className="no-gr-reason-check"
                        checked={checked}
                        onChange={() => toggleReason(r.label)}
                        aria-label={r.label}
                      />
                      {r.label}
                    </label>
                  );
                })}
              </fieldset>
            )}

            {/* Decision context text */}
            {decision === "uncertain" && (
              <p className="no-gr-decision-note is-warn">
                Paper will be set aside for a second pass or manual review.
              </p>
            )}
            {decision === "needs-human-review" && (
              <p className="no-gr-decision-note is-violet">
                Paper queued for a human reviewer. No further automated processing.
              </p>
            )}

            {/* Confirm */}
            {showConfirm && (
              <button
                type="button"
                className={`no-gr-confirm-btn is-${decisionTone(decision as Exclude<Decision, null>)}`}
                onClick={confirm}
                aria-label={`Confirm decision: ${decisionLabel(decision as Exclude<Decision, null>)}`}
              >
                Confirm: {decisionLabel(decision as Exclude<Decision, null>)}
              </button>
            )}
          </div>

          {/* Undo + History */}
          <div className="no-gr-history-panel">
            <div className="no-gr-history-heading">
              Recent decisions
              <button
                type="button"
                className="no-gr-undo-btn"
                onClick={undo}
                disabled={history.length === 0}
                aria-label="Undo last decision"
              >
                Undo
              </button>
            </div>
            {history.length === 0 ? (
              <p className="no-gr-history-empty">No decisions to undo.</p>
            ) : (
              <ol className="no-gr-history-list" aria-label="Decision history">
                {history.map((h) => (
                  <li key={h.id} className="no-gr-history-row">
                    <span className={`no-gr-history-badge is-${decisionTone(h.decision)}`}>
                      {decisionLabel(h.decision)}
                    </span>
                    <span className="no-gr-history-title">{h.paperTitle}</span>
                    {h.reasons.length > 0 && (
                      <span className="no-gr-history-reasons">
                        {h.reasons.join("; ")}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
