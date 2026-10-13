"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FileText, Home, Keyboard, Plus, Search, Upload } from "lucide-react";
import type { Page } from "@tatalaku/shared";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { SPRING, SPRING_SOFT } from "@/components/motion";
import { useUIStore } from "@/stores/ui-store";
import { usePageStore } from "@/stores/page-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { formatTimeAgo } from "@/lib/date";
import { searchPages, type PageSearchResult } from "@/services/page/search-pages";
import { filterPages, getParentPath } from "./filter-pages";

const RESULT_LIMIT = 20;

interface PaletteItem {
  id: string;
  group: "Pages" | "Recent" | "Actions";
  label: string;
  hint?: string | undefined;
  meta?: string | undefined;
  icon: ReactNode;
  onSelect: () => void;
}

/**
 * Global ⌘K / Ctrl+K palette for jumping between pages and running quick actions.
 * Mount once inside the workspace layout.
 */
export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen, toggleCommandPalette } = useUIStore();
  const mounted = useIsMounted();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    }
    // Capture phase so the editor can't swallow the shortcut first
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [toggleCommandPalette]);

  if (!mounted) return null;

  // Rendering the dialog only while open gives it fresh state on every open;
  // AnimatePresence keeps it around just long enough to animate out.
  return createPortal(
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <PaletteDialog key="palette" onClose={() => setCommandPaletteOpen(false)} />
      )}
    </AnimatePresence>,
    document.body,
  );
}

function PaletteDialog({ onClose }: { onClose: () => void }) {
  const isPresent = useIsPresent();
  const router = useRouter();
  const { pages, createPage } = usePageStore();
  const { activeWorkspace } = useWorkspaceStore();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  // Server results are tagged with the query they belong to, so stale results
  // from a previous keystroke are ignored during render without a reset effect.
  const [serverSearch, setServerSearch] = useState<{ q: string; results: PageSearchResult[] }>({
    q: "",
    results: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  // Restore focus to whatever was focused before the palette opened
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  // Server-side full-text search (title + content), debounced. Local filtering
  // still runs for instant feedback; server results add content matches and
  // pages that may not be loaded in the store.
  const workspaceId = activeWorkspace?.id;
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || !workspaceId) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchPages({ workspaceId, q: trimmed, limit: RESULT_LIMIT })
        .then((res) => {
          if (!cancelled) setServerSearch({ q: trimmed, results: res.data });
        })
        .catch(() => {
          if (!cancelled) setServerSearch({ q: trimmed, results: [] });
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, workspaceId]);

  const pagesById = useMemo(() => new Map(pages.map((p) => [p.id, p])), [pages]);

  const items = useMemo<PaletteItem[]>(() => {
    const trimmed = query.trim();
    const isSearching = trimmed.length > 0;

    const toPageItem = (page: Page, snippet?: string | null): PaletteItem => ({
      id: `page-${page.id}`,
      group: isSearching ? "Pages" : "Recent",
      label: page.title || "Untitled",
      hint: snippet || getParentPath(page, pagesById) || undefined,
      meta: formatTimeAgo(page.updatedAt || page.createdAt),
      icon: page.icon ? (
        <span className="leading-none">{page.icon}</span>
      ) : (
        <FileText className="w-4 h-4" />
      ),
      onSelect: () => router.push(`/workspace/${page.id}`),
    });

    // Local title matches first (instant), then server matches that add new
    // hits (content matches or pages not in the store), deduped by id.
    const localPages = filterPages(pages, query, RESULT_LIMIT);
    const seen = new Set(localPages.map((p) => p.id));
    // Only trust server results that match the current query (ignore stale ones)
    const freshServer = serverSearch.q === trimmed ? serverSearch.results : [];
    const pageItems: PaletteItem[] = [
      ...localPages.map((p) => toPageItem(p)),
      ...(isSearching
        ? freshServer
            .filter((p) => !seen.has(p.id))
            .slice(0, RESULT_LIMIT)
            .map((p) => toPageItem(p, p.snippet))
        : []),
    ];
    const actionItems: PaletteItem[] = [
      {
        id: "action-new-page",
        group: "Actions",
        label: trimmed ? `New page "${trimmed}"` : "New page",
        icon: <Plus className="w-4 h-4" />,
        onSelect: async () => {
          if (!activeWorkspace) return;
          try {
            const newPage = await createPage({
              workspaceId: activeWorkspace.id,
              title: trimmed || "Untitled",
            });
            router.push(`/workspace/${newPage.id}`);
          } catch {
            // Error handled by store
          }
        },
      },
      {
        id: "action-home",
        group: "Actions",
        label: "Go to Home",
        icon: <Home className="w-4 h-4" />,
        onSelect: () => router.push("/workspace"),
      },
      {
        id: "action-import",
        group: "Actions",
        label: "Import Markdown",
        icon: <Upload className="w-4 h-4" />,
        onSelect: () => useUIStore.getState().setImportMarkdownOpen(true),
      },
      {
        id: "action-shortcuts",
        group: "Actions",
        label: "Keyboard shortcuts",
        icon: <Keyboard className="w-4 h-4" />,
        onSelect: () => useUIStore.getState().setShortcutsOpen(true),
      },
    ];

    // While searching, only keep actions that still make sense for the query
    const visibleActions = isSearching
      ? actionItems.filter(
          (a) =>
            a.id === "action-new-page" || a.label.toLowerCase().includes(trimmed.toLowerCase()),
        )
      : actionItems;

    return [...pageItems, ...visibleActions];
  }, [query, pages, pagesById, serverSearch, activeWorkspace, createPage, router]);

  // Keep the highlighted row in bounds and in view
  const safeIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${safeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [safeIndex]);

  function runItem(item: PaletteItem | undefined) {
    if (!item) return;
    onClose();
    item.onSelect();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((safeIndex + 1) % Math.max(items.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((safeIndex - 1 + items.length) % Math.max(items.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runItem(items[safeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  const activeItem = items[safeIndex];

  return (
    <div
      // While animating out, let clicks fall through to the page underneath
      className={`fixed inset-0 z-50 flex justify-center px-4 pt-24 sm:pt-32 ${
        isPresent ? "" : "pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Search pages and commands"
    >
      <m.div
        className="fixed inset-0 bg-codex-background/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      />

      <m.div
        initial={{ opacity: 0, y: -10, scale: 0.97, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } }}
        transition={SPRING_SOFT}
        className="glass-surface relative z-10 flex flex-col w-full max-w-xl max-h-96 self-start overflow-hidden rounded-codex-2xl border border-codex-border text-codex-foreground shadow-2xl shadow-black/10"
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 border-b border-codex-border">
          <Search className="w-4 h-4 shrink-0 text-codex-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${activeWorkspace?.name ?? "pages"}…`}
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeItem ? `${listboxId}-${activeItem.id}` : undefined}
            aria-autocomplete="list"
            className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-codex-muted"
          />
          <kbd className="shrink-0 font-sans text-xs text-codex-muted">esc</kbd>
        </div>

        {/* Results */}
        <ul ref={listRef} id={listboxId} role="listbox" className="flex-1 overflow-y-auto p-1">
          {items.map((item, index) => {
            const showGroupLabel = index === 0 || items[index - 1]?.group !== item.group;
            const isActive = index === safeIndex;
            return (
              <li key={item.id} role="presentation">
                {showGroupLabel && (
                  <div className="px-3 pt-2 pb-1 text-xs font-medium text-codex-muted">
                    {item.group}
                  </div>
                )}
                <div
                  id={`${listboxId}-${item.id}`}
                  role="option"
                  aria-selected={isActive}
                  data-index={index}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => runItem(item)}
                  className="relative flex items-center gap-3 px-3 py-2 pointer-coarse:py-3 rounded-codex-md text-sm cursor-pointer"
                >
                  {/* Shared highlight glides between rows instead of jumping */}
                  {isActive && (
                    <m.span
                      layoutId={`${listboxId}-highlight`}
                      className="absolute inset-0 rounded-codex-md bg-codex-surface-secondary"
                      transition={SPRING}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative w-5 flex justify-center shrink-0 transition-colors ${
                      isActive ? "text-codex-accent" : "text-codex-muted"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="relative flex-1 min-w-0 truncate">
                    {item.label}
                    {item.hint && <span className="ml-2 text-codex-muted">{item.hint}</span>}
                  </span>
                  {item.meta && (
                    <span className="relative shrink-0 text-xs text-codex-muted">{item.meta}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-codex-border text-xs text-codex-muted select-none">
          <span>↑↓ to navigate</span>
          <span>↵ to open</span>
        </div>
      </m.div>
    </div>
  );
}
