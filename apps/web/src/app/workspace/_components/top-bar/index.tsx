"use client";

import type { ReactNode } from "react";
import { PanelLeft } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { Breadcrumb, type BreadcrumbItem } from "@/components/shared/breadcrumb";
import { AccountMenu } from "./account-menu";
import { ThemeMenu } from "./theme-menu";
import { TOP_BAR_ICON_BUTTON } from "./constants";

export { TOP_BAR_ICON_BUTTON };

interface TopBarProps {
  items: BreadcrumbItem[];
  actions?: ReactNode;
  /** Hairline along the bottom edge that fills as the page is read */
  showScrollProgress?: boolean;
}

/**
 * Sticky top bar for workspace pages: where you are on the left, page actions
 * plus the theme and account menus on the right.
 */
export function TopBar({ items, actions, showScrollProgress = false }: TopBarProps) {
  const { isSidebarOpen, setSidebarOpen, peekSidebar, unpeekSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-codex-border bg-codex-background px-3 select-none pointer-coarse:h-14">
      <div className="flex min-w-0 items-center gap-1">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            // Hovering previews the sidebar as a floating peek (desktop only)
            onMouseEnter={peekSidebar}
            onMouseLeave={unpeekSidebar}
            className={TOP_BAR_ICON_BUTTON}
            aria-label="Open sidebar"
            title="Open sidebar (⌘\)"
          >
            <PanelLeft className="size-4" />
          </button>
        )}
        <Breadcrumb items={items} />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {actions}
        <ThemeMenu />
        {/* Phones reach the account through the sidebar */}
        <div className="hidden sm:block">
          <AccountMenu />
        </div>
      </div>

      {/* Scroll-driven in CSS (no listeners); hidden where unsupported */}
      {showScrollProgress && (
        <div
          aria-hidden="true"
          className="scroll-progress pointer-events-none absolute inset-x-0 -bottom-px h-px bg-codex-accent"
        />
      )}
    </header>
  );
}
