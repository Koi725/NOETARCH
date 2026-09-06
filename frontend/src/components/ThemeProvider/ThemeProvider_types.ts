import type { ReactNode } from "react";

export type ThemeMode = "night" | "day";

export type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  plain: boolean;
  togglePlain: () => void;
  motion: boolean;
  toggleMotion: () => void;
};

export type ThemeProviderProps = {
  children: ReactNode;
};
