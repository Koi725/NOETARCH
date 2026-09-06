"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { computeCoachmarkPosition, type Box } from "./tour-position";
import type { TourStep } from "./tour-types";
import "@/tailwind/components/Tour/Tour.css";

function readRect(targetId: string): Box | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById(targetId);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function viewport(): { width: number; height: number } {
  if (typeof window === "undefined") return { width: 1024, height: 768 };
  return { width: window.innerWidth, height: window.innerHeight };
}

export interface SpotlightTourProps {
  steps: TourStep[];
  onClose: () => void;
  /** When true: no spotlight animation, instant steps (prefers-reduced-motion). */
  reducedMotion?: boolean;
}

/**
 * A guided coachmark tour: highlights one target, dims the rest, and steps through
 * data-driven { title, explanation } entries. The compact card is positioned relative to
 * its target with edge-flip (never off-screen, never obscuring the highlight). Accessible
 * dialog with focus-trap, Esc to close, keyboard next/prev/skip, and SR step announcements.
 *
 * Must render inside a ThemeProvider (for reduced motion), which the app root provides.
 * Does NOT aria-hide the rest of the app, so underlying content stays queryable.
 */
export function SpotlightTour({ steps, onClose, reducedMotion = false }: SpotlightTourProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Box | null>(null);
  const [cardSize, setCardSize] = useState({ width: 320, height: 180 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const total = steps.length;
  const step = steps[Math.min(index, total - 1)];
  const isFirst = index === 0;
  const isLast = index >= total - 1;

  const close = useCallback(() => onClose(), [onClose]);
  const goNext = useCallback(() => setIndex((i) => (i >= total - 1 ? i : i + 1)), [total]);
  const goPrev = useCallback(() => setIndex((i) => (i <= 0 ? 0 : i - 1)), []);

  // Track the highlighted element's rectangle (recompute on step change + resize/scroll).
  useEffect(() => {
    if (!step) return;
    const update = () => setRect(readRect(step.targetId));
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step]);

  // Measure the compact card so placement can flip/clamp correctly.
  useLayoutEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) setCardSize({ width: r.width, height: r.height });
  }, [index, rect]);

  // Focus management: focus the coachmark on open, restore on close.
  useEffect(() => {
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    nextRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus();
    };
  }, []);

  // Move focus to the primary action each step for predictable keyboarding.
  useEffect(() => {
    nextRef.current?.focus();
  }, [index]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") ?? [],
        );
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    [close, goNext, goPrev],
  );

  const highlightStyle = useMemo(() => {
    if (!rect || (rect.width === 0 && rect.height === 0)) return undefined;
    const pad = 6;
    return {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    } as const;
  }, [rect]);

  const position = useMemo(
    () => computeCoachmarkPosition(rect, cardSize, viewport()),
    [rect, cardSize],
  );

  if (!step) return null;

  return (
    <div
      className="no-tour-root"
      data-reduced={reducedMotion ? "true" : "false"}
      role="presentation"
    >
      {/* Dimming overlay + spotlight cutout (visual only; not aria-hidden). */}
      <div className="no-tour-overlay" aria-hidden="true" onClick={close}>
        {highlightStyle && <div className="no-tour-spotlight" style={highlightStyle} />}
      </div>

      {/* Screen-reader announcement of the current step. */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Step {index + 1} of {total}: {step.title}
      </div>

      <div
        ref={dialogRef}
        className="no-tour-coachmark"
        data-placement={position.placement}
        style={{ top: position.top, left: position.left }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={onKeyDown}
      >
        <div className="no-tour-step-count">
          Step {index + 1} of {total}
        </div>
        <h2 id={titleId} className="no-tour-title">
          {step.title}
        </h2>
        <p id={descId} className="no-tour-explanation">
          {step.explanation}
        </p>
        <div className="no-tour-actions">
          <button
            type="button"
            className="no-tour-btn no-tour-btn--ghost"
            onClick={close}
            aria-label="Skip the tour"
          >
            Skip
          </button>
          <div className="no-tour-actions-right">
            <button
              type="button"
              className="no-tour-btn no-tour-btn--secondary"
              onClick={goPrev}
              disabled={isFirst}
            >
              Back
            </button>
            <button
              ref={nextRef}
              type="button"
              className="no-tour-btn no-tour-btn--primary"
              onClick={isLast ? close : goNext}
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
