"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ThemeContextValue, ThemeMode, ThemeProviderProps } from "./ThemeProvider_types";

const STORAGE_KEYS = {
  mode: "noetarch.mode",
  plain: "noetarch.plain",
  motion: "noetarch.motion",
} as const;

const ThemeContext = createContext<ThemeContextValue | null>(null);
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key && Object.values(STORAGE_KEYS).includes(event.key as (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS])) {
      listener();
    }
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function readBoolean(key: string, fallback: boolean): boolean {
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : stored === "true";
  } catch {
    return fallback;
  }
}

function readMode(): ThemeMode {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.mode) === "day" ? "day" : "night";
  } catch {
    return "night";
  }
}

function persist(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private browsing and blocked storage should not prevent the UI from working.
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const mode = useSyncExternalStore<ThemeMode>(subscribe, readMode, () => "night");
  const plain = useSyncExternalStore(subscribe, () => readBoolean(STORAGE_KEYS.plain, false), () => false);
  const motion = useSyncExternalStore(subscribe, () => readBoolean(STORAGE_KEYS.motion, true), () => true);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = mode;
    root.dataset.plain = plain ? "on" : "off";
    root.dataset.anim = motion ? "on" : "off";
  }, [mode, plain, motion]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    persist(STORAGE_KEYS.mode, nextMode);
    emitChange();
  }, []);
  const togglePlain = useCallback(() => {
    persist(STORAGE_KEYS.plain, String(!readBoolean(STORAGE_KEYS.plain, false)));
    emitChange();
  }, []);
  const toggleMotion = useCallback(() => {
    persist(STORAGE_KEYS.motion, String(!readBoolean(STORAGE_KEYS.motion, true)));
    emitChange();
  }, []);
  const value = useMemo(
    () => ({ mode, setMode, plain, togglePlain, motion, toggleMotion }),
    [mode, setMode, plain, togglePlain, motion, toggleMotion],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
