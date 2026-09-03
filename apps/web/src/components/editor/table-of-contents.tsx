"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { AlignLeft, X, ListTree, Hash, Sparkles } from "lucide-react";
import { useUIStore } from "@/stores";

export interface ToCItem {
  id: string;
  level: number;
  text: string;
  pos: number;
  index: number;
}

export function useTableOfContents(editor: Editor | null) {
  const [items, setItems] = useState<ToCItem[]>([]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const updateToC = () => {
      const headings: ToCItem[] = [];
      let index = 0;

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          const id = (node.attrs.id as string) || `heading-${index}`;
          const text = node.textContent.trim();
          headings.push({
            id,
            level: node.attrs.level,
            text: text || "Untitled",
            pos,
            index,
          });
          index++;
        }
      });

      setItems(headings);
    };

    editor.on("update", updateToC);
    // Initial extraction
    updateToC();

    return () => {
      editor.off("update", updateToC);
    };
  }, [editor]);

  return items;
}

/**
 * Get the target DOM element for a heading item reliably
 */
export function getHeadingDOM(editor: Editor | null, item: ToCItem): HTMLElement | null {
  if (!editor || editor.isDestroyed) return null;

  // 1. Direct index matching from editor view DOM (pre-order depth first matches document order)
  try {
    const headings = editor.view.dom.querySelectorAll("h1, h2, h3");
    if (headings && headings[item.index]) {
      const el = headings[item.index] as HTMLElement;
      if (item.id) {
        if (!el.id) el.id = item.id;
        if (!el.getAttribute("data-id")) el.setAttribute("data-id", item.id);
      }
      return el;
    }
  } catch {
    // index lookup not applicable
  }

  // 2. Try finding by data-id or id in document
  if (item.id) {
    try {
      const el = document.querySelector(
        `[data-id="${item.id}"], #${CSS.escape(item.id)}`,
      ) as HTMLElement | null;
      if (el) return el;
    } catch {
      const el = document.querySelector(`[data-id="${item.id}"]`) as HTMLElement | null;
      if (el) return el;
    }
  }

  // 3. Fallback search inside editor view DOM by matching text
  try {
    const headings = editor.view.dom.querySelectorAll("h1, h2, h3");
    for (const h of headings) {
      if (h.textContent?.trim() === item.text) {
        return h as HTMLElement;
      }
    }
  } catch {
    // text lookup not applicable
  }

  return null;
}

/**
 * Scroll smoothly to a DOM node and trigger the Notion-style flash highlight.
 * In Tatalaku, the scroll container is the <main> element inside WorkspaceLayout.
 */
export function scrollToTargetNode(targetDom: HTMLElement | null) {
  if (!targetDom) return;

  const mainContainer =
    targetDom.closest("main") || (document.querySelector("main") as HTMLElement | null);

  if (mainContainer) {
    const containerRect = mainContainer.getBoundingClientRect();
    const targetRect = targetDom.getBoundingClientRect();
    // Sticky header is ~52px tall. We set targetOffset to 72px for 20px clean breathing space.
    const targetOffset = 72;
    const currentScrollTop = mainContainer.scrollTop;
    const targetTop = targetRect.top - containerRect.top + currentScrollTop - targetOffset;

    mainContainer.scrollTo({
      top: Math.max(0, Math.round(targetTop)),
      behavior: "smooth",
    });
  } else {
    targetDom.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Trigger flash highlight animation
  targetDom.classList.remove("block-highlight-flash");
  void targetDom.offsetWidth; // Force CSS reflow
  targetDom.classList.add("block-highlight-flash");

  setTimeout(() => {
    targetDom.classList.remove("block-highlight-flash");
  }, 1900);
}

interface TableOfContentsProps {
  editor: Editor | null;
}

export function TableOfContents({ editor }: TableOfContentsProps) {
  const items = useTableOfContents(editor);
  const { isOutlineOpen, setOutlineOpen } = useUIStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);
  const isClickingRef = useRef(false);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep active item in view inside outline panel
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeId]);

  // Scrollspy: detect currently visible heading closest to top of viewport
  useEffect(() => {
    if (!editor || editor.isDestroyed || items.length === 0) {
      return;
    }

    const mainEl = document.querySelector("main");

    const handleScroll = () => {
      if (!editor || editor.isDestroyed || items.length === 0) return;
      if (isClickingRef.current) return;

      // Bottom of page detection (if user reaches bottom of document)
      if (mainEl && mainEl.scrollHeight - mainEl.scrollTop - mainEl.clientHeight <= 25) {
        const last = items[items.length - 1];
        if (last) {
          setActiveId(last.id);
          return;
        }
      }

      // Pick heading currently active.
      // Target offset is 72px. Threshold is 80px.
      // The active heading is the last heading whose top has reached or passed 80px.
      const topThreshold = 80;
      let activeItem = items[0];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;
        const dom = getHeadingDOM(editor, item);
        if (!dom) continue;

        const rect = dom.getBoundingClientRect();
        if (rect.top <= topThreshold) {
          activeItem = item;
        } else {
          break;
        }
      }

      if (activeItem) {
        setActiveId(activeItem.id);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Attach to main, window, and document to guarantee scroll is captured
    mainEl?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });

    // Initial check
    handleScroll();

    return () => {
      mainEl?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("scroll", onScroll, { capture: true });
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, [editor, items]);

  const handleItemClick = useCallback(
    (e: React.MouseEvent, item: ToCItem) => {
      e.preventDefault();
      const targetDom = getHeadingDOM(editor, item);
      if (targetDom) {
        setActiveId(item.id);
        isClickingRef.current = true;
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        clickTimerRef.current = setTimeout(() => {
          isClickingRef.current = false;
        }, 800);

        scrollToTargetNode(targetDom);
      }
    },
    [editor],
  );

  if (!isOutlineOpen) {
    return null;
  }

  return (
    <aside
      ref={panelRef}
      aria-label="Table of contents"
      className="fixed right-4 sm:right-6 top-16 sm:top-20 z-40 w-[calc(100vw-2rem)] sm:w-80 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col glass-surface border border-codex-border shadow-2xl rounded-codex-xl animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* Outline Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-codex-border/60 bg-codex-surface/50">
        <div className="flex items-center gap-2">
          <ListTree className="w-4 h-4 text-codex-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-codex-foreground">
            Outline
          </span>
          {items.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-codex-border/50 text-codex-muted">
              {items.length}
            </span>
          )}
        </div>

        <button
          onClick={() => setOutlineOpen(false)}
          className="p-1 rounded-codex-sm hover:bg-codex-surface text-codex-muted hover:text-codex-foreground transition-colors"
          title="Close outline"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Outline List / Empty State */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-[60vh] text-xs">
        {items.length === 0 ? (
          <div className="p-6 text-center text-codex-muted flex flex-col items-center gap-2">
            <AlignLeft className="w-8 h-8 opacity-25" />
            <p className="font-medium text-codex-foreground text-xs">No headings yet</p>
            <p className="text-[11px] leading-relaxed opacity-75">
              Add Heading 1, 2, or 3 blocks to build an automatic table of contents for this page.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                ref={isActive ? activeItemRef : undefined}
                href={`#${item.id}`}
                onClick={(e) => handleItemClick(e, item)}
                className={`group relative flex items-center gap-1.5 py-1.5 pr-2 rounded-codex-md transition-all duration-150 ${
                  isActive
                    ? "bg-codex-accent/15 text-codex-foreground font-semibold shadow-xs"
                    : "text-codex-muted hover:text-codex-foreground hover:bg-codex-surface-secondary/50"
                }`}
                style={{
                  paddingLeft: `${(item.level - 1) * 14 + 10}px`,
                }}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-1 top-1.5 bottom-1.5 w-1 rounded-full bg-codex-accent animate-in fade-in duration-200" />
                )}

                {/* Level marker */}
                <span
                  className={`shrink-0 transition-opacity ${
                    isActive ? "text-codex-accent opacity-100" : "opacity-40 group-hover:opacity-80"
                  }`}
                >
                  {item.level === 1 ? (
                    <Hash className="w-3.5 h-3.5" />
                  ) : (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                  )}
                </span>

                {/* Heading Text */}
                <span
                  className={`truncate ${
                    item.level === 1
                      ? "text-xs font-semibold"
                      : item.level === 2
                        ? "text-xs font-medium"
                        : "text-[11px] opacity-90"
                  }`}
                >
                  {item.text}
                </span>
              </a>
            );
          })
        )}
      </div>

      {/* Subtle footer tip */}
      {items.length > 0 && (
        <div className="px-3 py-1.5 border-t border-codex-border/40 bg-codex-surface/30 flex items-center gap-1.5 text-[10px] text-codex-muted">
          <Sparkles className="w-3 h-3 text-codex-accent/70 shrink-0" />
          <span className="opacity-70">Click to jump to section</span>
        </div>
      )}
    </aside>
  );
}

/**
 * Floating Outline Pill Button (visible when scrolling down inside the editor canvas)
 */
export function OutlineFloatingPill({ editor }: { editor: Editor | null }) {
  const items = useTableOfContents(editor);
  const { isOutlineOpen, toggleOutline } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const mainEl = document.querySelector("main");
      const currentScroll = mainEl ? mainEl.scrollTop : window.scrollY;
      setIsScrolled(currentScroll > 160);
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  if (items.length === 0 || !isScrolled || isOutlineOpen) {
    return null;
  }

  return (
    <button
      onClick={toggleOutline}
      className="fixed right-4 sm:right-6 top-16 sm:top-20 z-30 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full glass-surface border border-codex-border/80 shadow-md text-codex-muted hover:text-codex-foreground hover:border-codex-accent/60 transition-all duration-200 animate-in fade-in zoom-in-95 hover:scale-105"
      title="View page outline"
    >
      <ListTree className="w-3.5 h-3.5 text-codex-accent" />
      <span className="text-[11px] font-medium">Outline</span>
      <span className="text-[10px] font-mono px-1 rounded-full bg-codex-border/60">
        {items.length}
      </span>
    </button>
  );
}
