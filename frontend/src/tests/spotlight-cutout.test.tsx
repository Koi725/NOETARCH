import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SpotlightTour } from "@/components/ui/SpotlightTour";
import type { TourStep } from "@/components/ui";

afterEach(() => {
  vi.restoreAllMocks();
});

function renderWithTarget(hasTarget: boolean) {
  const steps: TourStep[] = [
    { targetId: hasTarget ? "tgt" : "missing", title: "Look here", explanation: "This section." },
  ];
  return render(
    <ThemeProvider>
      {hasTarget && <div id="tgt">target content</div>}
      <SpotlightTour steps={steps} onClose={() => {}} />
    </ThemeProvider>,
  );
}

describe("spotlight brightness / cutout", () => {
  test("with a real target, the root marks has-spotlight and renders a bright cutout", async () => {
    // Give the target a non-zero rectangle (jsdom returns 0 by default).
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 120,
      left: 140,
      width: 240,
      height: 48,
      right: 380,
      bottom: 168,
      x: 140,
      y: 120,
      toJSON: () => ({}),
    } as DOMRect);

    const { container } = renderWithTarget(true);

    await waitFor(() => {
      const root = container.querySelector(".no-tour-root");
      expect(root?.className).toContain("has-spotlight");
    });
    // The spotlight cutout element exists (its box-shadow dims AROUND it; the target
    // beneath the transparent cutout stays at full brightness).
    expect(container.querySelector(".no-tour-spotlight")).not.toBeNull();
  });

  test("without a target, it falls back to a uniform dim (no cutout, no has-spotlight)", () => {
    const { container } = renderWithTarget(false);
    const root = container.querySelector(".no-tour-root");
    expect(root?.className).not.toContain("has-spotlight");
    expect(container.querySelector(".no-tour-spotlight")).toBeNull();
    // The dialog still renders so the tour remains usable.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
