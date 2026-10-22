"use client";

import type { ReactNode } from "react";
import { PanelLeft } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useModKey } from "@/lib/platform";
import { Breadcrumb, type BreadcrumbItem } from "@/components/shared/breadcrumb";
import { TOP_BAR_ICON_BUTTON } from "./constants";

export { TOP_BAR_ICON_BUTTON };

interface TopBarProps {
  items: BreadcrumbItem[];
  actions?: ReactNode;
  /** Hairline along the bottom edge that fills as the page is read */
  showScrollProgress?: boolean;
  /**
   * Drop the bar on wide screens while the sidebar is docked open, for views
   * where it would only repeat the sidebar (Home). It stays on phones, where
   * it holds the drawer button, and whenever the sidebar is collapsed.
   */
  hideWhenSidebarDocked?: boolean;
}

/**
 * Sticky top bar for workspace pages: where you are on the left, the page's
 * own actions on the right. Account and preferences (theme included) live in
 * the sidebar's Settings and the command palette, so they aren't repeated here.
 */
export function TopBar({
  items,
  actions,
  showScrollProgress = false,
  hideWhenSidebarDocked = false,
}: TopBarProps) {
  const { isSidebarOpen, setSidebarOpen, peekSidebar, unpeekSidebar } = useUIStore();
  const mod = useModKey();

  return (
    <header
      className={`sticky top-0 z-40 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-codex-border bg-codex-background px-3 select-none pointer-coarse:h-14 ${
        hideWhenSidebarDocked && isSidebarOpen ? "md:hidden" : ""
      }`}
    >
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
            aria-keyshortcuts="Meta+Backslash Control+Backslash"
            title={`Open sidebar (${mod}\\)`}
          >
            <PanelLeft className="size-4" />
          </button>
        )}
        <Breadcrumb items={items} />
      </div>

      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}

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
