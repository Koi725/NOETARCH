"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useTour } from "@/components/ui";
import { mockShellService } from "@/services/ShellService";
import type { CommandPaletteProps } from "./CommandPalette_types";

const { paletteItems } = mockShellService.getShellConfig();
import "@/tailwind/components/CommandPalette/CommandPalette.css";

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const { mode, setMode } = useTheme();
  const { hasCurrentTour, startCurrentTour } = useTour();
  const firstAvailableIndex = paletteItems.findIndex((item) => item.available);

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      firstItemRef.current?.focus();
    } else {
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="no-palette-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section ref={dialogRef} className="no-command-palette" role="dialog" aria-modal="true" aria-labelledby="command-palette-title" onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
        if (event.key === "Tab") {
          const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") ?? []);
          const first = focusable[0];
          const last = focusable.at(-1);
          if (event.shiftKey && document.activeElement === first && last) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last && first) {
            event.preventDefault();
            first.focus();
          }
        }
      }}>
        <div className="no-palette-header">
          <div>
            <div className="no-eyebrow">Search anything</div>
            <h2 id="command-palette-title">Type what you want to do</h2>
          </div>
          <button className="no-palette-close" type="button" onClick={onClose} aria-label="Close command palette">Esc</button>
        </div>
        <div className="no-palette-list">
          {hasCurrentTour && (
            <button
              className="no-palette-item"
              type="button"
              onClick={() => {
                startCurrentTour();
                onClose();
              }}
            >
              <span className="no-palette-item-label">Show me around</span>
              <span className="no-palette-item-hint">Tour this screen</span>
            </button>
          )}
          {paletteItems.map((item, index) => (
            <button
              ref={index === firstAvailableIndex ? firstItemRef : undefined}
              className="no-palette-item"
              type="button"
              key={item.label}
              disabled={!item.available}
              onClick={() => {
                if (item.action === "theme") {
                  setMode(mode === "night" ? "day" : "night");
                  onClose();
                } else if (item.href) {
                  onNavigate(item.href);
                }
              }}
            >
              <span className="no-palette-item-label">{item.label}</span>
              <span className="no-palette-item-hint">
                {!item.available ? "Coming soon" : item.action === "theme" ? (mode === "night" ? "Daylight" : "Obsidian") : item.hint}
              </span>
            </button>
          ))}
        </div>
        <div className="no-palette-footer">Plain words, not commands — the same list works for a professor and for an IT admin.</div>
      </section>
    </div>
  );
}
