import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchTodayData } from "@/services/TodayService";

describe("fetchTodayData — mock fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns mock data when NEXT_PUBLIC_API_BASE is not set", async () => {
    const data = await fetchTodayData();
    expect(typeof data.project).toBe("string");
    expect(typeof data.question).toBe("string");
    expect(data.waiting).toHaveProperty("title");
    expect(data.run).toHaveProperty("progress");
    expect(Array.isArray(data.sources)).toBe(true);
    expect(Array.isArray(data.files)).toBe(true);
  });
});

describe("fetchTodayData — real client", () => {
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
      question: "Q",
      waiting: { title: "t", detail: "d", next: "n" },
      run: { title: "r", meta: "m", current: "c", progress: 42, kpis: [["Papers", "1", ""]] },
      failure: { title: "f", body: "b" },
      finished: [["x", "y", "$0"]],
      sources: [["OpenAlex", "fast", "ok"]],
      files: [["a.csv", "1 row", false]],
    };
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", mockFetch);

    const data = await fetchTodayData();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/today",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(data.run.progress).toBe(42);
    expect(data.project).toBe("P");
  });

  test("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }));
    await expect(fetchTodayData()).rejects.toThrow("500");
  });
});
