import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-codex-md bg-codex-muted/20 ${className}`} {...props} />
  );
}

/**
 * Skeleton for the sticky top page header
 */
export function PageHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 flex h-11 items-center justify-between px-3 bg-codex-background select-none">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded-codex-sm" />
        <Skeleton className="w-20 h-4 rounded-codex-sm" />
        <span className="text-codex-border/60">/</span>
        <Skeleton className="w-28 h-4 rounded-codex-sm" />
      </div>

      {/* Header action skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-16 h-3.5 rounded-codex-sm hidden sm:block" />
        <Skeleton className="w-6 h-6 rounded-codex-md" />
      </div>
    </header>
  );
}

/**
 * Skeleton simulating a document page with title, headings, paragraphs, and list items
 */
export function PageContentSkeleton() {
  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-6 sm:px-12 pt-12 sm:pt-20 pb-24 space-y-8 animate-in fade-in duration-300">
      {/* Page Icon & Title Skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-12 h-12 rounded-codex-xl" />
        <Skeleton className="w-2/5 max-w-md h-10 rounded-codex-lg" />
      </div>

      {/* Paragraph 1 */}
      <div className="space-y-2.5 pt-4">
        <Skeleton className="w-full h-4 rounded-codex-sm" />
        <Skeleton className="w-11/12 h-4 rounded-codex-sm" />
        <Skeleton className="w-4/5 h-4 rounded-codex-sm" />
      </div>

      {/* Heading 2 Skeleton */}
      <div className="pt-2">
        <Skeleton className="w-1/3 max-w-xs h-7 rounded-codex-md" />
      </div>

      {/* Checklist / Todo block skeletons */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-3">
          <Skeleton className="w-4 h-4 rounded-codex-sm shrink-0" />
          <Skeleton className="w-3/5 h-4 rounded-codex-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-4 h-4 rounded-codex-sm shrink-0" />
          <Skeleton className="w-1/2 h-4 rounded-codex-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-4 h-4 rounded-codex-sm shrink-0" />
          <Skeleton className="w-2/3 h-4 rounded-codex-sm" />
        </div>
      </div>

      {/* Paragraph 2 */}
      <div className="space-y-2.5 pt-4">
        <Skeleton className="w-full h-4 rounded-codex-sm" />
        <Skeleton className="w-5/6 h-4 rounded-codex-sm" />
        <Skeleton className="w-3/4 h-4 rounded-codex-sm" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the sidebar navigation and page tree
 */
export function SidebarSkeleton() {
  return (
    <aside className="w-60 h-screen bg-codex-sidebar flex flex-col select-none shrink-0 p-2 space-y-4">
      {/* Workspace Switcher Skeleton */}
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Skeleton className="w-5 h-5 rounded-codex-sm shrink-0" />
        <Skeleton className="w-28 h-3.5 rounded-codex-sm" />
      </div>

      {/* Quick Nav Items */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="w-4 h-4 rounded-codex-sm" />
          <Skeleton className="w-16 h-3 rounded-codex-sm" />
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="w-4 h-4 rounded-codex-sm" />
          <Skeleton className="w-20 h-3 rounded-codex-sm" />
        </div>
      </div>

      {/* Page Tree Section Skeleton */}
      <div className="space-y-2 flex-1 pt-2">
        <div className="flex items-center justify-between px-2">
          <Skeleton className="w-14 h-3 rounded-codex-sm" />
          <Skeleton className="w-4 h-4 rounded-codex-sm" />
        </div>

        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded-codex-sm" />
            <Skeleton className="w-32 h-3.5 rounded-codex-sm" />
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 pl-6">
            <Skeleton className="w-3.5 h-3.5 rounded-codex-sm" />
            <Skeleton className="w-24 h-3.5 rounded-codex-sm" />
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded-codex-sm" />
            <Skeleton className="w-28 h-3.5 rounded-codex-sm" />
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded-codex-sm" />
            <Skeleton className="w-36 h-3.5 rounded-codex-sm" />
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 pl-6">
            <Skeleton className="w-3.5 h-3.5 rounded-codex-sm" />
            <Skeleton className="w-20 h-3.5 rounded-codex-sm" />
          </div>
        </div>
      </div>

      {/* Bottom info skeleton */}
      <div className="pt-2">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="w-4 h-4 rounded-codex-sm" />
          <Skeleton className="w-16 h-3 rounded-codex-sm" />
        </div>
      </div>
    </aside>
  );
}

/**
 * Skeleton for the Workspace Home overview page
 */
export function WorkspaceHomeSkeleton() {
  return (
    <div className="flex-1 flex flex-col relative w-full">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-11 items-center px-3 bg-codex-background select-none">
        <Skeleton className="w-12 h-3.5 rounded-codex-sm" />
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 sm:px-12 pt-12 sm:pt-20 pb-24 animate-in fade-in duration-300">
        {/* Date, greeting & quick actions */}
        <Skeleton className="w-40 h-4 rounded-codex-sm" />
        <Skeleton className="mt-2 w-64 h-9 rounded-codex-lg" />
        <div className="mt-6 flex gap-2">
          <Skeleton className="w-28 h-8 rounded-codex-md" />
          <Skeleton className="w-28 h-8 rounded-codex-md" />
        </div>

        {/* Recently edited */}
        <div className="mt-12 space-y-3">
          <Skeleton className="w-24 h-3 rounded-codex-sm" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-codex-lg" />
            ))}
          </div>
        </div>

        {/* All pages list */}
        <div className="mt-12 space-y-3">
          <Skeleton className="w-16 h-3 rounded-codex-sm" />
          {["w-2/5", "w-1/3", "w-1/2", "w-1/4"].map((width, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <Skeleton className="w-4 h-4 rounded-codex-sm shrink-0" />
              <Skeleton className={`${width} h-3.5 rounded-codex-sm`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
