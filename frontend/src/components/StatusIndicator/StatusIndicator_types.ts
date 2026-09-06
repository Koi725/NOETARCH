import type { HTMLAttributes } from "react";
import type { StatusKind } from "@/data/StatusIndicator/StatusIndicator-data";

export type StatusIndicatorProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  status: StatusKind;
  label?: string;
  live?: boolean;
};
