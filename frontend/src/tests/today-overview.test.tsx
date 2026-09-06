import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TodayOverview } from "@/components/TodayOverview";

function renderToday() {
  return render(
    <ThemeProvider>
      <TodayOverview onOpenPalette={vi.fn()} />
    </ThemeProvider>,
  );
}

describe("Today prototype disclosure and unavailable actions", () => {
  test("clearly discloses that operational-looking content is mock data", () => {
    renderToday();

    expect(screen.getByRole("note")).toHaveTextContent("Prototype · Mock data");
  });

  test("future product actions are disabled, labelled and never exposed as links", () => {
    renderToday();

    expect(screen.getByRole("button", { name: "Start a review — coming soon" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Watch the live literature run — coming soon" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Decide — coming soon" })).toBeDisabled();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
