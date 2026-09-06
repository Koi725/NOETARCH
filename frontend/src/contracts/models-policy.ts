export type ProviderType = "cloud" | "local";
export type ProviderStatus = "available" | "down";
export type EgressPolicy = "explicit-approval" | "none";
export type RoutingPreference = "prefer" | "prefer-local-fallback" | "allow" | "disabled";

export interface PolicyProvider {
  id: string;
  name: string;
  type: ProviderType;
  status: ProviderStatus;
  statusNote?: string;
  enabled: boolean;
  dailyCostLimit: number | null;
  dataRetention: string;
  egressPolicy: EgressPolicy;
  capabilities: string[];
  routingPreference: RoutingPreference;
  requiresApproval: boolean;
}

export const ROUTING_PREFERENCE_LABELS: Record<RoutingPreference, string> = {
  prefer: "Prefer",
  "prefer-local-fallback": "Prefer (local fallback)",
  allow: "Allow",
  disabled: "Disabled",
};

export const ROUTING_OPTIONS: RoutingPreference[] = ["prefer", "allow", "prefer-local-fallback", "disabled"];
