"use client";

import { useState, useCallback } from "react";
import {
  liveRunMeta,
  liveRunSteps,
  currentStepInspector,
  liveRunKPIs,
  liveRunEvents,
  liveRunDecisions,
  liveRunEvidenceCards,
} from "@/data/LiveRun/LiveRun-data";
import type { LiveRunLayout, StepState } from "./LiveRun_types";
import "@/tailwind/components/LiveRun/LiveRun.css";

function stepStateLabel(state: StepState, isPaused: boolean): string {
  if (state === "running" && isPaused) return "paused";
  return state;
}

function StepRail({ activeIndex, isPaused }: { activeIndex: number; isPaused: boolean }) {
  return (
    <ol className="no-live-run-rail" aria-label="Workflow steps">
      {liveRunSteps.map((step) => {
        const displayState = stepStateLabel(step.state, isPaused);
        const isCurrent = step.index === activeIndex;
        return (
          <li
            key={step.index}
            className={`no-live-run-step is-${displayState}${isCurrent ? " is-current" : ""}`}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span className="no-live-step-marker" aria-hidden="true">
              {step.state === "done" || step.state === "partial" ? (
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <polyline points="2,5 4.2,7.5 8,2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{step.index}</span>
              )}
            </span>
            <span className="no-live-step-label">
              {step.label}
              {step.note && (
                <span className="no-live-step-note">{step.note}</span>
              )}
            </span>
            {step.state === "running" && !isPaused && (
              <span className="no-live-step-spinner" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepInspector({ isPaused }: { isPaused: boolean }) {
  const s = currentStepInspector;
  return (
    <section className="no-live-inspector" aria-labelledby="inspector-heading">
      <div className="no-inspector-heading-row">
        <h2 id="inspector-heading" className="no-inspector-heading">
          Step {s.stepIndex}: {s.label}
        </h2>
        {isPaused && (
          <span className="no-live-paused-badge" role="status">Paused</span>
        )}
        {!isPaused && (
          <span className="no-live-running-badge" role="status">
            <span className="no-live-pulse" aria-hidden="true" />
            Running
          </span>
        )}
      </div>
      <dl className="no-inspector-grid">
        <dt>Method</dt>
        <dd>{s.method}</dd>
        <dt>Locality</dt>
        <dd className="no-locality-value">{s.locality}</dd>
        <dt>Status</dt>
        <dd>{s.status}</dd>
        <dt>Input</dt>
        <dd>{s.input}</dd>
        <dt>Output so far</dt>
        <dd>{s.outputSoFar}</dd>
      </dl>
    </section>
  );
}

function KPIRow() {
  return (
    <div className="no-live-kpi-row" role="region" aria-label="Run metrics">
      {liveRunKPIs.map((kpi) => (
        <div className="no-live-kpi" key={kpi.label}>
          <div className="no-live-kpi-label">{kpi.label}</div>
          <div
            className={`no-live-kpi-value${kpi.tone ? ` is-${kpi.tone}` : ""}`}
            aria-live="polite"
          >
            {kpi.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function EventLedger() {
  return (
    <section className="no-live-ledger" aria-labelledby="ledger-heading">
      <h2 id="ledger-heading" className="no-ledger-heading">
        System event ledger
        <span className="no-ledger-note">Model notes are clearly labeled and separated from verified system facts.</span>
      </h2>
      <ol className="no-ledger-list" aria-label="Events, newest first">
        {liveRunEvents.map((evt) => (
          <li
            key={evt.id}
            className={`no-ledger-row is-${evt.kind}`}
          >
            <time className="no-ledger-time" dateTime={`2026-09-06T${evt.time}`}>
              {evt.time}
            </time>
            <div className="no-ledger-body">
              {evt.kind === "model" && (
                <span className="no-model-note-label" aria-label="Model note">
                  Model note
                </span>
              )}
              <span className="no-ledger-message">{evt.message}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DecisionInspector() {
  return (
    <section className="no-live-decisions" aria-labelledby="decisions-heading">
      <h2 id="decisions-heading" className="no-decisions-heading">
        Pending decisions
      </h2>
      {liveRunDecisions.map((dec) => (
        <div key={dec.id} className="no-decision-card">
          <span className="no-decision-badge">Pending</span>
          <p className="no-decision-desc">{dec.description}</p>
        </div>
      ))}
    </section>
  );
}

function EvidenceCards() {
  return (
    <section className="no-live-evidence" aria-labelledby="evidence-heading">
      <h2 id="evidence-heading" className="no-evidence-heading">
        Evidence cards
      </h2>
      <div className="no-evidence-card-list">
        {liveRunEvidenceCards.map((card) => (
          <article key={card.id} className="no-evidence-card">
            <p className="no-evidence-title">{card.title}</p>
            <dl className="no-evidence-meta">
              <dt>DOI</dt>
              <dd>
                <span className="no-evidence-doi">{card.doi}</span>
              </dd>
              <dt>Source</dt>
              <dd>{card.source}</dd>
              <dt>Verified by</dt>
              <dd className="no-evidence-verified">{card.verifiedBy}</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

type SimNoticeProps = { label: string };

function SimNotice({ label }: SimNoticeProps) {
  return (
    <p className="no-live-sim-notice" role="status">
      Simulated — no real backend action: {label}
    </p>
  );
}

export function LiveRun() {
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [retryActive, setRetryActive] = useState(false);
  const [skipActive, setSkipActive] = useState(false);
  const [layout, setLayout] = useState<LiveRunLayout>("split");
  const [lastSim, setLastSim] = useState<string | null>(null);

  const showSim = useCallback((label: string) => {
    setLastSim(label);
    const t = setTimeout(() => setLastSim(null), 3500);
    return () => clearTimeout(t);
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused((p) => !p);
    showSim(isPaused ? "Resume" : "Pause");
  }, [isPaused, showSim]);

  const handleStop = useCallback(() => {
    setIsStopped((s) => !s);
    showSim("Stop");
  }, [showSim]);

  const handleRetry = useCallback(() => {
    setRetryActive(true);
    showSim("Retry current step");
    setTimeout(() => setRetryActive(false), 2000);
  }, [showSim]);

  const handleSkip = useCallback(() => {
    setSkipActive(true);
    showSim("Skip step");
    setTimeout(() => setSkipActive(false), 2000);
  }, [showSim]);

  const cycleLayout = useCallback(() => {
    setLayout((l) => {
      if (l === "split") return "wide-left";
      if (l === "wide-left") return "wide-right";
      return "split";
    });
  }, []);

  const layoutLabel =
    layout === "split"
      ? "Layout: split"
      : layout === "wide-left"
      ? "Layout: wide left"
      : "Layout: wide right";

  return (
    <div className={`no-live-page is-layout-${layout}`}>
      {/* Top bar */}
      <div className="no-live-topbar">
        <div className="no-live-topbar-left">
          <span className="no-eyebrow no-live-eyebrow">
            Run {liveRunMeta.runId} · {liveRunMeta.started} · {liveRunMeta.elapsed} elapsed
          </span>
          <h1 className="no-live-title">{liveRunMeta.title}</h1>
        </div>
        <div className="no-live-topbar-right">
          <div className="no-live-controls" role="toolbar" aria-label="Run controls">
            <button
              type="button"
              className="no-secondary-button"
              onClick={handlePause}
              aria-pressed={isPaused}
              aria-label={isPaused ? "Resume run" : "Pause run"}
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              className="no-secondary-button"
              onClick={handleStop}
              aria-pressed={isStopped}
              aria-label="Stop run"
            >
              Stop
            </button>
            <button
              type="button"
              className={`no-secondary-button${retryActive ? " is-active" : ""}`}
              onClick={handleRetry}
              aria-label="Retry current step"
            >
              Retry step
            </button>
            <button
              type="button"
              className={`no-secondary-button${skipActive ? " is-active" : ""}`}
              onClick={handleSkip}
              aria-label="Skip current step"
            >
              Skip step
            </button>
            <button
              type="button"
              className="no-secondary-button"
              onClick={cycleLayout}
              aria-label={layoutLabel}
            >
              Layout
            </button>
          </div>
          <div className="no-live-locality-badge" aria-label="Execution locality">
            <span className="no-locality-dot" aria-hidden="true" />
            cloud · external
          </div>
        </div>
      </div>

      {/* Simulated notice bar */}
      {(isStopped || lastSim) && (
        <div className="no-live-sim-bar" role="status" aria-live="polite">
          {isStopped && (
            <span className="no-live-stopped-notice">
              Run stopped (simulated) — no real backend action taken.
            </span>
          )}
          {lastSim && !isStopped && <SimNotice label={lastSim} />}
        </div>
      )}

      {/* Prototype notice */}
      <div className="no-live-proto-notice" role="note">
        Prototype · Mock data · Simulated · no backend
      </div>

      {/* Body */}
      <div className="no-live-body">
        {/* Left column */}
        <div className="no-live-left">
          <KPIRow />
          <StepRail activeIndex={currentStepInspector.stepIndex} isPaused={isPaused} />
          <StepInspector isPaused={isPaused} />
          <DecisionInspector />
          <EvidenceCards />
        </div>

        {/* Right column */}
        <div className="no-live-right">
          <EventLedger />
        </div>
      </div>
    </div>
  );
}
