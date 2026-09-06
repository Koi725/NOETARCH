"use client";

import { useId, useState } from "react";
import { useTour } from "./TourProvider";
import "@/tailwind/components/Tooltip/Tooltip.css";

/**
 * A small "explain this" affordance: a "?" button that reveals a tooltip on hover AND
 * focus, dismissible with Escape or by blurring. The tooltip has role="tooltip" and is
 * linked to the trigger via aria-describedby. Available anytime, not just first run.
 */
export function ExplainTip({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  const tipId = useId();

  return (
    <span className="no-tip">
      <button
        type="button"
        className="no-tip-trigger"
        aria-label={label}
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <span aria-hidden="true">?</span>
      </button>
      {open && (
        <span id={tipId} role="tooltip" className="no-tip-bubble">
          {text}
        </span>
      )}
    </span>
  );
}

/**
 * The "Show me around" help button. Renders only when the current screen has registered a
 * tour; clicking re-runs that tour on demand.
 */
export function TourHelpButton() {
  const { hasCurrentTour, startCurrentTour } = useTour();
  if (!hasCurrentTour) return null;
  return (
    <button
      type="button"
      className="no-tour-help-btn"
      onClick={startCurrentTour}
      aria-label="Show me around"
    >
      <span aria-hidden="true">?</span>
      <span className="no-tour-help-btn__text">Show me around</span>
    </button>
  );
}
