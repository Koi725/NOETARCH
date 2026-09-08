export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export type NavigationItem = {
  label: string;
  href: string;
  available: boolean;
  preview?: boolean;
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Watch",
    items: [
      { label: "Today", href: "/today", available: true },
      { label: "Live run", href: "/live-run", available: true },
      { label: "Decisions", href: "/decisions", available: true },
      { label: "Evidence", href: "/evidence", available: true },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Guided review", href: "/guided-review", available: true, preview: true },
      { label: "Recipes", href: "/recipes", available: true, preview: true },
      { label: "History & replay", href: "/history", available: true },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Models & policy", href: "/models-policy", available: true },
      { label: "First run", href: "/first-run", available: true },
      { label: "Loading & empty states", href: "/states", available: true },
    ],
  },
];

export const themeNote = {
  night: "Obsidian · quiet, high contrast",
  day: "Daylight · paper and modernist red",
} as const;
