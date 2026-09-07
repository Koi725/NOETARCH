import type { CredentialStatus } from "@/contracts/credentials";

export interface ConnectApiKeyProps {
  /** Called once a key is saved to the vault (or the user chooses to continue). */
  onConnected?: () => void;
  /** Optional low-emphasis escape — lets the user explore without a key yet. */
  onSkip?: () => void;
  /** A vault-read error to surface. Never hard-blocks: the user can still continue. */
  vaultError?: string | null;
  /** When true, renders inside the app shell (e.g. the /first-run route) rather than full-screen. */
  standalone?: boolean;
  /** Existing masked status, when already configured (shown on the standalone route). */
  existingStatus?: CredentialStatus | null;
}
