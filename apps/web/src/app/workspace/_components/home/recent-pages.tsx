"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { m } from "motion/react";
import type { Page } from "@tatalaku/shared";
import { FileText, Plus } from "lucide-react";
import { EASE_OUT } from "@/components/motion";
import { TiltCard } from "@/components/motion/tilt-card";
import { formatTimeAgo } from "@/lib/date";

const SLOT_COUNT = 4;

/** Theme tokens the generated banners blend between */
const BANNER_TOKENS = ["--color-accent", "--color-info", "--color-skill"] as const;

/** Small deterministic string hash (FNV-1a) — same page, same banner */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Pages without a cover get a generated banner: two theme colors at an angle
 * derived from the page id, softened into the surface so it suits any theme.
 */
function generatedBanner(pageId: string): CSSProperties {
  const hash = hashString(pageId);
  const from = BANNER_TOKENS[hash % BANNER_TOKENS.length] ?? "--color-accent";
  const to = BANNER_TOKENS[(hash >>> 3) % BANNER_TOKENS.length] ?? "--color-info";
  const angle = hash % 360;
  return {
    backgroundImage: `linear-gradient(${angle}deg, color-mix(in srgb, var(${from}) 38%, var(--color-surface)), color-mix(in srgb, var(${to}) 18%, var(--color-surface)))`,
  };
}

interface RecentPagesProps {
  pages: Page[];
  getParentPath: (page: Page) => string;
  onCreatePage: () => void;
}

const cardEnter = (index: number) =>
  ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay: 0.3 + index * 0.07, ease: EASE_OUT },
  }) as const;

export function RecentPages({ pages, getParentPath, onCreatePage }: RecentPagesProps) {
  const visible = pages.slice(0, SLOT_COUNT);
  // A single ghost card keeps the row balanced while the workspace is still small
  const showGhost = visible.length < SLOT_COUNT;

  return (
    <section className="mt-12">
      <h2 className="text-xs font-medium text-codex-muted mb-3">Recently edited</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {visible.map((page, index) => {
          const parentPath = getParentPath(page);
          return (
            <m.div key={page.id} {...cardEnter(index)}>
              <TiltCard className="h-full rounded-codex-xl">
                <Link
                  href={`/workspace/${page.id}`}
                  className="flex flex-col h-40 overflow-hidden rounded-codex-xl border border-codex-border bg-codex-surface hover:border-codex-accent/40 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-codex-accent"
                >
                  {/* Banner: the real cover when there is one */}
                  <span
                    className="relative block h-14 shrink-0 overflow-hidden"
                    style={page.coverImage ? undefined : generatedBanner(page.id)}
                  >
                    {page.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.coverImage}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <span className="flex flex-1 flex-col min-w-0 px-3 pb-3">
                    {/* relative: paint above the (positioned) banner it overlaps */}
                    <span className="relative -mt-4 mb-2 flex h-8 w-8 items-center justify-center rounded-codex-md border border-codex-border bg-codex-surface text-xl leading-none">
                      {page.icon ?? <FileText className="w-4 h-4 text-codex-muted" />}
                    </span>
                    <span className="mt-auto min-w-0">
                      <span className="block text-sm font-medium text-codex-foreground line-clamp-2 leading-snug">
                        {page.title || "Untitled"}
                      </span>
                      <span className="block text-xs text-codex-muted mt-1 truncate">
                        {parentPath ? `${parentPath} · ` : ""}
                        {formatTimeAgo(page.updatedAt || page.createdAt)}
                      </span>
                    </span>
                  </span>
                </Link>
              </TiltCard>
            </m.div>
          );
        })}

        {showGhost && (
          <m.div {...cardEnter(visible.length)}>
            <button
              type="button"
              onClick={onCreatePage}
              className="group flex flex-col items-center justify-center gap-2 w-full h-40 p-3 rounded-codex-xl border border-dashed border-codex-border text-codex-muted hover:border-codex-accent/50 hover:text-codex-foreground transition-colors duration-200"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-codex-border transition-transform duration-300 group-hover:rotate-90 group-hover:border-codex-accent/50">
                <Plus className="w-4 h-4" />
              </span>
              <span className="text-xs">New page</span>
            </button>
          </m.div>
        )}
      </div>
    </section>
  );
}
