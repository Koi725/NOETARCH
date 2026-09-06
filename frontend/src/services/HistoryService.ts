import type { HistoryRun } from "@/contracts/run";

export interface HistoryService {
  getRuns(): HistoryRun[];
}

import { runs } from "@/data/RunHistory/RunHistory-data";

export const mockHistoryService: HistoryService = {
  getRuns: () => runs as HistoryRun[],
};
