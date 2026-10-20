"use client";

import Link from "next/link";
import type { Page } from "@tatalaku/shared";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { formatFullDate, formatTimeAgo, toISODate } from "@/lib/date";
import { SectionHeading } from "./section-heading";

const SLOT_COUNT = 4;

interface RecentPagesProps {
  pages: Page[];
  getParentPath: (page: Page) => string;
  onCreatePage: () => void;
  /** Section the "View all" link jumps to */
  allPagesId: string;
}

export function RecentPages({ pages, getParentPath, onCreatePage, allPagesId }: RecentPagesProps) {
  const visible = pages.slice(0, SLOT_COUNT);
  // A single ghost card keeps the row balanced while the workspace is still small
  const showGhost = visible.length < SLOT_COUNT;
  const hasMore = pages.length > SLOT_COUNT;

  return (
    <section className="mt-14" aria-labelledby="home-recent-heading">
      <SectionHeading
        id="home-recent-heading"
        label="Recently edited"
        action={
          hasMore ? (
            <a
              href={`#${allPagesId}`}
              className="flex items-center gap-1 rounded-codex-sm normal-case tracking-normal text-sm text-codex-muted transition-colors hover:text-codex-foreground"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          ) : undefined
        }
      />
      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {visible.map((page) => {
          const parentPath = getParentPath(page);
          const touched = page.updatedAt || page.createdAt;
          return (
            <li key={page.id}>
              <Link
                href={`/workspace/${page.id}`}
                className="group flex h-40 flex-col overflow-hidden rounded-codex-lg border border-codex-border bg-codex-elevated transition-[border-color,box-shadow] duration-150 hover:border-codex-border-strong hover:shadow-codex-sm"
              >
                {page.coverImage ? (
                  <span className="block h-16 shrink-0 overflow-hidden border-b border-codex-border bg-codex-surface-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element -- covers are user URLs on any host */}
                    <img
                      src={page.coverImage}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </span>
                ) : (
                  <span className="flex h-16 shrink-0 items-start px-3 pt-3">
                    <span className="flex size-8 items-center justify-center rounded-codex-md bg-codex-surface-secondary text-lg leading-none">
                      {page.icon ?? (
                        <FileText className="size-4 text-codex-muted" aria-hidden="true" />
                      )}
                    </span>
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col px-3 pt-2 pb-3">
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-codex-foreground">
                    {page.coverImage && page.icon ? `${page.icon} ` : ""}
                    {page.title || "Untitled"}
                  </span>
                  <span className="eyebrow mt-auto flex min-w-0 items-center justify-between gap-2 pt-2 text-codex-muted">
                    <span className="truncate">{parentPath}</span>
                    <time
                      className="shrink-0"
                      dateTime={toISODate(touched)}
                      title={formatFullDate(touched)}
                    >
                      {formatTimeAgo(touched)}
                    </time>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}

        {showGhost && (
          <li>
            <button
              type="button"
              onClick={onCreatePage}
              className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-codex-lg border border-dashed border-codex-border-strong text-codex-muted transition-colors duration-150 hover:border-codex-accent hover:text-codex-accent"
            >
              <span className="flex size-9 items-center justify-center rounded-full border border-current">
                <Plus className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium">New page</span>
            </button>
          </li>
        )}
      </ul>
    </section>
  );
}
