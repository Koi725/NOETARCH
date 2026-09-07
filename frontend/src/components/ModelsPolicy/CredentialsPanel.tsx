"use client";

import { useEffect, useId, useState } from "react";
import type { CredentialStatus } from "@/contracts/credentials";
import { ANTHROPIC_PROVIDER } from "@/contracts/credentials";
import {
  deleteCredential,
  fetchCredentialStatus,
  hasBackend,
  patchCredential,
  setCredential,
} from "@/services/CredentialsService";

type Load = "loading" | "ready" | "error";

// BYOK key management for Models & Policy: masked display, rotate, enable/disable, daily
// budget, and remove. The plaintext key is only ever sent on rotate (PUT) and is never
// echoed back, logged, or stored in component state after the request resolves.
export function CredentialsPanel() {
  const provider = ANTHROPIC_PROVIDER;
  const backend = hasBackend();
  const [load, setLoad] = useState<Load>(backend ? "loading" : "ready");
  const [status, setStatus] = useState<CredentialStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [newKey, setNewKey] = useState("");
  const [reveal, setReveal] = useState(false);
  const [budget, setBudget] = useState("");

  const keyId = useId();
  const budgetId = useId();

  useEffect(() => {
    if (!backend) return;
    let cancelled = false;
    fetchCredentialStatus(provider)
      .then((s) => {
        if (cancelled) return;
        setStatus(s);
        setBudget(s.dailyBudget != null ? String(s.dailyBudget) : "");
        setLoad("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not read the key vault.");
        setLoad("error");
      });
    return () => {
      cancelled = true;
    };
  }, [backend, provider]);

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 2600);
  }

  async function withBusy(fn: () => Promise<CredentialStatus>, ok: string) {
    setBusy(true);
    setError(null);
    try {
      const next = await fn();
      setStatus(next);
      setBudget(next.dailyBudget != null ? String(next.dailyBudget) : "");
      flash(ok);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "The request failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveKey(event: React.FormEvent) {
    event.preventDefault();
    const key = newKey.trim();
    if (key.length < 8) return;
    await withBusy(
      () => setCredential(provider, { api_key: key, enabled: true }),
      status?.configured ? "Key rotated" : "Key connected",
    );
    setNewKey(""); // drop plaintext from memory immediately
  }

  async function handleToggleEnabled() {
    if (!status?.configured) return;
    await withBusy(
      () => patchCredential(provider, { enabled: !status.enabled }),
      status.enabled ? "Key disabled" : "Key enabled",
    );
  }

  async function handleSaveBudget() {
    if (!status?.configured) return;
    const trimmed = budget.trim();
    const value = trimmed === "" ? 0 : Number.parseFloat(trimmed);
    if (!Number.isFinite(value) || value < 0) return;
    await withBusy(() => patchCredential(provider, { daily_budget: value }), "Budget saved");
  }

  async function handleRemove() {
    if (!status?.configured) return;
    await withBusy(() => deleteCredential(provider), "Key removed");
  }

  if (!backend) {
    return (
      <div id="policy-credentials" className="no-cred-panel" role="note">
        <strong>Provider keys are managed here when connected to a backend.</strong>
        <p className="no-cred-hint">
          You&apos;re running in standalone preview mode. Start the full app to connect an
          encrypted Anthropic key.
        </p>
      </div>
    );
  }

  return (
    <section id="policy-credentials" className="no-cred-panel" aria-labelledby="cred-heading">
      <div className="no-cred-head">
        <h2 id="cred-heading" className="no-cred-title">
          Anthropic API key
        </h2>
        {load === "ready" && (
          <span
            className={`no-cred-badge is-${status?.configured ? (status.enabled ? "on" : "off") : "none"}`}
          >
            {status?.configured ? (status.enabled ? "Connected" : "Disabled") : "Not connected"}
          </span>
        )}
      </div>

      <p className="no-cred-hint">
        Your key is encrypted at rest in a local vault — never written to logs, env files, or
        this browser. Outbound calls stay behind the allowlisted egress guard.
      </p>

      {load === "loading" && <p className="no-cred-loading" role="status">Reading vault…</p>}

      {error && (
        <p className="no-cred-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="no-cred-notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}

      {load === "ready" && status?.configured && (
        <div className="no-cred-current">
          <div className="no-cred-row">
            <span className="no-cred-label">Current key</span>
            <code className="no-cred-masked">{status.masked ?? "sk-…"}</code>
          </div>
          <div className="no-cred-controls">
            <label className="no-policy-toggle" htmlFor={`${keyId}-enabled`}>
              <input
                id={`${keyId}-enabled`}
                type="checkbox"
                role="switch"
                checked={Boolean(status.enabled)}
                onChange={() => void handleToggleEnabled()}
                disabled={busy}
                aria-checked={Boolean(status.enabled)}
              />
              <span className="no-policy-toggle__track" aria-hidden="true">
                <span className="no-policy-toggle__thumb" />
              </span>
              <span className="no-policy-toggle__label">
                {status.enabled ? "Enabled" : "Disabled"}
              </span>
            </label>
            <button
              type="button"
              className="no-cred-remove"
              onClick={() => void handleRemove()}
              disabled={busy}
            >
              Remove key
            </button>
          </div>

          <div className="no-cred-budget">
            <label htmlFor={budgetId} className="no-cred-label">
              Daily budget (USD)
            </label>
            <div className="no-cred-budget-row">
              <span aria-hidden="true">$</span>
              <input
                id={budgetId}
                className="no-cred-budget-input"
                type="number"
                min={0}
                step={0.5}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="No cap"
                disabled={busy}
              />
              <button
                type="button"
                className="no-secondary-button"
                onClick={() => void handleSaveBudget()}
                disabled={busy}
              >
                Save budget
              </button>
            </div>
          </div>
        </div>
      )}

      {load === "ready" && (
        <form className="no-cred-rotate" onSubmit={handleSaveKey}>
          <label htmlFor={keyId} className="no-cred-label">
            {status?.configured ? "Rotate key" : "Connect a key"}
          </label>
          <div className="no-cred-key-row">
            <input
              id={keyId}
              className="no-connect-input"
              type={reveal ? "text" : "password"}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="sk-ant-…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="no-secondary-button"
              onClick={() => setReveal((r) => !r)}
              aria-pressed={reveal}
            >
              {reveal ? "Hide" : "Show"}
            </button>
            <button
              type="submit"
              className="no-primary-button"
              disabled={busy || newKey.trim().length < 8}
            >
              {status?.configured ? "Rotate" : "Connect"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
