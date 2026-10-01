import Link from "next/link";
import type { Page } from "@tatalaku/shared";
import { FileText, Plus } from "lucide-react";
import { formatTimeAgo } from "@/lib/date";

const SLOT_COUNT = 4;

interface RecentPagesProps {
  pages: Page[];
  getParentPath: (page: Page) => string;
  onCreatePage: () => void;
}

export function RecentPages({ pages, getParentPath, onCreatePage }: RecentPagesProps) {
  const visible = pages.slice(0, SLOT_COUNT);
  // A single ghost card keeps the row balanced while the workspace is still small
  const showGhost = visible.length < SLOT_COUNT;

  return (
    <section className="mt-12">
      <h2 className="text-xs font-medium text-codex-muted mb-3">Recently edited</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {visible.map((page) => {
          const parentPath = getParentPath(page);
          return (
            <Link
              key={page.id}
              href={`/workspace/${page.id}`}
              className="group flex flex-col h-32 p-3 rounded-codex-lg bg-codex-surface-secondary hover:bg-codex-border/50 transition-colors duration-150"
            >
              <span className="text-2xl leading-none">
                {page.icon ?? <FileText className="w-6 h-6 text-codex-muted" />}
              </span>
              <div className="mt-auto min-w-0">
                <p className="text-sm font-medium text-codex-foreground line-clamp-2 leading-snug">
                  {page.title || "Untitled"}
                </p>
                <p className="text-xs text-codex-muted mt-1 truncate">
                  {parentPath ? `${parentPath} · ` : ""}
                  {formatTimeAgo(page.updatedAt || page.createdAt)}
                </p>
              </div>
            </Link>
          );
        })}

        {showGhost && (
          <button
            type="button"
            onClick={onCreatePage}
            className="flex flex-col items-center justify-center gap-1.5 h-32 p-3 rounded-codex-lg border border-dashed border-codex-border text-codex-muted hover:border-codex-muted hover:text-codex-foreground transition-colors duration-150"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">New page</span>
          </button>
        )}
      </div>
    </section>
  );
}
