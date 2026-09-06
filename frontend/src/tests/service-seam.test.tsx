import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DecisionCenter } from "@/components/DecisionCenter";
import { EvidenceLibrary } from "@/components/EvidenceLibrary";
import { RecipeLibrary } from "@/components/RecipeLibrary";

describe("screens render through service seam", () => {
  test("DecisionCenter renders decisions from mock service when no prop supplied", () => {
    render(
      <ThemeProvider>
        <DecisionCenter />
      </ThemeProvider>
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("Decisions")).toBeInTheDocument();
  });

  test("EvidenceLibrary shows loading state then renders records from mock service", async () => {
    render(
      <ThemeProvider>
        <EvidenceLibrary />
      </ThemeProvider>
    );
    // Initial render: loading state is shown
    expect(screen.getByRole("status", { name: "Loading evidence records" })).toBeInTheDocument();
    // After the mock Promise resolves, the search input appears
    expect(await screen.findByRole("searchbox", { name: "Search evidence records" })).toBeInTheDocument();
  });

  test("RecipeLibrary renders recipes from mock service when no prop supplied", () => {
    render(
      <ThemeProvider>
        <RecipeLibrary />
      </ThemeProvider>
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
