import type { EvidenceRecord } from "@/contracts/evidence";

export interface EvidenceService {
  getEvidenceRecords(): EvidenceRecord[];
  getProjectName(): string;
}

import { evidenceRecords, evidenceLibraryProject } from "@/data/EvidenceLibrary/EvidenceLibrary-data";

export const mockEvidenceService: EvidenceService = {
  getEvidenceRecords: () => evidenceRecords as EvidenceRecord[],
  getProjectName: () => evidenceLibraryProject,
};

// ─── M5 async client ────────────────────────────────────────────────────────

export interface EvidenceData {
  records: EvidenceRecord[];
  project: string;
}

/**
 * Fetches evidence data from the real backend when NEXT_PUBLIC_API_BASE is set.
 * Falls back to mock data (synchronously resolved Promise) when the env var is absent,
 * so the app runs standalone without a backend.
 */
export async function fetchEvidenceData(runId?: string): Promise<EvidenceData> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return {
      records: mockEvidenceService.getEvidenceRecords(),
      project: mockEvidenceService.getProjectName(),
    };
  }
  const url = runId
    ? `${apiBase}/api/v1/evidence?run=${encodeURIComponent(runId)}`
    : `${apiBase}/api/v1/evidence`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Evidence API error: ${res.status}`);
  }
  const data = (await res.json()) as { project: string; records: EvidenceRecord[] };
  return { records: data.records, project: data.project };
}

// ─── M9 external-source search ───────────────────────────────────────────────

export interface EvidenceSearchResult {
  enabled: boolean;
  source: string;
  query: string;
  retrievedAt: string | null;
  frozen: number;
  deduplicated: number;
  records: EvidenceRecord[];
  message: string | null;
}

/**
 * Searches an external source (OpenAlex) via the backend, which fetches, freezes, and
 * returns typed records with provenance. When NEXT_PUBLIC_API_BASE is unset (mock mode),
 * this makes NO network call and returns a clear disabled state.
 */
export async function searchEvidence(query: string): Promise<EvidenceSearchResult> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return {
      enabled: false,
      source: "openalex",
      query,
      retrievedAt: null,
      frozen: 0,
      deduplicated: 0,
      records: [],
      message: "External sources are unavailable in mock mode — showing local data only.",
    };
  }
  const res = await fetch(`${apiBase}/api/v1/evidence/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    throw new Error(`Evidence search failed: ${res.status}`);
  }
  return (await res.json()) as EvidenceSearchResult;
}
