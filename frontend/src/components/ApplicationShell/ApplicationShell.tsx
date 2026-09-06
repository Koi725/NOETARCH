"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CommandPalette } from "@/components/CommandPalette";
import { RouteProgress } from "@/components/RouteProgress";
import { SidebarNavigation } from "@/components/SidebarNavigation";
import { TourProvider, TourHelpButton } from "@/components/ui";
import type { ApplicationShellProps } from "./ApplicationShell_types";
import "@/tailwind/components/ApplicationShell/ApplicationShell.css";

type ShellContextValue = { openPalette: () => void };
const ShellContext = createContext<ShellContextValue>({ openPalette: () => {} });

export function useShell(): ShellContextValue {
  return useContext(ShellContext);
}

export function ApplicationShell({ children }: ApplicationShellProps) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [routingTarget, setRoutingTarget] = useState<string | null>(null);
  const routing = routingTarget !== null && routingTarget !== pathname;

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const closeNav = useCallback(() => setNavOpen(false), []);
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
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <ShellContext.Provider value={{ openPalette }}>
      <TourProvider>
        <div className="no-application-shell">
          <RouteProgress active={routing} />

          {/* Mobile top bar with a hamburger (hidden on desktop via CSS). */}
          <header className="no-shell-topbar">
            <button
              type="button"
              className="no-shell-hamburger"
              aria-label="Open menu"
              aria-controls="primary-nav"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <span className="no-shell-topbar-brand">NOETARCH</span>
            <button
              type="button"
              className="no-shell-topbar-search"
              aria-label="Search anything"
              onClick={openPalette}
            >
              ⌘K
            </button>
          </header>

          {/* Scrim behind the drawer on mobile. */}
          {navOpen && (
            <div className="no-shell-scrim" role="presentation" onClick={closeNav} />
          )}

          <SidebarNavigation
            currentPath={pathname}
            onOpenPalette={openPalette}
            onNavigate={setRoutingTarget}
            open={navOpen}
            onClose={closeNav}
          />
          <main className="no-shell-main">
            {children}
          </main>
          <CommandPalette open={paletteOpen} onClose={closePalette} onNavigate={navigate} />
          <TourHelpButton />
        </div>
      </TourProvider>
    </ShellContext.Provider>
  );
}
