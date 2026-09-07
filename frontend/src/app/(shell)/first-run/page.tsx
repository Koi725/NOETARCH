"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectApiKey } from "@/components/ConnectApiKey";
import type { CredentialStatus } from "@/contracts/credentials";
import { ANTHROPIC_PROVIDER } from "@/contracts/credentials";
import { fetchCredentialStatus } from "@/services/CredentialsService";

// Repurposed First-run route: a standalone "Connect your API key" surface. The onboarding
// gate handles the very first visit; this route lets the user return to connect, rotate, or
// confirm their key. On success it continues into the workspace.
export default function FirstRunPage() {
  const router = useRouter();
  const [status, setStatus] = useState<CredentialStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCredentialStatus(ANTHROPIC_PROVIDER)
      .then((s) => {
        if (!cancelled) setStatus(s);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ConnectApiKey
      standalone
      existingStatus={status}
      onConnected={() => router.push("/today")}
    />
  );
}
