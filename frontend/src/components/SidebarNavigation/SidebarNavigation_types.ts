export type SidebarNavigationProps = {
  currentPath: string;
  onOpenPalette: () => void;
  onNavigate?: (href: string) => void;
  /** Mobile drawer: whether the off-canvas sidebar is open. */
  open?: boolean;
  /** Mobile drawer: request to close (backdrop, close button, or item click). */
  onClose?: () => void;
};
