import type { TodayData } from "@/contracts/today";

export interface TodayService {
  getTodayData(): TodayData;
}

import { todayData } from "@/data/TodayOverview/TodayOverview-data";

export const mockTodayService: TodayService = {
  getTodayData: () => todayData as unknown as TodayData,
};

// ─── M6 async client ────────────────────────────────────────────────────────

/**
 * Fetches the Today snapshot from the real backend when NEXT_PUBLIC_API_BASE is set.
 * Falls back to mock data when the env var is absent, so the app runs standalone.
 */
export async function fetchTodayData(): Promise<TodayData> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return mockTodayService.getTodayData();
  }
  const res = await fetch(`${apiBase}/api/v1/today`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Today API error: ${res.status}`);
  }
  return (await res.json()) as TodayData;
}
