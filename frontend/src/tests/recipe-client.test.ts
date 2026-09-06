import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchRecipes } from "@/services/RecipeService";

describe("fetchRecipes — mock fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns mock data when NEXT_PUBLIC_API_BASE is not set", async () => {
    const recipes = await fetchRecipes();
    expect(Array.isArray(recipes)).toBe(true);
    expect(recipes.length).toBeGreaterThan(0);
    const first = recipes[0]!;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("execution");
    expect(Array.isArray(first.steps)).toBe(true);
    expect(Array.isArray(first.providers)).toBe(true);
  });
});

describe("fetchRecipes — real client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("calls the correct endpoint and returns parsed data", async () => {
    const payload = [
      {
        id: "rec-001",
        name: "N",
        description: "d",
        execution: "local",
        steps: ["s"],
        inputs: ["i"],
        outputs: ["o"],
        estimatedCost: "$0",
        estimatedTime: "1m",
        providers: ["On-device model"],
        privacyPolicy: "local only",
      },
    ];
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", mockFetch);

    const recipes = await fetchRecipes();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/recipes",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(recipes[0]!.id).toBe("rec-001");
    expect(recipes[0]!.execution).toBe("local");
  });

  test("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }));
    await expect(fetchRecipes()).rejects.toThrow("500");
  });
});
