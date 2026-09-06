import { describe, expect, test } from "vitest";
import { computeCoachmarkPosition, type Box } from "@/components/ui";

const CARD = { width: 320, height: 180 };
const VP = { width: 1000, height: 800 };

describe("computeCoachmarkPosition (edge-flip)", () => {
  test("places below when there is room", () => {
    const target: Box = { top: 60, left: 400, width: 200, height: 40 };
    const pos = computeCoachmarkPosition(target, CARD, VP);
    expect(pos.placement).toBe("bottom");
    expect(pos.top).toBe(60 + 40 + 12); // below target + gap
  });

  test("flips above when there is no room below", () => {
    const target: Box = { top: 760, left: 400, width: 200, height: 40 };
    const pos = computeCoachmarkPosition(target, CARD, VP);
    expect(pos.placement).toBe("top");
    expect(pos.top).toBe(760 - 180 - 12); // above target - gap
  });

  test("clamps to the left edge (never off-screen)", () => {
    const target: Box = { top: 100, left: 0, width: 20, height: 20 };
    const pos = computeCoachmarkPosition(target, CARD, VP);
    expect(pos.left).toBeGreaterThanOrEqual(12);
  });

  test("clamps to the right edge (never off-screen)", () => {
    const target: Box = { top: 100, left: 990, width: 20, height: 20 };
    const pos = computeCoachmarkPosition(target, CARD, VP);
    expect(pos.left).toBeLessThanOrEqual(VP.width - CARD.width - 12);
  });

  test("never exceeds the viewport vertically", () => {
    const target: Box = { top: 400, left: 400, width: 100, height: 100 };
    const pos = computeCoachmarkPosition(target, CARD, VP);
    expect(pos.top).toBeGreaterThanOrEqual(12);
    expect(pos.top + CARD.height).toBeLessThanOrEqual(VP.height);
  });

  test("centers as a fallback when there is no target", () => {
    expect(computeCoachmarkPosition(null, CARD, VP).placement).toBe("center");
    expect(
      computeCoachmarkPosition({ top: 0, left: 0, width: 0, height: 0 }, CARD, VP).placement,
    ).toBe("center");
  });
});
