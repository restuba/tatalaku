"use client";

import Link from "next/link";
import { m } from "motion/react";
import type { Page } from "@tatalaku/shared";
import { FileText, Plus } from "lucide-react";
import { TWEEN } from "@/components/motion";
import { formatTimeAgo } from "@/lib/date";
import { SectionHeading } from "./section-heading";

const SLOT_COUNT = 4;

interface RecentPagesProps {
  pages: Page[];
  getParentPath: (page: Page) => string;
  onCreatePage: () => void;
}

const cardEnter = (index: number) =>
  ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { ...TWEEN, delay: 0.3 + index * 0.05 },
  }) as const;

export function RecentPages({ pages, getParentPath, onCreatePage }: RecentPagesProps) {
  const visible = pages.slice(0, SLOT_COUNT);
  // A single ghost card keeps the row balanced while the workspace is still small
  const showGhost = visible.length < SLOT_COUNT;

  return (
    <section className="mt-16" aria-labelledby="home-recent-heading">
      <SectionHeading
        id="home-recent-heading"
        label="Recently edited"
        meta={String(visible.length).padStart(2, "0")}
      />
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {visible.map((page, index) => {
          const parentPath = getParentPath(page);
          return (
            <m.div key={page.id} {...cardEnter(index)}>
              <Link
                href={`/workspace/${page.id}`}
                className="group flex h-40 flex-col overflow-hidden rounded-codex-xl border border-codex-border bg-codex-surface-secondary transition-colors duration-200 hover:border-codex-border-strong"
              >
                {/* Banner: the real cover when there is one, a dot field otherwise */}
                <span className="relative block h-14 shrink-0 overflow-hidden border-b border-codex-border">
                  {page.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={page.coverImage}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="block size-full dot-matrix opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                  )}
                </span>
                <span className="relative flex min-w-0 flex-1 flex-col px-3 pt-6 pb-3">
                  {/* Icon tile overlapping the banner's bottom edge */}
                  <span className="absolute -top-4 left-3 flex h-8 w-8 items-center justify-center rounded-codex-md border border-codex-border bg-codex-surface-secondary text-lg leading-none">
                    {page.icon ?? <FileText className="w-4 h-4 text-codex-muted" />}
                  </span>
                  <span className="block text-sm font-medium text-codex-foreground line-clamp-2 leading-snug">
                    {page.title || "Untitled"}
                  </span>
                  <span className="mt-auto flex min-w-0 items-center justify-between gap-2 pt-2 font-mono text-xs uppercase tracking-label">
                    <span className="truncate text-codex-muted/70">{parentPath}</span>
                    <span className="shrink-0 text-codex-muted">
                      {formatTimeAgo(page.updatedAt || page.createdAt)}
                    </span>
                  </span>
                </span>
              </Link>
            </m.div>
          );
        })}

        {showGhost && (
          <m.div {...cardEnter(visible.length)}>
            <button
              type="button"
              onClick={onCreatePage}
              className="group flex flex-col items-center justify-center gap-3 w-full h-40 p-3 rounded-codex-xl border border-dashed border-codex-border-strong text-codex-muted transition-colors duration-200 hover:border-codex-muted hover:text-codex-foreground"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-codex-border-strong transition-colors duration-200 group-hover:border-codex-muted">
                <Plus className="w-4 h-4" />
              </span>
              <span className="font-mono text-xs uppercase tracking-label">New page</span>
            </button>
          </m.div>
        )}
      </div>
    </section>
  );
}
