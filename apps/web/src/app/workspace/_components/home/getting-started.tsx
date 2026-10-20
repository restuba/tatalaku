"use client";

import type { Page } from "@tatalaku/shared";
import { Check } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { SectionHeading } from "./section-heading";

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
      description: "Every note, doc or plan starts as a page.",
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
        ? `Pins “${latestPage.title || "Untitled"}” to the sidebar.`
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
    <section className="mt-14" aria-labelledby="home-onboarding-heading">
      <SectionHeading
        id="home-onboarding-heading"
        label="Getting started"
        meta={`${doneCount}/${items.length}`}
        action={
          <button
            type="button"
            onClick={dismissOnboarding}
            className="eyebrow -my-1 rounded-codex-sm px-1.5 py-1 text-codex-muted transition-colors hover:bg-codex-hover hover:text-codex-foreground"
          >
            Hide
          </button>
        }
      />

      <div
        className="mt-3 h-1 overflow-hidden rounded-full bg-codex-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={doneCount}
        aria-valuetext={`${doneCount} of ${items.length} steps done`}
        aria-label="Getting started progress"
      >
        <div
          className="h-full rounded-full bg-codex-accent transition-[width] duration-500 ease-out"
          style={{ width: `${(doneCount / items.length) * 100}%` }}
        />
      </div>

      <ul className="mt-2">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={item.onAction}
              disabled={item.isDone}
              className="group flex w-full items-center gap-3 rounded-codex-md px-2 py-2.5 text-left transition-colors duration-150 hover:bg-codex-hover disabled:cursor-default disabled:hover:bg-transparent"
            >
              <span
                aria-hidden="true"
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                  item.isDone
                    ? "border-codex-accent bg-codex-accent text-codex-background"
                    : "border-codex-faint group-hover:border-codex-accent"
                }`}
              >
                {item.isDone && <Check className="size-3" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm ${
                    item.isDone ? "text-codex-muted" : "text-codex-foreground"
                  }`}
                >
                  {item.label}
                </span>
                {!item.isDone && (
                  <span className="block truncate text-xs text-codex-muted">
                    {item.description}
                  </span>
                )}
              </span>
              <span className="eyebrow shrink-0 text-codex-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="sr-only">{item.isDone ? "Completed" : "Not completed"}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
