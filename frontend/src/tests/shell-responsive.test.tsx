import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ApplicationShell } from "@/components/ApplicationShell";
import { ThemeProvider } from "@/components/ThemeProvider";

const routerPush = vi.hoisted(() => vi.fn());
const pathname = vi.hoisted(() => ({ value: "/today" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
  useRouter: () => ({ push: routerPush }),
}));

beforeEach(() => {
  pathname.value = "/today";
});

function renderShell() {
  return render(
    <ThemeProvider>
      <ApplicationShell>
        <div>page content</div>
      </ApplicationShell>
    </ThemeProvider>,
  );
}

// The mobile top bar / drawer controls are CSS-hidden at desktop width (jsdom does not
// evaluate the mobile media query), so they are queried with { hidden: true }. The test
// validates the open/close WIRING that drives the CSS drawer.
describe("responsive shell drawer", () => {
  test("provides a hamburger that opens the sidebar drawer", () => {
    renderShell();
    const hamburger = screen.getByLabelText("Open menu");
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
    expect(hamburger).toHaveAttribute("aria-controls", "primary-nav");

    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(nav.className).not.toContain("is-open");

    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "true");
    expect(nav.className).toContain("is-open");
  });

  test("closing via the close button collapses the drawer", () => {
    renderShell();
    fireEvent.click(screen.getByLabelText("Open menu"));
    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(nav.className).toContain("is-open");

    fireEvent.click(screen.getByLabelText("Close menu"));
    expect(nav.className).not.toContain("is-open");
  });

  test("navigating from the drawer closes it", () => {
    renderShell();
    fireEvent.click(screen.getByLabelText("Open menu"));
    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(nav.className).toContain("is-open");

    fireEvent.click(screen.getByRole("link", { name: "Decisions" }));
    expect(nav.className).not.toContain("is-open");
  });

  test("a mobile top bar is present with brand + search", () => {
    renderShell();
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Search anything"),
    ).toBeInTheDocument();
  });
});
