"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usePageStore } from "@/stores/page-store";
import { useUIStore } from "@/stores/ui-store";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { PageTreeItem } from "./page-tree-item";
import { Search, Settings, Home, Plus, Trash2, ChevronsLeft, ChevronRight } from "lucide-react";
import { TrashModal } from "./trash-modal";
import { SettingsModal, type SettingsTab } from "./settings-modal";
import { Skeleton } from "@/components/ui/skeleton";

// Shared look for every clickable row in the sidebar
const NAV_ITEM_BASE =
  "w-full flex items-center gap-2 px-2 py-1 rounded-codex-md text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
const NAV_ITEM_IDLE = "text-codex-muted hover:bg-codex-border/40 hover:text-codex-foreground";
const NAV_ITEM_ACTIVE = "bg-codex-border/60 text-codex-foreground font-medium";

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
      className={`group ${NAV_ITEM_BASE} ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE}`}
    >
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
      {isOpen && <div className="space-y-px">{children}</div>}
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

  const { isSidebarOpen, toggleSidebar, setCommandPaletteOpen } = useUIStore();

  const rootPages = pages.filter(
    (p) => (p.parentPageId === null || p.parentPageId === undefined) && !p.isArchived,
  );
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
      <aside
        className={`h-screen bg-codex-sidebar flex flex-col select-none shrink-0 transition-all duration-200 ease-out relative group/sidebar z-20 ${
          isSidebarOpen ? "w-60" : "w-0 overflow-hidden"
        }`}
      >
        <div
          className={`w-60 flex flex-col h-full overflow-hidden transition-opacity duration-150 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* Top: Workspace Selector + collapse */}
          <div className="flex items-center gap-1 px-2 pt-2 pb-1">
            <div className="flex-1 min-w-0">
              <WorkspaceSwitcher />
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              className="shrink-0 p-1.5 rounded-codex-md text-codex-muted opacity-0 group-hover/sidebar:opacity-100 focus-visible:opacity-100 hover:bg-codex-border/40 hover:text-codex-foreground transition-all duration-150"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <ChevronsLeft className="w-4 h-4" />
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
                {favoritePages.map((page) => (
                  <PageTreeItem key={`fav-${page.id}`} page={page} level={0} />
                ))}
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
                  className="p-0.5 rounded-codex-sm text-codex-muted opacity-0 group-hover:opacity-100 hover:bg-codex-border/40 hover:text-codex-foreground transition-all disabled:cursor-not-allowed"
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
