"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { usePageStore } from "@/stores/page.store";
import { FileText, Plus, Clock, Sparkles } from "lucide-react";

export default function WorkspaceHomePage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspaceStore();
  const { pages, createPage } = usePageStore();

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
    <div className="flex-1 max-w-4xl w-full mx-auto p-8 sm:p-12">
      {/* Workspace Header */}
      <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Workspace Overview
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {activeWorkspace?.name || "Workspace"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {activePages.length} {activePages.length === 1 ? "page" : "pages"} in this workspace
          </p>
        </div>

        <button
          onClick={handleCreatePage}
          disabled={!activeWorkspace}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Page</span>
        </button>
      </div>

      {/* Pages Grid / List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            All Pages
          </h2>
        </div>

        {activePages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activePages.map((page) => (
              <Link
                key={page.id}
                href={`/workspace/${page.id}`}
                className="group flex flex-col justify-between p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900/60 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
                    {page.icon ? (
                      <span className="text-lg leading-none">{page.icon}</span>
                    ) : (
                      <FileText className="w-5 h-5 text-neutral-400 shrink-0" />
                    )}
                  </div>
                  <h3 className="font-medium text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {page.title || "Untitled"}
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-4">
                  <Clock className="w-3 h-3" />
                  <span>
                    Updated {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No pages yet
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
              Get started by creating your first document in this workspace.
            </p>
            <button
              onClick={handleCreatePage}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create page</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
