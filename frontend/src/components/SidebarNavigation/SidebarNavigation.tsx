"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { applicationMeta } from "@/data/ApplicationShell/ApplicationShell-data";
import { navigationGroups, themeNote } from "@/data/SidebarNavigation/SidebarNavigation-data";
import type { SidebarNavigationProps } from "./SidebarNavigation_types";
import "@/tailwind/components/SidebarNavigation/SidebarNavigation.css";

function isCurrentPath(currentPath: string, href: string) {
  return href === "/" ? currentPath === "/" || currentPath === "/today" : currentPath.startsWith(href);
}

export function SidebarNavigation({ currentPath, onOpenPalette, onNavigate }: SidebarNavigationProps) {
  const { mode, plain, motion, togglePlain, toggleMotion } = useTheme();

  return (
    <nav className="no-sidebar" aria-label="Primary navigation">
      <div className="no-brand-block">
        <div className="no-brand-lockup">
          <span className="no-brand-mark" aria-hidden="true" />
          <span className="no-brand-name">{applicationMeta.brand}</span>
        </div>
        <div className="no-eyebrow no-brand-tagline">{applicationMeta.tagline}</div>
      </div>

      <div className="no-utility-block">
        <ThemeToggle />
        <div className="no-theme-note" aria-live="polite">{themeNote[mode]}</div>
        <button className="no-utility-button" type="button" onClick={togglePlain} aria-pressed={plain}>
          <span className="no-utility-square" aria-hidden="true" />
          Plain-English mode · {plain ? "on" : "off"}
        </button>
        <button className="no-utility-button" type="button" onClick={toggleMotion} aria-pressed={motion}>
          <span className="no-utility-square" aria-hidden="true" />
          Motion · {motion ? "on" : "off"}
        </button>
        <button className="no-utility-button" type="button" onClick={onOpenPalette}>
          <span aria-hidden="true">⌕</span> Search anything · ⌘K
        </button>
      </div>

      <div className="no-navigation-groups">
        {navigationGroups.map((group) => (
          <div className="no-navigation-group" key={group.label}>
            <div className="no-eyebrow no-navigation-heading">{group.label}</div>
            <div className="no-navigation-items">
              {group.items.map((item) => {
                const active = item.available && isCurrentPath(currentPath, item.href);
                return item.available ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`no-nav-item${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => onNavigate?.(item.href)}
                  >
                    {active ? <span className="no-nav-active-bar" aria-hidden="true" /> : null}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className="no-nav-item is-disabled" aria-disabled="true" key={item.href}>
                    <span>{item.label}</span>
                    <span className="no-nav-availability">Coming soon</span>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <footer className="no-sidebar-footer">
        <div className="no-storage-line"><span className="no-status-dot no-status-ok" aria-hidden="true" />{applicationMeta.storage}</div>
        <div className="no-spend-line">Today <strong>{applicationMeta.spend}</strong><span>/ {applicationMeta.budget}</span></div>
        <div className="no-budget-track" aria-label={`${applicationMeta.budgetPercent}% of today's budget used`}><span style={{ width: `${applicationMeta.budgetPercent}%` }} /></div>
      </footer>
    </nav>
  );
}
