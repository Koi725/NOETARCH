import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { OnboardingGate } from "@/components/OnboardingGate";

function stubStatus(status: unknown) {
  vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => status }));
}

describe("OnboardingGate — the key gate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("an enabled key passes straight into the workspace", async () => {
    stubStatus({ provider: "anthropic", configured: true, enabled: true, masked: "sk-…abcd" });
    render(
      <OnboardingGate>
        <div>WORKSPACE</div>
      </OnboardingGate>,
    );
    expect(await screen.findByText("WORKSPACE")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Connect your API key" })).not.toBeInTheDocument();
  });

  test("no enabled key routes to the Connect screen, not the workspace", async () => {
    stubStatus({ provider: "anthropic", configured: false });
    render(
      <OnboardingGate>
        <div>WORKSPACE</div>
      </OnboardingGate>,
    );
    expect(
      await screen.findByRole("heading", { name: "Connect your API key" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("WORKSPACE")).not.toBeInTheDocument();
  });

  test("a vault error is shown but never hard-blocks (user can continue)", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    render(
      <OnboardingGate>
        <div>WORKSPACE</div>
      </OnboardingGate>,
    );
    // The connect screen appears with the vault error and a skip escape.
    expect(
      await screen.findByRole("heading", { name: "Connect your API key" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/vault/i);
    expect(screen.getByRole("button", { name: "Skip for now" })).toBeInTheDocument();
  });

  test("standalone/mock mode passes through without a backend", async () => {
    render(
      <OnboardingGate>
        <div>WORKSPACE</div>
      </OnboardingGate>,
    );
    await waitFor(() => expect(screen.getByText("WORKSPACE")).toBeInTheDocument());
  });
});
