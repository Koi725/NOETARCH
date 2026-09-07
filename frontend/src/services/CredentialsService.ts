import type {
  CredentialPatch,
  CredentialStatus,
  CredentialUpsert,
} from "@/contracts/credentials";
import { ANTHROPIC_PROVIDER } from "@/contracts/credentials";

// Async client for the BYOK credential surface. All calls target the guarded backend
// (encrypted vault). The plaintext key is only ever sent outbound on setCredential; the
// GET/PATCH/DELETE paths never carry or return key material.
//
// Standalone (mock) mode: when NEXT_PUBLIC_API_BASE is unset there is no vault to talk to,
// so the onboarding gate is skipped and these mutations are unavailable. `hasBackend()`
// lets the UI branch cleanly instead of firing doomed requests.

const PROVIDER_PATTERN = /^[a-z][a-z0-9_-]{0,62}$/;

export function hasBackend(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE);
}

function apiBaseOrThrow(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    throw new Error("No backend configured — credentials require a running vault.");
  }
  return apiBase;
}

function credentialsUrl(apiBase: string, provider: string): string {
  if (!PROVIDER_PATTERN.test(provider)) {
    throw new Error(`Invalid provider id: ${provider}`);
  }
  return `${apiBase}/api/v1/models-policy/credentials/${provider}`;
}

/**
 * Read a provider's masked credential status. In standalone/mock mode there is no vault,
 * so this resolves to a synthetic "configured" status that lets the onboarding gate pass
 * straight through (the demo app is never trapped behind a key it cannot store).
 */
export async function fetchCredentialStatus(
  provider: string = ANTHROPIC_PROVIDER,
): Promise<CredentialStatus> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return { provider, configured: true, enabled: true, masked: null };
  }
  const res = await fetch(credentialsUrl(apiBase, provider), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Credential status error: ${res.status}`);
  }
  return (await res.json()) as CredentialStatus;
}

/** Set or rotate the provider key (PUT). The plaintext is sent once and never stored. */
export async function setCredential(
  provider: string,
  body: CredentialUpsert,
): Promise<CredentialStatus> {
  const apiBase = apiBaseOrThrow();
  const res = await fetch(credentialsUrl(apiBase, provider), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await credentialError(res, "Could not save the key"));
  }
  return (await res.json()) as CredentialStatus;
}

/** Toggle enable / change budget without re-sending the key (PATCH). */
export async function patchCredential(
  provider: string,
  body: CredentialPatch,
): Promise<CredentialStatus> {
  const apiBase = apiBaseOrThrow();
  const res = await fetch(credentialsUrl(apiBase, provider), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await credentialError(res, "Could not update the key"));
  }
  return (await res.json()) as CredentialStatus;
}

/** Remove the provider key from the vault (DELETE). */
export async function deleteCredential(
  provider: string,
): Promise<CredentialStatus> {
  const apiBase = apiBaseOrThrow();
  const res = await fetch(credentialsUrl(apiBase, provider), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(await credentialError(res, "Could not remove the key"));
  }
  return (await res.json()) as CredentialStatus;
}

// Surface the backend's structured error message when present, without leaking internals.
async function credentialError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: { message?: string }; detail?: string };
    const message = data?.error?.message ?? data?.detail;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  } catch {
    // non-JSON body — fall through to the generic message
  }
  return `${fallback} (HTTP ${res.status}).`;
}
