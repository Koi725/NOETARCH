import type { StatusIndicatorProps } from "./StatusIndicator_types";

const STATUS_LABELS = {
  live: "Live",
  pending: "Needs a decision",
  verified: "Verified",
  complete: "Complete",
  failed: "Failed",
  warning: "Needs attention",
  unverified: "Not checked by us",
  idle: "Not started",
} as const;

export function StatusIndicator({ status, label, live = false, className, ...props }: StatusIndicatorProps) {
  const classes = ["status-indicator", `status-indicator--${status}`, className]
    .filter(Boolean)
    .join(" ");
  const accessibleLabel = label ?? STATUS_LABELS[status];

  return (
    <div {...props} className={classes} role="status" aria-live={live ? "polite" : undefined}>
      <span className="status-indicator__square" aria-hidden="true" />
      <span className="status-indicator__label">{accessibleLabel}</span>
    </div>
  );
}
