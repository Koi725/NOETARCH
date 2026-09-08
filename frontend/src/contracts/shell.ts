export interface NavigationItem {
  label: string;
  href: string;
  available: boolean;
  // Reachable but not fully wired — shown with a "Preview" tag so nothing oversells itself.
  preview?: boolean;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export interface PaletteItem {
  label: string;
  hint: string;
  href?: string;
  action?: "theme";
  available: boolean;
}

export interface ApplicationMeta {
  brand: string;
  tagline: string;
  storage: string;
  spend: string;
  budget: string;
  budgetPercent: number;
}

export interface ThemeNote {
  night: string;
  day: string;
}

export interface ShellConfig {
  applicationMeta: ApplicationMeta;
  navigationGroups: NavigationGroup[];
  paletteItems: PaletteItem[];
  themeNote: ThemeNote;
}
