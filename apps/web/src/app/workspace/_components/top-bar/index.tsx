"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PanelLeft } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { Breadcrumb, type BreadcrumbItem } from "@/components/shared/breadcrumb";

interface TopBarProps {
  items: BreadcrumbItem[];
  actions?: ReactNode;
  /** Thin accent line along the bottom edge that tracks reading progress */
  showScrollProgress?: boolean;
}

/**
 * Minimal sticky top bar for workspace pages.
 * The bottom divider only appears once the content has been scrolled,
 * so the page feels borderless at rest.
 */
export function TopBar({ items, actions, showScrollProgress = false }: TopBarProps) {
  const { isSidebarOpen, setSidebarOpen, peekSidebar, unpeekSidebar } = useUIStore();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsScrolled(entry ? !entry.isIntersecting : false);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-0 w-full" />
      <header
        className={`sticky top-0 z-40 flex h-11 items-center justify-between gap-3 px-3 bg-codex-background border-b transition-colors duration-150 select-none ${
          isScrolled ? "border-codex-border" : "border-transparent"
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
              className="shrink-0 p-1.5 pointer-coarse:p-2.5 rounded-codex-md text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground transition-colors"
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
            className="scroll-progress pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-codex-accent"
          />
        )}
      </header>
    </>
  );
}
