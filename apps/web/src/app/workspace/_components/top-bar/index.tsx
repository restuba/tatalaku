"use client";

import type { ReactNode } from "react";
import { PanelLeft } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { Breadcrumb, type BreadcrumbItem } from "@/components/shared/breadcrumb";

interface TopBarProps {
  items: BreadcrumbItem[];
  actions?: ReactNode;
  /** Hairline along the bottom edge that fills as the page is read */
  showScrollProgress?: boolean;
}

/** Icon buttons in the top bar: 32px on mouse, 44px on touch */
export const TOP_BAR_ICON_BUTTON =
  "flex size-8 shrink-0 items-center justify-center rounded-codex-md text-codex-muted transition-colors duration-150 hover:bg-codex-surface-raised hover:text-codex-foreground pointer-coarse:size-11";

/**
 * Sticky top bar for workspace pages. Its bottom hairline is always drawn, so
 * the header reads as part of the shell's structure, like the sidebar's edge.
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
            title="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
        <Breadcrumb items={items} />
      </div>

      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}

      {/* Scroll-driven in CSS (no listeners); hidden where unsupported */}
      {showScrollProgress && (
        <div
          aria-hidden="true"
          className="scroll-progress pointer-events-none absolute inset-x-0 -bottom-px h-px bg-codex-foreground"
        />
      )}
    </header>
  );
}
