"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { usePageStore } from "@/stores/page.store";
import { useUIStore } from "@/stores";
import { FileText, Plus, Clock, Sparkles, Menu } from "lucide-react";

export default function WorkspaceHomePage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspaceStore();
  const { pages, createPage } = usePageStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  const activePages = pages.filter((p) => !p.isArchived);

  async function handleCreatePage() {
    if (!activeWorkspace) return;
    try {
      const newPage = await createPage({
        workspaceId: activeWorkspace.id,
        title: "Untitled",
      });
      router.push(`/workspace/${newPage.id}`);
    } catch {
      // Handled
    }
  }

  return (
    <div className="flex-1 flex flex-col relative w-full">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-codex-background/80 backdrop-blur-md border-b border-codex-border/50 transition-colors select-none">
        <div className="flex items-center gap-1.5 flex-wrap truncate text-xs text-codex-muted transition-all">
          {!isSidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 mr-1 hover:bg-codex-surface rounded-codex-md text-codex-muted hover:text-codex-foreground transition-colors"
              title="Open sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <span className="text-codex-foreground font-medium truncate">
            {activeWorkspace?.name || "Workspace"}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-12">
        {/* Workspace Header */}
        <div className="flex items-start justify-between border-b border-codex-border pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-codex-muted">
                Workspace Overview
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-codex-foreground">
              {activeWorkspace?.name || "Workspace"}
            </h1>
            <p className="text-sm text-codex-muted mt-1">
              {activePages.length} {activePages.length === 1 ? "page" : "pages"} in this workspace
            </p>
          </div>

          <button
            onClick={handleCreatePage}
            disabled={!activeWorkspace}
            className="flex items-center gap-2 px-4 py-2 rounded-codex-md text-sm font-medium bg-codex-accent text-codex-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
          </button>
        </div>

        {/* Pages Grid / List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-codex-foreground">All Pages</h2>
          </div>

          {activePages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activePages.map((page) => (
                <Link
                  key={page.id}
                  href={`/workspace/${page.id}`}
                  className="group flex flex-col justify-between p-4 rounded-codex-xl border border-codex-border bg-codex-surface hover:border-codex-accent/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-codex-muted group-hover:text-codex-foreground transition-colors">
                      {page.icon ? (
                        <span className="text-lg leading-none">{page.icon}</span>
                      ) : (
                        <FileText className="w-5 h-5 shrink-0" />
                      )}
                    </div>
                    <h3 className="font-medium text-codex-foreground group-hover:text-codex-accent transition-colors line-clamp-2">
                      {page.title || "Untitled"}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-codex-muted mt-4">
                    <Clock className="w-3 h-3" />
                    <span>
                      Updated {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 border border-dashed border-codex-border rounded-codex-2xl">
              <div className="w-12 h-12 rounded-codex-xl bg-codex-surface border border-codex-border flex items-center justify-center mx-auto mb-3 text-codex-muted">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-codex-foreground">No pages yet</h3>
              <p className="text-xs text-codex-muted max-w-sm mx-auto mt-1 mb-4">
                Get started by creating your first document in this workspace.
              </p>
              <button
                onClick={handleCreatePage}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-codex-md text-xs font-medium bg-codex-accent text-codex-background hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create page</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
