"use client";

import { ProgressBar } from "@/components/ProgressBar";
import { StatusIndicator } from "@/components/StatusIndicator";
import {
  galleryStates,
  LONG_TITLE_EXAMPLE,
  CONFLICT_RECORD,
} from "@/data/StateGallery/StateGallery-data";
import "@/tailwind/components/StateGallery/StateGallery.css";

/* Shared card wrapper */
function StateCard({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="no-state-card" aria-labelledby={`state-title-${id}`}>
      <header className="no-state-card__header">
        <h2 id={`state-title-${id}`} className="no-state-card__title">
          {title}
        </h2>
        <p className="no-state-card__desc">{description}</p>
      </header>
      <div className="no-state-card__demo">{children}</div>
    </article>
  );
}

/* 1. Loading */
function StateLoading() {
  return (
    <div className="no-sg-loading">
      <ProgressBar indeterminate label="Fetching records…" showValue={false} />
      <div className="no-sg-skeleton-rows" aria-busy="true" aria-label="Loading records">
        {[80, 65, 90, 55].map((w) => (
          <div
            key={w}
            className="no-sg-skeleton-row"
            style={{ width: `${w}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

/* 2. Empty */
function StateEmpty() {
  return (
    <div className="no-sg-empty" role="status" aria-live="polite">
      <div className="no-sg-empty__icon" aria-hidden="true">
        <span className="no-sg-empty__sq" />
        <span className="no-sg-empty__sq" />
        <span className="no-sg-empty__sq" />
      </div>
      <p className="no-sg-empty__heading">No records in this library</p>
      <p className="no-sg-empty__sub">
        Run a search to find papers, or import a bibliography to get started.
      </p>
    </div>
  );
}

/* 3. Offline */
function StateOffline() {
  return (
    <div className="no-sg-source-status">
      <div className="no-sg-source-row">
        <StatusIndicator status="failed" label="Offline" live />
        <div className="no-sg-source-detail">
          <span className="no-sg-source-name">Semantic Scholar</span>
          <span className="no-sg-source-note">
            Unavailable for 11 min — queued tasks will resume automatically.
          </span>
        </div>
      </div>
    </div>
  );
}

/* 4. Source failure */
function StateSourceFailure() {
  return (
    <div className="no-sg-failure-card">
      <div className="no-sg-failure-kicker">Source error</div>
      <div className="no-sg-failure-body">
        <p className="no-sg-failure-title">PubMed returned an unexpected response</p>
        <p className="no-sg-failure-detail">HTTP 503 · Service unavailable · Retry scheduled in 5 min</p>
        <StatusIndicator status="failed" label="Failed — 1 source" />
      </div>
    </div>
  );
}

/* 5. Partial results */
function StatePartialResults() {
  return (
    <div className="no-sg-partial-card">
      <StatusIndicator status="warning" label="Partial results" />
      <p className="no-sg-partial-body">
        Retrieved <strong>1,204 records</strong> from 4 of 5 sources. Crossref timed out and is
        excluded from this run.
      </p>
      <div className="no-sg-gap-tag">1 source gap</div>
    </div>
  );
}

/* 6. Permission denied */
function StatePermissionDenied() {
  return (
    <div className="no-sg-permission-card" role="alert">
      <div className="no-sg-permission-kicker">Cloud step blocked</div>
      <p className="no-sg-permission-body">
        Sending abstracts to Anthropic Claude requires your approval. This step is paused until
        you decide.
      </p>
      <div className="no-sg-permission-actions">
        <button type="button" className="no-secondary-button" disabled aria-label="Approve — not interactive in gallery">
          Approve
        </button>
        <button type="button" className="no-secondary-button" disabled aria-label="Skip — not interactive in gallery">
          Skip this step
        </button>
      </div>
    </div>
  );
}

/* 7. Waiting for approval */
function StateWaitingApproval() {
  return (
    <div className="no-sg-decision-card" role="status">
      <StatusIndicator status="pending" label="Needs a decision" live />
      <div className="no-sg-decision-body">
        <p className="no-sg-decision-title">AI screening — send 847 abstracts to Anthropic?</p>
        <p className="no-sg-decision-meta">Cost estimate: $0.08 · Data leaves device · Waiting 3 min</p>
      </div>
    </div>
  );
}

/* 8. Budget exhausted */
function StateBudgetExhausted() {
  return (
    <div className="no-sg-budget-card" role="alert">
      <StatusIndicator status="warning" label="Spending limit reached" />
      <p className="no-sg-budget-body">
        Daily limit of <strong>$2.00</strong> reached. All cloud steps are paused.
        Raise your limit in{" "}
        <span className="no-sg-budget-link" aria-label="Models and policy settings (not interactive in gallery)">
          Models &amp; policy
        </span>{" "}
        to continue.
      </p>
    </div>
  );
}

/* 9. Rate limited */
function StateRateLimited() {
  return (
    <div className="no-sg-rate-card">
      <div className="no-sg-rate-kicker">HTTP 429 — Too Many Requests</div>
      <p className="no-sg-rate-body">
        OpenAlex enforced a rate limit. NOETARCH will retry automatically in{" "}
        <strong>60 seconds</strong>.
      </p>
      <StatusIndicator status="warning" label="Rate limited — retrying" />
    </div>
  );
}

/* 10. Conflicting evidence */
function StateConflictingEvidence() {
  return (
    <div className="no-sg-conflict-card">
      <div className="no-sg-conflict-title">{CONFLICT_RECORD.title}</div>
      <div className="no-sg-conflict-note">{CONFLICT_RECORD.conflict}</div>
      <div className="no-sg-conflict-rows">
        {CONFLICT_RECORD.sources.map((src) => (
          <div key={src.name} className="no-sg-conflict-row">
            <span className="no-sg-conflict-source">{src.name}</span>
            <span className="no-sg-conflict-field">Year: {src.year}</span>
            <span className="no-sg-conflict-field">Citations: {src.citationCount.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <StatusIndicator status="unverified" label="Conflict — requires review" />
    </div>
  );
}

/* 11. Missing DOI */
function StateMissingDoi() {
  return (
    <div className="no-sg-record-card">
      <div className="no-sg-record-title">
        Work arrangement flexibility and organisational commitment: a grounded theory approach
      </div>
      <div className="no-sg-record-meta">
        <span>Brown et al. · 2021 · Journal of Management Studies</span>
      </div>
      <div className="no-sg-missing-doi" role="status">
        <span className="no-sg-missing-doi__tag">No DOI</span>
        <span className="no-sg-missing-doi__note">
          This record cannot be linked or deduplicated without a DOI.
        </span>
      </div>
    </div>
  );
}

/* 12. Long title overflow */
function StateLongTitle() {
  return (
    <div className="no-sg-record-card">
      <div className="no-sg-record-title no-sg-record-title--long" title={LONG_TITLE_EXAMPLE}>
        {LONG_TITLE_EXAMPLE}
      </div>
      <div className="no-sg-record-meta">
        <span>Müller et al. · 2024 · Work, Employment and Society</span>
      </div>
      <div className="no-sg-char-count" aria-label={`Title is ${LONG_TITLE_EXAMPLE.length} characters`}>
        {LONG_TITLE_EXAMPLE.length} chars — truncated in list view
      </div>
    </div>
  );
}

/* 13. Large record counts */
function StateLargeCount() {
  return (
    <div className="no-sg-count-card">
      <div className="no-sg-count-kicker">Evidence library</div>
      <div className="no-sg-count-value" aria-label="12,847 records">12,847</div>
      <div className="no-sg-count-label">records</div>
      <div className="no-sg-count-breakdown">
        <span>OpenAlex: 8,204</span>
        <span>Crossref: 2,691</span>
        <span>PubMed: 1,952</span>
      </div>
    </div>
  );
}

/* 14. Reduced motion */
function StateReducedMotion() {
  return (
    <div className="no-sg-motion-card" role="status">
      <div className="no-sg-motion-indicator" aria-hidden="true">
        <span className="no-sg-motion-bar" />
        <span className="no-sg-motion-bar no-sg-motion-bar--still" />
      </div>
      <p className="no-sg-motion-label">
        Animations disabled
      </p>
      <p className="no-sg-motion-note">
        When <code>prefers-reduced-motion: reduce</code> or{" "}
        <code>data-anim=&quot;off&quot;</code> is set, all animations and transitions are
        suppressed via the motion.css rule.
      </p>
    </div>
  );
}

/* 15. Narrow viewport */
function StateNarrowViewport() {
  return (
    <div className="no-sg-narrow-card" role="note">
      <div className="no-sg-narrow-icon" aria-hidden="true">
        <span className="no-sg-narrow-frame" />
      </div>
      <p className="no-sg-narrow-label">Mobile layout · ≤ 390 px</p>
      <ul className="no-sg-narrow-list">
        <li>Sidebar collapses to icon rail (40 px)</li>
        <li>All interactive controls expand to min-height 48 px</li>
        <li>Multi-column grids stack to single column</li>
        <li>Padding reduced to 16–18 px horizontal</li>
      </ul>
    </div>
  );
}

const STATE_COMPONENTS: Record<string, () => React.ReactElement> = {
  loading: StateLoading,
  empty: StateEmpty,
  offline: StateOffline,
  "source-failure": StateSourceFailure,
  "partial-results": StatePartialResults,
  "permission-denied": StatePermissionDenied,
  "waiting-approval": StateWaitingApproval,
  "budget-exhausted": StateBudgetExhausted,
  "rate-limited": StateRateLimited,
  "conflicting-evidence": StateConflictingEvidence,
  "missing-doi": StateMissingDoi,
  "long-title": StateLongTitle,
  "large-count": StateLargeCount,
  "reduced-motion": StateReducedMotion,
  "narrow-viewport": StateNarrowViewport,
};

export function StateGallery() {
  return (
    <div className="no-state-gallery-page">
      <header className="no-state-gallery-header">
        <div>
          <div className="no-eyebrow">Internal reference</div>
          <h1>UI state gallery</h1>
          <p>
            Production-quality examples of every named application state. 15 states documented.
          </p>
        </div>
        <div className="no-prototype-notice" role="note">
          Internal reference · not a product screen
        </div>
      </header>

      <div className="no-state-gallery-body">
        <div className="no-state-gallery-grid">
          {galleryStates.map((entry) => {
            const Demo = STATE_COMPONENTS[entry.id];
            return (
              <StateCard
                key={entry.id}
                id={entry.id}
                title={entry.title}
                description={entry.description}
              >
                {Demo ? <Demo /> : <span>Demo not found</span>}
              </StateCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
