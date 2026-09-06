import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DecisionCenter } from "@/components/DecisionCenter";
import type { Decision } from "@/components/DecisionCenter/DecisionCenter_types";

const pendingDecision: Decision = {
  id: "dec-001",
  title: "Send 38 abstracts to Anthropic",
  type: "cloud-egress",
  risk: "high",
  cost: "$0.62",
  time: "~40s",
  reversible: false,
  detail: "These abstracts leave your device.",
  alternatives: [],
  status: "pending",
  version: 1,
};

function renderCenter() {
  return render(
    <ThemeProvider>
      <DecisionCenter decisions={[{ ...pendingDecision }]} />
    </ThemeProvider>,
  );
}

describe("DecisionCenter write path", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("optimistic update: approve resolves the card and shows the audit trail", async () => {
    const approved: Decision = { ...pendingDecision, status: "approved", version: 2 };
    const auditTrail = [
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
    const mockFetch = vi.fn((url: string) => {
      if (url.endsWith("/action")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => approved });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => auditTrail });
    });
    vi.stubGlobal("fetch", mockFetch);

    renderCenter();
    fireEvent.click(screen.getByRole("button", { name: "Approve once" }));

    // Resolved badge appears (optimistically, then confirmed). Re-query each poll
    // because the badge element is replaced when the confirmed state renders.
    await waitFor(() => expect(screen.getByText("Approved")).toBeInTheDocument());
    // Audit trail is surfaced after the write succeeds.
    await waitFor(() =>
      expect(screen.getByRole("region", { name: /Audit trail for/ })).toBeInTheDocument(),
    );
  });

  test("error rollback: a failed action reverts to pending and shows a retryable error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    renderCenter();
    fireEvent.click(screen.getByRole("button", { name: "Approve once" }));

    // Error surfaced…
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    // …and the control is back (rolled back to actionable pending state).
    expect(screen.getByRole("button", { name: "Approve once" })).toBeEnabled();
    // Not shown as Approved.
    expect(screen.queryByText("Approved")).not.toBeInTheDocument();
  });
});
