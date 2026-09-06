"use client";

import { useTheme } from "@/components/ThemeProvider";
import { THEME_LABELS } from "@/data/ThemeToggle/ThemeToggle-data";
import type { ThemeToggleProps } from "./ThemeToggle_types";

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();
  const classes = ["theme-toggle", className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="group" aria-label="Colour theme">
      {(["night", "day"] as const).map((themeMode) => (
        <button
          key={themeMode}
          type="button"
          className="theme-toggle__option"
          aria-label={`Switch to ${THEME_LABELS[themeMode]}`}
          aria-pressed={mode === themeMode}
          onClick={() => setMode(themeMode)}
        >
          {themeMode === "night" ? "Night" : "Day"}
        </button>
      ))}
    </div>
  );
}
