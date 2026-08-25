"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Page } from "@tatalaku/shared";
import { usePageStore } from "@/stores/page.store";
import { ChevronRight, FileText, Plus, MoreHorizontal, Trash2, Edit2 } from "lucide-react";

interface PageTreeItemProps {
  page: Page;
  level?: number;
}

export function PageTreeItem({ page, level = 0 }: PageTreeItemProps) {
  const params = useParams();
  const router = useRouter();
  const activePageId = params?.["pageId"] as string | undefined;
  const isActive = activePageId === page.id;

  const { pages, expandedPageIds, toggleExpand, createPage, updatePage, archivePage } =
    usePageStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(page.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isExpanded = expandedPageIds.includes(page.id);
  const childPages = pages.filter((p) => p.parentPageId === page.id && !p.isArchived);
  const hasChildren = childPages.length > 0;

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
    try {
      await archivePage(page.id);
      if (isActive) {
        router.push("/workspace");
      }
    } catch {
      // Error handled by store
    }
  }

  return (
    <div className="select-none">
      <div
        className={`group flex items-center justify-between py-1 px-2 rounded-codex-md text-sm transition-colors cursor-pointer ${
          isActive
            ? "bg-codex-surface text-codex-foreground font-medium"
            : "text-codex-muted hover:bg-codex-surface/50 hover:text-codex-foreground"
        }`}
        style={{ paddingLeft: `${Math.max(level * 14 + 8, 8)}px` }}
      >
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {/* Chevron or placeholder */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleExpand(page.id);
            }}
            className={`w-4 h-4 flex items-center justify-center rounded hover:bg-codex-background transition-transform duration-150 shrink-0 ${
              hasChildren
                ? "opacity-70 group-hover:opacity-100"
                : "opacity-0 group-hover:opacity-40"
            }`}
          >
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>

          {/* Icon */}
          <span className="shrink-0 text-codex-muted">
            {page.icon ? (
              <span className="text-sm leading-none">{page.icon}</span>
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </span>

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
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
            {/* Quick Add Subpage */}
            <button
              type="button"
              onClick={handleAddSubpage}
              className="p-1 text-codex-muted hover:text-codex-foreground rounded-codex-sm hover:bg-codex-background transition-colors"
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
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 text-codex-muted hover:text-codex-foreground rounded-codex-sm hover:bg-codex-background transition-colors"
                title="Page options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-codex-surface border border-codex-border rounded-codex-md shadow-xl p-1 min-w-[140px] text-xs animate-in fade-in-0 zoom-in-95 duration-100">
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
                    onClick={handleArchive}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-codex-sm hover:bg-red-500/10 text-red-500 transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete / Archive</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recursive Subpages */}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5 mt-0.5">
          {childPages.map((child) => (
            <PageTreeItem key={child.id} page={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
