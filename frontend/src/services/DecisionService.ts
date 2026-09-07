import type { AuditEntry, Decision, DecisionActionType } from "@/contracts/decision";

export interface DecisionService {
  getDecisions(): Decision[];
}

/** True when a real backend is configured (vs. standalone mock mode). */
export function isRealBackend(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE);
}

import { decisions } from "@/data/DecisionCenter/DecisionCenter-data";

export const mockDecisionService: DecisionService = {
  getDecisions: () => decisions,
};

// ─── M6 async client ────────────────────────────────────────────────────────

/**
 * Fetches decisions from the real backend when NEXT_PUBLIC_API_BASE is set.
 * Falls back to mock data when the env var is absent, so the app runs standalone.
 */
export async function fetchDecisions(runId?: string): Promise<Decision[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return mockDecisionService.getDecisions();
  }
  const url = runId
    ? `${apiBase}/api/v1/decisions?run=${encodeURIComponent(runId)}`
    : `${apiBase}/api/v1/decisions`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Decisions API error: ${res.status}`);
  }
  return (await res.json()) as Decision[];
}

// ─── M8 write path ───────────────────────────────────────────────────────────

export class DecisionConflictError extends Error {}

/**
 * Approve / reject / use-local-alternative on a pending decision (real backend only).
 * Sends the decision's current version for optimistic concurrency. A 409 raises a
 * DecisionConflictError so the caller can prompt a refresh instead of a blind retry.
 */
export async function actionDecision(
  id: string,
  action: DecisionActionType,
  expectedVersion: number,
): Promise<Decision> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    throw new Error("No backend configured — decision actions are simulated in mock mode.");
  }
  const res = await fetch(`${apiBase}/api/v1/decisions/${id}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ action, expected_version: expectedVersion }),
  });
  if (res.status === 409) {
    throw new DecisionConflictError("This decision changed elsewhere — refresh and try again.");
  }
  if (!res.ok) {
    throw new Error(`Decision action failed: ${res.status}`);
  }
  return (await res.json()) as Decision;
}

/** Fetch the append-only audit trail for a decision. Empty in mock mode. */
export async function fetchAuditTrail(id: string): Promise<AuditEntry[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return [];
  }
  const res = await fetch(`${apiBase}/api/v1/decisions/${id}/audit`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Audit fetch failed: ${res.status}`);
  }
  return (await res.json()) as AuditEntry[];
}
