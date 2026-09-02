"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { usePageStore } from "@/stores/page.store";
import { useUIStore } from "@/stores";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { PageTreeItem } from "./page-tree-item";
import {
  Search,
  Settings,
  Home,
  Plus,
  FileText,
  Trash2,
  ChevronsLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { TrashModal } from "./trash-modal";
import { AppearanceModal } from "./appearance-modal";

export function Sidebar() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspaceStore();
  const { pages, createPage } = usePageStore();
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);

  // Accordion state
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [isPagesOpen, setIsPagesOpen] = useState(true);

  const { isSidebarOpen, toggleSidebar } = useUIStore();

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
        className={`h-screen bg-codex-surface/80 dark:bg-codex-surface/40 backdrop-blur-2xl border-codex-border/40 flex flex-col select-none shrink-0 transition-all duration-300 ease-out relative group/sidebar z-20 ${
          isSidebarOpen
            ? "w-64 border-r shadow-2xl shadow-black/5 dark:shadow-black/20"
            : "w-0 border-r-0 overflow-hidden"
        }`}
      >
        <div
          className={`w-64 flex flex-col h-full overflow-hidden transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* Top: Workspace Selector */}
          <div className="p-3 border-b border-codex-border/50">
            <WorkspaceSwitcher />
          </div>

          {/* Quick Actions */}
          <div className="px-2 py-2 space-y-0.5">
            <button
              onClick={() => {}}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-codex-md text-sm text-codex-muted hover:bg-codex-surface/80 hover:text-codex-foreground hover:scale-[1.02] active:scale-95 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-medium bg-codex-background border border-codex-border rounded text-codex-muted">
                  ⌘K
                </kbd>
              </div>
            </button>
            <button
              onClick={() => router.push("/workspace")}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-codex-md text-sm text-codex-muted hover:bg-codex-surface/80 hover:text-codex-foreground hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setIsAppearanceOpen(true)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-codex-md text-sm text-codex-muted hover:bg-codex-surface/80 hover:text-codex-foreground hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Scrollable Sections (Favorites & Pages) */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
            {/* Favorites Section */}
            {favoritePages.length > 0 && (
              <div>
                <div
                  className="group flex items-center justify-between px-1 py-1 text-xs font-semibold text-codex-muted hover:text-codex-foreground cursor-pointer transition-colors"
                  onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
                >
                  <div className="flex items-center gap-1">
                    {isFavoritesOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    )}
                    <span className="uppercase tracking-wider">Favorites</span>
                  </div>
                </div>

                {isFavoritesOpen && (
                  <div className="space-y-0.5 mt-0.5">
                    {favoritePages.map((page) => (
                      <PageTreeItem key={`fav-${page.id}`} page={page} level={0} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pages Section */}
            <div>
              <div
                className="group flex items-center justify-between px-1 py-1 text-xs font-semibold text-codex-muted hover:text-codex-foreground cursor-pointer transition-colors"
                onClick={() => setIsPagesOpen(!isPagesOpen)}
              >
                <div className="flex items-center gap-1">
                  {isPagesOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                  <span className="uppercase tracking-wider">Pages</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTopLevelPage();
                  }}
                  disabled={!activeWorkspace}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-codex-surface rounded-codex-sm transition-all"
                  title="Create page"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {isPagesOpen && (
                <div className="space-y-0.5 mt-0.5">
                  {rootPages.length > 0 ? (
                    rootPages.map((page) => <PageTreeItem key={page.id} page={page} level={0} />)
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <FileText className="w-6 h-6 text-codex-muted/50 mx-auto mb-1.5" />
                      <p className="text-xs text-codex-muted">No pages yet</p>
                      <button
                        onClick={handleCreateTopLevelPage}
                        disabled={!activeWorkspace}
                        className="mt-2 text-xs text-codex-accent hover:underline font-medium"
                      >
                        + Create first page
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trash Menu (Bottom) */}
          <div className="px-2 py-2 border-t border-codex-border/30">
            <button
              onClick={() => setIsTrashOpen(true)}
              disabled={!activeWorkspace}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-codex-md text-sm text-codex-muted hover:bg-codex-surface/80 hover:text-codex-foreground hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
            </button>
          </div>
        </div>

        {isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3.5 top-8 z-50 p-1 bg-codex-surface/80 backdrop-blur-md border border-codex-border/40 rounded-full text-codex-muted hover:text-codex-foreground hover:bg-codex-background hover:scale-110 opacity-0 group-hover/sidebar:opacity-100 transition-all shadow-sm flex items-center justify-center"
            title="Close sidebar"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </aside>

      {/* Modals placed outside the aside so they aren't trapped by backdrop-filter */}
      <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />
      <AppearanceModal isOpen={isAppearanceOpen} onClose={() => setIsAppearanceOpen(false)} />
    </>
  );
}
