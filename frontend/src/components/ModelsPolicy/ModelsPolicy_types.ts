import type { PolicyProvider, RoutingPreference } from "@/data/ModelsPolicy/ModelsPolicy-data";

export type { PolicyProvider, RoutingPreference };

export type ModelsPolicyProps = Record<string, never>;

export interface ProviderState {
  enabled: boolean;
  dailyCostLimit: number | null;
  routingPreference: RoutingPreference;
  requiresApproval: boolean;
  savedNotice: boolean;
}

export type ProviderStateMap = Record<string, ProviderState>;
