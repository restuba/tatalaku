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
 * sizes and line heights), so nothing moves when the content arrives.
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
      className={`animate-pulse bg-codex-muted/20 ${radius} ${className}`}
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

/** Same size as the top bar's icon buttons (p-1.5 + 16px icon, larger on touch) */
const TOP_BAR_BUTTON = "size-7 pointer-coarse:size-9 shrink-0";

/**
 * Mirrors the TopBar "open sidebar" button so the breadcrumb doesn't shift.
 * Below md the sidebar is a drawer that always starts closed, so the real
 * button is always there.
 */
function SidebarToggleSlot() {
  const isSidebarOpen = useHydratedSidebarOpen();
  return <Skeleton className={`${TOP_BAR_BUTTON} ${isSidebarOpen ? "md:hidden" : ""}`} />;
}

/** Mirrors `TopBar` + `Breadcrumb`: crumbs are px-1.5 py-0.5 text-sm, split by a 12px chevron */
function TopBarSkeleton({
  crumbs,
  hasActions = false,
}: {
  crumbs: readonly string[];
  hasActions?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-11 items-center justify-between gap-3 px-3 bg-codex-background border-b border-transparent select-none">
      <div className="flex min-w-0 items-center gap-1">
        <SidebarToggleSlot />
        <div className="flex min-w-0 items-center gap-1 text-sm">
          {crumbs.map((width, i) => (
            <Fragment key={`${width}-${i}`}>
              {i > 0 && (
                <ChevronRight
                  aria-hidden="true"
                  size={12}
                  className="shrink-0 text-codex-muted/60"
                />
              )}
              <div className="px-1.5 py-0.5">
                <TextLine className={width} />
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Page options button */}
      {hasActions && <Skeleton className={TOP_BAR_BUTTON} />}
    </header>
  );
}

const PAGE_CRUMBS = ["w-12", "w-24"] as const;
const HOME_CRUMBS = ["w-10"] as const;

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
    <div className="space-y-6 py-4">
      <div className="space-y-2.5">
        <Skeleton className="w-full h-4 rounded-codex-sm" />
        <Skeleton className="w-11/12 h-4 rounded-codex-sm" />
        <Skeleton className="w-4/5 h-4 rounded-codex-sm" />
      </div>
      <div className="pt-2">
        <Skeleton className="w-1/3 max-w-xs h-6 rounded-codex-md" />
      </div>
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-3">
          <Skeleton className="w-4 h-4 rounded-codex-sm shrink-0" />
          <Skeleton className="w-1/2 h-4 rounded-codex-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-4 h-4 rounded-codex-sm shrink-0" />
          <Skeleton className="w-3/5 h-4 rounded-codex-sm" />
        </div>
      </div>
      <div className="space-y-2.5 pt-2">
        <Skeleton className="w-full h-4 rounded-codex-sm" />
        <Skeleton className="w-5/6 h-4 rounded-codex-sm" />
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
      className={`flex-1 flex flex-col w-full mx-auto pl-10 pr-6 sm:px-12 pt-12 sm:pt-20 pb-24 ${
        isFullWidth ? "max-w-none xl:pr-20" : "max-w-3xl"
      }`}
    >
      <div className="mb-2">
        {/* "Add cover": hidden at rest on desktop, but it still takes its row */}
        <div className="h-7 mb-2" />
        {/* "Add icon" */}
        <Skeleton className="w-24 h-7 mb-2" />
        {/* Title textarea: text-4xl, leading-tight */}
        <div className="text-4xl leading-tight">
          <TextLine className="w-2/5 max-w-md" />
        </div>
      </div>

      {/* Same offset as the BlockEditor root (mt-4) */}
      <div className="mt-4">
        <EditorBodySkeleton />
      </div>
    </div>
  );
}

/** Same shape as a sidebar `NavItem` (px-2 py-1 text-sm, taller on touch) */
function NavRowSkeleton({ width }: { width: string }) {
  return (
    <div className="flex items-center gap-2 h-7 pointer-coarse:h-9 px-2">
      <Skeleton className="w-4 h-4 shrink-0 rounded-codex-sm" />
      <Skeleton className={`${width} h-3 rounded-codex-sm`} />
    </div>
  );
}

const TREE_WIDTHS = ["w-28", "w-20", "w-24", "w-32"] as const;

/**
 * Rows shaped like `PageTreeItem` at level 0: 2px inset + 12px drag-grip slot
 * (no grip on touch), 16px icon, then the title (py-0.5, leading-snug).
 * Used both inside the real sidebar and by the full sidebar skeleton.
 */
export function PageTreeSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-px">
      {TREE_WIDTHS.map((width) => (
        <div
          key={width}
          className="flex items-center gap-1.5 py-0.5 pointer-coarse:py-1.5 pl-3.5 pointer-coarse:pl-0.5 pr-2 text-sm"
        >
          <Skeleton className="w-4 h-4 shrink-0 rounded-codex-sm" />
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
      className="w-60 h-dvh bg-codex-sidebar flex flex-col select-none shrink-0 overflow-hidden"
    >
      {/* Workspace switcher (px-2 py-1.5, 20px avatar) */}
      <div className="px-2 pt-2 pb-1">
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
          <Skeleton className="w-5 h-5 shrink-0 rounded-codex-sm" />
          <TextLine className="w-24" />
        </div>
      </div>

      {/* Search, Home */}
      <div className="px-2 pb-3 space-y-px">
        <NavRowSkeleton width="w-14" />
        <NavRowSkeleton width="w-12" />
      </div>

      {/* "Pages" section: header row (label + 18px create button), then the tree */}
      <div className="flex-1 px-2 pb-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="text-xs">
            <TextLine className="w-10" />
          </div>
          <div className="size-4.5" />
        </div>
        <PageTreeSkeleton />
      </div>

      {/* Settings, Import Markdown, Trash */}
      <div className="px-2 py-2 space-y-px">
        <NavRowSkeleton width="w-16" />
        <NavRowSkeleton width="w-28" />
        <NavRowSkeleton width="w-12" />
      </div>
    </aside>
  );
}

const STAT_WIDTHS = ["w-16", "w-28", "w-20"] as const;
const CHECKLIST_WIDTHS = ["w-44", "w-36", "w-32", "w-40", "w-44"] as const;
const ALL_PAGES_WIDTHS = ["w-40", "w-32", "w-48", "w-28"] as const;

/** Skeleton for the Workspace Home overview, section for section with the real page */
export function WorkspaceHomeSkeleton() {
  const isFullWidth = useHydratedFullWidth();
  const isOnboardingDismissed = useHydratedUIValue((s) => s.isOnboardingDismissed, false);

  return (
    <div className="flex-1 flex flex-col relative w-full">
      <TopBarSkeleton crumbs={HOME_CRUMBS} />

      <div className="flex-1 w-full">
        <div
          className={`w-full mx-auto px-6 sm:px-12 pt-12 sm:pt-20 pb-24 ${
            isFullWidth ? "max-w-none" : "max-w-3xl"
          }`}
        >
          {/* Hero: date line, greeting (usually wraps on phones), stats */}
          <div className="font-mono text-xs">
            <TextLine className="w-48" />
          </div>
          <div className="mt-3 text-4xl sm:text-5xl leading-[1.08]">
            <TextLine className="w-72 sm:w-96" />
            <div className="sm:hidden">
              <TextLine className="w-36" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-lg">
            {STAT_WIDTHS.map((width) => (
              <TextLine key={width} className={width} />
            ))}
          </div>

          {/* Quick action tiles (36px icon + two text lines) */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 min-h-14 px-3 py-2.5 rounded-codex-xl border border-codex-border"
              >
                <Skeleton className="w-9 h-9 shrink-0 rounded-codex-lg" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <TextLine className="w-16" />
                  </div>
                  <div className="text-xs">
                    <TextLine className="w-4/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recently edited */}
          <section className="mt-12">
            <div className="mb-3 text-xs">
              <TextLine className="w-24" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-codex-xl" />
              ))}
            </div>
          </section>

          {/* Getting started: shown until dismissed (or completed) */}
          {!isOnboardingDismissed && (
            <section className="mt-12">
              <div className="flex h-5 items-center mb-2 text-xs">
                <TextLine className="w-28" />
              </div>
              <div className="h-1 mb-3 rounded-full bg-codex-surface-secondary" />
              <div className="-mx-2">
                {CHECKLIST_WIDTHS.map((width, i) => (
                  <div key={`${width}-${i}`} className="flex items-center gap-3 px-2 py-2">
                    <Skeleton className="w-4 h-4 shrink-0 rounded-full" />
                    <div className="flex-1 min-w-0">
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
          <section className="mt-12">
            <div className="mb-2 text-xs">
              <TextLine className="w-20" />
            </div>
            <div className="-mx-2">
              {ALL_PAGES_WIDTHS.map((width) => (
                <div key={width} className="flex items-center gap-3 px-2 py-1.5 text-sm">
                  <div className="w-5 flex justify-center shrink-0">
                    <Skeleton className="w-4 h-4 rounded-codex-sm" />
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
