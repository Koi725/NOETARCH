// Canonical types for the BYOK credential surface (Models & Policy → credentials).
//
// The status shape is WRITE-ONLY by design: the backend returns a MASKED key
// ("sk-…last4") and never the plaintext. The plaintext only ever travels outbound on a
// set/rotate request and is never stored in the frontend beyond the input's lifetime.

export interface CredentialStatus {
  provider: string;
  configured: boolean;
  masked?: string | null; // "sk-…last4" when configured, else null
  enabled?: boolean;
  dailyBudget?: number | null;
  updatedAt?: string | null;
}

export interface CredentialUpsert {
  api_key: string;
  enabled?: boolean;
  daily_budget?: number | null;
}

export interface CredentialPatch {
  enabled?: boolean;
  daily_budget?: number | null;
}

export const ANTHROPIC_PROVIDER = "anthropic";
