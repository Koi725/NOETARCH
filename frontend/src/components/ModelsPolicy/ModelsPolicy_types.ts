import type { RoutingPreference } from "@/contracts/models-policy";
export type { PolicyProvider, RoutingPreference } from "@/contracts/models-policy";

export type ModelsPolicyProps = Record<string, never>;

export interface ProviderState {
  enabled: boolean;
  dailyCostLimit: number | null;
  routingPreference: RoutingPreference;
  requiresApproval: boolean;
  savedNotice: boolean;
}

export type ProviderStateMap = Record<string, ProviderState>;
