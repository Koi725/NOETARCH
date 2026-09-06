"use client";

import { useState, useSyncExternalStore } from "react";
import { Compass, X } from "lucide-react";
import { hasSeenTour, markTourSeen } from "./tour-storage";
import "@/tailwind/components/Help/Help.css";

const WELCOME_KEY = "welcome";

// A no-op external store: we only need getSnapshot to read guarded localStorage on the
// client, and getServerSnapshot to render nothing on the server (avoids a setState-in-effect
// and any SSR hydration mismatch).
function subscribe(): () => void {
  return () => {};
}
function clientSeen(): boolean {
  return hasSeenTour(WELCOME_KEY);
}
function serverSeen(): boolean {
  return true; // treat as already-seen on the server → render nothing
}

/**
 * First-run only: one small, dismissible welcome card pointing at the sidebar + Help control.
 * Persists dismissal in guarded localStorage; never shown again once dismissed.
 */
export function WelcomeCoachmark() {
  const seen = useSyncExternalStore(subscribe, clientSeen, serverSeen);
  const [dismissed, setDismissed] = useState(false);

  if (seen || dismissed) return null;

  const dismiss = () => {
    markTourSeen(WELCOME_KEY);
    setDismissed(true);
  };

  return (
    <div className="no-welcome" role="note" aria-label="Welcome to NOETARCH">
      <div className="no-welcome__icon" aria-hidden="true">
        <Compass size={18} strokeWidth={2} />
      </div>
      <div className="no-welcome__body">
        <strong>New here?</strong> Press <kbd>⌘K</kbd> or open <strong>Help</strong> in the
        sidebar anytime to take a guided tour.
      </div>
      <button
        type="button"
        className="no-welcome__close"
        aria-label="Dismiss welcome"
        onClick={dismiss}
      >
        <X size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
