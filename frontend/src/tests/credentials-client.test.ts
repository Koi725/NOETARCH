import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  deleteCredential,
  fetchCredentialStatus,
  hasBackend,
  patchCredential,
  setCredential,
} from "@/services/CredentialsService";

describe("CredentialsService — mock fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("hasBackend is false without NEXT_PUBLIC_API_BASE", () => {
    expect(hasBackend()).toBe(false);
  });

  test("fetchCredentialStatus resolves configured so the gate passes through in mock mode", async () => {
    const status = await fetchCredentialStatus("anthropic");
    expect(status.configured).toBe(true);
    expect(status.enabled).toBe(true);
    // No plaintext is ever present in the status shape.
    expect(status.masked).toBeNull();
  });

  test("mutations throw in mock mode (no vault to write to)", async () => {
    await expect(setCredential("anthropic", { api_key: "sk-ant-xxxx" })).rejects.toThrow();
  });
});

describe("CredentialsService — real client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("GET reads masked status from the credentials endpoint", async () => {
    const payload = { provider: "anthropic", configured: true, masked: "sk-…abcd", enabled: true };
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", mockFetch);

    const status = await fetchCredentialStatus("anthropic");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/models-policy/credentials/anthropic",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(status.masked).toBe("sk-…abcd");
  });

  test("PUT sends the plaintext key exactly once in the body", async () => {
    const payload = { provider: "anthropic", configured: true, masked: "sk-…wxyz", enabled: true };
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", mockFetch);

    await setCredential("anthropic", { api_key: "sk-ant-secret", enabled: true });
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body as string)).toEqual({ api_key: "sk-ant-secret", enabled: true });
  });

  test("PATCH toggles without a key; DELETE removes", async () => {
    const patched = { provider: "anthropic", configured: true, enabled: false };
    const removed = { provider: "anthropic", configured: false };
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => patched })
      .mockResolvedValueOnce({ ok: true, json: async () => removed });
    vi.stubGlobal("fetch", mockFetch);

    const p = await patchCredential("anthropic", { enabled: false });
    expect(p.enabled).toBe(false);
    const patchInit = (mockFetch.mock.calls[0] as [string, RequestInit])[1];
    expect(patchInit.method).toBe("PATCH");
    expect(JSON.parse(patchInit.body as string)).not.toHaveProperty("api_key");

    const d = await deleteCredential("anthropic");
    expect(d.configured).toBe(false);
    expect((mockFetch.mock.calls[1] as [string, RequestInit])[1].method).toBe("DELETE");
  });

  test("rejects an invalid provider id before making a request", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    await expect(fetchCredentialStatus("../etc/passwd")).rejects.toThrow(/Invalid provider/);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
