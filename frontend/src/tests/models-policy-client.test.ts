import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchProviders } from "@/services/ModelsPolicyService";

describe("fetchProviders — mock fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns mock data when NEXT_PUBLIC_API_BASE is not set", async () => {
    const providers = await fetchProviders();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
    const first = providers[0]!;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("type");
    expect(first).toHaveProperty("egressPolicy");
    expect(Array.isArray(first.capabilities)).toBe(true);
  });

  test("mock data carries no credential fields", async () => {
    const providers = await fetchProviders();
    for (const p of providers) {
      for (const key of Object.keys(p)) {
        expect(key.toLowerCase()).not.toContain("key");
        expect(key.toLowerCase()).not.toContain("secret");
        expect(key.toLowerCase()).not.toContain("token");
      }
    }
  });
});

describe("fetchProviders — real client", () => {
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
        id: "anthropic",
        name: "Anthropic Claude",
        type: "cloud",
        status: "available",
        enabled: true,
        dailyCostLimit: 2.0,
        dataRetention: "Zero retention",
        egressPolicy: "explicit-approval",
        capabilities: ["abstract-screening"],
        routingPreference: "prefer-local-fallback",
        requiresApproval: true,
      },
    ];
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", mockFetch);

    const providers = await fetchProviders();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/models-policy/providers",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(providers[0]!.id).toBe("anthropic");
    expect(providers[0]!.type).toBe("cloud");
  });

  test("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }));
    await expect(fetchProviders()).rejects.toThrow("500");
  });
});
