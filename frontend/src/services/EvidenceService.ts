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
export async function fetchEvidenceData(): Promise<EvidenceData> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return {
      records: mockEvidenceService.getEvidenceRecords(),
      project: mockEvidenceService.getProjectName(),
    };
  }
  const res = await fetch(`${apiBase}/api/v1/evidence`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Evidence API error: ${res.status}`);
  }
  const data = (await res.json()) as { project: string; records: EvidenceRecord[] };
  return { records: data.records, project: data.project };
}
