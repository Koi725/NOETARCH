import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, beforeEach, test } from "vitest";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

function ThemeProbe() {
  const { mode, plain, motion, setMode, togglePlain, toggleMotion } = useTheme();

  return (
    <div>
      <output data-testid="mode">{mode}</output>
      <output data-testid="plain">{String(plain)}</output>
      <output data-testid="motion">{String(motion)}</output>
      <button type="button" onClick={() => setMode("day")}>set-day</button>
      <button type="button" onClick={togglePlain}>toggle-plain</button>
      <button type="button" onClick={toggleMotion}>toggle-motion</button>
    </div>
  );
}

function renderThemeProbe() {
  return render(
    <ThemeProvider>
      <ThemeProbe />
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe("theme preferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-mode");
    document.documentElement.removeAttribute("data-plain");
    document.documentElement.removeAttribute("data-anim");
  });

  test("hydrates persisted mode and preference toggles", async () => {
    window.localStorage.setItem("noetarch.mode", "day");
    window.localStorage.setItem("noetarch.plain", "true");
    window.localStorage.setItem("noetarch.motion", "false");

    renderThemeProbe();

    await waitFor(() => {
      expect(screen.getByTestId("mode")).toHaveTextContent("day");
      expect(screen.getByTestId("plain")).toHaveTextContent("true");
      expect(screen.getByTestId("motion")).toHaveTextContent("false");
      expect(document.documentElement.dataset.mode).toBe("day");
      expect(document.documentElement.dataset.plain).toBe("on");
      expect(document.documentElement.dataset.anim).toBe("off");
    });
  });

  test("persists mode, plain-English, and motion changes", async () => {
    renderThemeProbe();

    await waitFor(() => expect(screen.getByTestId("mode")).toHaveTextContent("night"));
    fireEvent.click(screen.getByRole("button", { name: "set-day" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle-plain" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle-motion" }));

    await waitFor(() => {
      expect(window.localStorage.getItem("noetarch.mode")).toBe("day");
      expect(window.localStorage.getItem("noetarch.plain")).toBe("true");
      expect(window.localStorage.getItem("noetarch.motion")).toBe("false");
      expect(document.documentElement.dataset.mode).toBe("day");
      expect(document.documentElement.dataset.plain).toBe("on");
      expect(document.documentElement.dataset.anim).toBe("off");
    });
  });

  test("theme toggle exposes the next mode and changes the root mode", async () => {
    renderThemeProbe();

    await waitFor(() => expect(screen.getByRole("button", { name: "Switch to Daylight" })).toHaveAttribute("aria-pressed", "false"));
    fireEvent.click(screen.getByRole("button", { name: "Switch to Daylight" }));

    await waitFor(() => {
      expect(screen.getByTestId("mode")).toHaveTextContent("day");
      expect(screen.getByRole("button", { name: "Switch to Daylight" })).toHaveAttribute("aria-pressed", "true");
    });
  });
});
