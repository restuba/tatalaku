"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { m } from "motion/react";
import { TWEEN } from "@/components/motion";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usePageStore } from "@/stores/page-store";
import { Sidebar } from "@/app/workspace/_components/sidebar";
import { CommandPalette } from "@/app/workspace/_components/command-palette";
import { ImportMarkdownModal } from "@/app/workspace/_components/import-markdown";
import { DialogHost } from "@/components/shared/dialog-host";
import { KeyboardShortcuts } from "@/app/workspace/_components/keyboard-shortcuts";
import { Plus } from "lucide-react";
import { LogoSpinner } from "@/components/ui/logo-spinner";
import { WorkspaceShellSkeleton } from "./_components/workspace-skeleton";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  // The route transition only plays between pages. On first load the content
  // replaces a skeleton that is already on screen, so fading it in would blink.
  const [landingPathname] = useState(pathname);
  const [hasNavigated, setHasNavigated] = useState(false);
  if (!hasNavigated && pathname !== landingPathname) {
    setHasNavigated(true);
  }

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
    return <WorkspaceShellSkeleton />;
  }

  // If auth has an error (e.g. backend down), show the error UI
  if (isAuthInit && error) {
    return (
      <div className="h-dvh w-full flex items-center justify-center p-4 bg-codex-background">
        <div
          role="alert"
          className="w-full max-w-md glass-surface rounded-codex-xl border border-codex-border-strong p-8"
        >
          <p className="font-mono text-xs uppercase tracking-label text-codex-danger">
            [ Error: connection failed ]
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-codex-foreground">
            Can&apos;t reach Tatalaku
          </h1>
          <p className="mt-2 text-sm text-codex-muted">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-codex-accent px-6 font-mono text-xs uppercase tracking-label text-codex-background transition-opacity hover:opacity-85"
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
      <div className="relative min-h-dvh w-full flex items-center justify-center p-6 bg-codex-background overflow-hidden">
        {/* Dot-matrix backdrop, fading out from the top left */}
        <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0" />

        <div className="relative z-10 w-full max-w-md">
          <p
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-label text-codex-muted animate-row-in"
            style={{ animationDelay: "60ms" }}
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-codex-signal" />
            New workspace
          </p>
          <h1
            className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-codex-foreground text-balance animate-row-in"
            style={{ animationDelay: "120ms" }}
          >
            Welcome to Tatalaku.
          </h1>
          <p
            className="mt-3 text-sm text-codex-muted text-pretty animate-row-in"
            style={{ animationDelay: "180ms" }}
          >
            Let&apos;s create your first workspace to start taking notes and organizing docs.
          </p>

          <form
            onSubmit={handleCreateFirstWorkspace}
            className="mt-10 animate-row-in"
            style={{ animationDelay: "240ms" }}
          >
            <label
              htmlFor="first-workspace-name"
              className="block font-mono text-xs uppercase tracking-label text-codex-muted"
            >
              Workspace name
            </label>
            <input
              id="first-workspace-name"
              type="text"
              autoFocus
              placeholder="e.g. My Notes, Personal, Acme Team"
              value={initialWorkspaceName}
              onChange={(e) => setInitialWorkspaceName(e.target.value)}
              className="mt-2 w-full border-b border-codex-border-strong bg-transparent py-2.5 text-lg text-codex-foreground outline-none transition-colors placeholder:text-codex-muted/60 focus:border-codex-foreground"
            />
            <button
              type="submit"
              disabled={!initialWorkspaceName.trim() || isCreatingFirstWs}
              className="mt-8 inline-flex h-11 min-w-48 items-center justify-center gap-2 rounded-full bg-codex-accent px-6 font-mono text-xs uppercase tracking-label text-codex-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isCreatingFirstWs ? (
                <LogoSpinner size="sm" className="w-5 h-5 opacity-80" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create workspace</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full flex overflow-hidden bg-codex-background">
      <Sidebar />
      <CommandPalette />
      <ImportMarkdownModal />
      <KeyboardShortcuts />
      <DialogHost />
      <main className="flex-1 h-dvh overflow-y-auto flex flex-col relative z-10 bg-codex-background">
        {/* Route transition: each page fades in. Opacity only, so no lingering
            filter/transform can re-anchor the fixed editor menus. */}
        <m.div
          key={pathname}
          className="flex-1 flex flex-col"
          initial={hasNavigated ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={TWEEN}
        >
          {children}
        </m.div>
      </main>
    </div>
  );
}
