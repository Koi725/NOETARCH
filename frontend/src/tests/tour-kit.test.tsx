import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  TourProvider,
  HelpMenu,
  WelcomeCoachmark,
  useScreenTour,
  ExplainTip,
  hasSeenTour,
  markTourSeen,
  resetTourSeen,
  type TourStep,
} from "@/components/ui";

const STEPS: TourStep[] = [
  { targetId: "x", title: "Welcome", explanation: "Here is the panel overview." },
];

function Harness({ tourKey }: { tourKey: string }) {
  useScreenTour(tourKey, STEPS);
  return (
    <div>
      <div id="x">target</div>
      <HelpMenu />
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

describe("tours are no longer auto-launched", () => {
  test("mounting a screen registers its tour but does not open a spotlight", () => {
    resetTourSeen("noauto");
    renderHarness("noauto");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Help menu re-runs the tour on demand", () => {
  test("opening Help → Take the tour launches the spotlight", () => {
    renderHarness("ondemand");
    // No floating pill anymore.
    expect(screen.queryByRole("button", { name: "Show me around" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Take the tour" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  test("Help menu also offers keyboard shortcuts + getting started", () => {
    renderHarness("menu");
    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    expect(screen.getByRole("menuitem", { name: "Keyboard shortcuts" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Getting started" })).toBeInTheDocument();
  });
});

describe("first-run welcome coach-mark", () => {
  afterEach(() => resetTourSeen("welcome"));

  test("renders once on first run, then not again after dismissal", () => {
    resetTourSeen("welcome");
    const first = render(
      <ThemeProvider>
        <WelcomeCoachmark />
      </ThemeProvider>,
    );
    const card = screen.getByRole("note", { name: "Welcome to NOETARCH" });
    expect(card).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss welcome" }));
    expect(screen.queryByRole("note", { name: "Welcome to NOETARCH" })).not.toBeInTheDocument();
    first.unmount();

    // Second mount: already dismissed → not shown.
    render(
      <ThemeProvider>
        <WelcomeCoachmark />
      </ThemeProvider>,
    );
    expect(screen.queryByRole("note", { name: "Welcome to NOETARCH" })).not.toBeInTheDocument();
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
  });
});
