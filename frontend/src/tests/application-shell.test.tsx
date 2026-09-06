import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ApplicationShell } from "@/components/ApplicationShell";
import { ThemeProvider } from "@/components/ThemeProvider";

const routerPush = vi.hoisted(() => vi.fn());
const pathname = vi.hoisted(() => ({ value: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
  useRouter: () => ({ push: routerPush }),
}));

// The shell contract is isolated from TodayOverview so these tests stay focused
// on global keyboard and landmark behavior.
vi.mock("@/components/TodayOverview", () => ({
  TodayOverview: () => null,
}));

describe("application shell keyboard and landmark contracts", () => {
  test.each([{ modifier: "ctrlKey" as const }, { modifier: "metaKey" as const }])(
    "opens and toggles the palette with $modifier+K",
    ({ modifier }) => {
      render(
        <ThemeProvider>
          <ApplicationShell>
            <h1>Shell content</h1>
          </ApplicationShell>
        </ThemeProvider>,
      );

      fireEvent.keyDown(window, { key: "k", [modifier]: true });
      expect(screen.getByRole("dialog", { name: "Type what you want to do" })).toBeInTheDocument();

      fireEvent.keyDown(window, { key: "k", [modifier]: true });
      expect(screen.queryByRole("dialog", { name: "Type what you want to do" })).not.toBeInTheDocument();
    },
  );

  test("provides the shell main landmark and correct Today active state", () => {
    pathname.value = "/";
    render(
      <ThemeProvider>
        <ApplicationShell>
          <h1>Shell content</h1>
        </ApplicationShell>
      </ThemeProvider>,
    );

    expect(screen.getByRole("main")).toContainElement(screen.getByRole("heading", { name: "Shell content" }));
    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
    // In M3 all routes are real links
    expect(screen.getByRole("link", { name: "Decisions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Live run" })).toBeInTheDocument();
  });

  test("all M3 palette items are enabled", () => {
    render(
      <ThemeProvider>
        <ApplicationShell>
          <div />
        </ApplicationShell>
      </ThemeProvider>,
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const palette = screen.getByRole("dialog");
    const disabledInPalette = palette.querySelectorAll("button:disabled");
    expect(disabledInPalette).toHaveLength(0);
  });
});
