export type PaletteItem = {
  label: string;
  hint: string;
  href?: string;
  action?: "theme";
  available: boolean;
};

export const paletteItems: PaletteItem[] = [
  { label: "Decide the two things waiting for me", hint: "Decisions", href: "/decisions", available: true },
  { label: "Watch the run that's going now", hint: "Live run", href: "/live-run", available: true },
  { label: "Start a new review from a question", hint: "Guided review", href: "/guided-review", available: true },
  { label: "Find the 15 papers that need my eyes", hint: "Evidence", href: "/evidence", available: true },
  { label: "Switch to Daylight (light)", hint: "Appearance", action: "theme", available: true },
  { label: "Show me every loading and empty state", hint: "Internal reference", href: "/states", available: true },
];
