import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getRun, RunUnavailableError, startRun } from "@/services/RunService";

const RESULT = {
  id: "abc123",
  status: "completed",
  question: "does X help Y?",
  provider: "anthropic",
  model: "claude-haiku-4-5",
  frozen: 3,
  deduplicated: 0,
  screened: 3,
  included: 1,
  excluded: 1,
  uncertain: 1,
  offSchema: 0,
  inputTokens: 3000,
  outputTokens: 3000,
  costUsd: 0.018,
  createdAt: "2026-09-07T00:00:00Z",
  finishedAt: "2026-09-07T00:00:03Z",
};

describe("RunService launcher — mock mode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("startRun throws without a backend", async () => {
    await expect(startRun({ question: "q" })).rejects.toThrow(/No backend/);
  });
});

describe("RunService launcher — real client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("startRun POSTs the query + bounds and returns the run result", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, status: 200, json: async () => RESULT });
    vi.stubGlobal("fetch", mockFetch);

    const result = await startRun({ question: "does X help Y?", max_results: 25, budget_usd: 1 });
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8000/api/v1/runs");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.question).toBe("does X help Y?");
    expect(body.max_results).toBe(25);
    expect(result.id).toBe("abc123");
    expect(result.included).toBe(1);
  });

  test("a 409 gate raises RunUnavailableError carrying the backend message", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ detail: "No enabled provider key is configured." }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(startRun({ question: "q" })).rejects.toBeInstanceOf(RunUnavailableError);
  });

  test("getRun reads a run by id", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => RESULT });
    vi.stubGlobal("fetch", mockFetch);

    const result = await getRun("abc123");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/runs/abc123",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(result.status).toBe("completed");
  });
});
