"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usePageStore } from "@/stores/page-store";
import { SIDEBAR_DRAWER_QUERY as MOBILE_QUERY, useUIStore } from "@/stores/ui-store";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { PageTreeItem } from "./page-tree-item";
import {
  Search,
  Settings,
  Home,
  Plus,
  Trash2,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  Upload,
} from "lucide-react";
import { AnimatePresence, LayoutGroup, m } from "motion/react";
import { TWEEN, TWEEN_FAST } from "@/components/motion";
import { Kbd } from "@/components/reusable/kbd";
import { Logo } from "@/components/ui/logo";
import { SidebarActivePill } from "./active-pill";
import { TrashModal } from "./trash-modal";
import { SettingsModal } from "./settings-modal";
import { PageTreeSkeleton } from "@/components/ui/skeleton";

// Shared look for every clickable row in the sidebar: 32px on mouse, 44px on touch
const NAV_ITEM_BASE =
  "group relative isolate flex h-8 w-full items-center gap-2.5 rounded-codex-md px-2 text-left text-sm transition-colors duration-150 pointer-coarse:h-11 disabled:cursor-not-allowed disabled:opacity-50";
const NAV_ITEM_IDLE = "text-codex-muted hover:bg-codex-hover hover:text-codex-foreground";
const NAV_ITEM_ACTIVE = "text-codex-foreground font-medium";

/** Horizontal drag (px) past which releasing a swipe closes the drawer */
const SWIPE_CLOSE_THRESHOLD = 64;

/**
 * Swipe-left-to-close for the mobile sidebar drawer. Moves the panel with the
 * finger via a direct style write (no React re-render per touchmove) and
 * either closes or springs back on release. Vertical scrolls are left alone.
 */
function useSwipeToClose(
  panelRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !isOpen) return undefined;

    let startX = 0;
    let startY = 0;
    let dx = 0;
    let tracking: "undecided" | "horizontal" | "vertical" = "undecided";

    const onStart = (e: TouchEvent) => {
      if (!window.matchMedia(MOBILE_QUERY).matches || e.touches.length !== 1) return;
      const touch = e.touches[0]!;
      startX = touch.clientX;
      startY = touch.clientY;
      dx = 0;
      tracking = "undecided";
    };
    const onMove = (e: TouchEvent) => {
      if (!window.matchMedia(MOBILE_QUERY).matches || e.touches.length !== 1) return;
      const touch = e.touches[0]!;
      const moveX = touch.clientX - startX;
      const moveY = touch.clientY - startY;
      if (tracking === "undecided" && Math.abs(moveX) + Math.abs(moveY) > 8) {
        tracking = Math.abs(moveX) > Math.abs(moveY) ? "horizontal" : "vertical";
      }
      if (tracking !== "horizontal") return;
      dx = Math.min(0, moveX);
      panel.style.transition = "none";
      panel.style.transform = `translateX(${dx}px)`;
    };
    const onEnd = () => {
      if (tracking !== "horizontal") return;
      panel.style.transition = "";
      panel.style.transform = "";
      if (dx < -SWIPE_CLOSE_THRESHOLD) onClose();
      tracking = "undecided";
    };

    panel.addEventListener("touchstart", onStart, { passive: true });
    panel.addEventListener("touchmove", onMove, { passive: true });
    panel.addEventListener("touchend", onEnd);
    panel.addEventListener("touchcancel", onEnd);
    return () => {
      panel.removeEventListener("touchstart", onStart);
      panel.removeEventListener("touchmove", onMove);
      panel.removeEventListener("touchend", onEnd);
      panel.removeEventListener("touchcancel", onEnd);
      panel.style.transition = "";
      panel.style.transform = "";
    };
  }, [panelRef, isOpen, onClose]);
}

interface NavItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
}

function NavItem({ icon, label, onClick, isActive = false, disabled, trailing }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      className={`${NAV_ITEM_BASE} ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE}`}
    >
      {isActive && <SidebarActivePill />}
      <span
        className={`flex w-4 shrink-0 justify-center transition-colors ${
          isActive ? "text-codex-foreground" : "text-codex-muted group-hover:text-codex-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {trailing}
    </button>
  );
}

interface SectionProps {
  id: string;
  label: string;
  /** Item count shown next to the label, zero-padded */
  count?: number | undefined;
  isOpen: boolean;
  onToggle: () => void;
  action?: ReactNode;
  children: ReactNode;
}

function SidebarSection({ id, label, count, isOpen, onToggle, action, children }: SectionProps) {
  return (
    <div className="pt-3">
      <div className="group/section flex h-7 items-center justify-between">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={id}
          className="eyebrow flex h-7 items-center gap-1.5 rounded-codex-sm px-2 text-codex-muted transition-colors hover:text-codex-foreground"
        >
          <span>{label}</span>
          {count !== undefined && <span>{String(count).padStart(2, "0")}</span>}
          <ChevronRight
            aria-hidden="true"
            className={`size-3 opacity-0 transition-[opacity,rotate] duration-150 group-hover/section:opacity-100 group-focus-within/section:opacity-100 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </button>
        {action}
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            key="section"
            id={id}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={TWEEN}
          >
            <div className="space-y-px pt-0.5">{children}</div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspaceStore();
  const { pages, createPage, isInitialized, isLoading } = usePageStore();
  const isPagesLoading = !isInitialized || (isLoading && pages.length === 0);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Accordion state
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [isPagesOpen, setIsPagesOpen] = useState(true);

  const {
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    setCommandPaletteOpen,
    setImportMarkdownOpen,
    openSettings,
    sidebarPeek,
    peekSidebar,
    unpeekSidebar,
  } = useUIStore();
  // Collapsed sidebar can float in as a "peek" panel (desktop hover only)
  const isPeekLayout = !isSidebarOpen && sidebarPeek !== "hidden";
  const isPeekShown = !isSidebarOpen && sidebarPeek === "shown";

  let panelStateClass: string;
  if (isSidebarOpen) {
    // The docked column's edge: one hairline between navigation and content
    panelStateClass = "h-full opacity-100 border-r border-codex-border";
  } else if (isPeekLayout) {
    panelStateClass = `fixed top-14 bottom-14 left-0 z-50 rounded-r-codex-xl border border-l-0 border-codex-border bg-codex-sidebar shadow-codex-lg ${
      isPeekShown ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
    }`;
  } else {
    panelStateClass = "h-full opacity-0 md:-translate-x-4 pointer-events-none";
  }

  // On small screens the sidebar is an overlay: close it after navigating
  useEffect(() => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setSidebarOpen(false);
    }
  }, [pathname, setSidebarOpen]);

  const asideRef = useRef<HTMLElement>(null);
  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);
  useSwipeToClose(asideRef, isSidebarOpen, closeSidebar);

  // Escape closes the overlay drawer on small screens
  useEffect(() => {
    if (!isSidebarOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && window.matchMedia(MOBILE_QUERY).matches) closeSidebar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSidebarOpen, closeSidebar]);

  const activePages = pages.filter((p) => !p.isArchived);
  const rootPages = activePages
    .filter((p) => p.parentPageId === null || p.parentPageId === undefined)
    .sort((a, b) => a.order - b.order);
  const favoritePages = activePages.filter((p) => p.isFavorite);

  async function handleCreateTopLevelPage() {
    if (!activeWorkspace) return;
    try {
      const newPage = await createPage({
        workspaceId: activeWorkspace.id,
        title: "Untitled",
      });
      router.push(`/workspace/${newPage.id}`);
    } catch {
      // Error handled by store
    }
  }

  return (
    <>
      {/* Mobile backdrop: sidebar overlays the content instead of squeezing it */}
      <AnimatePresence>
        {isSidebarOpen && (
          <m.div
            key="sidebar-backdrop"
            aria-hidden
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-codex-scrim md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TWEEN_FAST}
          />
        )}
      </AnimatePresence>
      {/* Left-edge hot zone that peeks the collapsed sidebar (desktop hover) */}
      {!isSidebarOpen && (
        <div
          aria-hidden="true"
          className="hidden md:block pointer-coarse:hidden fixed inset-y-0 left-0 z-30 w-3"
          onMouseEnter={peekSidebar}
          onMouseLeave={unpeekSidebar}
        />
      )}
      <aside
        ref={asideRef}
        aria-label="Workspace navigation"
        className={`h-dvh bg-codex-sidebar flex flex-col select-none shrink-0 transition-all duration-200 ease-out group/sidebar fixed inset-y-0 left-0 z-40 md:relative md:z-20 ${
          isSidebarOpen ? "w-72 md:w-60" : "w-0 overflow-hidden"
        }`}
      >
        <div
          // Fixed descendants escape the collapsed (w-0, overflow-hidden) aside,
          // so the peek floats over the page without changing the layout
          className={`w-72 md:w-60 flex flex-col overflow-hidden transition-[opacity,translate] duration-200 ease-out ${panelStateClass}`}
          onMouseEnter={isPeekLayout ? peekSidebar : undefined}
          onMouseLeave={isPeekLayout ? unpeekSidebar : undefined}
        >
          {/* Brand + collapse / dock */}
          <div className="flex h-12 shrink-0 items-center gap-1 pr-2 pl-3 pointer-coarse:h-14">
            <Link
              href="/workspace"
              className="flex min-w-0 flex-1 items-center rounded-codex-md py-1"
              aria-label="Tatalaku home"
            >
              <Logo size="sm" />
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex size-8 shrink-0 items-center justify-center rounded-codex-md text-codex-muted opacity-0 transition-[opacity,color,background-color] duration-150 group-hover/sidebar:opacity-100 hover:bg-codex-hover hover:text-codex-foreground focus-visible:opacity-100 pointer-coarse:size-11 pointer-coarse:opacity-100"
              aria-label={isPeekLayout ? "Keep sidebar open" : "Close sidebar"}
              title={isPeekLayout ? "Keep sidebar open" : "Close sidebar (⌘\\)"}
            >
              {isPeekLayout ? (
                <ChevronsRight className="size-4" />
              ) : (
                <ChevronsLeft className="size-4" />
              )}
            </button>
          </div>

          {/* Search reads as a field, opens the command palette */}
          <div className="shrink-0 px-2 pb-2">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              aria-keyshortcuts="Meta+K Control+K"
              className="flex h-8 w-full items-center gap-2 rounded-codex-md border border-codex-border bg-codex-elevated px-2.5 text-left text-sm text-codex-muted transition-colors duration-150 hover:border-codex-border-strong hover:text-codex-foreground pointer-coarse:h-11"
            >
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 truncate">Search…</span>
              <Kbd className="pointer-coarse:hidden">⌘K</Kbd>
            </button>
          </div>

          {/* Primary navigation */}
          <nav aria-label="Primary" className="shrink-0 px-2 space-y-px">
            <NavItem
              icon={<Home className="size-4" />}
              label="Home"
              isActive={pathname === "/workspace"}
              onClick={() => router.push("/workspace")}
            />
          </nav>

          {/* Scrollable sections (Favorites & Pages) */}
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {favoritePages.length > 0 && (
              <SidebarSection
                id="sidebar-favorites"
                label="Favorites"
                count={favoritePages.length}
                isOpen={isFavoritesOpen}
                onToggle={() => setIsFavoritesOpen(!isFavoritesOpen)}
              >
                {/* Own layout scope: a favorited active page appears twice, and
                    each copy should keep its own highlight */}
                <LayoutGroup id="favorites">
                  {favoritePages.map((page) => (
                    <PageTreeItem key={`fav-${page.id}`} page={page} level={0} />
                  ))}
                </LayoutGroup>
              </SidebarSection>
            )}

            <SidebarSection
              id="sidebar-pages"
              label="Pages"
              count={isPagesLoading ? undefined : activePages.length}
              isOpen={isPagesOpen}
              onToggle={() => setIsPagesOpen(!isPagesOpen)}
              action={
                <button
                  type="button"
                  onClick={handleCreateTopLevelPage}
                  disabled={!activeWorkspace}
                  className="flex size-7 items-center justify-center rounded-codex-sm text-codex-muted opacity-0 transition-[opacity,color,background-color] duration-150 group-hover/section:opacity-100 hover:bg-codex-hover hover:text-codex-foreground focus-visible:opacity-100 disabled:cursor-not-allowed pointer-coarse:size-10 pointer-coarse:opacity-100"
                  aria-label="Create page"
                  title="Create page"
                >
                  <Plus className="size-3.5" />
                </button>
              }
            >
              {isPagesLoading ? (
                <PageTreeSkeleton />
              ) : rootPages.length > 0 ? (
                rootPages.map((page) => <PageTreeItem key={page.id} page={page} level={0} />)
              ) : (
                <NavItem
                  icon={<Plus className="size-4" />}
                  label="Add a page"
                  onClick={handleCreateTopLevelPage}
                  disabled={!activeWorkspace}
                />
              )}
            </SidebarSection>
          </div>

          {/* Secondary navigation and the workspace, set off by a hairline */}
          <div className="shrink-0 border-t border-codex-border px-2 pt-2 pb-2 space-y-px">
            <NavItem
              icon={<Upload className="size-4" />}
              label="Import"
              onClick={() => setImportMarkdownOpen(true)}
              disabled={!activeWorkspace}
            />
            <NavItem
              icon={<Trash2 className="size-4" />}
              label="Trash"
              onClick={() => setIsTrashOpen(true)}
              disabled={!activeWorkspace}
            />
            <NavItem
              icon={<Settings className="size-4" />}
              label="Settings"
              onClick={() => openSettings("account")}
            />
            <div className="pt-1">
              <WorkspaceSwitcher />
            </div>
          </div>
        </div>
      </aside>

      {/* Modals placed outside the aside so they aren't clipped by its overflow */}
      <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />
      <SettingsModal />
    </>
  );
}
