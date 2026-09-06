"use client";

import { useState, useEffect, useId } from "react";
import { fetchDecisions } from "@/services/DecisionService";
import type {
  Decision,
  DecisionCenterProps,
  DecisionStatus,
} from "./DecisionCenter_types";
import "@/tailwind/components/DecisionCenter/DecisionCenter.css";

function riskLabel(risk: Decision["risk"]): string {
  if (risk === "high") return "High risk";
  if (risk === "medium") return "Medium risk";
  return "Low risk";
}

function typeLabel(type: Decision["type"]): string {
  if (type === "cloud-egress") return "Cloud · data egress";
  if (type === "local-file") return "Local · file write";
  return "Workflow change";
}

interface CardState {
  sessionStatus: DecisionStatus | null;
  chosenAlternativeIndex: number | null;
}

function DecisionCard({
  decision,
  cardState,
  onApprove,
  onReject,
  onAlternative,
  onChangeMind,
}: {
  decision: Decision;
  cardState: CardState;
  onApprove: () => void;
  onReject: () => void;
  onAlternative: (idx: number) => void;
  onChangeMind: () => void;
}) {
  const detailId = useId();
  const effectiveStatus = cardState.sessionStatus ?? decision.status;
  const isActed =
    effectiveStatus === "approved" ||
    effectiveStatus === "rejected" ||
    effectiveStatus === "alternative";
  const isMuted = decision.status === "rejected" && cardState.sessionStatus === null;

  const borderClass =
    decision.type === "cloud-egress"
      ? "no-decision-card--egress"
      : decision.type === "local-file"
      ? "no-decision-card--local"
      : "no-decision-card--workflow";

  return (
    <article
      className={`no-decision-card ${borderClass}${isMuted ? " no-decision-card--muted" : ""}`}
      aria-labelledby={`${detailId}-title`}
    >
      <header className="no-decision-card__header">
        <div className="no-decision-card__meta">
          <span
            className={`no-decision-risk no-decision-risk--${decision.risk}`}
            aria-label={riskLabel(decision.risk)}
          >
            {riskLabel(decision.risk)}
          </span>
          <span className="no-decision-type">{typeLabel(decision.type)}</span>
        </div>
        <h2 className="no-decision-title" id={`${detailId}-title`}>
          {decision.title}
        </h2>
      </header>

      <div className="no-decision-card__body">
        <dl className="no-decision-facts">
          {decision.payload && (
            <>
              <dt>Payload</dt>
              <dd>{decision.payload}</dd>
            </>
          )}
          <dt>Cost</dt>
          <dd>{decision.cost}</dd>
          <dt>Time</dt>
          <dd>{decision.time}</dd>
          <dt>Reversible</dt>
          <dd>{decision.reversible ? "Yes" : "No"}</dd>
        </dl>

        <p className="no-decision-detail" id={detailId}>
          {decision.detail}
        </p>

        {decision.rejectedAt && cardState.sessionStatus === null && (
          <p className="no-decision-rejected-note">
            Rejected at {decision.rejectedAt}
          </p>
        )}
      </div>

      {!isMuted && (
        <div className="no-decision-card__actions" aria-describedby={detailId}>
          {!isActed ? (
            <>
              <button
                type="button"
                className="no-decision-btn no-decision-btn--approve"
                onClick={onApprove}
              >
                Approve once
              </button>
              {decision.alternatives.map((alt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`no-decision-btn no-decision-btn--alt${
                    cardState.chosenAlternativeIndex === idx
                      ? " is-selected"
                      : ""
                  }`}
                  aria-pressed={cardState.chosenAlternativeIndex === idx}
                  onClick={() => onAlternative(idx)}
                >
                  {alt}
                </button>
              ))}
              <button
                type="button"
                className="no-decision-btn no-decision-btn--reject"
                onClick={onReject}
              >
                Reject
              </button>
            </>
          ) : (
            <div className="no-decision-acted" role="status" aria-live="polite">
              <span
                className={`no-decision-badge no-decision-badge--${effectiveStatus}`}
              >
                {effectiveStatus === "approved"
                  ? "Approved"
                  : effectiveStatus === "alternative"
                  ? "Using local alternative"
                  : "Rejected"}
              </span>
              <button
                type="button"
                className="no-decision-btn no-decision-btn--changemind"
                onClick={onChangeMind}
              >
                Change my mind
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function DecisionCenter({ decisions: decisionsProp }: DecisionCenterProps) {
  const [decisions, setDecisions] = useState<Decision[] | null>(decisionsProp ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (decisionsProp) return;
    let cancelled = false;
    fetchDecisions()
      .then((data) => {
        if (!cancelled) setDecisions(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load decisions.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [decisionsProp]);

  if (error) {
    return (
      <main className="no-decision-center" aria-label="Decision center">
        <div role="alert" className="no-decision-error">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!decisions) {
    return (
      <main className="no-decision-center" aria-label="Decision center">
        <p className="no-decision-loading" role="status" aria-label="Loading decisions">
          Loading decisions…
        </p>
      </main>
    );
  }

  return <DecisionCenterView decisions={decisions} />;
}

function DecisionCenterView({ decisions }: { decisions: Decision[] }) {
  const effectiveDecisions = decisions;
  const [cardStates, setCardStates] = useState<Record<string, CardState>>(
    () =>
      Object.fromEntries(
        effectiveDecisions.map((d) => [
          d.id,
          { sessionStatus: null, chosenAlternativeIndex: null },
        ])
      )
  );

  const update = (id: string, patch: Partial<CardState>) =>
    setCardStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch } as CardState,
    }) as Record<string, CardState>);

  const pending = effectiveDecisions.filter(
    (d) =>
      d.status === "pending" ||
      (d.status !== "rejected" && cardStates[d.id]?.sessionStatus !== "rejected")
  );
  const preRejected = effectiveDecisions.filter(
    (d) => d.status === "rejected" && cardStates[d.id]?.sessionStatus === null
  );

  return (
    <main className="no-decision-center" aria-label="Decision center">
      <header className="no-page-header">
        <h1 className="no-page-title">Decisions</h1>
        <p className="no-page-subtitle">
          Review and approve agent actions before they run
        </p>
        <p className="no-prototype-notice" role="note">
          Prototype · Mock data · No actions are executed
        </p>
      </header>

      <section aria-label="Pending decisions">
        <div className="no-decision-section-label">
          Pending · {pending.length} awaiting your decision
        </div>
        <div className="no-decision-list">
          {pending.map((d) => (
            <DecisionCard
              key={d.id}
              decision={d}
              cardState={cardStates[d.id] ?? { sessionStatus: null, chosenAlternativeIndex: null }}
              onApprove={() =>
                update(d.id, { sessionStatus: "approved", chosenAlternativeIndex: null })
              }
              onReject={() =>
                update(d.id, { sessionStatus: "rejected", chosenAlternativeIndex: null })
              }
              onAlternative={(idx) =>
                update(d.id, { sessionStatus: "alternative", chosenAlternativeIndex: idx })
              }
              onChangeMind={() =>
                update(d.id, { sessionStatus: null, chosenAlternativeIndex: null })
              }
            />
          ))}
          {pending.length === 0 && (
            <p className="no-decision-empty">No pending decisions.</p>
          )}
        </div>
      </section>

      {preRejected.length > 0 && (
        <section aria-label="Previously rejected decisions">
          <div className="no-decision-section-label no-decision-section-label--muted">
            Previously rejected
          </div>
          <div className="no-decision-list">
            {preRejected.map((d) => (
              <DecisionCard
                key={d.id}
                decision={d}
                cardState={cardStates[d.id] ?? { sessionStatus: null, chosenAlternativeIndex: null }}
                onApprove={() =>
                  update(d.id, { sessionStatus: "approved", chosenAlternativeIndex: null })
                }
                onReject={() =>
                  update(d.id, { sessionStatus: "rejected", chosenAlternativeIndex: null })
                }
                onAlternative={(idx) =>
                  update(d.id, { sessionStatus: "alternative", chosenAlternativeIndex: idx })
                }
                onChangeMind={() =>
                  update(d.id, { sessionStatus: null, chosenAlternativeIndex: null })
                }
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
