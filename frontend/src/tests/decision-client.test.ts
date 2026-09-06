import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchDecisions } from "@/services/DecisionService";

describe("fetchDecisions — mock fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns mock data when NEXT_PUBLIC_API_BASE is not set", async () => {
    const decisions = await fetchDecisions();
    expect(Array.isArray(decisions)).toBe(true);
    expect(decisions.length).toBeGreaterThan(0);
    const first = decisions[0]!;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("risk");
    expect(first).toHaveProperty("status");
    expect(Array.isArray(first.alternatives)).toBe(true);
  });
});

describe("fetchDecisions — real client", () => {
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
        id: "dec-001",
        title: "T",
        type: "cloud-egress",
        risk: "high",
        cost: "$0",
        time: "1s",
        reversible: false,
        detail: "d",
        alternatives: [],
        status: "pending",
      },
    ];
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", mockFetch);

    const decisions = await fetchDecisions();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/decisions",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(decisions[0]!.id).toBe("dec-001");
  });

  test("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }));
    await expect(fetchDecisions()).rejects.toThrow("500");
  });
});
