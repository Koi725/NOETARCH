import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchLiveRunData } from "@/services/RunService";

describe("fetchLiveRunData — mock fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns mock data when NEXT_PUBLIC_API_BASE is not set", async () => {
    const data = await fetchLiveRunData();
    expect(data.meta).toHaveProperty("runId");
    expect(Array.isArray(data.steps)).toBe(true);
    expect(data.steps.length).toBeGreaterThan(0);
    expect(Array.isArray(data.kpis)).toBe(true);
    expect(Array.isArray(data.events)).toBe(true);
    expect(data.stepInspector).toHaveProperty("stepIndex");
    expect(Array.isArray(data.evidenceCards)).toBe(true);
  });
});

describe("fetchLiveRunData — real client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("calls the correct endpoint and returns parsed data", async () => {
    const payload = {
      meta: { runId: "r1", title: "T", started: "14:02", elapsed: "1s" },
      steps: [{ index: 1, label: "s", state: "done" }],
      stepInspector: {
        stepIndex: 1,
        label: "s",
        method: "m",
        locality: "local",
        status: "ok",
        input: "i",
        outputSoFar: "o",
      },
      kpis: [{ label: "Papers", value: "1" }],
      events: [{ id: "e1", time: "14:02", message: "m", kind: "system" }],
      decisions: [{ id: "d1", description: "d", kind: "pending" }],
      evidenceCards: [{ id: "ev1", title: "t", doi: "10.x", source: "OpenAlex", verifiedBy: "OpenAlex" }],
    };
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", mockFetch);

    const data = await fetchLiveRunData();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/live-run",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(data.meta.runId).toBe("r1");
    expect(data.stepInspector.stepIndex).toBe(1);
  });

  test("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }));
    await expect(fetchLiveRunData()).rejects.toThrow("500");
  });
});
