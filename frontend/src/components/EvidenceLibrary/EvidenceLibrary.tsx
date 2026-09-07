"use client";

import { useState, useEffect, useMemo, useId, useCallback } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import {
  fetchEvidenceData,
  searchEvidence,
  type EvidenceSearchResult,
} from "@/services/EvidenceService";
import { isRealBackend } from "@/services/DecisionService";
import type {
  EvidenceRecord,
  EvidenceFilter,
  EvidenceSource,
} from "./EvidenceLibrary_types";
import { useScreenTour, EvidenceListSkeleton, EVIDENCE_TOUR_KEY, EVIDENCE_TOUR_STEPS } from "@/components/ui";
import "@/tailwind/components/EvidenceLibrary/EvidenceLibrary.css";

const FILTERS: { value: EvidenceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "checked", label: "Checked" },
  { value: "conflicting", label: "Conflicting" },
  { value: "cannot-check", label: "Cannot check" },
  { value: "missing-doi", label: "Missing DOI" },
];

function statusLabel(status: EvidenceRecord["status"]): string {
  if (status === "checked") return "Checked";
  if (status === "conflicting") return "Conflicting";
  return "Cannot check";
}

function SourceIcon({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <span className="no-ev-source-icon" aria-label={name} title={name}>
      {initial}
    </span>
  );
}

function StatusBadge({ status }: { status: EvidenceRecord["status"] }) {
  return (
    <span className={`no-ev-status-badge is-${status}`} aria-label={`Status: ${statusLabel(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

function SourceTable({ sources }: { sources: EvidenceSource[] }) {
  if (sources.length === 0) {
    return (
      <p className="no-ev-no-sources">No external sources checked — no DOI available.</p>
    );
  }
  return (
    <table className="no-ev-source-table">
      <caption className="sr-only">Source verification results</caption>
      <thead>
        <tr>
          <th scope="col">Source</th>
          <th scope="col">Found</th>
          <th scope="col">Notes</th>
        </tr>
      </thead>
      <tbody>
        {sources.map((src) => (
          <tr key={src.name}>
            <td>{src.name}</td>
            <td>
              <span className={`no-ev-found-badge is-${src.found ? "yes" : "no"}`}>
                {src.found ? "Yes" : "No"}
              </span>
            </td>
            <td>{src.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DetailInspector({
  record,
  onClose,
}: {
  record: EvidenceRecord;
  onClose: () => void;
}) {
  return (
    <aside className="no-ev-inspector" aria-label="Record detail inspector">
      <div className="no-ev-inspector-header">
        <h2 className="no-ev-inspector-title">{record.title}</h2>
        <button
          type="button"
          className="no-ev-close-btn"
          onClick={onClose}
          aria-label="Close detail inspector"
        >
          ✕
        </button>
      </div>

      <div className="no-ev-inspector-body">
        <StatusBadge status={record.status} />
        {record.conflictNote && (
          <p className="no-ev-conflict-note">{record.conflictNote}</p>
        )}
        {record.missingDoi && (
          <p className="no-ev-missing-doi-note">No DOI — cannot verify against external sources.</p>
        )}

        <dl className="no-ev-detail-grid">
          <dt>Authors</dt>
          <dd>{record.authors}</dd>
          <dt>Year</dt>
          <dd>{record.year}</dd>
          <dt>Journal</dt>
          <dd>{record.journal}</dd>
          <dt>DOI</dt>
          <dd>
            {record.doi ? (
              <span className="no-ev-doi-value">{record.doi}</span>
            ) : (
              <span className="no-ev-doi-missing">Not available</span>
            )}
          </dd>
          {record.totalSources > 0 && (
            <>
              <dt>Agreement</dt>
              <dd>
                {record.agreementCount} of {record.totalSources} sources agree
              </dd>
            </>
          )}
          <dt>Origin</dt>
          <dd>{record.source === "openalex" ? "Fetched from OpenAlex" : "Local dataset"}</dd>
          {record.retrievedAt && (
            <>
              <dt>Retrieved</dt>
              <dd>
                <time dateTime={record.retrievedAt}>{record.retrievedAt}</time>
              </dd>
            </>
          )}
        </dl>

        <section aria-labelledby="source-table-heading">
          <h3 id="source-table-heading" className="no-ev-section-label">
            Source verification
          </h3>
          <SourceTable sources={record.sources} />
        </section>

        <section aria-labelledby="provenance-heading">
          <h3 id="provenance-heading" className="no-ev-section-label">
            Provenance trail
          </h3>
          <ol className="no-ev-provenance">
            {record.provenance.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </aside>
  );
}

export function EvidenceLibrary({ runId }: { runId?: string }) {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [project, setProject] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<EvidenceFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchId = useId();
  const extSearchId = useId();
  const [extQuery, setExtQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<EvidenceSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [fetchOpen, setFetchOpen] = useState(false);
  // Only offer external fetch when a real backend is configured. In the default
  // local/mock mode the OpenAlex fetch action is not rendered at all.
  const externalAvailable = isRealBackend();
  useScreenTour(EVIDENCE_TOUR_KEY, EVIDENCE_TOUR_STEPS);

  const handleExternalSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const q = extQuery.trim();
      if (!q) return;
      setSearching(true);
      setSearchError(null);
      try {
        const result = await searchEvidence(q);
        setSearchStatus(result);
        if (result.records.length > 0) {
          setRecords((prev) => {
            const existing = new Set(prev.map((r) => r.id));
            const additions = result.records.filter((r) => !existing.has(r.id));
            return [...additions, ...prev];
          });
        }
      } catch (err: unknown) {
        setSearchError(err instanceof Error ? err.message : "External search failed.");
      } finally {
        setSearching(false);
      }
    },
    [extQuery]
  );

  useEffect(() => {
    let cancelled = false;
    fetchEvidenceData(runId)
      .then((data) => {
        if (!cancelled) {
          setRecords(data.records);
          setProject(data.project);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load evidence records."
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [runId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "missing-doi" ? r.missingDoi === true : r.status === filter);
      const matchesSearch =
        q === "" ||
        r.title.toLowerCase().includes(q) ||
        r.authors.toLowerCase().includes(q) ||
        r.journal.toLowerCase().includes(q) ||
        (r.doi ?? "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [records, search, filter]);

  const selected = useMemo(
    () => (selectedId ? records.find((r) => r.id === selectedId) ?? null : null),
    [selectedId, records]
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId((prev) => (prev === id ? null : id));
    },
    []
  );

  const handleClose = useCallback(() => setSelectedId(null), []);

  if (loading) {
    return (
      <div className="no-ev-page" role="status" aria-label="Loading evidence records">
        <EvidenceListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="no-ev-page">
        <div role="alert" className="no-ev-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="no-ev-page">
      {/* Header */}
      <div className="no-ev-header">
        <div className="no-ev-header-top">
          <div>
            <div className="no-eyebrow no-ev-eyebrow">
              Evidence library{project ? ` · ${project}` : ""}
            </div>
            <h1 className="no-ev-page-title">Evidence records</h1>
          </div>
        </div>

        {runId && (
          <div className="no-run-filter-banner" role="status">
            <span>
              Showing evidence from run <code>{runId}</code>.
            </span>
            <Link className="no-run-filter-clear" href="/evidence">
              Clear filter
            </Link>
          </div>
        )}

        <div id="evidence-search" className="no-ev-search-row">
          <label htmlFor={searchId} className="sr-only">
            Search records
          </label>
          <input
            id={searchId}
            type="search"
            className="no-ev-search"
            placeholder="Search by title, author, journal, or DOI…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search evidence records"
          />
        </div>

        {/* External source fetch (OpenAlex): a deliberate, secondary egress action. Rendered
            only when a real backend is configured; collapsed behind a small button by default.
            In local/mock mode it is not shown at all. */}
        {externalAvailable && (
          <div id="evidence-external-search" className="no-ev-external">
            {!fetchOpen ? (
              <button
                type="button"
                className="no-ev-add-btn"
                onClick={() => setFetchOpen(true)}
              >
                <Search size={14} strokeWidth={2} aria-hidden="true" />
                Add from OpenAlex
              </button>
            ) : (
              <form
                className="no-ev-external-search"
                onSubmit={handleExternalSearch}
                aria-label="Search external sources"
              >
                <label htmlFor={extSearchId} className="sr-only">
                  Search external sources (OpenAlex)
                </label>
                <input
                  id={extSearchId}
                  type="search"
                  className="no-ev-ext-input"
                  placeholder="Fetch new papers from OpenAlex…"
                  value={extQuery}
                  onChange={(e) => setExtQuery(e.target.value)}
                  disabled={searching}
                  aria-label="Search external sources"
                  autoFocus
                />
                <button
                  type="submit"
                  className="no-secondary-button"
                  disabled={searching || extQuery.trim() === ""}
                >
                  {searching ? "Fetching…" : "Fetch"}
                </button>
                <button
                  type="button"
                  className="no-ev-ext-cancel"
                  onClick={() => setFetchOpen(false)}
                  aria-label="Cancel external fetch"
                >
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </form>
            )}
            {searchError && (
              <p className="no-ev-search-error" role="alert">
                {searchError}
              </p>
            )}
            {searchStatus && !searchError && (
              <p className="no-ev-search-status" role="status" aria-live="polite">
                {searchStatus.enabled
                  ? `Fetched ${searchStatus.records.length} · froze ${searchStatus.frozen} · deduped ${searchStatus.deduplicated}${
                      searchStatus.retrievedAt ? ` · retrieved ${searchStatus.retrievedAt}` : ""
                    }`
                  : searchStatus.message}
              </p>
            )}
          </div>
        )}

        <div id="evidence-filters" className="no-ev-filter-chips" role="group" aria-label="Filter records">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`no-ev-chip${filter === f.value ? " is-active" : ""}`}
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              aria-label={`Filter: ${f.label}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={`no-ev-body${selected ? " has-inspector" : ""}`}>
        {/* Record list */}
        <div id="evidence-list" className="no-ev-list-col" role="region" aria-label="Evidence records list">
          <div
            className="no-ev-count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            {filter !== "all" || search ? " (filtered)" : ""}
          </div>
          {filtered.length === 0 ? (
            <p className="no-ev-empty">
              {records.length === 0
                ? runId
                  ? "This run froze no evidence records."
                  : "No evidence yet — start a run to build your library."
                : "No records match the current filter."}
            </p>
          ) : (
            <ul className="no-ev-record-list" aria-label="Evidence records">
              {filtered.map((rec) => {
                const isSelected = rec.id === selectedId;
                return (
                  <li key={rec.id}>
                    <button
                      type="button"
                      className={`no-ev-record-row${isSelected ? " is-selected" : ""}`}
                      onClick={() => handleSelect(rec.id)}
                      aria-pressed={isSelected}
                      aria-expanded={isSelected}
                      aria-label={`${rec.title} — ${statusLabel(rec.status)}`}
                    >
                      <div className="no-ev-row-main">
                        <div className="no-ev-row-title">{rec.title}</div>
                        <div className="no-ev-row-meta">
                          {rec.year} · {rec.journal}
                        </div>
                      </div>
                      <div className="no-ev-row-right">
                        <StatusBadge status={rec.status} />
                        <div className="no-ev-source-icons" aria-label="Sources checked">
                          {rec.sources.map((s) => (
                            <SourceIcon key={s.name} name={s.name} />
                          ))}
                          {rec.sources.length === 0 && (
                            <span className="no-ev-no-source-icon" aria-label="No sources">—</span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail inspector */}
        {selected && (
          <DetailInspector record={selected} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}
