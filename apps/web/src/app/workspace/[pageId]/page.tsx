"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Page } from "@tatalaku/shared";
import { usePageStore } from "@/stores/page-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useHydratedFullWidth } from "@/stores/ui-store";
import { BlockEditor, type SaveStatus } from "@/components/editor/block-editor";
import { PageHeaderSkeleton, PageContentSkeleton } from "@/components/ui/skeleton";
import type { BreadcrumbItem } from "@/components/shared/breadcrumb";
import { formatTimeAgo, formatFullDate } from "@/lib/date";
import { getPage } from "@/services/page/get-page";
import { pageToMarkdown, downloadMarkdown, markdownFileName } from "@/lib/markdown-export";
import { TopBar } from "../_components/top-bar";
import {
  FileText,
  Plus,
  Smile,
  ArrowLeft,
  MoreHorizontal,
  Download,
  Image as ImageIcon,
} from "lucide-react";

const COMMON_EMOJIS = ["📝", "🚀", "💡", "🎯", "📌", "✨", "📚", "🎨", "🔥", "📋", "💻", "⭐"];

const SAVE_STATUS_LABEL: Record<Exclude<SaveStatus, "idle">, string> = {
  saving: "Saving…",
  saved: "Saved",
  error: "Failed to save",
};

function PageDetail({ page }: { page: Page }) {
  const router = useRouter();
  const { activeWorkspace } = useWorkspaceStore();
  const { pages, updatePage, createPage } = usePageStore();
  const isFullWidth = useHydratedFullWidth();

  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon);
  const [coverImage, setCoverImage] = useState(page.coverImage);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [localEditedAt, setLocalEditedAt] = useState<Date | string | null>(null);
  const lastEditedAt = localEditedAt || page.updatedAt || null;
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const resetSavedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Periodic tick to automatically refresh relative timestamp ("just now", "1m ago", etc.)
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveStatusChange = useCallback((status: SaveStatus) => {
    setSaveStatus(status);
    if (resetSavedTimerRef.current) {
      clearTimeout(resetSavedTimerRef.current);
      resetSavedTimerRef.current = null;
    }
    if (status === "saved") {
      resetSavedTimerRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    }
  }, []);

  const handleSaved = useCallback((updatedAt: Date | string) => {
    setLocalEditedAt(updatedAt);
  }, []);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = "auto";
      titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`;
    }
  }, [page.id]); // Adjust on initial mount when page loads

  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (isOptionsOpen && optionsRef.current && !optionsRef.current.contains(target)) {
        setIsOptionsOpen(false);
      }
      if (isEmojiPickerOpen && emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
        setIsEmojiPickerOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOptionsOpen, isEmojiPickerOpen]);

  // Build breadcrumb hierarchy (root → current)
  const ancestors: Page[] = [];
  let curr: Page | undefined = page;
  while (curr?.parentPageId) {
    const parent = pages.find((p) => p.id === curr?.parentPageId);
    if (parent) {
      ancestors.unshift(parent);
      curr = parent;
    } else {
      break;
    }
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: activeWorkspace?.name || "Workspace", href: "/workspace" },
    ...ancestors.map((p) => ({
      label: p.title || "Untitled",
      href: `/workspace/${p.id}`,
      icon: p.icon ?? undefined,
    })),
    { label: title || page.title || "Untitled", icon: icon ?? undefined },
  ];

  async function handleTitleBlur() {
    const finalTitle = title.trim() || "Untitled";
    if (finalTitle !== page.title) {
      handleSaveStatusChange("saving");
      try {
        const updated = await updatePage(page.id, { title: finalTitle });
        handleSaveStatusChange("saved");
        if (updated?.updatedAt) setLocalEditedAt(updated.updatedAt);
      } catch {
        handleSaveStatusChange("error");
      }
    }
  }

  async function handleSelectIcon(selectedIcon: string | null) {
    setIcon(selectedIcon);
    setIsEmojiPickerOpen(false);
    handleSaveStatusChange("saving");
    try {
      const updated = await updatePage(page.id, { icon: selectedIcon });
      handleSaveStatusChange("saved");
      if (updated?.updatedAt) setLocalEditedAt(updated.updatedAt);
    } catch {
      handleSaveStatusChange("error");
    }
  }

  async function handleSetCover(nextCover: string | null) {
    const previous = coverImage;
    setCoverImage(nextCover);
    handleSaveStatusChange("saving");
    try {
      const updated = await updatePage(page.id, { coverImage: nextCover });
      handleSaveStatusChange("saved");
      if (updated?.updatedAt) setLocalEditedAt(updated.updatedAt);
    } catch {
      setCoverImage(previous);
      handleSaveStatusChange("error");
    }
  }

  function handleAddCover() {
    setIsOptionsOpen(false);
    const url = window.prompt("Paste an image URL for the cover");
    const trimmed = url?.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      window.alert("Please enter a valid http(s) image URL.");
      return;
    }
    void handleSetCover(trimmed);
  }

  async function handleExportMarkdown() {
    setIsOptionsOpen(false);
    setIsExporting(true);
    try {
      // Fetch the latest content so unsaved debounced edits aren't missed
      const res = await getPage(page.id);
      downloadMarkdown(markdownFileName(res.data.title), pageToMarkdown(res.data));
    } catch {
      // The store only holds page metadata (no content), so there is nothing
      // safe to fall back to; surface the failure instead of an empty file.
      setExportFailed(true);
      window.setTimeout(() => setExportFailed(false), 4000);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleAddSubpage() {
    if (!activeWorkspace) return;
    setIsOptionsOpen(false);
    try {
      const subpage = await createPage({
        workspaceId: activeWorkspace.id,
        parentPageId: page.id,
        title: "Untitled",
      });
      router.push(`/workspace/${subpage.id}`);
    } catch {
      // Error handled by store
    }
  }

  const topBarActions = (
    <>
      {exportFailed && (
        <span
          role="alert"
          className="px-2 text-xs text-codex-danger animate-in fade-in duration-150"
        >
          Export failed
        </span>
      )}

      {/* Save status: only visible while something is happening */}
      {saveStatus !== "idle" && (
        <span
          role="status"
          className={`px-2 text-xs animate-in fade-in duration-150 ${
            saveStatus === "error" ? "text-codex-danger" : "text-codex-muted"
          }`}
        >
          {SAVE_STATUS_LABEL[saveStatus]}
        </span>
      )}

      <div className="relative" ref={optionsRef}>
        <button
          type="button"
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className={`p-1.5 rounded-codex-md transition-colors ${
            isOptionsOpen
              ? "bg-codex-surface-secondary text-codex-foreground"
              : "text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground"
          }`}
          aria-label="Page options"
          aria-expanded={isOptionsOpen}
          title="Page options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {isOptionsOpen && (
          <div className="absolute top-full right-0 mt-1 w-60 glass-surface border border-codex-border rounded-codex-lg p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={handleAddSubpage}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-codex-md text-sm text-codex-foreground hover:bg-codex-surface-secondary transition-colors text-left"
            >
              <Plus className="w-4 h-4 text-codex-muted" />
              <span>Add subpage</span>
            </button>

            <button
              type="button"
              onClick={handleExportMarkdown}
              disabled={isExporting}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-codex-md text-sm text-codex-foreground hover:bg-codex-surface-secondary transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-codex-muted" />
              <span>{isExporting ? "Exporting…" : "Export to Markdown"}</span>
            </button>

            {/* Page metadata lives here instead of cluttering the canvas */}
            <div className="mt-1 pt-2 pb-1 px-2 border-t border-codex-border space-y-0.5 text-xs text-codex-muted">
              {lastEditedAt && (
                <p title={formatFullDate(lastEditedAt)}>Edited {formatTimeAgo(lastEditedAt)}</p>
              )}
              {page.createdAt && <p>Created {formatFullDate(page.createdAt)}</p>}
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex-1 flex flex-col relative w-full">
      <TopBar items={breadcrumbItems} actions={topBarActions} />

      {/* Cover image banner */}
      {coverImage && (
        <div className="group/cover relative w-full h-40 sm:h-56 shrink-0 overflow-hidden bg-codex-surface-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/cover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleAddCover}
              className="px-2 py-1 rounded-codex-md text-xs font-medium bg-codex-background/80 text-codex-foreground backdrop-blur-sm hover:bg-codex-background transition-colors"
            >
              Change cover
            </button>
            <button
              type="button"
              onClick={() => handleSetCover(null)}
              className="px-2 py-1 rounded-codex-md text-xs font-medium bg-codex-background/80 text-codex-foreground backdrop-blur-sm hover:bg-codex-background transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div
        className={`flex-1 flex flex-col w-full mx-auto pl-10 pr-6 sm:px-12 pb-24 transition-all duration-200 ${
          coverImage ? "pt-6" : "pt-12 sm:pt-20"
        } ${isFullWidth ? "max-w-none xl:pr-20" : "max-w-3xl"}`}
      >
        {/* Page Header: Icon & Title */}
        <div className="group/title mb-2">
          {/* Add cover affordance: only when the page has no cover yet */}
          {!coverImage && (
            <button
              type="button"
              onClick={handleAddCover}
              className="inline-flex items-center gap-1.5 mb-2 px-1.5 py-1 -ml-1.5 rounded-codex-md text-sm text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground transition-all duration-150 opacity-0 group-hover/title:opacity-100 focus-visible:opacity-100"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Add cover</span>
            </button>
          )}

          <div className="relative" ref={emojiPickerRef}>
            {icon ? (
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="text-5xl leading-none p-1 -ml-1 mb-3 rounded-codex-md hover:bg-codex-surface-secondary transition-colors"
                aria-label="Change icon"
                title="Change icon"
              >
                {icon}
              </button>
            ) : (
              // Revealed on hover so an empty page stays visually quiet
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className={`inline-flex items-center gap-1.5 mb-2 px-1.5 py-1 -ml-1.5 rounded-codex-md text-sm text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground transition-all duration-150 focus-visible:opacity-100 ${
                  isEmojiPickerOpen ? "opacity-100" : "opacity-0 group-hover/title:opacity-100"
                }`}
              >
                <Smile className="w-4 h-4" />
                <span>Add icon</span>
              </button>
            )}

            {isEmojiPickerOpen && (
              <div className="absolute left-0 top-full z-50 glass-surface border border-codex-border rounded-codex-lg p-2 w-60 animate-in fade-in zoom-in-95 duration-100">
                <div className="grid grid-cols-6 gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => handleSelectIcon(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg rounded-codex-md hover:bg-codex-surface-secondary transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {icon && (
                  <button
                    type="button"
                    onClick={() => handleSelectIcon(null)}
                    className="w-full mt-1 px-2 py-1.5 rounded-codex-md text-left text-xs text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground transition-colors"
                  >
                    Remove icon
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Editable Title */}
          <textarea
            ref={titleInputRef}
            rows={1}
            value={title}
            placeholder="Untitled"
            aria-label="Page title"
            onChange={(e) => {
              setTitle(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                titleInputRef.current?.blur();
              }
            }}
            className="w-full text-4xl font-bold bg-transparent text-codex-foreground placeholder:text-codex-muted/40 outline-none resize-none overflow-hidden border-none p-0 tracking-tight leading-tight"
          />
        </div>

        {/* Block Editor Area */}
        <BlockEditor
          pageId={page.id}
          onSaveStatusChange={handleSaveStatusChange}
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}

export default function PageView() {
  const params = useParams();
  const pageId = params?.["pageId"] as string;
  const { pages, isInitialized } = usePageStore();
  const currentPage = pages.find((p) => p.id === pageId);

  // Pages haven't been fetched yet — show Skeleton instead of "not found"
  if (!isInitialized) {
    return (
      <div className="flex-1 flex flex-col relative w-full">
        <PageHeaderSkeleton />
        <PageContentSkeleton />
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <FileText className="w-10 h-10 text-codex-muted opacity-40 mb-3" />
        <h2 className="text-base font-semibold text-codex-foreground">Page not found</h2>
        <p className="text-xs text-codex-muted mt-1 mb-4">
          This page may have been deleted or archived.
        </p>
        <Link
          href="/workspace"
          className="inline-flex items-center gap-1.5 text-xs text-codex-accent hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </Link>
      </div>
    );
  }

  return <PageDetail key={currentPage.id} page={currentPage} />;
}
