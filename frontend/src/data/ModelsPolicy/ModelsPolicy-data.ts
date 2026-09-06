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

export const modelsPolicyData: PolicyProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic Claude",
    type: "cloud",
    status: "available",
    enabled: true,
    dailyCostLimit: 2.0,
    dataRetention: "Zero retention (API ToS § 3.1 — data not used for training)",
    egressPolicy: "explicit-approval",
    capabilities: ["abstract-screening", "evidence-synthesis", "query-generation"],
    routingPreference: "prefer-local-fallback",
    requiresApproval: true,
  },
  {
    id: "openai",
    name: "OpenAI GPT",
    type: "cloud",
    status: "available",
    enabled: false,
    dailyCostLimit: 1.0,
    dataRetention: "30 days (default) — opt-out available",
    egressPolicy: "explicit-approval",
    capabilities: ["abstract-screening", "query-generation"],
    routingPreference: "disabled",
    requiresApproval: true,
  },
  {
    id: "on-device",
    name: "On-device model",
    type: "local",
    status: "available",
    enabled: true,
    dailyCostLimit: null,
    dataRetention: "Not applicable — all processing stays on device",
    egressPolicy: "none",
    capabilities: ["query-generation", "deduplication", "clustering"],
    routingPreference: "prefer",
    requiresApproval: false,
  },
  {
    id: "ollama",
    name: "Ollama (local LLM)",
    type: "local",
    status: "down",
    statusNote: "Ollama not running — start with: ollama serve",
    enabled: true,
    dailyCostLimit: null,
    dataRetention: "Not applicable — all processing stays on device",
    egressPolicy: "none",
    capabilities: ["abstract-screening", "query-generation"],
    routingPreference: "prefer",
    requiresApproval: false,
  },
];
