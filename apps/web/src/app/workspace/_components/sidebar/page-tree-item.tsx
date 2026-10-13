"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { SPRING } from "@/components/motion";
import { PopPanel } from "@/components/motion/pop-panel";
import { SIDEBAR_ACTIVE_LAYOUT_ID } from "./constants";
import { useParams, useRouter } from "next/navigation";
import type { Page } from "@tatalaku/shared";
import { usePageStore } from "@/stores/page-store";
import { useApp } from "@/components/app";
import {
  ChevronRight,
  FileText,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  Pin,
  PinOff,
  GripVertical,
} from "lucide-react";

// Matches `w-48`; height is an estimate of the 3-item menu, used for flipping
const MENU_WIDTH = 192;
const MENU_HEIGHT_ESTIMATE = 110;

interface PageTreeItemProps {
  page: Page;
  level?: number;
}

export function PageTreeItem({ page, level = 0 }: PageTreeItemProps) {
  const params = useParams();
  const router = useRouter();
  const activePageId = params?.["pageId"] as string | undefined;
  const isActive = activePageId === page.id;

  const {
    pages,
    expandedPageIds,
    toggleExpand,
    setExpanded,
    createPage,
    updatePage,
    archivePage,
    restorePage,
    reorderPages,
  } = usePageStore();
  const { message } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(page.title);
  // Where a dragged page would land relative to this row
  const [dropZone, setDropZone] = useState<"before" | "after" | "inside" | null>(null);
  // Whether this row is the one currently being dragged
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const isExpanded = expandedPageIds.includes(page.id);
  const childPages = pages
    .filter((p) => p.parentPageId === page.id && !p.isArchived)
    .sort((a, b) => a.order - b.order);
  const hasChildren = childPages.length > 0;

  const isDescendantOf = (candidateAncestorId: string, nodeId: string): boolean => {
    let current = pages.find((p) => p.id === nodeId);
    const seen = new Set<string>();
    while (current?.parentPageId && !seen.has(current.parentPageId)) {
      if (current.parentPageId === candidateAncestorId) return true;
      seen.add(current.parentPageId);
      current = pages.find((p) => p.id === current?.parentPageId);
    }
    return false;
  };

  function handleDragStart(e: React.DragEvent) {
    e.stopPropagation();
    e.dataTransfer.setData("application/x-tatalaku-page", page.id);
    e.dataTransfer.effectAllowed = "move";

    // Replace the browser's default drag image (which, because the title is an
    // <a>, renders an ugly "title + URL" box) with a clean icon + title chip.
    // Use a clone of the actual sidebar row as the drag image so the lifted
    // object matches the page row exactly (icon, spacing, font, size).
    const row = rowRef.current;
    if (row) {
      const rect = row.getBoundingClientRect();
      const ghost = row.cloneNode(true) as HTMLElement;

      // Strip hover-only affordances (grip, actions) and left indent so the
      // floating chip reads as a clean, self-contained page row.
      ghost
        .querySelectorAll<HTMLElement>("[data-drag-grip], [data-drag-actions], [data-drop-line]")
        .forEach((el) => el.remove());

      ghost.className =
        "glass-surface flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-codex-md " +
        "border border-codex-border text-sm text-codex-foreground pointer-events-none";
      ghost.style.cssText =
        `position:fixed;top:-9999px;left:0;width:${Math.round(rect.width)}px;` +
        "transform:rotate(-1.5deg);box-shadow:0 12px 28px rgba(0,0,0,0.28);";

      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 16, Math.round(rect.height / 2));
      window.setTimeout(() => ghost.remove(), 0);
    }

    setIsDragging(true);
    // Collapse while dragging so a deep subtree doesn't clutter the drop targets
    if (isExpanded) setExpanded(page.id, false);
  }

  function handleDragEnd() {
    setIsDragging(false);
    setDropZone(null);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!e.dataTransfer.types.includes("application/x-tatalaku-page")) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const third = rect.height / 3;
    setDropZone(offset < third ? "before" : offset > third * 2 ? "after" : "inside");
  }

  function handleDragLeave(e: React.DragEvent) {
    // Ignore when moving between children of this row
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDropZone(null);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("application/x-tatalaku-page");
    const zone = dropZone;
    setDropZone(null);

    if (!draggedId || !zone || draggedId === page.id) return;
    // Can't drop a page into itself or one of its own descendants
    if (isDescendantOf(draggedId, page.id)) return;

    if (zone === "inside") {
      // Append as last child of this page
      const siblings = pages
        .filter((p) => p.parentPageId === page.id && !p.isArchived && p.id !== draggedId)
        .sort((a, b) => a.order - b.order)
        .map((p) => p.id);
      setExpanded(page.id, true);
      try {
        await reorderPages(page.workspaceId, page.id, [...siblings, draggedId]);
      } catch {
        // Error handled by store (rollback)
      }
      return;
    }

    // before/after: insert into this row's sibling list at the right index
    const targetParentId = page.parentPageId ?? null;
    const siblings = pages
      .filter((p) => p.parentPageId === targetParentId && !p.isArchived && p.id !== draggedId)
      .sort((a, b) => a.order - b.order)
      .map((p) => p.id);
    const targetIndex = siblings.indexOf(page.id);
    const insertAt = zone === "before" ? targetIndex : targetIndex + 1;
    const nextOrder = [...siblings.slice(0, insertAt), draggedId, ...siblings.slice(insertAt)];

    try {
      await reorderPages(page.workspaceId, targetParentId, nextOrder);
    } catch {
      // Error handled by store (rollback)
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fixed menu would drift away from its trigger on scroll/resize, so close it
  useEffect(() => {
    if (!isMenuOpen) return;
    const close = () => setIsMenuOpen(false);
    window.addEventListener("resize", close);
    document.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [isMenuOpen]);

  async function handleAddSubpage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newPage = await createPage({
        workspaceId: page.workspaceId,
        parentPageId: page.id,
        title: "Untitled",
      });
      router.push(`/workspace/${newPage.id}`);
    } catch {
      // Error handled by store
    }
  }

  async function handleSaveTitle() {
    setIsEditing(false);
    if (editTitle.trim() && editTitle.trim() !== page.title) {
      try {
        await updatePage(page.id, { title: editTitle.trim() });
      } catch {
        setEditTitle(page.title);
      }
    } else {
      setEditTitle(page.title);
    }
  }

  async function handleArchive(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    const wasActive = isActive;
    const pageId = page.id;
    try {
      await archivePage(pageId);
      if (wasActive) {
        router.push("/workspace");
      }
    } catch {
      message.error("Couldn't move the page to Trash");
      return;
    }

    // Deleting is one click, so make it just as easy to take back
    const handleUndo = async () => {
      try {
        await restorePage(pageId);
        if (wasActive) router.push(`/workspace/${pageId}`);
      } catch {
        message.error("Couldn't restore the page");
      }
    };
    message.info(
      <span className="flex items-center gap-3">
        <span className="max-w-56 truncate">Moved “{page.title || "Untitled"}” to Trash</span>
        <button
          type="button"
          onClick={() => void handleUndo()}
          className="shrink-0 font-medium text-codex-accent hover:underline focus-visible:underline outline-none"
        >
          Undo
        </button>
      </span>,
      6000,
    );
  }

  async function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    try {
      await updatePage(page.id, { isFavorite: !page.isFavorite });
    } catch {
      // Error handled by store
    }
  }

  return (
    <div className="select-none">
      <div
        ref={rowRef}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group isolate flex items-center justify-between py-0.5 pointer-coarse:py-1.5 pr-2 rounded-codex-md text-sm transition-colors duration-150 relative ${
          isDragging ? "opacity-40 cursor-grabbing" : "cursor-grab"
        } ${
          isActive
            ? "text-codex-foreground font-medium"
            : "text-codex-muted hover:bg-codex-border/40 hover:text-codex-foreground"
        } ${
          dropZone === "inside" ? "ring-2 ring-inset ring-codex-accent/70 bg-codex-accent/10" : ""
        }`}
        style={{ paddingLeft: `${Math.max(level * 14 + 2, 2)}px` }}
      >
        {/* Active-page pill shared with the nav items: glides to the new page */}
        {isActive && (
          <m.span
            layoutId={SIDEBAR_ACTIVE_LAYOUT_ID}
            data-drop-line
            className="absolute inset-0 -z-10 rounded-codex-md bg-codex-border/60"
            transition={SPRING}
            aria-hidden="true"
          />
        )}
        {/* Sibling drop indicators: a line with a leading dot */}
        {dropZone === "before" && (
          <div
            data-drop-line
            className="absolute left-2 right-2 -top-px flex items-center pointer-events-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-codex-accent -ml-0.5" />
            <span className="flex-1 h-0.5 bg-codex-accent rounded-full" />
          </div>
        )}
        {dropZone === "after" && (
          <div
            data-drop-line
            className="absolute left-2 right-2 -bottom-px flex items-center pointer-events-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-codex-accent -ml-0.5" />
            <span className="flex-1 h-0.5 bg-codex-accent rounded-full" />
          </div>
        )}

        {/* Drag handle: appears on hover, hints the row is draggable */}
        <span
          data-drag-grip
          aria-hidden="true"
          className="w-3 shrink-0 flex items-center justify-center text-codex-muted/60 opacity-0 group-hover:opacity-100 pointer-coarse:hidden transition-opacity"
        >
          <GripVertical className="w-3 h-3" />
        </span>

        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Icon ⇄ Chevron: a single slot that shows the page icon at rest and
              swaps to an expand/collapse chevron on hover. Every page can be
              expanded; empty ones reveal a "No pages inside" placeholder. */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleExpand(page.id);
            }}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            aria-expanded={isExpanded}
            className="relative w-4 h-4 shrink-0 flex items-center justify-center rounded-codex-sm text-codex-muted hover:bg-codex-border/60"
          >
            {/* Icon: visible at rest, hidden on hover (or while expanded) */}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${
                isExpanded ? "opacity-0" : "opacity-100 group-hover:opacity-0"
              }`}
            >
              {page.icon ? (
                <span className="text-sm leading-none">{page.icon}</span>
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </span>
            {/* Chevron: hidden at rest, revealed on hover (or while expanded) */}
            <ChevronRight
              className={`absolute inset-0 m-auto w-3.5 h-3.5 transition-all duration-150 ${
                isExpanded ? "opacity-100 rotate-90" : "opacity-0 group-hover:opacity-100 rotate-0"
              }`}
            />
          </button>

          {/* Title or Inline Edit */}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditTitle(page.title);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="px-1 py-0.5 text-xs bg-codex-background border border-codex-accent rounded-codex-sm outline-none w-full text-codex-foreground"
            />
          ) : (
            <Link
              href={`/workspace/${page.id}`}
              className="truncate flex-1 py-0.5 leading-snug"
              title={page.title}
            >
              {page.title || "Untitled"}
            </Link>
          )}
        </div>

        {/* Hover Actions */}
        {!isEditing && (
          <div
            data-drag-actions
            className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 transition-opacity shrink-0 ml-1"
          >
            {/* Quick Add Subpage */}
            <button
              type="button"
              onClick={handleAddSubpage}
              className="p-1 text-codex-muted hover:text-codex-foreground rounded-codex-sm hover:bg-codex-border/60 transition-colors"
              title="Add a page inside"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* More Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  // Flip upward when there isn't enough room below the trigger
                  const top =
                    rect.bottom + MENU_HEIGHT_ESTIMATE > window.innerHeight
                      ? rect.top - MENU_HEIGHT_ESTIMATE - 4
                      : rect.bottom + 4;
                  setMenuPos({ top, left: Math.max(8, rect.right - MENU_WIDTH) });
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 text-codex-muted hover:text-codex-foreground rounded-codex-sm hover:bg-codex-border/60 transition-colors"
                title="Page options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              <PopPanel
                open={isMenuOpen && menuPos !== null}
                origin="top right"
                position={menuPos ?? undefined}
                className="fixed z-50 glass-surface border border-codex-border rounded-codex-md p-1 w-48 text-xs"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setEditTitle(page.title);
                    setIsEditing(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-codex-sm hover:bg-codex-background text-codex-foreground transition-colors text-left"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-codex-sm hover:bg-codex-background text-codex-foreground transition-colors text-left"
                >
                  {page.isFavorite ? (
                    <>
                      <PinOff className="w-3.5 h-3.5" />
                      <span>Remove from Favorites</span>
                    </>
                  ) : (
                    <>
                      <Pin className="w-3.5 h-3.5" />
                      <span>Add to Favorites</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-codex-sm hover:bg-codex-danger-bg/10 text-codex-danger transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </PopPanel>
            </div>
          </div>
        )}
      </div>

      {/* Recursive Subpages — height springs open/closed instead of popping */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <m.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            {hasChildren ? (
              <div className="space-y-0.5 mt-0.5">
                {childPages.map((child) => (
                  <PageTreeItem key={child.id} page={child} level={level + 1} />
                ))}
              </div>
            ) : (
              <p
                className="mt-0.5 py-0.5 text-xs italic text-codex-muted/70 select-none"
                style={{ paddingLeft: `${Math.max((level + 1) * 14 + 8, 8)}px` }}
              >
                No pages inside
              </p>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
