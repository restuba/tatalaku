"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { usePageStore } from "@/stores/page.store";
import { Sidebar } from "@/app/workspace/_components/sidebar";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { LogoSpinner } from "@/components/ui/logo-spinner";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isInitialized: isAuthInit, error, fetchMe } = useAuthStore();
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
  const activeWorkspaceId = activeWorkspace?.id;
  useEffect(() => {
    if (isWsInit && activeWorkspaceId && user) {
      fetchPages(activeWorkspaceId).catch((err) => {
        console.error("Failed to fetch pages:", err);
      });
    }
  }, [isWsInit, activeWorkspaceId, user, fetchPages]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (isAuthInit && !user) {
      router.push("/login");
    }
  }, [isAuthInit, user, router]);

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
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-codex-muted" />
          <p className="text-sm text-codex-muted">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // If auth has an error (e.g. backend down), show the error UI
  if (isAuthInit && error) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-codex-surface border border-codex-border rounded-codex-2xl p-8 text-center">
          <h1 className="text-xl font-bold text-codex-danger mb-2">Connection Error</h1>
          <p className="text-sm text-codex-muted mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-codex-xl text-sm font-medium bg-codex-accent text-codex-background hover:opacity-90 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If user is not logged in and initialization is complete, redirect to login
  if (isAuthInit && !user) {
    return null;
  }
  // If user has no workspaces at all, show friendly Onboarding screen
  if (isWsInit && workspaces.length === 0) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-codex-surface/10 overflow-hidden">
        {/* Soft Organic Orbs (Zen Canvas) */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-[5%] -left-[10%] w-[70%] h-[70%] rounded-full bg-codex-accent opacity-60 dark:opacity-40 blur-[120px] animate-pulse"
            style={{ animationDuration: "12s" }}
          />
          <div className="absolute top-[30%] -right-[15%] w-[80%] h-[80%] rounded-full bg-codex-info opacity-50 dark:opacity-30 blur-[130px]" />
          <div
            className="absolute -bottom-[10%] left-[10%] w-[60%] h-[60%] rounded-full bg-codex-skill opacity-50 dark:opacity-30 blur-[100px] animate-pulse"
            style={{ animationDuration: "18s" }}
          />
        </div>

        {/* Frosted Glass Overlay */}
        <div className="absolute inset-0 backdrop-blur-[80px] bg-codex-surface/30 dark:bg-codex-surface/50 pointer-events-none" />

        <div className="relative z-10 max-w-md w-full p-8 text-center">
          <div
            className="w-16 h-16 bg-codex-accent/10 text-codex-accent rounded-full flex items-center justify-center mx-auto mb-6 opacity-0 animate-slide-up-fade"
            style={{ animationDelay: "100ms" }}
          >
            <Sparkles className="w-8 h-8" />
          </div>
          <h1
            className="text-2xl font-bold text-codex-foreground opacity-0 animate-slide-up-fade"
            style={{ animationDelay: "200ms" }}
          >
            Welcome to Tatalaku!
          </h1>
          <p
            className="text-sm text-codex-muted mt-2 mb-8 opacity-0 animate-slide-up-fade"
            style={{ animationDelay: "300ms" }}
          >
            Let&apos;s create your first workspace to start taking notes and organizing docs.
          </p>

          <form
            onSubmit={handleCreateFirstWorkspace}
            className="space-y-4 opacity-0 animate-slide-up-fade"
            style={{ animationDelay: "400ms" }}
          >
            <input
              type="text"
              autoFocus
              placeholder="e.g. My Notes, Personal, Acme Team"
              value={initialWorkspaceName}
              onChange={(e) => setInitialWorkspaceName(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-codex-xl bg-codex-surface/50 dark:bg-codex-surface/30 text-codex-foreground outline-none focus:ring-2 focus:ring-codex-accent transition-all placeholder:text-codex-muted/50"
            />
            <button
              type="submit"
              disabled={!initialWorkspaceName.trim() || isCreatingFirstWs}
              className="w-full flex items-center justify-center h-[44px] rounded-codex-xl text-sm font-medium bg-codex-accent text-codex-background hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-codex-accent/20"
            >
              {isCreatingFirstWs ? (
                <LogoSpinner size="sm" className="w-5 h-5 opacity-80" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
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
    <div className="relative h-screen w-full flex overflow-hidden bg-codex-background">
      {/* Subtle background glow to make the translucent sidebar pop */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[50%] rounded-full bg-codex-accent/20 dark:bg-codex-accent/10 blur-[120px] pointer-events-none" />

      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative z-10 bg-codex-background/50">
        {children}
      </main>
    </div>
  );
}
