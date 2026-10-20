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
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/reusable/button";
import { Input } from "@/components/reusable/input";
import { Logo } from "@/components/ui/logo";
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
        <div role="alert" className="w-full max-w-md surface-dialog rounded-codex-xl p-8">
          <p className="eyebrow flex items-center gap-2 text-codex-danger">
            <AlertCircle className="size-4" aria-hidden="true" />
            Connection failed
          </p>
          <h1 className="mt-4 font-serif text-3xl font-medium leading-tight text-codex-foreground">
            Can&apos;t reach Tatalaku
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-codex-muted">{error}</p>
          <Button
            btnType="primary"
            size="large"
            className="mt-8"
            onClick={() => window.location.reload()}
            icon={<RefreshCw className="size-4" />}
          >
            Try again
          </Button>
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
      <div className="min-h-dvh w-full flex flex-col bg-codex-background">
        <header className="flex h-16 items-center px-6 sm:px-10">
          <Logo size="md" />
        </header>
        <main className="flex flex-1 items-center justify-center px-6 pb-24">
          <div className="w-full max-w-md">
            <p className="eyebrow flex items-center gap-2 text-codex-muted">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-codex-accent-secondary"
              />
              New workspace
            </p>
            <h1 className="mt-5 font-serif text-4xl font-normal leading-tight text-codex-foreground text-balance sm:text-5xl">
              Welcome to <span className="italic text-codex-accent">Tatalaku</span>.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-codex-muted text-pretty">
              Start with a workspace: a home for your notes, documents and plans.
            </p>

            <form onSubmit={handleCreateFirstWorkspace} className="mt-10 space-y-4">
              <Input
                id="first-workspace-name"
                label="Workspace name"
                size="large"
                autoFocus
                placeholder="e.g. My Notes, Personal, Acme Team"
                value={initialWorkspaceName}
                onChange={setInitialWorkspaceName}
              />
              <Button
                htmlType="submit"
                btnType="primary"
                size="large"
                loading={isCreatingFirstWs}
                disabled={!initialWorkspaceName.trim()}
                icon={<Plus className="size-4" />}
              >
                Create workspace
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full flex overflow-hidden bg-codex-background">
      {/* Keyboard users can jump past the sidebar */}
      <a
        href="#workspace-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-codex-md focus:bg-codex-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-codex-foreground focus:shadow-codex-md"
      >
        Skip to content
      </a>
      <Sidebar />
      <CommandPalette />
      <ImportMarkdownModal />
      <KeyboardShortcuts />
      <DialogHost />
      <main
        id="workspace-main"
        className="flex-1 h-dvh overflow-y-auto flex flex-col relative z-10 bg-codex-background"
      >
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
