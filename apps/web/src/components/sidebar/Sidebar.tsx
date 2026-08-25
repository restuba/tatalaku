"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { usePageStore } from "@/stores/page.store";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { PageTreeItem } from "./PageTreeItem";
import { Plus, LogOut, FileText, Compass, Trash2 } from "lucide-react";
import { TrashModal } from "./TrashModal";

export function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { pages, createPage } = usePageStore();
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const rootPages = pages.filter(
    (p) => (p.parentPageId === null || p.parentPageId === undefined) && !p.isArchived,
  );

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

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <aside className="w-64 h-screen bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200/80 dark:border-neutral-800/80 flex flex-col select-none shrink-0 transition-all">
      {/* Top: Workspace Selector */}
      <div className="p-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
        <WorkspaceSwitcher />
      </div>

      {/* Navigation & Actions */}
      <div className="p-2 space-y-1">
        <button
          onClick={() => router.push("/workspace")}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <Compass className="w-4 h-4 text-neutral-500" />
          <span>Workspace Home</span>
        </button>
        <button
          onClick={handleCreateTopLevelPage}
          disabled={!activeWorkspace}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4 text-neutral-500" />
          <span>Add a page</span>
        </button>
      </div>

      {/* Pages Section */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex items-center justify-between px-2.5 py-1 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          <span>Pages</span>
          <button
            onClick={handleCreateTopLevelPage}
            disabled={!activeWorkspace}
            className="p-0.5 hover:text-neutral-800 dark:hover:text-neutral-200 rounded transition-colors"
            title="Create page"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-0.5 mt-1">
          {rootPages.length > 0 ? (
            rootPages.map((page) => <PageTreeItem key={page.id} page={page} level={0} />)
          ) : (
            <div className="px-3 py-4 text-center">
              <FileText className="w-6 h-6 text-neutral-300 dark:text-neutral-700 mx-auto mb-1.5" />
              <p className="text-xs text-neutral-400">No pages yet</p>
              <button
                onClick={handleCreateTopLevelPage}
                disabled={!activeWorkspace}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                + Create first page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trash Menu */}
      <div className="px-2 py-2">
        <button
          onClick={() => setIsTrashOpen(true)}
          disabled={!activeWorkspace}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-neutral-500 dark:text-neutral-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          <span>Trash</span>
        </button>
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xs font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors shrink-0"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
      <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />
    </aside>
  );
}
