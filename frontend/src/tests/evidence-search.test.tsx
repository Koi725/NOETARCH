import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { EvidenceLibrary } from "@/components/EvidenceLibrary";

describe("EvidenceLibrary external search", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("mock mode: fetching shows a clear disabled state and makes no network call", async () => {
    const spyFetch = vi.fn();
    vi.stubGlobal("fetch", spyFetch);

    render(
      <ThemeProvider>
        <EvidenceLibrary />
      </ThemeProvider>,
    );
    // Wait for the initial (mock) load.
    await screen.findByRole("searchbox", { name: "Search evidence records" });

    const input = screen.getByRole("searchbox", { name: "Search external sources" });
    fireEvent.change(input, { target: { value: "worker well-being" } });
    fireEvent.click(screen.getByRole("button", { name: "Fetch from OpenAlex" }));

    await waitFor(() =>
      expect(screen.getByText(/showing local data only/i)).toBeInTheDocument(),
    );
    expect(spyFetch).not.toHaveBeenCalled();
  });

  test("real mode: a fetched record is merged into the list with a status banner", async () => {
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
          provenance: ["Retrieved from OpenAlex on 2026-09-06T14:00:00+00:00"],
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
      // initial GET /evidence load
      return Promise.resolve({
        ok: true,
        json: async () => ({ project: "P", records: [] }),
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <ThemeProvider>
        <EvidenceLibrary />
      </ThemeProvider>,
    );
    await screen.findByRole("searchbox", { name: "Search evidence records" });

    fireEvent.change(screen.getByRole("searchbox", { name: "Search external sources" }), {
      target: { value: "worker well-being" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Fetch from OpenAlex" }));

    await waitFor(() =>
      expect(screen.getByText("A freshly fetched paper")).toBeInTheDocument(),
    );
    expect(screen.getByText(/froze 1/i)).toBeInTheDocument();
  });
});
