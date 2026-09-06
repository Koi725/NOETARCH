export const STATUS_LABELS = {
  live: "Live",
  pending: "Needs a decision",
  verified: "Verified",
  complete: "Complete",
  failed: "Failed",
  warning: "Needs attention",
  unverified: "Not checked by us",
  idle: "Not started",
} as const;

export type StatusKind = keyof typeof STATUS_LABELS;
