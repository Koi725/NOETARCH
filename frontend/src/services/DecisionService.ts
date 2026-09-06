import type { Decision } from "@/contracts/decision";

export interface DecisionService {
  getDecisions(): Decision[];
}

import { decisions } from "@/data/DecisionCenter/DecisionCenter-data";

export const mockDecisionService: DecisionService = {
  getDecisions: () => decisions,
};
