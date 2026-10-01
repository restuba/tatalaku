"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Page } from "@tatalaku/shared";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usePageStore } from "@/stores/page-store";
import { WorkspaceHomeSkeleton } from "@/components/ui/skeleton";
import { formatTimeAgo, formatFullDate } from "@/lib/date";
import { TopBar } from "./_components/top-bar";
import { GettingStarted, QuickActions, RecentPages } from "./_components/home";
import { getParentPath } from "./_components/command-palette/filter-pages";
import { FileText } from "lucide-react";

function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getLastTouched(page: Page): number {
  return new Date(page.updatedAt || page.createdAt).getTime();
}

export default function WorkspaceHomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { pages, createPage, updatePage, isInitialized } = usePageStore();

  const activePages = useMemo(
    () => pages.filter((p) => !p.isArchived).sort((a, b) => getLastTouched(b) - getLastTouched(a)),
    [pages],
  );
  const pagesById = useMemo(() => new Map(pages.map((p) => [p.id, p])), [pages]);
  const parentPathOf = (page: Page) => getParentPath(page, pagesById);

  const now = new Date();
  const firstName = user?.name?.split(" ")[0];
  const today = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  async function handleCreatePage(parentPageId?: string) {
    if (!activeWorkspace) return;
    try {
      const newPage = await createPage({
        workspaceId: activeWorkspace.id,
        title: "Untitled",
        ...(parentPageId ? { parentPageId } : {}),
      });
      router.push(`/workspace/${newPage.id}`);
    } catch {
      // Handled by store
    }
  }

  async function handleFavoritePage(page: Page) {
    try {
      await updatePage(page.id, { isFavorite: true });
    } catch {
      // Handled by store
    }
  }

  if (!isInitialized) {
    return <WorkspaceHomeSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col relative w-full">
      <TopBar items={[{ label: "Home" }]} />

      <div className="flex-1 max-w-3xl w-full mx-auto px-6 sm:px-12 pt-12 sm:pt-20 pb-24">
        {/* Greeting */}
        <p className="text-sm text-codex-muted">{today}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-codex-foreground">
          {getGreeting(now)}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <QuickActions onCreatePage={() => handleCreatePage()} disabled={!activeWorkspace} />

        <RecentPages
          pages={activePages}
          getParentPath={parentPathOf}
          onCreatePage={() => handleCreatePage()}
        />

        <GettingStarted
          pages={activePages}
          latestPage={activePages[0]}
          onCreatePage={() => handleCreatePage()}
          onCreateSubpage={(parent) => handleCreatePage(parent.id)}
          onOpenPage={(page) => router.push(`/workspace/${page.id}`)}
          onFavoritePage={handleFavoritePage}
        />

        {activePages.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xs font-medium text-codex-muted mb-2">
              All pages
              <span className="ml-2 tabular-nums">{activePages.length}</span>
            </h2>
            <ul className="-mx-2">
              {activePages.map((page) => {
                const parentPath = parentPathOf(page);
                return (
                  <li key={page.id}>
                    <Link
                      href={`/workspace/${page.id}`}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-codex-md hover:bg-codex-surface-secondary transition-colors duration-150"
                    >
                      <span className="w-5 flex justify-center shrink-0 leading-none">
                        {page.icon ?? <FileText className="w-4 h-4 text-codex-muted" />}
                      </span>
                      <span className="flex-1 min-w-0 truncate text-sm text-codex-foreground">
                        {page.title || "Untitled"}
                        {parentPath && (
                          <span className="ml-2 text-codex-muted">in {parentPath}</span>
                        )}
                      </span>
                      <span
                        className="shrink-0 text-xs text-codex-muted"
                        title={formatFullDate(page.updatedAt || page.createdAt)}
                      >
                        {formatTimeAgo(page.updatedAt || page.createdAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
