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
import { promptDialog } from "@/stores/dialog-store";
import { validateImageUrl } from "@/lib/url";
import { AnimatePresence, m } from "motion/react";
import { TWEEN, TWEEN_FAST } from "@/components/motion";
import { PopPanel } from "@/components/motion/pop-panel";
import { TOP_BAR_ICON_BUTTON, TopBar } from "../_components/top-bar";
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
  saving: "Saving",
  saved: "Saved",
  error: "Not saved",
};

/** Status readout color: neutral while saving, green once saved, red on failure */
const SAVE_STATUS_TONE: Record<Exclude<SaveStatus, "idle">, string> = {
  saving: "text-codex-muted",
  saved: "text-codex-success",
  error: "text-codex-danger",
};

/** Quiet text button that reveals page affordances (add icon / add cover) */
const GHOST_BUTTON =
  "inline-flex h-8 items-center gap-1.5 -ml-2 px-2 rounded-codex-md text-sm text-codex-muted transition-[opacity,color,background-color] duration-150 hover:bg-codex-surface-secondary hover:text-codex-foreground focus-visible:opacity-100 pointer-coarse:h-11";

/** Pill over the cover image: opaque enough to read on any photo, no blur */
const COVER_BUTTON =
  "inline-flex h-8 items-center rounded-full border border-codex-border-strong bg-codex-background/85 px-3 font-mono text-xs uppercase tracking-label text-codex-foreground transition-colors duration-150 hover:border-codex-muted pointer-coarse:h-11";

const MENU_ITEM =
  "w-full flex h-9 items-center gap-2.5 px-2.5 rounded-codex-md text-sm text-codex-foreground hover:bg-codex-surface-raised transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed";

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

  async function handleAddCover() {
    setIsOptionsOpen(false);
    const url = await promptDialog({
      title: coverImage ? "Change cover" : "Add cover",
      label: "Image URL",
      placeholder: "https://example.com/cover.jpg",
      defaultValue: coverImage ?? "",
      inputType: "url",
      confirmLabel: coverImage ? "Change cover" : "Add cover",
      validate: validateImageUrl,
    });
    if (url && url !== coverImage) void handleSetCover(url);
  }

  async function handleExportMarkdown() {
    setIsOptionsOpen(false);
    setIsExporting(true);
    try {
      // Fetch the latest content so unsaved debounced edits aren't missed
      // Serializer (marked) is only downloaded when someone actually exports
      const [res, { pageToMarkdown, downloadMarkdown, markdownFileName }] = await Promise.all([
        getPage(page.id),
        import("@/lib/markdown-export"),
      ]);
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
          className="px-2 font-mono text-xs uppercase tracking-label text-codex-danger animate-in fade-in duration-150"
        >
          [ Error: export failed ]
        </span>
      )}

      {/* Save status: a dot and a mono readout, only while something is happening */}
      {saveStatus !== "idle" && (
        <span
          role="status"
          className={`flex items-center gap-1.5 px-2 font-mono text-xs uppercase tracking-label animate-in fade-in duration-150 ${SAVE_STATUS_TONE[saveStatus]}`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full bg-current ${
              saveStatus === "saving" ? "motion-safe:animate-pulse" : ""
            }`}
          />
          {SAVE_STATUS_LABEL[saveStatus]}
        </span>
      )}

      <div className="relative" ref={optionsRef}>
        <button
          type="button"
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className={`${TOP_BAR_ICON_BUTTON} ${
            isOptionsOpen ? "bg-codex-surface-raised text-codex-foreground" : ""
          }`}
          aria-label="Page options"
          aria-expanded={isOptionsOpen}
          title="Page options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        <PopPanel
          open={isOptionsOpen}
          origin="top right"
          className="absolute top-full right-0 mt-1 w-60 glass-surface rounded-codex-lg border border-codex-border-strong p-1 z-50"
        >
          <button type="button" onClick={handleAddSubpage} className={MENU_ITEM}>
            <Plus className="w-4 h-4 text-codex-muted" />
            <span>Add subpage</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            disabled={isExporting}
            className={MENU_ITEM}
          >
            <Download className="w-4 h-4 text-codex-muted" />
            <span>{isExporting ? "Exporting…" : "Export to Markdown"}</span>
          </button>

          {/* Page metadata lives here instead of cluttering the canvas */}
          <div className="mx-2 my-1 h-px bg-codex-border" />
          <dl className="px-2.5 pt-1.5 pb-2 space-y-1 font-mono text-xs uppercase tracking-label">
            {lastEditedAt && (
              <div className="flex justify-between gap-3" title={formatFullDate(lastEditedAt)}>
                <dt className="text-codex-muted/70">Edited</dt>
                <dd className="text-codex-muted">{formatTimeAgo(lastEditedAt)}</dd>
              </div>
            )}
            {page.createdAt && (
              <div className="flex justify-between gap-3" title={formatFullDate(page.createdAt)}>
                <dt className="text-codex-muted/70">Created</dt>
                <dd className="text-codex-muted">{formatTimeAgo(page.createdAt)}</dd>
              </div>
            )}
          </dl>
        </PopPanel>
      </div>
    </>
  );

  return (
    <div className="flex-1 flex flex-col relative w-full">
      <TopBar items={breadcrumbItems} actions={topBarActions} showScrollProgress />

      {/* Cover image banner: unfolds when added, folds away when removed.
          Mounting with the page (initial={false}) skips the unfold so the
          editor doesn't jump on load — the image itself eases in instead. */}
      <AnimatePresence initial={false}>
        {coverImage && (
          <m.div
            key="cover"
            className="shrink-0 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={TWEEN}
          >
            {/* Full bleed, closed off from the page by a hairline */}
            <div className="group/cover relative w-full h-40 sm:h-56 overflow-hidden border-b border-codex-border bg-codex-surface-secondary">
              {/* Parallax wrapper (scroll-driven CSS) — kept separate from the
                  motion-driven <img> so the two transforms never collide */}
              <div className="cover-parallax absolute inset-0">
                <m.img
                  key={coverImage}
                  src={coverImage}
                  alt=""
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...TWEEN, duration: 0.5 }}
                />
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover/cover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100 transition-opacity">
                <button type="button" onClick={handleAddCover} className={COVER_BUTTON}>
                  Change cover
                </button>
                <button type="button" onClick={() => handleSetCover(null)} className={COVER_BUTTON}>
                  Remove
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

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
              className={`${GHOST_BUTTON} mb-1 opacity-0 group-hover/title:opacity-100 pointer-coarse:opacity-100`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Add cover</span>
            </button>
          )}

          <div className="relative" ref={emojiPickerRef}>
            {icon ? (
              // key={icon}: every new icon fades in on its own
              <m.button
                key={icon}
                type="button"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="text-5xl leading-none p-1 -ml-1 mb-3 rounded-codex-md hover:bg-codex-surface-secondary transition-colors"
                aria-label="Change icon"
                title="Change icon"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={TWEEN_FAST}
              >
                {icon}
              </m.button>
            ) : (
              // Revealed on hover so an empty page stays visually quiet
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className={`${GHOST_BUTTON} mb-1 ${
                  isEmojiPickerOpen
                    ? "opacity-100"
                    : "opacity-0 group-hover/title:opacity-100 pointer-coarse:opacity-100"
                }`}
              >
                <Smile className="w-4 h-4" />
                <span>Add icon</span>
              </button>
            )}

            <PopPanel
              open={isEmojiPickerOpen}
              origin="top left"
              className="absolute left-0 top-full z-50 w-60 glass-surface rounded-codex-lg border border-codex-border-strong p-2"
            >
              <p className="px-1 pb-2 font-mono text-xs uppercase tracking-label text-codex-muted/80">
                Icon
              </p>
              <div className="grid grid-cols-6 gap-1">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => handleSelectIcon(emoji)}
                    className={`w-8 h-8 pointer-coarse:w-10 pointer-coarse:h-10 flex items-center justify-center text-lg rounded-codex-md transition-colors hover:bg-codex-surface-raised ${
                      emoji === icon
                        ? "bg-codex-surface-raised ring-1 ring-inset ring-codex-border-strong"
                        : ""
                    }`}
                    aria-label={`Use ${emoji} as icon`}
                    aria-pressed={emoji === icon}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {icon && (
                <>
                  <div className="my-2 h-px bg-codex-border" />
                  <button
                    type="button"
                    onClick={() => handleSelectIcon(null)}
                    className="flex h-8 w-full items-center px-2 rounded-codex-md text-left text-sm text-codex-muted transition-colors hover:bg-codex-surface-raised hover:text-codex-foreground"
                  >
                    Remove icon
                  </button>
                </>
              )}
            </PopPanel>
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
            // block: an inline textarea sits on the text baseline and leaves a
            // descender gap below it, which the page skeleton can't predict
            className="block w-full text-4xl font-semibold bg-transparent text-codex-foreground caret-codex-signal placeholder:text-codex-muted/40 outline-none resize-none overflow-hidden border-none p-0 tracking-tight leading-tight"
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
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <FileText className="w-8 h-8 text-codex-muted/60 mb-6" aria-hidden="true" />
        <p className="font-mono text-xs uppercase tracking-label text-codex-muted">
          [ Page not found ]
        </p>
        <p className="mt-3 text-sm text-codex-muted">
          This page may have been deleted or archived.
        </p>
        <Link
          href="/workspace"
          className="mt-8 inline-flex h-10 items-center gap-2 rounded-full border border-codex-border-strong px-5 font-mono text-xs uppercase tracking-label text-codex-foreground transition-colors hover:border-codex-muted"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to workspace</span>
        </Link>
      </div>
    );
  }

  return <PageDetail key={currentPage.id} page={currentPage} />;
}
