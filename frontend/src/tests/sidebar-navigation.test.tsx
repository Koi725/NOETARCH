import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SidebarNavigation } from "@/components/SidebarNavigation";
import { ThemeProvider } from "@/components/ThemeProvider";

describe("sidebar navigation semantics", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("uses a named navigation landmark and marks the active route correctly", () => {
    render(
      <ThemeProvider>
        <SidebarNavigation currentPath="/decisions" onOpenPalette={vi.fn()} />
      </ThemeProvider>,
    );

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Decisions" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Today" })).not.toHaveAttribute("aria-current");
  });

  test("all ten M3 destinations render as active links", () => {
    render(
      <ThemeProvider>
        <SidebarNavigation currentPath="/today" onOpenPalette={vi.fn()} />
      </ThemeProvider>,
    );

    const expectedLinks = [
      "Today",
      "Live run",
      "Decisions",
      "Evidence",
      "Guided review",
      "Recipes",
      "History & replay",
      "Models & policy",
      "First run",
      "Loading & empty states",
    ];
    for (const label of expectedLinks) {
      expect(screen.getByRole("link", { name: label }), `"${label}" should be a link`).toBeInTheDocument();
    }
  });

  test("provides a reachable motion preference control", () => {
    render(
      <ThemeProvider>
        <SidebarNavigation currentPath="/" onOpenPalette={vi.fn()} />
      </ThemeProvider>,
    );

    const motionControl = screen.getByRole("button", { name: "Motion · on" });
    expect(motionControl).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(motionControl);

    expect(screen.getByRole("button", { name: "Motion · off" })).toHaveAttribute("aria-pressed", "false");
    expect(window.localStorage.getItem("noetarch.motion")).toBe("false");
  });

  test("keeps Today current for both root and Today route", () => {
    const { rerender } = render(
      <ThemeProvider>
        <SidebarNavigation currentPath="/" onOpenPalette={vi.fn()} />
      </ThemeProvider>,
    );

    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
    rerender(
      <ThemeProvider>
        <SidebarNavigation currentPath="/today" onOpenPalette={vi.fn()} />
      </ThemeProvider>,
    );
    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
  });
});
