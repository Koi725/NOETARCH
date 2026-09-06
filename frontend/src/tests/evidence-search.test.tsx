import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { EvidenceLibrary } from "@/components/EvidenceLibrary";

describe("EvidenceLibrary external fetch — gated + collapsed (M13)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("mock/flag-off default: the OpenAlex fetch control is NOT rendered at all", async () => {
    const spyFetch = vi.fn();
    vi.stubGlobal("fetch", spyFetch);

    render(
      <ThemeProvider>
        <EvidenceLibrary />
      </ThemeProvider>,
    );
    await screen.findByRole("searchbox", { name: "Search evidence records" });

    // No external-fetch affordance in the default local/mock mode.
    expect(screen.queryByRole("button", { name: /Add from OpenAlex/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("searchbox", { name: "Search external sources" }),
    ).not.toBeInTheDocument();
    expect(spyFetch).not.toHaveBeenCalled();
  });

  test("real backend: a compact 'Add from OpenAlex' button is present (collapsed)", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ project: "P", records: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <ThemeProvider>
        <EvidenceLibrary />
      </ThemeProvider>,
    );
    await screen.findByRole("searchbox", { name: "Search evidence records" });

    // Collapsed by default: the button is shown, the input is not.
    const addBtn = screen.getByRole("button", { name: /Add from OpenAlex/i });
    expect(addBtn).toBeInTheDocument();
    expect(
      screen.queryByRole("searchbox", { name: "Search external sources" }),
    ).not.toBeInTheDocument();

    // Expands on demand to reveal the input.
    fireEvent.click(addBtn);
    expect(
      screen.getByRole("searchbox", { name: "Search external sources" }),
    ).toBeInTheDocument();
  });

  test("real backend: fetching merges a record and shows the status banner", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE", "http://localhost:8000");
    const fetched = {
      enabled: true,
      source: "openalex",
      query: "q",
      retrievedAt: "2026-09-06T14:00:00+00:00",
      frozen: 1,
      deduplicated: 0,
      records: [
        {
          id: "oa-new",
          title: "A freshly fetched paper",
          authors: "Author X",
          year: 2024,
          journal: "Journal Y",
          doi: "10.9999/new.1",
          status: "checked",
          sources: [],
          provenance: ["Retrieved from OpenAlex"],
          agreementCount: 1,
          totalSources: 1,
          source: "openalex",
          retrievedAt: "2026-09-06T14:00:00+00:00",
        },
      ],
      message: null,
    };
    const mockFetch = vi.fn((url: string) => {
      if (url.endsWith("/evidence/search")) {
        return Promise.resolve({ ok: true, json: async () => fetched });
      }
      return Promise.resolve({ ok: true, json: async () => ({ project: "P", records: [] }) });
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <ThemeProvider>
        <EvidenceLibrary />
      </ThemeProvider>,
    );
    await screen.findByRole("searchbox", { name: "Search evidence records" });

    fireEvent.click(screen.getByRole("button", { name: /Add from OpenAlex/i }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search external sources" }), {
      target: { value: "worker well-being" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));

    await waitFor(() =>
      expect(screen.getByText("A freshly fetched paper")).toBeInTheDocument(),
    );
    expect(screen.getByText(/froze 1/i)).toBeInTheDocument();
  });
});
