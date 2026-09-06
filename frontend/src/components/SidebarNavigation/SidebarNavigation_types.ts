export type SidebarNavigationProps = {
  currentPath: string;
  onOpenPalette: () => void;
  onNavigate?: (href: string) => void;
};
