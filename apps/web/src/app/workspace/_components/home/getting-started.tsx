"use client";

import type { Page } from "@tatalaku/shared";
import { Check } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  isDone: boolean;
  onAction: () => void;
}

interface GettingStartedProps {
  pages: Page[];
  latestPage: Page | undefined;
  onCreatePage: () => void;
  onCreateSubpage: (parent: Page) => void;
  onOpenPage: (page: Page) => void;
  onFavoritePage: (page: Page) => void;
}

/**
 * Lightweight onboarding checklist. Progress is derived from real workspace
 * data (plus one persisted UI flag), so it completes itself as the user explores.
 */
export function GettingStarted({
  pages,
  latestPage,
  onCreatePage,
  onCreateSubpage,
  onOpenPage,
  onFavoritePage,
}: GettingStartedProps) {
  const { hasUsedCommandPalette, isOnboardingDismissed, dismissOnboarding, setCommandPaletteOpen } =
    useUIStore();

  // Fall back to creating a page when a step needs one that doesn't exist yet
  const withLatest = (fn: (page: Page) => void) => () =>
    latestPage ? fn(latestPage) : onCreatePage();

  const items: ChecklistItem[] = [
    {
      id: "create",
      label: "Create your first page",
      description: "Every note, doc, or plan starts as a page.",
      isDone: pages.length > 0,
      onAction: onCreatePage,
    },
    {
      id: "icon",
      label: "Give a page an icon",
      description: "Hover the title and choose Add icon.",
      isDone: pages.some((p) => Boolean(p.icon)),
      onAction: withLatest(onOpenPage),
    },
    {
      id: "subpage",
      label: "Nest a subpage",
      description: "Group related pages under a parent.",
      isDone: pages.some((p) => Boolean(p.parentPageId)),
      onAction: withLatest(onCreateSubpage),
    },
    {
      id: "favorite",
      label: "Pin a page to Favorites",
      description: latestPage
        ? `Pins "${latestPage.title || "Untitled"}" to the sidebar.`
        : "Keep important pages one click away.",
      isDone: pages.some((p) => p.isFavorite),
      onAction: withLatest(onFavoritePage),
    },
    {
      id: "search",
      label: "Jump anywhere with ⌘K",
      description: "Search pages and run quick actions.",
      isDone: hasUsedCommandPalette,
      onAction: () => setCommandPaletteOpen(true),
    },
  ];

  const doneCount = items.filter((i) => i.isDone).length;
  if (isOnboardingDismissed || doneCount === items.length) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-medium text-codex-muted">
          Getting started
          <span className="ml-2 tabular-nums">
            {doneCount}/{items.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={dismissOnboarding}
          className="px-1.5 py-0.5 rounded-codex-sm text-xs text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground transition-colors"
        >
          Hide
        </button>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 mb-3 rounded-full bg-codex-surface-secondary overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={doneCount}
        aria-label="Getting started progress"
      >
        <div
          className="h-full rounded-full bg-codex-accent transition-all duration-300"
          style={{ width: `${(doneCount / items.length) * 100}%` }}
        />
      </div>

      <ul className="-mx-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={item.onAction}
              disabled={item.isDone}
              className="group w-full flex items-center gap-3 px-2 py-2 rounded-codex-md text-left hover:bg-codex-surface-secondary disabled:hover:bg-transparent disabled:cursor-default transition-colors duration-150"
            >
              <span
                className={`w-4 h-4 shrink-0 flex items-center justify-center rounded-full border transition-colors ${
                  item.isDone
                    ? "bg-codex-accent border-codex-accent text-codex-background"
                    : "border-codex-border group-hover:border-codex-muted"
                }`}
                aria-hidden="true"
              >
                {item.isDone && <Check className="w-3 h-3" strokeWidth={3} />}
              </span>
              <span className="flex-1 min-w-0">
                <span
                  className={`block text-sm ${
                    item.isDone ? "text-codex-muted line-through" : "text-codex-foreground"
                  }`}
                >
                  {item.label}
                </span>
                {!item.isDone && (
                  <span className="block text-xs text-codex-muted truncate">
                    {item.description}
                  </span>
                )}
              </span>
              <span className="sr-only">{item.isDone ? "Completed" : "Not completed"}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
