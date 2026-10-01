import type { Page } from "@tatalaku/shared";

/**
 * Rank a title against a query. Lower is better; `null` means no match.
 * 0 = title starts with query, 1 = a word starts with query, 2 = substring match.
 */
function rankTitle(title: string, query: string): number | null {
  const normalized = title.toLowerCase();
  if (normalized.startsWith(query)) return 0;
  if (normalized.split(/\s+/).some((word) => word.startsWith(query))) return 1;
  if (normalized.includes(query)) return 2;
  return null;
}

function lastTouched(page: Page): number {
  return new Date(page.updatedAt || page.createdAt).getTime();
}

/**
 * Filter non-archived pages by title. An empty query returns the most
 * recently edited pages; otherwise results are sorted by match quality,
 * then by recency.
 */
export function filterPages(pages: Page[], rawQuery: string, limit: number): Page[] {
  const query = rawQuery.trim().toLowerCase();
  const candidates = pages.filter((p) => !p.isArchived);

  if (!query) {
    return [...candidates].sort((a, b) => lastTouched(b) - lastTouched(a)).slice(0, limit);
  }

  return candidates
    .map((page) => ({ page, rank: rankTitle(page.title || "Untitled", query) }))
    .filter((entry): entry is { page: Page; rank: number } => entry.rank !== null)
    .sort((a, b) => a.rank - b.rank || lastTouched(b.page) - lastTouched(a.page))
    .slice(0, limit)
    .map((entry) => entry.page);
}

/** Build a "Parent / Child" path for a page, excluding the page itself. */
export function getParentPath(page: Page, pagesById: Map<string, Page>): string {
  const names: string[] = [];
  let parentId = page.parentPageId;
  // Guard against accidental cycles in malformed data
  const seen = new Set<string>();
  while (parentId && !seen.has(parentId)) {
    seen.add(parentId);
    const parent = pagesById.get(parentId);
    if (!parent) break;
    names.unshift(parent.title || "Untitled");
    parentId = parent.parentPageId;
  }
  return names.join(" / ");
}
