import type { HTMLAttributes } from "react";

export type StatusKind = "live" | "pending" | "verified" | "complete" | "failed" | "warning" | "unverified" | "idle";

export type StatusIndicatorProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  status: StatusKind;
  label?: string;
  live?: boolean;
};
