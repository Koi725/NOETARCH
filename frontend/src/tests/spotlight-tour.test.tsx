import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SpotlightTour } from "@/components/ui/SpotlightTour";
import type { TourStep } from "@/components/ui";

const STEPS: TourStep[] = [
  { targetId: "t1", title: "First stop", explanation: "Explain one." },
  { targetId: "t2", title: "Second stop", explanation: "Explain two." },
  { targetId: "t3", title: "Third stop", explanation: "Explain three." },
];

function renderTour(reducedMotion = false) {
  const onClose = vi.fn();
  render(
    <ThemeProvider>
      <SpotlightTour steps={STEPS} onClose={onClose} reducedMotion={reducedMotion} />
    </ThemeProvider>,
  );
  return { onClose };
}

describe("SpotlightTour", () => {
  test("renders an accessible dialog with title, explanation, and step count", () => {
    renderTour();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("First stop")).toBeInTheDocument();
    expect(screen.getByText("Explain one.")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  test("announces the current step to screen readers", () => {
    renderTour();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Step 1 of 3: First stop");
  });

  test("steps forward and back with Next/Back", () => {
    renderTour();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Second stop")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("First stop")).toBeInTheDocument();
  });

  test("last step shows Done and closes", () => {
    const { onClose } = renderTour();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Third stop")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalled();
  });

  test("keyboard: arrows advance, Escape dismisses", () => {
    const { onClose } = renderTour();
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(screen.getByText("Second stop")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(screen.getByText("First stop")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("Skip dismisses the tour", () => {
    const { onClose } = renderTour();
    fireEvent.click(screen.getByRole("button", { name: "Skip the tour" }));
    expect(onClose).toHaveBeenCalled();
  });

  test("reduced motion sets data-reduced and still steps instantly", () => {
    renderTour(true);
    const root = screen.getByRole("dialog").closest(".no-tour-root");
    expect(root).toHaveAttribute("data-reduced", "true");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Second stop")).toBeInTheDocument();
  });
});
