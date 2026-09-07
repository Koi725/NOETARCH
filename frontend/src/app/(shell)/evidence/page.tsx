import { EvidenceLibrary } from "@/components/EvidenceLibrary";

export default async function EvidencePage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string }>;
}) {
  const { run } = await searchParams;
  return <EvidenceLibrary runId={run} />;
}
