"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";
import "@/tailwind/components/Tooltip/Tooltip.css";

/**
 * A small "explain this" affordance: a muted Info icon that reveals a tooltip on hover AND
 * focus, dismissible with Escape or by blurring. The tooltip has role="tooltip" and is
 * linked to the trigger via aria-describedby. Available anytime, not just first run.
 *
 * Icon convention: decorative glyph is aria-hidden; the interactive button carries the label.
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
        <Info size={14} strokeWidth={2} aria-hidden="true" />
      </button>
      {open && (
        <span id={tipId} role="tooltip" className="no-tip-bubble">
          {text}
        </span>
      )}
    </span>
  );
}
