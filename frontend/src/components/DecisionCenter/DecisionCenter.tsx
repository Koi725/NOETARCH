"use client";

import { useState, useEffect, useId } from "react";
import {
  fetchDecisions,
  actionDecision,
  fetchAuditTrail,
  isRealBackend,
} from "@/services/DecisionService";
import type { AuditEntry } from "@/contracts/decision";
import {
  useScreenTour,
  ExplainTip,
  DECISIONS_TOUR_KEY,
  DECISIONS_TOUR_STEPS,
} from "@/components/ui";
import type {
  Decision,
  DecisionActionType,
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

function actionToStatus(action: DecisionActionType): DecisionStatus {
  if (action === "approve") return "approved";
  if (action === "reject") return "rejected";
  return "local_alternative";
}

function statusLabel(status: DecisionStatus): string {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "local_alternative") return "Using local alternative";
  return "Pending";
}

interface CardUi {
  inFlight: boolean;
  optimistic: DecisionActionType | null;
  error: string | null;
}

const IDLE_UI: CardUi = { inFlight: false, optimistic: null, error: null };

function DecisionCard({
  decision,
  ui,
  audit,
  onAction,
}: {
  decision: Decision;
  ui: CardUi;
  audit: AuditEntry[] | null;
  onAction: (action: DecisionActionType) => void;
}) {
  const detailId = useId();

  const displayStatus: DecisionStatus = ui.optimistic
    ? actionToStatus(ui.optimistic)
    : decision.status;
  const isResolved = displayStatus !== "pending";

  const borderClass =
    decision.type === "cloud-egress"
      ? "no-decision-card--egress"
      : decision.type === "local-file"
      ? "no-decision-card--local"
      : "no-decision-card--workflow";

  return (
    <article
      className={`no-decision-card ${borderClass}`}
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

        {ui.error && (
          <p className="no-decision-action-error" role="alert">
            {ui.error}
          </p>
        )}
      </div>

      <div className="no-decision-card__actions" aria-describedby={detailId}>
        {!isResolved ? (
          <>
            <button
              type="button"
              className="no-decision-btn no-decision-btn--approve"
              onClick={() => onAction("approve")}
              disabled={ui.inFlight}
            >
              Approve once
            </button>
            {decision.alternatives.map((alt, idx) => (
              <button
                key={idx}
                type="button"
                className="no-decision-btn no-decision-btn--alt"
                onClick={() => onAction("use_local_alternative")}
                disabled={ui.inFlight}
              >
                {alt}
              </button>
            ))}
            <button
              type="button"
              className="no-decision-btn no-decision-btn--reject"
              onClick={() => onAction("reject")}
              disabled={ui.inFlight}
            >
              Reject
            </button>
          </>
        ) : (
          <div className="no-decision-acted" role="status" aria-live="polite">
            <span className={`no-decision-badge no-decision-badge--${displayStatus}`}>
              {statusLabel(displayStatus)}
            </span>
            {ui.inFlight && (
              <span className="no-decision-saving" aria-live="polite">
                Saving…
              </span>
            )}
          </div>
        )}
      </div>

      {audit && audit.length > 0 && (
        <section className="no-decision-audit" aria-label={`Audit trail for ${decision.title}`}>
          <div className="no-decision-audit__heading">Audit trail</div>
          <ol className="no-decision-audit__list">
            {audit.map((entry) => (
              <li key={entry.id} className="no-decision-audit__row">
                <span className="no-decision-audit__action">{entry.action}</span>
                <span className="no-decision-audit__transition">
                  {entry.fromStatus} → {entry.toStatus}
                </span>
                <span className="no-decision-audit__actor">{entry.actor}</span>
                <time className="no-decision-audit__time" dateTime={entry.createdAt}>
                  {entry.createdAt}
                </time>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

export function DecisionCenter({ decisions: decisionsProp }: DecisionCenterProps) {
  const [decisions, setDecisions] = useState<Decision[] | null>(decisionsProp ?? null);
  const [error, setError] = useState<string | null>(null);
  useScreenTour(DECISIONS_TOUR_KEY, DECISIONS_TOUR_STEPS);

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

  return <DecisionCenterView initialDecisions={decisions} />;
}

function DecisionCenterView({ initialDecisions }: { initialDecisions: Decision[] }) {
  const realBackend = isRealBackend();
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const [uiState, setUiState] = useState<Record<string, CardUi>>({});
  const [auditState, setAuditState] = useState<Record<string, AuditEntry[]>>({});

  const setUi = (id: string, patch: Partial<CardUi>) =>
    setUiState((prev) => ({ ...prev, [id]: { ...(prev[id] ?? IDLE_UI), ...patch } }));

  const replaceDecision = (updated: Decision) =>
    setDecisions((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

  const runAction = async (decision: Decision, action: DecisionActionType) => {
    // Mock mode: no backend — simulate locally, clearly not persisted.
    if (!realBackend) {
      replaceDecision({
        ...decision,
        status: actionToStatus(action),
        version: decision.version + 1,
        resolutionAction: action,
      });
      return;
    }

    // Real mode: optimistic update (show resolved immediately), roll back on error.
    setUi(decision.id, { inFlight: true, optimistic: action, error: null });
    try {
      const updated = await actionDecision(decision.id, action, decision.version);
      replaceDecision(updated);
      setUi(decision.id, { inFlight: false, optimistic: null, error: null });
      const trail = await fetchAuditTrail(decision.id);
      setAuditState((prev) => ({ ...prev, [decision.id]: trail }));
    } catch (err: unknown) {
      // Roll back the optimistic status; surface a clear, retryable error.
      setUi(decision.id, {
        inFlight: false,
        optimistic: null,
        error: err instanceof Error ? err.message : "Couldn't save your decision — please retry.",
      });
    }
  };

  const pending = decisions.filter((d) => d.status === "pending");
  const resolved = decisions.filter((d) => d.status !== "pending");

  return (
    <main className="no-decision-center" aria-label="Decision center">
      <header className="no-page-header">
        <h1 className="no-page-title">Decisions</h1>
        <p className="no-page-subtitle">
          Review and approve agent actions before they run
        </p>
        <p className="no-prototype-notice" role="note">
          {realBackend
            ? "Connected · your choices are saved to your local database and recorded in an audit trail. No external effects."
            : "Prototype · simulated · no backend"}
          <ExplainTip
            label="What does approving do?"
            text="Approving records your intent with an audit trail. It does not yet trigger the underlying action — that is a separately-reviewed step."
          />
        </p>
      </header>

      <section id="decisions-pending" aria-label="Pending decisions">
        <div className="no-decision-section-label">
          Pending · {pending.length} awaiting your decision
        </div>
        <div id="decisions-first-actions" className="no-decision-list">
          {pending.map((d) => (
            <DecisionCard
              key={d.id}
              decision={d}
              ui={uiState[d.id] ?? IDLE_UI}
              audit={auditState[d.id] ?? null}
              onAction={(action) => void runAction(d, action)}
            />
          ))}
          {pending.length === 0 && (
            <p className="no-decision-empty">No pending decisions.</p>
          )}
        </div>
      </section>

      {resolved.length > 0 && (
        <section aria-label="Resolved decisions">
          <div className="no-decision-section-label no-decision-section-label--muted">
            Resolved
          </div>
          <div className="no-decision-list">
            {resolved.map((d) => (
              <DecisionCard
                key={d.id}
                decision={d}
                ui={uiState[d.id] ?? IDLE_UI}
                audit={auditState[d.id] ?? null}
                onAction={(action) => void runAction(d, action)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
