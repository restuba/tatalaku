"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { usePageStore } from "@/stores/page.store";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Loader2, Plus, Sparkles } from "lucide-react";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isInitialized: isAuthInit, fetchMe } = useAuthStore();
  const {
    workspaces,
    activeWorkspace,
    isInitialized: isWsInit,
    fetchWorkspaces,
    createWorkspace,
  } = useWorkspaceStore();
  const { fetchPages } = usePageStore();

  const [initialWorkspaceName, setInitialWorkspaceName] = useState("");
  const [isCreatingFirstWs, setIsCreatingFirstWs] = useState(false);

  // Initialize auth & workspaces
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (isAuthInit && user) {
      fetchWorkspaces();
    }
  }, [isAuthInit, user, fetchWorkspaces]);

  // Fetch pages whenever active workspace changes
  useEffect(() => {
    if (activeWorkspace) {
      fetchPages(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchPages]);

  async function handleCreateFirstWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!initialWorkspaceName.trim()) return;
    setIsCreatingFirstWs(true);
    try {
      await createWorkspace(initialWorkspaceName.trim());
      setInitialWorkspaceName("");
    } finally {
      setIsCreatingFirstWs(false);
    }
  }

  // Loading state
  if (!isAuthInit || (!isWsInit && user)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          <p className="text-sm text-neutral-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in and initialization is complete, redirect to login
  if (isAuthInit && !user) {
    router.push("/login");
    return null;
  }

  // If user has no workspaces at all, show friendly Onboarding screen
  if (isWsInit && workspaces.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-800 dark:text-neutral-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            Welcome to Tatalaku!
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-6">
            Let&apos;s create your first workspace to start taking notes and organizing docs.
          </p>

          <form onSubmit={handleCreateFirstWorkspace} className="space-y-3">
            <input
              type="text"
              autoFocus
              placeholder="e.g. My Notes, Personal, Acme Team"
              value={initialWorkspaceName}
              onChange={(e) => setInitialWorkspaceName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 transition-all"
            />
            <button
              type="submit"
              disabled={!initialWorkspaceName.trim() || isCreatingFirstWs}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isCreatingFirstWs ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Workspace</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto flex flex-col">{children}</main>
    </div>
  );
}
