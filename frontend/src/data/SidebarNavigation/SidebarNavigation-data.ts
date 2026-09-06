export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export type NavigationItem = {
  label: string;
  href: string;
  available: boolean;
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Watch",
    items: [
      { label: "Today", href: "/", available: true },
      { label: "Live run", href: "/live-run", available: false },
      { label: "Decisions", href: "/decisions", available: false },
      { label: "Evidence", href: "/evidence", available: false },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Guided review", href: "/guided-review", available: false },
      { label: "Recipes", href: "/recipes", available: false },
      { label: "History & replay", href: "/history", available: false },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Models & policy", href: "/models-policy", available: false },
      { label: "First run", href: "/first-run", available: false },
      { label: "Loading & empty states", href: "/states", available: false },
    ],
  },
];

export const themeNote = {
  night: "Obsidian · quiet, high contrast",
  day: "Daylight · paper and modernist red",
} as const;
