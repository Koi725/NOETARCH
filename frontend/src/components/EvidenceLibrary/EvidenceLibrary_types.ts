export type EvidenceStatus = "checked" | "conflicting" | "cannot-check";

export type EvidenceSource = {
  name: string;
  found: boolean;
  note: string;
};

export type EvidenceRecord = {
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
  source?: "seed" | "openalex" | "crossref";
  retrievedAt?: string | null;
};

export type EvidenceFilter =
  | "all"
  | "checked"
  | "conflicting"
  | "cannot-check"
  | "missing-doi";

export type EvidenceLibraryProps = Record<string, never>;
