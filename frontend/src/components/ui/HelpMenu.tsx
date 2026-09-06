"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LifeBuoy, Compass, Keyboard, BookOpen, X } from "lucide-react";
import { useTour } from "./TourProvider";
import "@/tailwind/components/Help/Help.css";

/**
 * The single, discoverable Help control (sidebar footer). Opens a small menu:
 *   • Take the tour  — runs the existing spotlight for the current screen
 *   • Keyboard shortcuts — a small dialog
 *   • Getting started — links to the onboarding route
 *
 * Replaces the old persistent floating "Show me around" pill.
 */
export function HelpMenu() {
  const { hasCurrentTour, startCurrentTour } = useTour();
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="no-help" ref={rootRef}>
      <button
        type="button"
        className="no-help-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Help"
        onClick={() => setOpen((v) => !v)}
      >
        <LifeBuoy size={15} strokeWidth={2} aria-hidden="true" />
        <span>Help</span>
      </button>

      {open && (
        <div className="no-help-menu" role="menu" aria-label="Help">
          <button
            type="button"
            role="menuitem"
            className="no-help-item"
            disabled={!hasCurrentTour}
            onClick={() => {
              startCurrentTour();
              setOpen(false);
            }}
          >
            <Compass size={15} strokeWidth={2} aria-hidden="true" />
            Take the tour
          </button>
          <button
            type="button"
            role="menuitem"
            className="no-help-item"
            onClick={() => {
              setShortcutsOpen(true);
              setOpen(false);
            }}
          >
            <Keyboard size={15} strokeWidth={2} aria-hidden="true" />
            Keyboard shortcuts
          </button>
          <Link href="/first-run" role="menuitem" className="no-help-item" onClick={() => setOpen(false)}>
            <BookOpen size={15} strokeWidth={2} aria-hidden="true" />
            Getting started
          </Link>
        </div>
      )}

      {shortcutsOpen && (
        <div className="no-help-scrim" role="presentation" onClick={() => setShortcutsOpen(false)}>
          <div
            className="no-help-shortcuts"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="no-help-shortcuts__head">
              <h2>Keyboard shortcuts</h2>
              <button
                type="button"
                className="no-help-close"
                aria-label="Close keyboard shortcuts"
                onClick={() => setShortcutsOpen(false)}
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            <dl className="no-help-shortcuts__list">
              <dt><kbd>⌘</kbd>/<kbd>Ctrl</kbd> <kbd>K</kbd></dt>
              <dd>Open the command palette</dd>
              <dt><kbd>Esc</kbd></dt>
              <dd>Close dialogs, palette, tour, or the menu</dd>
              <dt><kbd>←</kbd> <kbd>→</kbd></dt>
              <dd>During a tour: previous / next step</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
