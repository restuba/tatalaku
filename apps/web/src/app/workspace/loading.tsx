import { SidebarSkeleton, PageHeaderSkeleton, PageContentSkeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-codex-background">
      {/* Sidebar Skeleton */}
      <div className="hidden md:block">
        <SidebarSkeleton />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col relative z-10 bg-codex-background">
        <PageHeaderSkeleton />
        <PageContentSkeleton />
      </div>
    </div>
  );
}
