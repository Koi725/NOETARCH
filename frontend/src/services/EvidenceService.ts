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
