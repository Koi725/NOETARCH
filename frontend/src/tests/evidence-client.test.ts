import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchEvidenceData } from "@/services/EvidenceService";

describe("fetchEvidenceData — mock fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns mock data when NEXT_PUBLIC_API_BASE is not set", async () => {
    const data = await fetchEvidenceData();
    expect(Array.isArray(data.records)).toBe(true);
    expect(data.records.length).toBeGreaterThan(0);
    expect(typeof data.project).toBe("string");
    expect(data.project.length).toBeGreaterThan(0);
    const first = data.records[0]!;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("status");
    expect(Array.isArray(first.sources)).toBe(true);
    expect(Array.isArray(first.provenance)).toBe(true);
    expect(first).toHaveProperty("agreementCount");
    expect(first).toHaveProperty("totalSources");
  });
});

describe("fetchEvidenceData — real client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("calls the correct API endpoint when NEXT_PUBLIC_API_BASE is set", async () => {
    const mockRecords = [
      {
        id: "rec-1",
        title: "Test record",
        authors: "A",
        year: 2023,
        journal: "J",
        doi: null,
        status: "checked",
        sources: [],
        provenance: [],
        agreementCount: 0,
        totalSources: 0,
      },
    ];
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ project: "Test Project", records: mockRecords }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const data = await fetchEvidenceData();

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/evidence",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(data.project).toBe("Test Project");
    expect(data.records).toEqual(mockRecords);
  });

  test("throws when the API returns a non-ok status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: false, status: 503 }),
    );

    await expect(fetchEvidenceData()).rejects.toThrow("503");
  });

  test("throws when the API returns 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }),
    );

    await expect(fetchEvidenceData()).rejects.toThrow("500");
  });

  test("returned records satisfy the EvidenceRecord contract shape", async () => {
    const apiRecord = {
      id: "rec-1",
      title: "Worker well-being",
      authors: "Müller J",
      year: 2023,
      journal: "Technology in Society",
      doi: "10.1016/j.techsoc.2023.102089",
      status: "checked",
      sources: [{ name: "OpenAlex", found: true, note: "Matches" }],
      provenance: ["Retrieved via OpenAlex"],
      agreementCount: 1,
      totalSources: 1,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ project: "Test", records: [apiRecord] }),
      }),
    );

    const data = await fetchEvidenceData();
    const rec = data.records[0]!;
    expect(rec.id).toBe("rec-1");
    expect(rec.agreementCount).toBe(1);
    expect(rec.totalSources).toBe(1);
    expect(Array.isArray(rec.sources)).toBe(true);
    expect(rec.sources[0]!.name).toBe("OpenAlex");
  });
});
