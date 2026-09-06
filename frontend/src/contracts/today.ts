export type TodayKPITuple = readonly [string, string, string];
export type TodaySourceTuple = readonly [string, string, string];
export type TodayFileTuple = readonly [string, string, boolean];
export type TodayFinishedTuple = readonly [string, string, string];

export interface TodayWaiting {
  title: string;
  detail: string;
  next: string;
}

export interface TodayRun {
  title: string;
  meta: string;
  current: string;
  progress: number;
  kpis: readonly TodayKPITuple[];
}

export interface TodayFailure {
  title: string;
  body: string;
}

export interface TodayData {
  project: string;
  question: string;
  waiting: TodayWaiting;
  run: TodayRun;
  failure: TodayFailure;
  finished: readonly TodayFinishedTuple[];
  sources: readonly TodaySourceTuple[];
  files: readonly TodayFileTuple[];
}
