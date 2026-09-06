import type { HTMLAttributes } from "react";

export type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  valueText?: string;
  indeterminate?: boolean;
};
