import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TodayOverview } from "@/components/TodayOverview";

function renderToday() {
  return render(
    <ThemeProvider>
      <TodayOverview />
    </ThemeProvider>,
  );
}

describe("Today prototype disclosure and navigation", () => {
  test("clearly discloses that operational-looking content is mock data", () => {
    renderToday();
    expect(screen.getByRole("note")).toHaveTextContent("Prototype · Mock data");
  });

  test("primary actions navigate to M3 routes rather than simulating backend work", () => {
    renderToday();
    expect(screen.getByRole("link", { name: "Start a review" })).toHaveAttribute("href", "/guided-review");
    expect(screen.getByRole("link", { name: "Watch the active literature run" })).toHaveAttribute("href", "/live-run");
    expect(screen.getByRole("link", { name: "Decide" })).toHaveAttribute("href", "/decisions");
    expect(screen.getByRole("link", { name: "Change what's allowed" })).toHaveAttribute("href", "/models-policy");
  });

  test("backend-dependent retry action remains disabled and labelled", () => {
    renderToday();
    expect(screen.getByRole("button", { name: "Try that step again — coming soon" })).toBeDisabled();
  });

  test("history navigation link is present for run details", () => {
    renderToday();
    expect(screen.getByRole("link", { name: "See where it stopped" })).toHaveAttribute("href", "/history");
  });
});
