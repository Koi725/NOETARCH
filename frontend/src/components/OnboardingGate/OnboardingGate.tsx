"use client";

import { useEffect, useState } from "react";
import { ConnectApiKey } from "@/components/ConnectApiKey";
import { ANTHROPIC_PROVIDER } from "@/contracts/credentials";
import { fetchCredentialStatus } from "@/services/CredentialsService";
import "@/tailwind/components/OnboardingGate/OnboardingGate.css";

type GateState = "checking" | "needs-key" | "vault-error" | "ready";

// The onboarding key gate. On first load it asks the backend whether an enabled Anthropic
// key is configured. No enabled key → the "Connect your API key" screen. A key already
// exists → straight into the workspace. A vault error is SHOWN but never hard-blocks: the
// user can still continue into the rest of the app (real runs stay gated until a key works).
//
// The gate lives inside the persistent shell layout, so once it resolves to "ready" it
// stays ready across client-side navigation without re-checking on every route change.
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>("checking");
  const [vaultError, setVaultError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCredentialStatus(ANTHROPIC_PROVIDER)
      .then((status) => {
        if (cancelled) return;
        setState(status.configured && status.enabled ? "ready" : "needs-key");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setVaultError(
          err instanceof Error ? err.message : "The credential vault could not be reached.",
        );
        setState("vault-error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "ready") {
    return <>{children}</>;
  }

  if (state === "checking") {
    return (
      <div className="no-gate-splash" role="status" aria-label="Checking your workspace">
        <span className="no-gate-spinner" aria-hidden="true" />
      </div>
    );
  }

  // needs-key or vault-error → the connect screen (never hard-blocks in either case).
  return (
    <ConnectApiKey
      vaultError={state === "vault-error" ? vaultError : null}
      onConnected={() => setState("ready")}
      onSkip={() => setState("ready")}
    />
  );
}
