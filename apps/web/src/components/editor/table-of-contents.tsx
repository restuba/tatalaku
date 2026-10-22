"use client";

import { useEffect, useState, useCallback, useId, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { ListTree, Hash } from "lucide-react";
import { scrollBehavior } from "@/lib/motion";

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
 * Scroll smoothly to a DOM node and trigger a brief flash highlight.
 * In Tatalaku, the scroll container is the <main> element inside WorkspaceLayout.
 */
export function scrollToTargetNode(targetDom: HTMLElement | null) {
  if (!targetDom) return;

  const mainContainer =
    targetDom.closest("main") || (document.querySelector("main") as HTMLElement | null);

  if (mainContainer) {
    const containerRect = mainContainer.getBoundingClientRect();
    const targetRect = targetDom.getBoundingClientRect();
    // The sticky top bar is 48px tall (56px on touch); a 72px offset leaves
    // 16-24px of breathing space below it.
    const targetOffset = 72;
    const currentScrollTop = mainContainer.scrollTop;
    const targetTop = targetRect.top - containerRect.top + currentScrollTop - targetOffset;

    mainContainer.scrollTo({
      top: Math.max(0, Math.round(targetTop)),
      behavior: scrollBehavior(),
    });
  } else {
    targetDom.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);
  const isClickingRef = useRef(false);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  // The pointer may leave briefly (e.g. on its way to the panel) before it closes
  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
  }, []);

  // Keyboard: the panel stays open while focus is inside the outline
  const handleBlur = useCallback((event: React.FocusEvent) => {
    if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) setIsOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== "Escape" || !isOpen) return;
      event.stopPropagation();
      setIsOpen(false);
      railRef.current?.focus();
    },
    [isOpen],
  );

  // Keep active item in view inside outline panel
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: scrollBehavior(),
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

      // Pick heading currently active
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
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
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

  if (items.length === 0) {
    return null;
  }

  // Maximum 40 bars for the vertical outline bar indicator
  const displayBars = items.slice(0, 40);

  // A click on a bar jumps to its heading; anywhere else on the rail (and
  // Enter/Space) opens the outline panel
  const handleRailClick = (event: React.MouseEvent) => {
    const bar = (event.target as HTMLElement).closest<HTMLElement>("[data-toc-index]");
    const item = bar ? displayBars[Number(bar.dataset.tocIndex)] : undefined;
    if (item) handleItemClick(event, item);
    else handleOpen();
  };

  // Vertically centered (not offset from the top), so the panel's max height
  // (100vh - 8rem) keeps it clear of the sticky top bar (48px, 56px on touch).
  // Shown from xl up only, so no smaller breakpoints are needed.
  // The rail comes first in the DOM (Tab reaches it, then the panel's links);
  // flex-row-reverse puts the panel on its left.
  return (
    <div
      ref={wrapperRef}
      className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-row-reverse items-center select-none"
      onMouseEnter={handleOpen}
      onMouseLeave={handleMouseLeave}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {/* 1. The rail: one button (a comfortable target) drawing a bar per heading */}
      <button
        ref={railRef}
        type="button"
        aria-label="Outline"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={handleRailClick}
        className={`flex flex-col items-end rounded-codex-md px-2 py-0.5 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-60 hover:opacity-100"
        }`}
      >
        {displayBars.map((item, index) => {
          const isActive = activeId === item.id;
          // Width by heading level: 24px (H1), 16px (H2), 10px (H3)
          const widthClass = item.level === 1 ? "w-6" : item.level === 2 ? "w-4" : "w-2.5";
          // Padding, not gaps, so each bar's click area runs into the next
          return (
            <span key={item.id} data-toc-index={index} className="flex justify-end py-1">
              <span
                className={`block h-0.5 rounded-full transition-colors duration-150 ${widthClass} ${
                  isActive ? "bg-codex-accent" : "bg-codex-faint"
                }`}
              />
            </span>
          );
        })}
      </button>

      {/* 2. Panel (opens on hover or from the rail; scrollable) */}
      {isOpen && (
        <aside
          id={panelId}
          aria-label="Table of contents"
          className="surface-popover mr-3 flex w-80 max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-codex-lg animate-in fade-in slide-in-from-right-1 duration-150"
        >
          {/* Header: label and the heading count */}
          <div className="flex items-center justify-between border-b border-codex-border px-4 py-2.5">
            <div className="eyebrow flex items-center gap-2 text-codex-muted">
              <ListTree className="size-3.5" aria-hidden="true" />
              <span>Outline</span>
              <span>{String(items.length).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Scrollable Outline List: entries hang off a continuous hairline rail
              (each entry's left border, no gaps between them) */}
          <div className="flex-1 overflow-y-auto max-h-[55vh] px-4 py-3">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  ref={isActive ? activeItemRef : undefined}
                  href={`#${item.id}`}
                  onClick={(e) => handleItemClick(e, item)}
                  className={`group relative flex items-center gap-2 border-l border-codex-border py-1.5 pr-2 text-sm transition-colors duration-150 ${
                    isActive
                      ? "text-codex-foreground"
                      : "text-codex-muted hover:text-codex-foreground"
                  }`}
                  style={{
                    paddingLeft: `${(item.level - 1) * 14 + 12}px`,
                  }}
                >
                  {/* Active marker: a 2px accent bar over the rail */}
                  {isActive && (
                    <span className="absolute -left-px inset-y-0 w-0.5 bg-codex-accent animate-in fade-in duration-150" />
                  )}

                  {/* Level marker */}
                  <span
                    aria-hidden="true"
                    className={`shrink-0 transition-colors duration-150 ${
                      isActive
                        ? "text-codex-accent"
                        : "text-codex-faint group-hover:text-codex-muted"
                    }`}
                  >
                    {item.level === 1 ? (
                      <Hash className="w-3.5 h-3.5" />
                    ) : (
                      <span className="inline-block w-1 h-1 rounded-full bg-current" />
                    )}
                  </span>

                  {/* Heading Text */}
                  <span
                    className={`truncate ${item.level === 1 ? "font-medium" : ""} ${isActive ? "font-medium" : ""}`}
                  >
                    {item.text}
                  </span>
                </a>
              );
            })}
          </div>

          <p className="border-t border-codex-border px-4 py-2.5 text-xs text-codex-muted">
            Select a heading to jump to it.
          </p>
        </aside>
      )}
    </div>
  );
}
