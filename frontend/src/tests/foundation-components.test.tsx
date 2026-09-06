import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { RouteProgress } from "@/components/RouteProgress";
import { StatusIndicator } from "@/components/StatusIndicator";

describe("foundation component accessibility", () => {
  test("Button preserves its accessible name and disables while loading", () => {
    render(<Button loading>Save evidence</Button>);

    const button = screen.getByRole("button", { name: "Save evidence" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  test("ProgressBar exposes determinate value semantics", () => {
    render(<ProgressBar label="Screening progress" value={54} valueText="54 of 100 records" />);

    const progress = screen.getByRole("progressbar", { name: "Screening progress" });
    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "100");
    expect(progress).toHaveAttribute("aria-valuenow", "54");
    expect(progress).toHaveAttribute("aria-valuetext", "54 of 100 records");
  });

  test("StatusIndicator always includes visible status text", () => {
    render(<StatusIndicator status="failed" />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Failed");
    expect(status.querySelector(".status-indicator__square")).toHaveAttribute("aria-hidden", "true");
  });

  test("RouteProgress is named only while active", () => {
    const { rerender } = render(<RouteProgress active={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(<RouteProgress active />);
    expect(screen.getByRole("status", { name: "Loading next screen" })).toBeInTheDocument();
  });
});
