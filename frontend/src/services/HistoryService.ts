import type { HistoryRun } from "@/contracts/run";

export interface HistoryService {
  getRuns(): HistoryRun[];
}

import { runs } from "@/data/RunHistory/RunHistory-data";

export const mockHistoryService: HistoryService = {
  getRuns: () => runs as HistoryRun[],
};

// ─── M6 async client ────────────────────────────────────────────────────────

/**
 * Fetches run history from the real backend when NEXT_PUBLIC_API_BASE is set.
 * Falls back to mock data when the env var is absent, so the app runs standalone.
 */
export async function fetchRuns(): Promise<HistoryRun[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return mockHistoryService.getRuns();
  }
  const res = await fetch(`${apiBase}/api/v1/history`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`History API error: ${res.status}`);
  }
  return (await res.json()) as HistoryRun[];
}
