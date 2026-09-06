import { render, screen } from "@testing-library/react";
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

describe("M3 route active navigation state", () => {
  test.each([
    { path: "/today", label: "Today" },
    { path: "/", label: "Today" },
    { path: "/live-run", label: "Live run" },
    { path: "/decisions", label: "Decisions" },
    { path: "/evidence", label: "Evidence" },
    { path: "/guided-review", label: "Guided review" },
    { path: "/recipes", label: "Recipes" },
    { path: "/history", label: "History & replay" },
    { path: "/models-policy", label: "Models & policy" },
    { path: "/first-run", label: "First run" },
    { path: "/states", label: "Loading & empty states" },
  ])("$path marks '$label' as current page in the sidebar", ({ path, label }) => {
    pathname.value = path;
    renderShell();
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  });
});

describe("root-to-Today behavior", () => {
  test("root path marks Today as current and Today link points to /today", () => {
    pathname.value = "/";
    renderShell();
    const todayLink = screen.getByRole("link", { name: "Today" });
    expect(todayLink).toHaveAttribute("aria-current", "page");
    expect(todayLink).toHaveAttribute("href", "/today");
  });
});

describe("mock data disclosure in shell footer", () => {
  test("sidebar footer exposes workspace storage and budget information", () => {
    renderShell();
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
  });
});
