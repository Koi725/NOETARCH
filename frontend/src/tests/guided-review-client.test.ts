import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchReviewData } from "@/services/GuidedReviewService";

describe("fetchReviewData — mock fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns mock data when NEXT_PUBLIC_API_BASE is not set", async () => {
    const data = await fetchReviewData();
    expect(typeof data.project).toBe("string");
    expect(data.progress).toHaveProperty("reviewed");
    expect(data.currentPaper).toHaveProperty("abstract");
    expect(Array.isArray(data.nextPapers)).toBe(true);
    expect(Array.isArray(data.excludeReasons)).toBe(true);
    expect(Array.isArray(data.previousDecisions)).toBe(true);
  });
});

describe("fetchReviewData — real client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("calls the correct endpoint and returns parsed data", async () => {
    const payload = {
      project: "P",
      progress: { reviewed: 22, total: 50, remaining: 28 },
      currentPaper: {
        id: "paper-23",
        index: 23,
        title: "T",
        authors: "A",
        year: 2023,
        journal: "J",
        doi: "10.x",
        abstract: "abs",
        initialStatus: null,
        initialStatusNote: null,
      },
      nextPapers: [],
      excludeReasons: [{ id: "er-1", label: "r" }],
      previousDecisions: [],
    };
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", mockFetch);

    const data = await fetchReviewData();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/guided-review",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(data.currentPaper.id).toBe("paper-23");
    expect(data.progress.total).toBe(50);
  });

  test("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }));
    await expect(fetchReviewData()).rejects.toThrow("500");
  });
});
