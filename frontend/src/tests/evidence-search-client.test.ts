import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { searchEvidence } from "@/services/EvidenceService";

describe("searchEvidence — mock mode (no backend)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("makes no network call and returns a disabled state", async () => {
    const spyFetch = vi.fn();
    vi.stubGlobal("fetch", spyFetch);
    const result = await searchEvidence("worker well-being");
    expect(spyFetch).not.toHaveBeenCalled();
    expect(result.enabled).toBe(false);
    expect(result.records).toEqual([]);
    expect(result.message).toBeTruthy();
  });
});

describe("searchEvidence — real client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("POSTs the query and returns typed records + provenance counts", async () => {
    const payload = {
      enabled: true,
      source: "openalex",
      query: "q",
      retrievedAt: "2026-09-06T14:00:00+00:00",
      frozen: 1,
      deduplicated: 1,
      records: [
        {
          id: "oa-new",
          title: "Fetched",
          authors: "A",
          year: 2024,
          journal: "J",
          doi: "10.9999/new.1",
          status: "checked",
          sources: [],
          provenance: ["Retrieved from OpenAlex on 2026-09-06T14:00:00+00:00"],
          agreementCount: 1,
          totalSources: 1,
          source: "openalex",
          retrievedAt: "2026-09-06T14:00:00+00:00",
        },
      ],
      message: null,
    };
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", mockFetch);

    const result = await searchEvidence("worker well-being");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/evidence/search",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "worker well-being" }),
      }),
    );
    expect(result.frozen).toBe(1);
    expect(result.records[0]!.source).toBe("openalex");
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 502 }));
    await expect(searchEvidence("q")).rejects.toThrow("502");
  });
});
