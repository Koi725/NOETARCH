import { clampProgress, DEFAULT_PROGRESS_MAX } from "@/data/ProgressBar/ProgressBar-data";
import type { ProgressBarProps } from "./ProgressBar_types";

export function ProgressBar({
  value,
  max = DEFAULT_PROGRESS_MAX,
  label = "Progress",
  showValue = true,
  valueText,
  indeterminate = value === undefined,
  className,
  ...props
}: ProgressBarProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : DEFAULT_PROGRESS_MAX;
  const safeValue = clampProgress(value ?? 0, safeMax);
  const percentage = (safeValue / safeMax) * 100;
  const classes = ["progress-bar", className].filter(Boolean).join(" ");
  const style = { "--progress": `${percentage}%` } as React.CSSProperties;

  return (
    <div {...props} className={classes}>
      <div className="progress-bar__heading">
        <span className="progress-bar__label">{label}</span>
        {showValue && !indeterminate ? (
          <span className="progress-bar__value">{valueText ?? `${Math.round(percentage)}%`}</span>
        ) : null}
      </div>
      <div
        className="progress-bar__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : safeValue}
        aria-valuetext={indeterminate ? undefined : valueText}
        data-indeterminate={indeterminate ? "true" : "false"}
      >
        <span className="progress-bar__fill" style={style} />
        <span className="progress-bar__sweep" aria-hidden="true" />
      </div>
    </div>
  );
}
