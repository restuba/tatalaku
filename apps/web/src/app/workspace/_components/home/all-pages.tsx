"use client";

import { useState } from "react";
import Link from "next/link";
import { m } from "motion/react";
import type { Page } from "@tatalaku/shared";
import { ArrowUpRight, FileText } from "lucide-react";
import { SPRING } from "@/components/motion";
import { formatFullDate, formatTimeAgo } from "@/lib/date";

/** Rows past this index appear together instead of continuing the cascade */
const STAGGER_LIMIT = 12;

interface AllPagesProps {
  pages: Page[];
  getParentPath: (page: Page) => string;
}

/**
 * Flat list of every page. A single highlight glides between rows under the
 * pointer/focus (one shared layoutId), so long lists stay cheap: only the
 * active row renders the animated element.
 */
export function AllPages({ pages, getParentPath }: AllPagesProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (pages.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xs font-medium text-codex-muted mb-2">
        All pages
        <span className="ml-2 tabular-nums">{pages.length}</span>
      </h2>
      <ul className="-mx-2" onMouseLeave={() => setActiveId(null)}>
        {pages.map((page, index) => {
          const parentPath = getParentPath(page);
          const isActive = activeId === page.id;
          return (
            <li
              key={page.id}
              className="opacity-0 animate-slide-up-fade"
              style={{ animationDelay: `${500 + Math.min(index, STAGGER_LIMIT) * 35}ms` }}
            >
              <Link
                href={`/workspace/${page.id}`}
                onMouseEnter={() => setActiveId(page.id)}
                onFocus={() => setActiveId(page.id)}
                onBlur={() => setActiveId(null)}
                className="group relative isolate flex items-center gap-3 px-2 py-1.5 rounded-codex-md outline-none focus-visible:ring-2 focus-visible:ring-codex-accent/50"
              >
                {isActive && (
                  <m.span
                    layoutId="home-all-pages-highlight"
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-codex-md bg-codex-surface-secondary"
                    transition={SPRING}
                  />
                )}
                <span className="w-5 flex justify-center shrink-0 leading-none">
                  {page.icon ?? <FileText className="w-4 h-4 text-codex-muted" />}
                </span>
                <span className="flex-1 min-w-0 truncate text-sm text-codex-foreground">
                  {page.title || "Untitled"}
                  {parentPath && <span className="ml-2 text-codex-muted">in {parentPath}</span>}
                </span>
                <span
                  className="shrink-0 text-xs text-codex-muted transition-opacity duration-150 group-hover:opacity-0"
                  title={formatFullDate(page.updatedAt || page.createdAt)}
                >
                  {formatTimeAgo(page.updatedAt || page.createdAt)}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="absolute right-2 w-4 h-4 text-codex-muted opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
