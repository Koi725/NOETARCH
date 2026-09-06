export type EvidenceStatus = "checked" | "conflicting" | "cannot-check";

export interface EvidenceSource {
  name: string;
  found: boolean;
  note: string;
}

export interface EvidenceRecord {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi: string | null;
  status: EvidenceStatus;
  sources: EvidenceSource[];
  provenance: string[];
  agreementCount: number;
  totalSources: number;
  missingDoi?: boolean;
  conflictNote?: string;
}
