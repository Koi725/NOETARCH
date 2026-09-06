import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  actionDecision,
  fetchAuditTrail,
  DecisionConflictError,
} from "@/services/DecisionService";

describe("actionDecision — real client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("POSTs the action + expected_version and returns the updated decision", async () => {
    const updated = {
      id: "dec-001",
      title: "T",
      type: "cloud-egress",
      risk: "high",
      cost: "$0",
      time: "1s",
      reversible: false,
      detail: "d",
      alternatives: [],
      status: "approved",
      version: 2,
      resolutionAction: "approve",
    };
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, status: 200, json: async () => updated });
    vi.stubGlobal("fetch", mockFetch);

    const result = await actionDecision("dec-001", "approve", 1);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/decisions/dec-001/action",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "approve", expected_version: 1 }),
      }),
    );
    expect(result.status).toBe("approved");
    expect(result.version).toBe(2);
  });

  test("maps 409 to a DecisionConflictError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 409 }));
    await expect(actionDecision("dec-001", "approve", 1)).rejects.toBeInstanceOf(
      DecisionConflictError,
    );
  });

  test("throws on other non-ok responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }));
    await expect(actionDecision("dec-001", "approve", 1)).rejects.toThrow("500");
  });
});

describe("actionDecision — mock mode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  test("throws when no backend is configured (actions are simulated in the UI)", async () => {
    await expect(actionDecision("dec-001", "approve", 1)).rejects.toThrow("No backend");
  });
});

describe("fetchAuditTrail", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns [] in mock mode", async () => {
    expect(await fetchAuditTrail("dec-001")).toEqual([]);
  });

  test("returns the trail from the real endpoint", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
    const trail = [
      {
        id: "a1",
        entityType: "decision",
        entityId: "dec-001",
        action: "approve",
        actor: "local-user",
        fromStatus: "pending",
        toStatus: "approved",
        requestId: "req-1",
        createdAt: "2026-09-06T14:00:00+00:00",
        payloadHash: "abc",
      },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: true, json: async () => trail }));
    const result = await fetchAuditTrail("dec-001");
    expect(result).toHaveLength(1);
    expect(result[0]!.action).toBe("approve");
  });
});
