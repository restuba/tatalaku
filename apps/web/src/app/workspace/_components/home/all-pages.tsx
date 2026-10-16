"use client";

import Link from "next/link";
import type { Page } from "@tatalaku/shared";
import { ArrowUpRight, FileText } from "lucide-react";
import { formatFullDate, formatTimeAgo } from "@/lib/date";
import { SectionHeading } from "./section-heading";

/** Rows past this index appear together instead of continuing the cascade */
const STAGGER_LIMIT = 12;

interface AllPagesProps {
  pages: Page[];
  getParentPath: (page: Page) => string;
}

/** Flat list of every page as ruled data rows: title on the left, time on the right */
export function AllPages({ pages, getParentPath }: AllPagesProps) {
  if (pages.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="home-all-pages-heading">
      <SectionHeading
        id="home-all-pages-heading"
        label="All pages"
        meta={String(pages.length).padStart(2, "0")}
      />
      <ul className="divide-y divide-codex-border">
        {pages.map((page, index) => {
          const parentPath = getParentPath(page);
          return (
            <li
              key={page.id}
              className="animate-row-in"
              style={{ animationDelay: `${450 + Math.min(index, STAGGER_LIMIT) * 30}ms` }}
            >
              <Link
                href={`/workspace/${page.id}`}
                className="group relative flex items-center gap-3 px-2 py-2.5 transition-colors duration-150 hover:bg-codex-surface-secondary"
              >
                <span className="w-5 flex justify-center shrink-0 leading-none">
                  {page.icon ?? <FileText className="w-4 h-4 text-codex-muted" />}
                </span>
                <span className="flex-1 min-w-0 truncate text-sm text-codex-foreground">
                  {page.title || "Untitled"}
                  {parentPath && <span className="ml-2 text-codex-muted">in {parentPath}</span>}
                </span>
                <span
                  className="shrink-0 font-mono text-xs uppercase tracking-label text-codex-muted transition-opacity duration-150 group-hover:opacity-0"
                  title={formatFullDate(page.updatedAt || page.createdAt)}
                >
                  {formatTimeAgo(page.updatedAt || page.createdAt)}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="absolute right-2 w-4 h-4 text-codex-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
