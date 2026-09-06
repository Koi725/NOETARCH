import { render, screen, fireEvent, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  TourProvider,
  useScreenTour,
  ExplainTip,
  TourHelpButton,
  hasSeenTour,
  markTourSeen,
  resetTourSeen,
  type TourStep,
} from "@/components/ui";

const STEPS: TourStep[] = [
  { targetId: "x", title: "Welcome", explanation: "Here is the panel." },
];

function Harness({ tourKey }: { tourKey: string }) {
  useScreenTour(tourKey, STEPS);
  return (
    <div>
      <div id="x">target</div>
      <TourHelpButton />
    </div>
  );
}

function renderHarness(tourKey: string) {
  return render(
    <ThemeProvider>
      <TourProvider>
        <Harness tourKey={tourKey} />
      </TourProvider>
    </ThemeProvider>,
  );
}

describe("tour storage (shown-once)", () => {
  afterEach(() => resetTourSeen("unit-key"));

  test("marks and reads seen state", () => {
    resetTourSeen("unit-key");
    expect(hasSeenTour("unit-key")).toBe(false);
    markTourSeen("unit-key");
    expect(hasSeenTour("unit-key")).toBe(true);
  });
});

describe("first-run auto-run once", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("auto-runs the tour on first visit, then never again automatically", () => {
    resetTourSeen("auto-key");
    const first = renderHarness("auto-key");
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    first.unmount();

    // Second mount: already seen → no auto-run.
    renderHarness("auto-key");
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("on-demand re-trigger", () => {
  test('"Show me around" help button re-runs the tour any time', () => {
    markTourSeen("ondemand-key"); // already seen → no auto-run
    renderHarness("ondemand-key");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show me around" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    resetTourSeen("ondemand-key");
  });
});

describe("ExplainTip tooltip a11y", () => {
  test("shows a role=tooltip on focus and hides on Escape/blur", () => {
    render(
      <ThemeProvider>
        <ExplainTip label="Explain the cost" text="This is what the cost means." />
      </ThemeProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Explain the cost" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.focus(trigger);
    const tip = screen.getByRole("tooltip");
    expect(tip).toHaveTextContent("This is what the cost means.");
    expect(trigger).toHaveAttribute("aria-describedby", tip.id);

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
