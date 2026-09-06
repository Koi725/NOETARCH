import type { TodayData } from "@/contracts/today";

export interface TodayService {
  getTodayData(): TodayData;
}

import { todayData } from "@/data/TodayOverview/TodayOverview-data";

export const mockTodayService: TodayService = {
  getTodayData: () => todayData as unknown as TodayData,
};
