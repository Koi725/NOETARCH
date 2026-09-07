import type { RunSynthesis } from "./run";

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

// The newest real run's headline + grounded synthesis, surfaced on Today (WS3).
export interface TodayLatestRun {
  id: string;
  question: string;
  status: string;
  frozen: number;
  screened: number;
  included: number;
  costUsd: number;
  synthesis?: RunSynthesis | null;
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
  latestRun?: TodayLatestRun | null;
}
