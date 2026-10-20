"use client";

import { Fragment, type HTMLAttributes } from "react";
import { ChevronRight } from "lucide-react";
import {
  useHydratedFullWidth,
  useHydratedSidebarOpen,
  useHydratedUIValue,
} from "@/stores/ui-store";

/*
 * Skeletons mirror the real components' box model (same paddings, font
 * sizes, line heights and hairlines), so nothing moves when the content
 * arrives.
 */

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Pulsing placeholder block. A `rounded-*` class in `className` replaces the default radius. */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  // Same-property utilities resolve by stylesheet order, not class order, so a
  // passed radius (e.g. rounded-codex-lg) could otherwise lose to the default
  const radius = /(^|\s)rounded-/.test(className) ? "" : "rounded-codex-md";
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-codex-selected ${radius} ${className}`}
      {...props}
    />
  );
}

/**
 * One line of text. The box is one line-height tall (`1lh`) and the bar one
 * font-size tall (`1em`), both inherited from the parent's typography, so the
 * placeholder occupies exactly the space the real text will.
 */
function TextLine({ className = "" }: { className?: string }) {
  return (
    <div className="flex h-[1lh] items-center">
      <Skeleton className={`h-[1em] max-w-full rounded-codex-sm ${className}`} />
    </div>
  );
}

/** Same size as the top bar's icon buttons (32px, 44px on touch) */
const TOP_BAR_BUTTON = "size-8 pointer-coarse:size-11 shrink-0";

/**
 * Mirrors the TopBar "open sidebar" button so the breadcrumb doesn't shift.
 * Below md the sidebar is a drawer that always starts closed, so the real
 * button is always there.
 */
function SidebarToggleSlot() {
  const isSidebarOpen = useHydratedSidebarOpen();
  return <Skeleton className={`${TOP_BAR_BUTTON} ${isSidebarOpen ? "md:hidden" : ""}`} />;
}

/** Mirrors `TopBar` + `Breadcrumb`: 28px crumbs split by a 12px chevron, then the page actions */
function TopBarSkeleton({
  crumbs,
  hasActions = false,
  hideWhenSidebarDocked = false,
}: {
  crumbs: readonly string[];
  hasActions?: boolean;
  /** Same as TopBar's prop: no bar on wide screens while the sidebar is docked open */
  hideWhenSidebarDocked?: boolean;
}) {
  const isSidebarOpen = useHydratedSidebarOpen();
  return (
    <header
      className={`sticky top-0 z-40 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-codex-border bg-codex-background px-3 select-none pointer-coarse:h-14 ${
        hideWhenSidebarDocked && isSidebarOpen ? "md:hidden" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-1">
        <SidebarToggleSlot />
        <div className="flex min-w-0 items-center gap-0.5 text-sm">
          {crumbs.map((width, i) => (
            <Fragment key={`${width}-${i}`}>
              {i > 0 && (
                <ChevronRight aria-hidden="true" size={12} className="shrink-0 text-codex-faint" />
              )}
              <div className="flex h-7 items-center px-1.5">
                <TextLine className={width} />
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Page options (pages only; Home has no top-bar actions) */}
      {hasActions && (
        <div className="flex shrink-0 items-center gap-1">
          <Skeleton className={TOP_BAR_BUTTON} />
        </div>
      )}
    </header>
  );
}

const PAGE_CRUMBS = ["w-24", "w-28"] as const;
const HOME_CRUMBS = ["w-14"] as const;

/** Skeleton for the sticky top bar of a page (breadcrumb + options button) */
export function PageHeaderSkeleton() {
  return <TopBarSkeleton crumbs={PAGE_CRUMBS} hasActions />;
}

/**
 * Body blocks of a document. Shared by the page skeleton and the editor's own
 * loading state, so the hand-off from one to the other doesn't move anything.
 */
export function EditorBodySkeleton() {
  return (
    <div className="space-y-7 py-2">
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded-codex-sm" />
        <Skeleton className="h-4 w-11/12 rounded-codex-sm" />
        <Skeleton className="h-4 w-4/5 rounded-codex-sm" />
      </div>
      <Skeleton className="h-7 w-1/3 max-w-xs rounded-codex-md" />
      <div className="space-y-3.5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-4 shrink-0 rounded-codex-sm" />
          <Skeleton className="h-4 w-1/2 rounded-codex-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="size-4 shrink-0 rounded-codex-sm" />
          <Skeleton className="h-4 w-3/5 rounded-codex-sm" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded-codex-sm" />
        <Skeleton className="h-4 w-5/6 rounded-codex-sm" />
      </div>
    </div>
  );
}

/**
 * Skeleton for a page's content column. Matches a page without cover or icon
 * (the default for new pages); both are unknown until the page list loads.
 */
export function PageContentSkeleton() {
  const isFullWidth = useHydratedFullWidth();

  return (
    <div
      className={`mx-auto flex w-full flex-1 flex-col pt-8 pr-6 pb-24 pl-10 sm:px-12 sm:pt-12 ${
        isFullWidth ? "max-w-none xl:pr-20" : "max-w-3xl"
      }`}
    >
      <div className="mb-2">
        {/* "Add cover" and "Add icon": hidden at rest on desktop, but they take their rows */}
        <div className="mb-1 h-8 pointer-coarse:h-11" />
        <div className="mb-1 h-8 pointer-coarse:h-11" />
        {/* Title: Fraunces 36/42px on a 1.15 line height */}
        <div className="text-4xl leading-[1.15] sm:text-[2.625rem]">
          <TextLine className="w-2/5 max-w-md" />
        </div>
        {/* Byline ("Edited 4h ago", text-xs) */}
        <div className="mt-3 text-xs">
          <TextLine className="w-28" />
        </div>
      </div>

      {/* Same offset as the BlockEditor root (mt-4) */}
      <div className="mt-4">
        <EditorBodySkeleton />
      </div>
    </div>
  );
}

/** Same shape as a sidebar `NavItem` (h-8, 16px icon slot, gap-2.5; taller on touch) */
function NavRowSkeleton({ width }: { width: string }) {
  return (
    <div className="flex h-8 items-center gap-2.5 px-2 pointer-coarse:h-11">
      <Skeleton className="size-4 shrink-0 rounded-codex-sm" />
      <Skeleton className={`${width} h-3 rounded-codex-sm`} />
    </div>
  );
}

const TREE_WIDTHS = ["w-28", "w-20", "w-24", "w-32"] as const;

/**
 * Rows shaped like `PageTreeItem` at level 0: h-8, 2px inset + 12px drag-grip
 * slot (no grip on touch), 16px icon, then the title (leading-snug).
 * Used both inside the real sidebar and by the full sidebar skeleton.
 */
export function PageTreeSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-px">
      {TREE_WIDTHS.map((width) => (
        <div
          key={width}
          className="flex h-8 items-center gap-1.5 pr-1 pl-3.5 text-sm pointer-coarse:h-11 pointer-coarse:pl-0.5"
        >
          <Skeleton className="size-4 shrink-0 rounded-codex-sm" />
          <div className="py-0.5 leading-snug">
            <TextLine className={width} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for the docked sidebar, block for block with `Sidebar` */
export function SidebarSkeleton() {
  return (
    <aside
      aria-hidden="true"
      className="flex h-dvh w-60 shrink-0 flex-col overflow-hidden border-r border-codex-border bg-codex-sidebar select-none"
    >
      {/* Brand */}
      <div className="flex h-12 shrink-0 items-center gap-2 pr-2 pl-3 pointer-coarse:h-14">
        <Skeleton className="size-5 shrink-0 rounded-full" />
        <div className="text-base">
          <TextLine className="w-20" />
        </div>
      </div>

      {/* Search field + Home */}
      <div className="shrink-0 space-y-2 px-2">
        <Skeleton className="h-8 w-full pointer-coarse:h-11" />
        <NavRowSkeleton width="w-12" />
      </div>

      {/* "Pages" section: label row, then the tree */}
      <div className="flex-1 px-2 pb-3">
        <div className="flex h-7 items-center px-2 pt-3 text-xs">
          <TextLine className="w-16" />
        </div>
        <div className="pt-3.5">
          <PageTreeSkeleton />
        </div>
      </div>

      {/* Import, Trash, Settings, then the workspace row */}
      <div className="shrink-0 space-y-px border-t border-codex-border px-2 pt-2 pb-2">
        <NavRowSkeleton width="w-14" />
        <NavRowSkeleton width="w-12" />
        <NavRowSkeleton width="w-16" />
        <div className="pt-1">
          <div className="flex h-10 items-center gap-2.5 px-2 pointer-coarse:h-12">
            <Skeleton className="size-6 shrink-0" />
            <Skeleton className="h-3 w-28 rounded-codex-sm" />
          </div>
        </div>
      </div>
    </aside>
  );
}

const STAT_WIDTHS = ["w-12", "w-24", "w-20"] as const;
const ACTION_WIDTHS = ["w-28", "w-24", "w-32"] as const;
const CHECKLIST_WIDTHS = ["w-44", "w-36", "w-32", "w-40", "w-44"] as const;
const ALL_PAGES_WIDTHS = ["w-40", "w-32", "w-48", "w-28"] as const;

/** Mirrors `SectionHeading`: a small caps label on a 28px row */
function SectionHeadingSkeleton({ width }: { width: string }) {
  return (
    <div className="flex min-h-7 items-center text-xs">
      <TextLine className={width} />
    </div>
  );
}

/** Skeleton for the Workspace Home overview, section for section with the real page */
export function WorkspaceHomeSkeleton() {
  const isFullWidth = useHydratedFullWidth();
  const isOnboardingDismissed = useHydratedUIValue((s) => s.isOnboardingDismissed, false);

  return (
    <div className="relative flex w-full flex-1 flex-col">
      <TopBarSkeleton crumbs={HOME_CRUMBS} hideWhenSidebarDocked />

      <div className="w-full flex-1">
        <div
          className={`mx-auto w-full px-6 pt-10 pb-24 sm:px-12 sm:pt-16 ${
            isFullWidth ? "max-w-none" : "max-w-3xl"
          }`}
        >
          {/* Hero: eyebrow, greeting (usually wraps on phones), ruled stats */}
          <div className="flex items-center gap-2 text-xs">
            <Skeleton className="size-1.5 shrink-0 rounded-full" />
            <TextLine className="w-48" />
          </div>
          <div className="mt-5 text-4xl leading-[1.1] sm:text-5xl">
            <TextLine className="w-72 sm:w-md" />
            <div className="sm:hidden">
              <TextLine className="w-36" />
            </div>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4 sm:gap-6">
            {STAT_WIDTHS.map((width) => (
              <div key={width} className="border-t border-codex-border pt-3">
                <div className="min-h-8 text-xs sm:min-h-0">
                  <TextLine className={width} />
                </div>
                <div className="mt-2 text-3xl leading-none">
                  <TextLine className="w-12" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-9 flex flex-wrap gap-2.5">
            {ACTION_WIDTHS.map((width, i) => (
              <Skeleton
                key={`${width}-${i}`}
                className={`h-9 rounded-full pointer-coarse:h-11 ${width}`}
              />
            ))}
          </div>

          {/* Recently edited */}
          <section className="mt-14">
            <SectionHeadingSkeleton width="w-28" />
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-codex-lg" />
              ))}
            </div>
          </section>

          {/* Getting started: shown until dismissed (or completed) */}
          {!isOnboardingDismissed && (
            <section className="mt-14">
              <SectionHeadingSkeleton width="w-28" />
              <div className="mt-3 h-1 rounded-full bg-codex-border" />
              <div className="mt-2">
                {CHECKLIST_WIDTHS.map((width, i) => (
                  <div key={`${width}-${i}`} className="flex items-center gap-3 px-2 py-2.5">
                    <Skeleton className="size-5 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">
                        <TextLine className={width} />
                      </div>
                      <div className="text-xs">
                        <TextLine className="w-3/5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All pages */}
          <section className="mt-14">
            <SectionHeadingSkeleton width="w-20" />
            <div className="mt-2 divide-y divide-codex-border">
              {ALL_PAGES_WIDTHS.map((width) => (
                <div key={width} className="flex items-center gap-3 px-2 py-2.5 text-sm">
                  <div className="flex w-5 shrink-0 justify-center">
                    <Skeleton className="size-4 rounded-codex-sm" />
                  </div>
                  <TextLine className={width} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
