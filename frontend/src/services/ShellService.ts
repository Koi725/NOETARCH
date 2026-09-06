import type { ShellConfig } from "@/contracts/shell";

export interface ShellService {
  getShellConfig(): ShellConfig;
}

import { applicationMeta } from "@/data/ApplicationShell/ApplicationShell-data";
import { navigationGroups, themeNote } from "@/data/SidebarNavigation/SidebarNavigation-data";
import { paletteItems } from "@/data/CommandPalette/CommandPalette-data";

export const mockShellService: ShellService = {
  getShellConfig: () => ({
    applicationMeta: applicationMeta as ShellConfig["applicationMeta"],
    navigationGroups: navigationGroups as ShellConfig["navigationGroups"],
    paletteItems: paletteItems as ShellConfig["paletteItems"],
    themeNote: themeNote as ShellConfig["themeNote"],
  }),
};
