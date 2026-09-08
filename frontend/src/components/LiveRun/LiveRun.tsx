"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { RunUnavailableError, startRun } from "@/services/RunService";
import type {
  RunCriteria,
  RunExecutionStatus,
  RunRequestInput,
  RunResult,
  RunSynthesis,
} from "@/contracts/run";
import { useScreenTour, LIVE_RUN_TOUR_KEY, LIVE_RUN_TOUR_STEPS } from "@/components/ui";
import "@/tailwind/components/LiveRun/LiveRun.css";
import "@/tailwind/components/LiveRunLauncher/LiveRunLauncher.css";

type Phase = "form" | "running" | "done" | "error";

interface FormValues {
  question: string;
  yearFrom: string;
  yearTo: string;
  maxResults: string;
  budget: string;
}

const INITIAL_FORM: FormValues = {
  question: "",
  yearFrom: "",
  yearTo: "",
  maxResults: "50",
  budget: "",
};

const STATUS_LABEL: Record<RunExecutionStatus, string> = {
  completed: "Completed",
  halted_budget: "Stopped at budget cap",
  failed: "Failed",
  no_provider: "No provider key",
  external_sources_disabled: "External sources off",
};

function toIntOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number.parseInt(trimmed, 10);
  return Number.isFinite(n) ? n : null;
}

function toFloatOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number.parseFloat(trimmed);
  return Number.isFinite(n) ? n : null;
}

/** The core new piece: a run launcher on the Live Run screen. Question + bounds + budget →
 *  POST /runs → live status → summary with deep links into Evidence + Decisions for the run.
 *  No terminal, no curl anywhere in the path. */
export function LiveRun() {
  useScreenTour(LIVE_RUN_TOUR_KEY, LIVE_RUN_TOUR_STEPS);
  const [phase, setPhase] = useState<Phase>("form");
  const [form, setForm] = useState<FormValues>(INITIAL_FORM);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gated, setGated] = useState(false);
  const [template, setTemplate] = useState<string | null>(null);

  // Prefill from the URL (e.g. arriving from a Recipes "Use as run template" link). This syncs
  // an external browser API (location) that isn't available during SSR into local state exactly
  // once on mount, which keeps the static prerender and the client hydration in agreement — the
  // one legitimate case the blanket set-state-in-effect lint rule doesn't distinguish.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const patch: Partial<FormValues> = {};
    const q = sp.get("q");
    if (q) patch.question = q.slice(0, 500);
    const max = toIntOrNull(sp.get("max") ?? "");
    if (max != null) patch.maxResults = String(max);
    const budget = toFloatOrNull(sp.get("budget") ?? "");
    if (budget != null) patch.budget = String(budget);
    const yearFrom = toIntOrNull(sp.get("year_from") ?? "");
    if (yearFrom != null) patch.yearFrom = String(yearFrom);
    const yearTo = toIntOrNull(sp.get("year_to") ?? "");
    if (yearTo != null) patch.yearTo = String(yearTo);
    const t = sp.get("template");
    /* eslint-disable react-hooks/set-state-in-effect -- one-shot sync from window.location */
    if (t) setTemplate(t.slice(0, 80));
    if (Object.keys(patch).length > 0) setForm((f) => ({ ...f, ...patch }));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const questionId = useId();
  const yearFromId = useId();
  const yearToId = useId();
  const maxId = useId();
  const budgetId = useId();

  const setField = useCallback(
    (key: keyof FormValues, value: string) => setForm((f) => ({ ...f, [key]: value })),
    [],
  );

  const canStart = form.question.trim().length > 0 && phase !== "running";

  const handleStart = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (form.question.trim().length === 0) return;

      const input: RunRequestInput = {
        question: form.question.trim(),
        year_from: toIntOrNull(form.yearFrom),
        year_to: toIntOrNull(form.yearTo),
        max_results: toIntOrNull(form.maxResults) ?? 50,
        budget_usd: toFloatOrNull(form.budget),
      };

      setPhase("running");
      setError(null);
      setGated(false);
      try {
        const runResult = await startRun(input);
        setResult(runResult);
        setPhase("done");
      } catch (err: unknown) {
        if (err instanceof RunUnavailableError) {
          setGated(true);
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : "The run could not be started.");
        }
        setPhase("error");
      }
    },
    [form],
  );

  const resetToForm = useCallback(() => {
    setPhase("form");
    setResult(null);
    setError(null);
    setGated(false);
  }, []);

  return (
    <div className="no-launch-page">
      <header className="no-launch-header">
        <span className="no-eyebrow">Live run</span>
        <h1 className="no-launch-title">Start a new run</h1>
        <p className="no-launch-lede">
          Ask a research question and NOETARCH searches OpenAlex, freezes the evidence, and
          screens each abstract with your connected model. Everything runs behind the
          allowlisted egress guard; nothing the model returns is auto-executed.
        </p>
      </header>

      {template && phase === "form" && (
        <div className="no-launch-template-note" role="status">
          Starting from template <strong>{template}</strong>. The fields below are prefilled and
          fully editable — add your research question and start.
        </div>
      )}

      {(phase === "form" || phase === "running") && (
        <form className="no-launch-form" onSubmit={handleStart} aria-busy={phase === "running"}>
          <div className="no-launch-field">
            <label htmlFor={questionId} className="no-launch-label">
              Research question
            </label>
            <textarea
              id={questionId}
              className="no-launch-textarea"
              value={form.question}
              onChange={(e) => setField("question", e.target.value)}
              placeholder="e.g. Does spaced repetition improve long-term retention in adults?"
              rows={3}
              maxLength={500}
              disabled={phase === "running"}
              required
            />
          </div>

          <div className="no-launch-grid">
            <div className="no-launch-field">
              <label htmlFor={yearFromId} className="no-launch-label">
                Year from
              </label>
              <input
                id={yearFromId}
                className="no-launch-input"
                type="number"
                inputMode="numeric"
                min={1800}
                max={2100}
                value={form.yearFrom}
                onChange={(e) => setField("yearFrom", e.target.value)}
                placeholder="2015"
                disabled={phase === "running"}
              />
            </div>
            <div className="no-launch-field">
              <label htmlFor={yearToId} className="no-launch-label">
                Year to
              </label>
              <input
                id={yearToId}
                className="no-launch-input"
                type="number"
                inputMode="numeric"
                min={1800}
                max={2100}
                value={form.yearTo}
                onChange={(e) => setField("yearTo", e.target.value)}
                placeholder="2025"
                disabled={phase === "running"}
              />
            </div>
            <div className="no-launch-field">
              <label htmlFor={maxId} className="no-launch-label">
                Max papers
              </label>
              <input
                id={maxId}
                className="no-launch-input"
                type="number"
                inputMode="numeric"
                min={1}
                max={200}
                value={form.maxResults}
                onChange={(e) => setField("maxResults", e.target.value)}
                disabled={phase === "running"}
              />
            </div>
            <div className="no-launch-field">
              <label htmlFor={budgetId} className="no-launch-label">
                Budget (USD, optional)
              </label>
              <input
                id={budgetId}
                className="no-launch-input"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={form.budget}
                onChange={(e) => setField("budget", e.target.value)}
                placeholder="No cap"
                disabled={phase === "running"}
              />
            </div>
          </div>

          <p className="no-launch-guard-note" role="note">
            The run stops cleanly the moment it reaches your budget cap — you are never billed
            past it.
          </p>

          <div className="no-launch-actions">
            <button type="submit" className="no-primary-button" disabled={!canStart}>
              {phase === "running" ? "Running…" : "Start run"}
            </button>
          </div>
        </form>
      )}

      {phase === "running" && (
        <div className="no-launch-running" role="status" aria-live="polite">
          <span className="no-launch-spinner" aria-hidden="true" />
          <div>
            <p className="no-launch-running-title">Screening in progress</p>
            <p className="no-launch-running-sub">
              Searching, freezing evidence, and screening abstracts. Larger runs take longer —
              this page updates as soon as the run finishes.
            </p>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div className="no-launch-error" role="alert">
          <p className="no-launch-error-title">
            {gated ? "Real runs aren’t available yet" : "The run couldn’t start"}
          </p>
          <p>{error}</p>
          <div className="no-launch-error-actions">
            {gated && (
              <>
                <Link className="no-secondary-button" href="/models-policy">
                  Open Models &amp; Policy
                </Link>
                <Link className="no-secondary-button" href="/first-run">
                  Connect a key
                </Link>
              </>
            )}
            <button type="button" className="no-secondary-button" onClick={resetToForm}>
              Back to the form
            </button>
          </div>
        </div>
      )}

      {phase === "done" && result && <RunSummary result={result} onReset={resetToForm} />}
    </div>
  );
}

function formatElapsed(ms?: number | null): string | null {
  if (ms == null) return null;
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function RunSummary({ result, onReset }: { result: RunResult; onReset: () => void }) {
  const isBudget = result.status === "halted_budget";
  const isFailed = result.status === "failed";
  const elapsed = formatElapsed(result.elapsedMs);
  const findingCount = result.synthesis?.findings.length ?? 0;
  // `frozen` is the unique set kept after dedup; `deduplicated` is how many were merged out.
  // Total found = unique + merged. Report all three plainly rather than conflating them.
  const found = result.frozen + result.deduplicated;
  return (
    <section className="no-launch-summary" aria-labelledby="run-summary-heading">
      <div className="no-launch-summary-head">
        <h2 id="run-summary-heading" className="no-launch-summary-title">
          Run complete
        </h2>
        <span
          className={`no-launch-status is-${isFailed ? "bad" : isBudget ? "warn" : "ok"}`}
          role="status"
        >
          {STATUS_LABEL[result.status]}
        </span>
      </div>

      <p className="no-launch-summary-question">{result.question}</p>

      {/* One-line pipeline narrative: found → screened → included → synthesis, with cost + time. */}
      <p className="no-launch-narrative">
        Found <strong>{found}</strong> paper{found === 1 ? "" : "s"} · <strong>{result.deduplicated}</strong>{" "}
        merged · <strong>{result.frozen}</strong> unique → screened{" "}
        <strong>{result.screened}</strong> → included <strong>{result.included}</strong>
        {result.synthesis && (
          <>
            {" "}
            → synthesised <strong>{findingCount}</strong> finding{findingCount === 1 ? "" : "s"}
          </>
        )}
        . {elapsed && <>{elapsed} · </>}${result.costUsd.toFixed(4)}
      </p>

      {isBudget && (
        <p className="no-launch-summary-note" role="note">
          The run halted cleanly at your budget cap. Frozen evidence and the decisions made so
          far are saved below.
        </p>
      )}
      {isFailed && result.error && (
        <p className="no-launch-summary-note is-bad" role="note">
          {result.error}
        </p>
      )}

      <div id="live-run-kpis" className="no-launch-metrics" role="region" aria-label="Run metrics">
        <Metric label="Found" value={found} />
        <Metric label="Merged" value={result.deduplicated} />
        <Metric label="Unique" value={result.frozen} />
        <Metric label="Screened" value={result.screened} />
        <Metric label="Include" value={result.included} tone="ok" />
        <Metric label="Exclude" value={result.excluded} />
        <Metric label="Uncertain" value={result.uncertain} tone="warn" />
        <Metric label="Input tokens" value={result.inputTokens.toLocaleString()} />
        <Metric label="Output tokens" value={result.outputTokens.toLocaleString()} />
        <Metric label="Cost" value={`$${result.costUsd.toFixed(4)}`} />
        {elapsed && <Metric label="Time" value={elapsed} />}
      </div>

      {result.plannedQueries && result.plannedQueries.length > 0 && (
        <p className="no-launch-queries">
          <span className="no-launch-queries-label">Searched OpenAlex + Crossref for:</span>{" "}
          {result.plannedQueries.map((q) => (
            <code key={q}>{q}</code>
          ))}
        </p>
      )}

      {result.criteria && <CriteriaBlock criteria={result.criteria} />}
      {result.synthesis && <SynthesisBlock synthesis={result.synthesis} />}

      <div className="no-launch-deeplinks">
        <Link
          className="no-primary-button"
          href={`/evidence?run=${encodeURIComponent(result.id)}`}
        >
          View evidence ({result.frozen})
        </Link>
        <Link
          className="no-secondary-button"
          href={`/decisions?run=${encodeURIComponent(result.id)}`}
        >
          View decisions ({result.screened})
        </Link>
        <button type="button" className="no-secondary-button" onClick={onReset}>
          Start another run
        </button>
      </div>

      <p className="no-launch-provenance">
        Model: <code>{result.model}</code> · run <code>{result.id}</code>. Every screening
        result is stored as a pending claim — review and act on them under Decisions.
      </p>
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="no-launch-metric">
      <div className="no-launch-metric-label">{label}</div>
      <div className={`no-launch-metric-value${tone ? ` is-${tone}` : ""}`}>{value}</div>
    </div>
  );
}

/** The explicit, PICO-style screening criteria derived for this run (WS2). */
function CriteriaBlock({ criteria }: { criteria: RunCriteria }) {
  const pico: [string, string][] = [
    ["Population", criteria.population],
    ["Intervention", criteria.intervention],
    ["Comparator", criteria.comparator],
    ["Outcome", criteria.outcome],
  ];
  const hasPico = pico.some(([, v]) => v);
  if (!hasPico && criteria.include.length === 0 && criteria.exclude.length === 0) {
    return null;
  }
  return (
    <section className="no-launch-block" aria-label="Screening criteria">
      <h3 className="no-launch-block-title">Screening criteria</h3>
      {hasPico && (
        <dl className="no-launch-pico">
          {pico
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="no-launch-pico-row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
      )}
      {criteria.include.length > 0 && (
        <p className="no-launch-criteria-line">
          <span className="no-launch-tag is-ok">Include</span> {criteria.include.join("; ")}
        </p>
      )}
      {criteria.exclude.length > 0 && (
        <p className="no-launch-criteria-line">
          <span className="no-launch-tag is-warn">Exclude</span> {criteria.exclude.join("; ")}
        </p>
      )}
    </section>
  );
}

/** The grounded synthesis: every cited DOI is guaranteed to be in the frozen included set. */
function SynthesisBlock({ synthesis }: { synthesis: RunSynthesis }) {
  if (synthesis.offSchema && !synthesis.summary && synthesis.findings.length === 0) {
    return (
      <section className="no-launch-block" aria-label="Evidence synthesis">
        <h3 className="no-launch-block-title">Evidence synthesis</h3>
        <p className="no-launch-summary-note" role="note">
          A synthesis could not be generated for this run.
        </p>
      </section>
    );
  }
  return (
    <section className="no-launch-block" aria-label="Evidence synthesis">
      <div className="no-launch-block-head">
        <h3 className="no-launch-block-title">Evidence synthesis</h3>
        <span
          className={`no-launch-ground ${synthesis.grounded ? "is-ok" : "is-warn"}`}
          role="status"
        >
          {synthesis.grounded ? "Grounded" : "Grounding flags"}
        </span>
      </div>
      {synthesis.summary && <p className="no-launch-synth-summary">{synthesis.summary}</p>}
      {synthesis.findings.length > 0 && (
        <ul className="no-launch-findings">
          {synthesis.findings.map((f) => (
            <li key={f.doi} className="no-launch-finding">
              <span className="no-launch-finding-text">{f.finding}</span>
              <a
                className="no-launch-finding-doi"
                href={`https://doi.org/${f.doi}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {f.title}
              </a>
            </li>
          ))}
        </ul>
      )}
      {!synthesis.grounded && (
        <p className="no-launch-summary-note is-warn" role="note">
          {synthesis.droppedFindings > 0 &&
            `${synthesis.droppedFindings} finding(s) citing an unknown DOI were dropped. `}
          {synthesis.redactedCitations > 0 &&
            `${synthesis.redactedCitations} unverified citation(s) in the summary were redacted. `}
          Only DOIs from the frozen included set are ever shown.
        </p>
      )}
    </section>
  );
}
