"use client";

import { usePathname } from "next/navigation";
import {
  SidebarSkeleton,
  PageHeaderSkeleton,
  PageContentSkeleton,
  WorkspaceHomeSkeleton,
  useHydratedSidebarOpen,
} from "@/components/ui/skeleton";

/**
 * Skeleton for the main content area only — mirrors the route that is loading.
 * Rendered inside the layout's <main>, so it must never include the sidebar.
 */
export function WorkspaceContentSkeleton() {
  const pathname = usePathname();
  const isHome = pathname === "/workspace";

  if (isHome) {
    return <WorkspaceHomeSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col relative w-full">
      <PageHeaderSkeleton />
      <PageContentSkeleton />
    </div>
  );
}

/**
 * Full-screen skeleton (sidebar + content) used by the workspace layout
 * while auth and workspaces are still initializing.
 */
export function WorkspaceShellSkeleton() {
  const isSidebarOpen = useHydratedSidebarOpen();

  return (
    <div className="h-screen w-full flex overflow-hidden bg-codex-background">
      {/* On mobile the real sidebar is a closed overlay */}
      {isSidebarOpen && (
        <div className="hidden md:block">
          <SidebarSkeleton />
        </div>
      )}

      <div className="flex-1 h-screen overflow-y-auto flex flex-col relative z-10 bg-codex-background">
        <WorkspaceContentSkeleton />
      </div>
    </div>
  );
}
