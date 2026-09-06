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
