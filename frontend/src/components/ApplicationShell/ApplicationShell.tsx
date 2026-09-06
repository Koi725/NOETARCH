"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CommandPalette } from "@/components/CommandPalette";
import { RouteProgress } from "@/components/RouteProgress";
import { SidebarNavigation } from "@/components/SidebarNavigation";
import { TodayOverview } from "@/components/TodayOverview";
import type { ApplicationShellProps } from "./ApplicationShell_types";
import "@/tailwind/components/ApplicationShell/ApplicationShell.css";

export function ApplicationShell({ children }: ApplicationShellProps) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [routingTarget, setRoutingTarget] = useState<string | null>(null);
  const routing = routingTarget !== null && routingTarget !== pathname;

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const navigate = useCallback((href: string) => {
    setPaletteOpen(false);
    setRoutingTarget(href);
    router.push(href);
  }, [router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="no-application-shell">
      <RouteProgress active={routing} />
      <SidebarNavigation currentPath={pathname} onOpenPalette={openPalette} onNavigate={setRoutingTarget} />
      <main className="no-shell-main">
        {children ?? <TodayOverview onOpenPalette={openPalette} />}
      </main>
      <CommandPalette open={paletteOpen} onClose={closePalette} onNavigate={navigate} />
    </div>
  );
}
