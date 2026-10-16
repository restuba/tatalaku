"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Page } from "@tatalaku/shared";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usePageStore } from "@/stores/page-store";
import { useHydratedFullWidth } from "@/stores/ui-store";
import { WorkspaceHomeSkeleton } from "@/components/ui/skeleton";
import { TopBar } from "./_components/top-bar";
import {
  AllPages,
  GettingStarted,
  HomeHero,
  QuickActions,
  RecentPages,
  type HomeStat,
} from "./_components/home";
import { getParentPath } from "./_components/command-palette/filter-pages";

const DAY_MS = 24 * 60 * 60 * 1000;

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
  const isFullWidth = useHydratedFullWidth();

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

  const weekAgo = now.getTime() - 7 * DAY_MS;
  const stats: HomeStat[] =
    activePages.length === 0
      ? []
      : [
          { label: "Pages", value: activePages.length },
          {
            label: "Edited this week",
            value: activePages.filter((p) => getLastTouched(p) >= weekAgo).length,
          },
          { label: "Favorites", value: activePages.filter((p) => p.isFavorite).length },
        ];

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

      <div className="flex-1 w-full">
        <div
          className={`w-full mx-auto px-6 sm:px-12 pt-12 sm:pt-20 pb-24 transition-[max-width] duration-200 ${
            isFullWidth ? "max-w-none" : "max-w-3xl"
          }`}
        >
          <HomeHero
            greeting={getGreeting(now)}
            name={firstName}
            dateLabel={today}
            workspaceName={activeWorkspace?.name}
            stats={stats}
          />

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

          <AllPages pages={activePages} getParentPath={parentPathOf} />
        </div>
      </div>
    </div>
  );
}
