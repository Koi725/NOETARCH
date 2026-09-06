export type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
};
