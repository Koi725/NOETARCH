import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import {
  EvidenceListSkeleton,
  TodaySkeleton,
  LiveRunSkeleton,
  HistorySkeleton,
  ProviderGridSkeleton,
  DecisionsSkeleton,
  RecipesSkeleton,
  GuidedReviewSkeleton,
} from "@/components/ui";

describe("per-section skeletons", () => {
  test("evidence list skeleton renders the requested number of rows", () => {
    const { container } = render(<EvidenceListSkeleton rows={4} />);
    expect(container.querySelectorAll(".no-skel-ev-row")).toHaveLength(4);
    expect(container.querySelectorAll(".no-skel").length).toBeGreaterThan(0);
  });

  test("live-run skeleton mirrors the 9-step rail", () => {
    const { container } = render(<LiveRunSkeleton steps={9} />);
    expect(container.querySelectorAll(".no-skel-rail-step")).toHaveLength(9);
    expect(container.querySelectorAll(".no-skel-card--kpi")).toHaveLength(4);
  });

  test("history skeleton renders run rows", () => {
    const { container } = render(<HistorySkeleton rows={3} />);
    expect(container.querySelectorAll(".no-skel-history-row")).toHaveLength(3);
  });

  test("provider grid skeleton renders provider cards", () => {
    const { container } = render(<ProviderGridSkeleton cards={4} />);
    expect(container.querySelectorAll(".no-skel-card--provider")).toHaveLength(4);
  });

  test("today / decisions / recipes / guided-review skeletons render matched cards", () => {
    expect(
      render(<TodaySkeleton />).container.querySelectorAll(".no-skel-card").length,
    ).toBeGreaterThan(0);
    expect(
      render(<DecisionsSkeleton cards={3} />).container.querySelectorAll(".no-skel-card--decision"),
    ).toHaveLength(3);
    expect(
      render(<RecipesSkeleton cards={4} />).container.querySelectorAll(".no-skel-card--recipe"),
    ).toHaveLength(4);
    expect(
      render(<GuidedReviewSkeleton />).container.querySelectorAll(".no-skel-card--tall").length,
    ).toBeGreaterThan(0);
  });

  test("skeleton shapes are decorative (aria-hidden) so the labelled status wrapper speaks", () => {
    const { container } = render(<EvidenceListSkeleton />);
    expect(container.querySelector(".no-skel-wrap")).toHaveAttribute("aria-hidden", "true");
  });
});
