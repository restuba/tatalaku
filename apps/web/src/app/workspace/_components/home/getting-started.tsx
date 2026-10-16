"use client";

import type { Page } from "@tatalaku/shared";
import { AnimatePresence, m } from "motion/react";
import { Check } from "lucide-react";
import { TWEEN_FAST } from "@/components/motion";
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
    <section className="mt-16" aria-labelledby="home-onboarding-heading">
      <SectionHeading
        id="home-onboarding-heading"
        label="Getting started"
        meta={`${doneCount}/${items.length}`}
        action={
          <button
            type="button"
            onClick={dismissOnboarding}
            // Buttons don't inherit text-transform, so the label voice is restated here
            className="-my-1 rounded-codex-sm px-1.5 py-1 uppercase tracking-label text-codex-muted transition-colors hover:text-codex-foreground"
          >
            Hide
          </button>
        }
      />

      {/* Segmented progress: one square block per step, filled as steps complete */}
      <div
        className="mt-4 flex gap-0.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={doneCount}
        aria-label="Getting started progress"
      >
        {items.map((item) => (
          <span
            key={item.id}
            className={`h-2 flex-1 transition-colors duration-300 ${
              item.isDone ? "bg-codex-foreground" : "bg-codex-border"
            }`}
          />
        ))}
      </div>

      <ul className="mt-3 divide-y divide-codex-border">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="animate-row-in"
            style={{ animationDelay: `${380 + index * 45}ms` }}
          >
            <button
              type="button"
              onClick={item.onAction}
              disabled={item.isDone}
              className="group w-full flex items-center gap-3 px-2 py-3 text-left transition-colors duration-150 hover:bg-codex-surface-secondary disabled:hover:bg-transparent disabled:cursor-default"
            >
              <span
                className={`w-4 h-4 shrink-0 flex items-center justify-center rounded-full border transition-colors ${
                  item.isDone
                    ? "bg-codex-accent border-codex-accent text-codex-background"
                    : "border-codex-border-strong group-hover:border-codex-muted"
                }`}
                aria-hidden="true"
              >
                <AnimatePresence initial={false}>
                  {item.isDone && (
                    <m.span
                      key="check"
                      className="flex"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={TWEEN_FAST}
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </m.span>
                  )}
                </AnimatePresence>
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
              <span className="shrink-0 font-mono text-xs uppercase tracking-label text-codex-muted/70 tabular-nums">
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
