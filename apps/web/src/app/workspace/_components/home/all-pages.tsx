"use client";

import { useState } from "react";
import Link from "next/link";
import type { Page } from "@tatalaku/shared";
import { FileText } from "lucide-react";
import { formatFullDate, formatTimeAgo, toISODate } from "@/lib/date";
import { SectionHeading } from "./section-heading";

interface AllPagesProps {
  id: string;
  pages: Page[];
  getParentPath: (page: Page) => string;
}

/** How many rows to show before the "Show all" toggle */
const INITIAL_COUNT = 10;

/** Every page as quiet rows: title on the left, last edit on the right */
export function AllPages({ id, pages, getParentPath }: AllPagesProps) {
  const [expanded, setExpanded] = useState(false);

  if (pages.length === 0) return null;

  // A long workspace would make Home scroll for ages; show the first rows and
  // let the reader open the rest in place.
  const hasMore = pages.length > INITIAL_COUNT;
  const visible = expanded ? pages : pages.slice(0, INITIAL_COUNT);

  return (
    <section id={id} className="mt-14 scroll-mt-16" aria-labelledby="home-all-pages-heading">
      <SectionHeading
        id="home-all-pages-heading"
        label="All pages"
        meta={String(pages.length).padStart(2, "0")}
      />
      <ul className="mt-2 divide-y divide-codex-border">
        {visible.map((page) => {
          const parentPath = getParentPath(page);
          const touched = page.updatedAt || page.createdAt;
          return (
            <li key={page.id}>
              <Link
                href={`/workspace/${page.id}`}
                className="group flex items-center gap-3 rounded-codex-md px-2 py-2.5 transition-colors duration-150 hover:bg-codex-hover"
              >
                <span className="flex w-5 shrink-0 justify-center leading-none">
                  {page.icon ?? <FileText className="size-4 text-codex-muted" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-codex-foreground">
                  {page.title || "Untitled"}
                  {parentPath && <span className="ml-2 text-codex-muted">in {parentPath}</span>}
                </span>
                <time
                  className="shrink-0 text-xs tabular-nums text-codex-muted"
                  dateTime={toISODate(touched)}
                  title={formatFullDate(touched)}
                >
                  {formatTimeAgo(touched)}
                </time>
              </Link>
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 ml-2 rounded-codex-sm text-sm text-codex-muted transition-colors hover:text-codex-foreground"
        >
          {expanded ? "Show less" : `Show all ${pages.length}`}
        </button>
      )}
    </section>
  );
}
