import type { Decision } from "@/contracts/decision";

export interface DecisionService {
  getDecisions(): Decision[];
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
export async function fetchDecisions(): Promise<Decision[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return mockDecisionService.getDecisions();
  }
  const res = await fetch(`${apiBase}/api/v1/decisions`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Decisions API error: ${res.status}`);
  }
  return (await res.json()) as Decision[];
}
