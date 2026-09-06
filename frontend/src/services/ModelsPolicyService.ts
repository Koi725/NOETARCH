import type { PolicyProvider, RoutingPreference } from "@/contracts/models-policy";
import { ROUTING_OPTIONS, ROUTING_PREFERENCE_LABELS } from "@/contracts/models-policy";

export interface ModelsPolicyService {
  getProviders(): PolicyProvider[];
  getRoutingOptions(): RoutingPreference[];
  getRoutingPreferenceLabels(): Record<RoutingPreference, string>;
}

import { modelsPolicyData } from "@/data/ModelsPolicy/ModelsPolicy-data";

export const mockModelsPolicyService: ModelsPolicyService = {
  getProviders: () => modelsPolicyData as PolicyProvider[],
  getRoutingOptions: () => ROUTING_OPTIONS,
  getRoutingPreferenceLabels: () => ROUTING_PREFERENCE_LABELS,
};

// ─── M6 async client ────────────────────────────────────────────────────────

/**
 * Fetches provider policies from the real backend when NEXT_PUBLIC_API_BASE is set.
 * Falls back to mock data when the env var is absent, so the app runs standalone.
 * Routing options/labels stay synchronous (UI display config, no endpoint).
 */
export async function fetchProviders(): Promise<PolicyProvider[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return mockModelsPolicyService.getProviders();
  }
  const res = await fetch(`${apiBase}/api/v1/models-policy/providers`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Models policy API error: ${res.status}`);
  }
  return (await res.json()) as PolicyProvider[];
}
