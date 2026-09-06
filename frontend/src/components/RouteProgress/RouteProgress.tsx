import type { RouteProgressProps } from "./RouteProgress_types";
import "@/tailwind/components/RouteProgress/RouteProgress.css";

export function RouteProgress({ active }: RouteProgressProps) {
  if (!active) return null;
  return <div className="no-route-progress" role="status" aria-label="Loading next screen" />;
}
