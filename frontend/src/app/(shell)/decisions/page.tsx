import { DecisionCenter } from "@/components/DecisionCenter";

export default async function DecisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string }>;
}) {
  const { run } = await searchParams;
  return <DecisionCenter runId={run} />;
}
