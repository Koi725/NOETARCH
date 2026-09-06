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

  test("EvidenceLibrary renders records from mock service", () => {
    render(
      <ThemeProvider>
        <EvidenceLibrary />
      </ThemeProvider>
    );
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
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
