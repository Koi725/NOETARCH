"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { mockModelsPolicyService, fetchProviders } from "@/services/ModelsPolicyService";
import type { PolicyProvider, ProviderState, ProviderStateMap } from "./ModelsPolicy_types";

// Routing options/labels are static UI display config (enums), not backend data.
const ROUTING_OPTIONS = mockModelsPolicyService.getRoutingOptions();
const ROUTING_PREFERENCE_LABELS = mockModelsPolicyService.getRoutingPreferenceLabels();
import "@/tailwind/components/ModelsPolicy/ModelsPolicy.css";

function buildInitialState(providers: PolicyProvider[]): ProviderStateMap {
  const map: ProviderStateMap = {};
  for (const p of providers) {
    map[p.id] = {
      enabled: p.enabled,
      dailyCostLimit: p.dailyCostLimit,
      routingPreference: p.routingPreference,
      requiresApproval: p.requiresApproval,
      savedNotice: false,
    };
  }
  return map;
}

interface ProviderCardProps {
  provider: PolicyProvider;
  state: ProviderState;
  onToggleEnabled: (id: string) => void;
  onCostChange: (id: string, value: number | null) => void;
  onCostSave: (id: string) => void;
  onRoutingChange: (id: string, pref: ProviderState["routingPreference"]) => void;
  onApprovalToggle: (id: string) => void;
}

function ProviderCard({
  provider,
  state,
  onToggleEnabled,
  onCostChange,
  onCostSave,
  onRoutingChange,
  onApprovalToggle,
}: ProviderCardProps) {
  const enabledId = useId();
  const costId = useId();
  const approvalId = useId();
  const isCloud = provider.type === "cloud";
  const isDown = provider.status === "down";

  function handleCostBlur() {
    onCostSave(provider.id);
  }

  function handleCostKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <article
      className={`no-policy-provider no-policy-provider--${provider.type}${isDown ? " no-policy-provider--down" : ""}${!state.enabled ? " no-policy-provider--disabled" : ""}`}
      aria-labelledby={`provider-name-${provider.id}`}
    >
      <div className="no-policy-provider__header">
        <div className="no-policy-provider__title-row">
          <h2 id={`provider-name-${provider.id}`} className="no-policy-provider__name">
            {provider.name}
          </h2>
          <span className={`no-policy-type-badge no-policy-type-badge--${provider.type}`}>
            {isCloud ? "Cloud" : "Local"}
          </span>
          {isDown && (
            <span className="no-policy-status-badge no-policy-status-badge--down" role="status">
              Provider down
            </span>
          )}
          {!isDown && state.enabled && (
            <span className="no-policy-status-badge no-policy-status-badge--ok">Available</span>
          )}
          {!isDown && !state.enabled && (
            <span className="no-policy-status-badge no-policy-status-badge--disabled">Disabled</span>
          )}
        </div>

        <div className="no-policy-provider__toggle-row">
          <label className="no-policy-toggle" htmlFor={enabledId}>
            <input
              id={enabledId}
              type="checkbox"
              role="switch"
              checked={state.enabled}
              onChange={() => onToggleEnabled(provider.id)}
              aria-checked={state.enabled}
            />
            <span className="no-policy-toggle__track" aria-hidden="true">
              <span className="no-policy-toggle__thumb" />
            </span>
            <span className="no-policy-toggle__label">
              {state.enabled ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>
      </div>

      {isDown && provider.statusNote && (
        <div className="no-policy-down-notice" role="alert">
          <span className="no-policy-down-notice__icon" aria-hidden="true">!</span>
          <div>
            <strong>Not running</strong>
            <p>{provider.statusNote}</p>
          </div>
        </div>
      )}

      <div className="no-policy-provider__body">
        <div className={`no-policy-egress-band no-policy-egress-band--${isCloud ? "cloud" : "local"}`}>
          {isCloud ? (
            <>
              <strong>Data egress — cloud provider</strong>
              <p>
                Text you send to this provider leaves your device. Policy:{" "}
                <span className="no-policy-egress-value">{provider.egressPolicy === "explicit-approval" ? "Explicit approval required before each cloud call" : "None"}</span>
              </p>
              <p className="no-policy-retention-line">
                Retention: <span>{provider.dataRetention}</span>
              </p>
            </>
          ) : (
            <>
              <strong>Local processing only</strong>
              <p>{provider.dataRetention}</p>
            </>
          )}
        </div>

        <div className="no-policy-fields">
          {provider.dailyCostLimit !== null || isCloud ? (
            <div className="no-policy-field">
              <label htmlFor={costId} className="no-policy-field__label">
                Daily cost limit (USD)
              </label>
              {isCloud ? (
                <div className="no-policy-cost-row">
                  <span className="no-policy-cost-symbol" aria-hidden="true">$</span>
                  <input
                    id={costId}
                    type="number"
                    className="no-policy-cost-input"
                    min={0}
                    step={0.5}
                    value={state.dailyCostLimit ?? ""}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      onCostChange(provider.id, Number.isFinite(v) ? v : null);
                    }}
                    onBlur={handleCostBlur}
                    onKeyDown={handleCostKeyDown}
                    aria-describedby={`cost-hint-${provider.id}`}
                    placeholder="0.00"
                  />
                  {state.savedNotice && (
                    <span className="no-policy-saved-notice" role="status" aria-live="polite">
                      Saved
                    </span>
                  )}
                </div>
              ) : (
                <p className="no-policy-field__value no-policy-field__value--muted" id={costId}>
                  No limit — local processing has no cost
                </p>
              )}
              <p className="no-policy-field__hint" id={`cost-hint-${provider.id}`}>
                {isCloud
                  ? "NOETARCH stops and asks before exceeding this limit."
                  : "Local providers incur no API charges."}
              </p>
            </div>
          ) : null}

          <div className="no-policy-field">
            <span className="no-policy-field__label" id={`routing-label-${provider.id}`}>
              Task-routing preference
            </span>
            <div
              className="no-policy-routing-group"
              role="group"
              aria-labelledby={`routing-label-${provider.id}`}
            >
              {ROUTING_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`no-policy-routing-btn${state.routingPreference === opt ? " is-active" : ""}`}
                  aria-pressed={state.routingPreference === opt}
                  onClick={() => onRoutingChange(provider.id, opt)}
                >
                  {ROUTING_PREFERENCE_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>

          <div className="no-policy-field">
            <div className="no-policy-approval-row">
              <label className="no-policy-toggle" htmlFor={approvalId}>
                <input
                  id={approvalId}
                  type="checkbox"
                  role="switch"
                  checked={state.requiresApproval}
                  onChange={() => onApprovalToggle(provider.id)}
                  aria-checked={state.requiresApproval}
                />
                <span className="no-policy-toggle__track" aria-hidden="true">
                  <span className="no-policy-toggle__thumb" />
                </span>
                <span className="no-policy-toggle__label">
                  Require explicit approval before use
                </span>
              </label>
            </div>
          </div>

          <div className="no-policy-field">
            <span className="no-policy-field__label">Capabilities</span>
            <ul className="no-policy-capabilities" aria-label={`Capabilities of ${provider.name}`}>
              {provider.capabilities.map((cap) => (
                <li key={cap} className="no-policy-capability-tag">
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ModelsPolicy() {
  const [providers, setProviders] = useState<PolicyProvider[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProviders()
      .then((data) => {
        if (!cancelled) setProviders(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load provider policies.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="no-models-policy-page">
        <div role="alert" className="no-policy-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!providers) {
    return (
      <div className="no-models-policy-page" role="status" aria-label="Loading provider policies">
        <p className="no-policy-loading">Loading provider policies…</p>
      </div>
    );
  }

  return <ModelsPolicyView providers={providers} />;
}

function ModelsPolicyView({ providers }: { providers: PolicyProvider[] }) {
  const modelsPolicyData = providers;
  const [providerState, setProviderState] = useState<ProviderStateMap>(() =>
    buildInitialState(providers),
  );

  function patchProvider(prev: ProviderStateMap, id: string, patch: Partial<ProviderState>): ProviderStateMap {
    return { ...prev, [id]: { ...prev[id], ...patch } as ProviderState };
  }

  const handleToggleEnabled = useCallback((id: string) => {
    setProviderState((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return patchProvider(prev, id, { enabled: !current.enabled });
    });
  }, []);

  const handleCostChange = useCallback((id: string, value: number | null) => {
    setProviderState((prev) => patchProvider(prev, id, { dailyCostLimit: value, savedNotice: false }));
  }, []);

  const handleCostSave = useCallback((id: string) => {
    setProviderState((prev) => patchProvider(prev, id, { savedNotice: true }));
    setTimeout(() => {
      setProviderState((prev) => patchProvider(prev, id, { savedNotice: false }));
    }, 2400);
  }, []);

  const handleRoutingChange = useCallback(
    (id: string, pref: ProviderState["routingPreference"]) => {
      setProviderState((prev) => patchProvider(prev, id, { routingPreference: pref }));
    },
    [],
  );

  const handleApprovalToggle = useCallback((id: string) => {
    setProviderState((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return patchProvider(prev, id, { requiresApproval: !current.requiresApproval });
    });
  }, []);

  return (
    <div className="no-models-policy-page">
      <header className="no-models-policy-header">
        <div>
          <div className="no-eyebrow">Settings</div>
          <h1>Models and policy</h1>
          <p>
            Control which AI providers NOETARCH may use, how much they may cost, and what data they
            may receive. No credential inputs — add API keys via your shell environment.
          </p>
        </div>
        <div className="no-prototype-notice" role="note">
          Prototype · Mock data
        </div>
      </header>

      <div className="no-models-policy-body">
        <div className="no-policy-credential-notice" role="note">
          <strong>API credentials are not managed here.</strong> Set environment variables in your
          shell (e.g. <code>ANTHROPIC_API_KEY</code>) — NOETARCH reads them at startup and never
          stores them.
        </div>

        <div className="no-policy-provider-list" role="list" aria-label="AI provider policies">
          {modelsPolicyData.map((provider) => {
            const state = providerState[provider.id];
            if (!state) return null;
            return (
              <div key={provider.id} role="listitem">
                <ProviderCard
                  provider={provider}
                  state={state}
                  onToggleEnabled={handleToggleEnabled}
                  onCostChange={handleCostChange}
                  onCostSave={handleCostSave}
                  onRoutingChange={handleRoutingChange}
                  onApprovalToggle={handleApprovalToggle}
                />
              </div>
            );
          })}
        </div>

        <section className="no-policy-routing-explainer" aria-labelledby="routing-explainer-heading">
          <h2 id="routing-explainer-heading">How task routing works</h2>
          <dl className="no-policy-routing-dl">
            <dt>Prefer</dt>
            <dd>
              NOETARCH sends tasks to this provider first whenever it is capable and available.
            </dd>
            <dt>Prefer (local fallback)</dt>
            <dd>
              Use this provider first; if it is unavailable or over cost limit, fall back to a
              local provider automatically.
            </dd>
            <dt>Allow</dt>
            <dd>
              This provider may be selected when other preferred providers are busy or unavailable.
            </dd>
            <dt>Disabled</dt>
            <dd>NOETARCH will never route tasks to this provider until you re-enable it.</dd>
          </dl>
        </section>
      </div>
    </div>
  );
}
