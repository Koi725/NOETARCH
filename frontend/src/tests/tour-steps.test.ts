import { describe, expect, test } from "vitest";
import {
  TODAY_TOUR_STEPS,
  LIVE_RUN_TOUR_STEPS,
  EVIDENCE_TOUR_STEPS,
  DECISIONS_TOUR_STEPS,
  GUIDED_REVIEW_TOUR_STEPS,
  RECIPES_TOUR_STEPS,
  HISTORY_TOUR_STEPS,
  MODELS_POLICY_TOUR_STEPS,
  FIRST_RUN_TOUR_STEPS,
  type TourStep,
} from "@/components/ui";

const ALL: Record<string, TourStep[]> = {
  today: TODAY_TOUR_STEPS,
  "live-run": LIVE_RUN_TOUR_STEPS,
  evidence: EVIDENCE_TOUR_STEPS,
  decisions: DECISIONS_TOUR_STEPS,
  "guided-review": GUIDED_REVIEW_TOUR_STEPS,
  recipes: RECIPES_TOUR_STEPS,
  history: HISTORY_TOUR_STEPS,
  "models-policy": MODELS_POLICY_TOUR_STEPS,
  "first-run": FIRST_RUN_TOUR_STEPS,
};

describe("expanded, variable-length tours", () => {
  test("every screen has a tour with real, complete steps", () => {
    for (const [key, steps] of Object.entries(ALL)) {
      expect(steps.length, `${key} has steps`).toBeGreaterThan(0);
      for (const step of steps) {
        expect(step.targetId, `${key} targetId`).toBeTruthy();
        expect(step.title.length, `${key} title`).toBeGreaterThan(0);
        expect(step.explanation.length, `${key} explanation`).toBeGreaterThan(20);
      }
    }
  });

  test("the fixed ~3-step cap is gone — content-rich screens have more", () => {
    expect(TODAY_TOUR_STEPS.length).toBeGreaterThanOrEqual(6);
    expect(LIVE_RUN_TOUR_STEPS.length).toBeGreaterThanOrEqual(6);
    expect(EVIDENCE_TOUR_STEPS.length).toBeGreaterThanOrEqual(4);
    expect(GUIDED_REVIEW_TOUR_STEPS.length).toBeGreaterThanOrEqual(4);
  });

  test("target ids are unique within each tour", () => {
    for (const [key, steps] of Object.entries(ALL)) {
      const ids = steps.map((s) => s.targetId);
      expect(new Set(ids).size, `${key} unique targets`).toBe(ids.length);
    }
  });
});
