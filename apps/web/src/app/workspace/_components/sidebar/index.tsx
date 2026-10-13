"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usePageStore } from "@/stores/page-store";
import { useUIStore } from "@/stores/ui-store";
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
import { EASE_OUT, SPRING } from "@/components/motion";
import { SIDEBAR_ACTIVE_LAYOUT_ID } from "./constants";
import { TrashModal } from "./trash-modal";
import { SettingsModal, type SettingsTab } from "./settings-modal";
import { Skeleton } from "@/components/ui/skeleton";

// Shared look for every clickable row in the sidebar
const NAV_ITEM_BASE =
  "w-full flex items-center gap-2 px-2 py-1 pointer-coarse:py-2 rounded-codex-md text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

const MOBILE_QUERY = "(max-width: 767px)";
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
const NAV_ITEM_IDLE = "text-codex-muted hover:bg-codex-border/40 hover:text-codex-foreground";
const NAV_ITEM_ACTIVE = "text-codex-foreground font-medium";

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
      className={`group relative isolate ${NAV_ITEM_BASE} ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE}`}
    >
      {isActive && (
        <m.span
          layoutId={SIDEBAR_ACTIVE_LAYOUT_ID}
          className="absolute inset-0 -z-10 rounded-codex-md bg-codex-border/60"
          transition={SPRING}
          aria-hidden="true"
        />
      )}
      <span className="shrink-0 flex">{icon}</span>
      <span className="flex-1 truncate text-left">{label}</span>
      {trailing}
    </button>
  );
}

interface SectionProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  action?: ReactNode;
  children: ReactNode;
}

function SidebarSection({ label, isOpen, onToggle, action, children }: SectionProps) {
  return (
    <div>
      <div className="group flex items-center justify-between px-2 py-1">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex items-center gap-1 text-xs font-medium text-codex-muted hover:text-codex-foreground transition-colors"
        >
          <span>{label}</span>
          <ChevronRight
            className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-150 ${
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
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
          >
            <div className="space-y-px">{children}</div>
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>("account");

  // Accordion state
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [isPagesOpen, setIsPagesOpen] = useState(true);

  const {
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    setCommandPaletteOpen,
    setImportMarkdownOpen,
    sidebarPeek,
    peekSidebar,
    unpeekSidebar,
  } = useUIStore();
  // Collapsed sidebar can float in as a "peek" panel (desktop hover only)
  const isPeekLayout = !isSidebarOpen && sidebarPeek !== "hidden";
  const isPeekShown = !isSidebarOpen && sidebarPeek === "shown";

  let panelStateClass: string;
  if (isSidebarOpen) {
    panelStateClass = "h-full opacity-100";
  } else if (isPeekLayout) {
    panelStateClass = `fixed top-14 bottom-14 left-0 z-50 rounded-r-codex-xl border border-l-0 border-codex-border bg-codex-sidebar ${
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

  const rootPages = pages
    .filter((p) => (p.parentPageId === null || p.parentPageId === undefined) && !p.isArchived)
    .sort((a, b) => a.order - b.order);
  const favoritePages = pages.filter((p) => p.isFavorite && !p.isArchived);

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
            className="fixed inset-0 z-30 bg-codex-background/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
          isSidebarOpen ? "w-72 md:w-60 shadow-xl md:shadow-none" : "w-0 overflow-hidden"
        }`}
      >
        <div
          // Fixed descendants escape the collapsed (w-0, overflow-hidden) aside,
          // so the peek floats over the page without changing the layout
          className={`w-72 md:w-60 flex flex-col overflow-hidden transition-[opacity,translate] duration-200 ease-out ${panelStateClass}`}
          onMouseEnter={isPeekLayout ? peekSidebar : undefined}
          onMouseLeave={isPeekLayout ? unpeekSidebar : undefined}
        >
          {/* Top: Workspace Selector + collapse / dock */}
          <div className="flex items-center gap-1 px-2 pt-2 pb-1">
            <div className="flex-1 min-w-0">
              <WorkspaceSwitcher />
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              className="shrink-0 p-1.5 rounded-codex-md text-codex-muted opacity-0 group-hover/sidebar:opacity-100 pointer-coarse:opacity-100 focus-visible:opacity-100 hover:bg-codex-border/40 hover:text-codex-foreground transition-all duration-150"
              aria-label={isPeekLayout ? "Keep sidebar open" : "Close sidebar"}
              title={isPeekLayout ? "Keep sidebar open" : "Close sidebar"}
            >
              {isPeekLayout ? (
                <ChevronsRight className="w-4 h-4" />
              ) : (
                <ChevronsLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Primary navigation */}
          <nav className="px-2 pb-3 space-y-px">
            <NavItem
              icon={<Search className="w-4 h-4" />}
              label="Search"
              onClick={() => setCommandPaletteOpen(true)}
              trailing={
                <kbd className="font-sans text-xs text-codex-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  ⌘K
                </kbd>
              }
            />
            <NavItem
              icon={<Home className="w-4 h-4" />}
              label="Home"
              isActive={pathname === "/workspace"}
              onClick={() => router.push("/workspace")}
            />
          </nav>

          {/* Scrollable Sections (Favorites & Pages) */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-4">
            {favoritePages.length > 0 && (
              <SidebarSection
                label="Favorites"
                isOpen={isFavoritesOpen}
                onToggle={() => setIsFavoritesOpen(!isFavoritesOpen)}
              >
                {/* Own layout scope: a favorited active page appears twice, and
                    each copy should keep its own highlight pill */}
                <LayoutGroup id="favorites">
                  {favoritePages.map((page) => (
                    <PageTreeItem key={`fav-${page.id}`} page={page} level={0} />
                  ))}
                </LayoutGroup>
              </SidebarSection>
            )}

            <SidebarSection
              label="Pages"
              isOpen={isPagesOpen}
              onToggle={() => setIsPagesOpen(!isPagesOpen)}
              action={
                <button
                  type="button"
                  onClick={handleCreateTopLevelPage}
                  disabled={!activeWorkspace}
                  className="p-0.5 rounded-codex-sm text-codex-muted opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 hover:bg-codex-border/40 hover:text-codex-foreground transition-all disabled:cursor-not-allowed"
                  aria-label="Create page"
                  title="Create page"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              }
            >
              {isPagesLoading ? (
                <div className="space-y-1 py-1">
                  {["w-28", "w-20", "w-24", "w-32"].map((width, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1">
                      <Skeleton className="w-4 h-4 rounded-codex-sm shrink-0" />
                      <Skeleton className={`${width} h-3.5 rounded-codex-sm`} />
                    </div>
                  ))}
                </div>
              ) : rootPages.length > 0 ? (
                rootPages.map((page) => <PageTreeItem key={page.id} page={page} level={0} />)
              ) : (
                <NavItem
                  icon={<Plus className="w-4 h-4" />}
                  label="Add a page"
                  onClick={handleCreateTopLevelPage}
                  disabled={!activeWorkspace}
                />
              )}
            </SidebarSection>
          </div>

          {/* Secondary navigation (bottom) */}
          <div className="px-2 py-2 space-y-px">
            <NavItem
              icon={<Settings className="w-4 h-4" />}
              label="Settings"
              onClick={() => {
                setSettingsInitialTab("account");
                setIsSettingsOpen(true);
              }}
            />
            <NavItem
              icon={<Upload className="w-4 h-4" />}
              label="Import Markdown"
              onClick={() => setImportMarkdownOpen(true)}
              disabled={!activeWorkspace}
            />
            <NavItem
              icon={<Trash2 className="w-4 h-4" />}
              label="Trash"
              onClick={() => setIsTrashOpen(true)}
              disabled={!activeWorkspace}
            />
          </div>
        </div>
      </aside>

      {/* Modals placed outside the aside so they aren't trapped by backdrop-filter */}
      <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsInitialTab}
      />
    </>
  );
}
