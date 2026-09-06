import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchRuns } from "@/services/HistoryService";

describe("fetchRuns — mock fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns mock data when NEXT_PUBLIC_API_BASE is not set", async () => {
    const runs = await fetchRuns();
    expect(Array.isArray(runs)).toBe(true);
    expect(runs.length).toBeGreaterThan(0);
    const first = runs[0]!;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("status");
    expect(Array.isArray(first.providers)).toBe(true);
  });
});

describe("fetchRuns — real client", () => {
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
        id: "0f3a·91",
        status: "running",
        title: "T",
        recipe: "R",
        started: "today",
        duration: "in progress",
        cost: "$0",
        papers: 214,
        providers: ["OpenAlex"],
      },
    ];
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", mockFetch);

    const runs = await fetchRuns();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/history",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(runs[0]!.id).toBe("0f3a·91");
    expect(runs[0]!.status).toBe("running");
  });

  test("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }));
    await expect(fetchRuns()).rejects.toThrow("500");
  });
});
