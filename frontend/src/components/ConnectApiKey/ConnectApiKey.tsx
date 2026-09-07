"use client";

import { useId, useState } from "react";
import { ANTHROPIC_PROVIDER } from "@/contracts/credentials";
import { setCredential } from "@/services/CredentialsService";
import type { ConnectApiKeyProps } from "./ConnectApiKey_types";
import "@/tailwind/components/ConnectApiKey/ConnectApiKey.css";

type SubmitState = "idle" | "saving" | "error";

// The onboarding key gate — the first thing a new user sees. Pastes an Anthropic API key,
// which is sent ONCE to the encrypted vault (PUT /credentials/anthropic) and never stored,
// echoed, or logged in the frontend. On success the app continues into the workspace.
export function ConnectApiKey({
  onConnected,
  onSkip,
  vaultError,
  standalone = false,
  existingStatus,
}: ConnectApiKeyProps) {
  const inputId = useId();
  const errorId = useId();
  const [apiKey, setApiKey] = useState("");
  const [reveal, setReveal] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const alreadyConfigured = Boolean(existingStatus?.configured && existingStatus?.enabled);
  const trimmed = apiKey.trim();
  const canSubmit = trimmed.length >= 8 && state !== "saving";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setState("saving");
    setMessage(null);
    try {
      await setCredential(ANTHROPIC_PROVIDER, { api_key: trimmed, enabled: true });
      setApiKey(""); // drop the plaintext from memory as soon as it is saved
      onConnected?.();
    } catch (err: unknown) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Could not save the key. Try again.");
    }
  }

  return (
    <div className={`no-connect-page${standalone ? " is-standalone" : ""}`}>
      <div className="no-connect-card">
        <div className="no-connect-brand">
          <span className="no-brand-mark" aria-hidden="true" />
          <span className="no-connect-brand-name">NOETARCH</span>
        </div>

        <span className="no-eyebrow">Get started</span>
        <h1 className="no-connect-title">Connect your API key</h1>
        <p className="no-connect-lede">
          NOETARCH runs on your own Anthropic key. Paste it once — it is encrypted in a local
          vault and never written to logs, environment files, or the browser. You stay in
          control of spend and can rotate or remove it any time under Models &amp; Policy.
        </p>

        {vaultError && (
          <div className="no-connect-vault-error" role="alert">
            <strong>The key vault reported a problem.</strong>
            <p>{vaultError}</p>
            <p className="no-connect-vault-hint">
              You can still use the rest of the app — real runs stay unavailable until a key is
              connected.
            </p>
          </div>
        )}

        {alreadyConfigured ? (
          <div className="no-connect-configured" role="status">
            <p>
              A key is already connected{" "}
              {existingStatus?.masked ? (
                <code className="no-connect-masked">{existingStatus.masked}</code>
              ) : null}
              . You&apos;re all set.
            </p>
            <button type="button" className="no-primary-button" onClick={() => onConnected?.()}>
              Continue to the workspace
            </button>
            <p className="no-connect-rotate-note">
              To rotate or replace it, paste a new key below.
            </p>
          </div>
        ) : null}

        <form className="no-connect-form" onSubmit={handleSubmit}>
          <label htmlFor={inputId} className="no-connect-label">
            Anthropic API key
          </label>
          <div className="no-connect-input-row">
            <input
              id={inputId}
              className="no-connect-input"
              type={reveal ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (state === "error") setState("idle");
              }}
              placeholder="sk-ant-…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-describedby={message ? errorId : undefined}
              aria-invalid={state === "error" ? "true" : undefined}
            />
            <button
              type="button"
              className="no-secondary-button no-connect-reveal"
              onClick={() => setReveal((r) => !r)}
              aria-pressed={reveal}
              aria-label={reveal ? "Hide key" : "Show key"}
            >
              {reveal ? "Hide" : "Show"}
            </button>
          </div>

          {message && (
            <p className="no-connect-error" id={errorId} role="alert">
              {message}
            </p>
          )}

          <div className="no-connect-actions">
            <button type="submit" className="no-primary-button" disabled={!canSubmit}>
              {state === "saving" ? "Connecting…" : "Connect and continue"}
            </button>
            {onSkip && (
              <button type="button" className="no-connect-skip" onClick={onSkip}>
                Skip for now
              </button>
            )}
          </div>
        </form>

        <p className="no-connect-security-note" role="note">
          <span className="no-connect-lock" aria-hidden="true" />
          Stored encrypted at rest. Outbound calls are constrained to an allowlist; nothing
          leaves your machine except approved provider and source requests.
        </p>
      </div>
    </div>
  );
}
