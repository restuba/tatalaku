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
import { DropdownMenu } from "@/components/reusable/dropdown-menu";
import { EmptyState } from "@/components/reusable/empty-state";
import { useApp } from "@/components/app";
import { formatTimeAgo, formatFullDate, toISODate } from "@/lib/date";
import { getPage } from "@/services/page/get-page";
import { promptDialog } from "@/stores/dialog-store";
import { validateImageUrl } from "@/lib/url";
import { COVER_PRESETS } from "@/lib/cover-presets";
import { AnimatePresence, m } from "motion/react";
import { TWEEN, TWEEN_FAST } from "@/components/motion";
import { PopPanel } from "@/components/motion/pop-panel";
import { TOP_BAR_ICON_BUTTON, TopBar } from "../_components/top-bar";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  FileText,
  Home,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Smile,
} from "lucide-react";

const COMMON_EMOJIS = ["📝", "🚀", "💡", "🎯", "📌", "✨", "📚", "🎨", "🔥", "📋", "💻", "⭐"];

const SAVE_STATUS_LABEL: Record<Exclude<SaveStatus, "idle">, string> = {
  saving: "Saving…",
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
  "inline-flex h-8 items-center gap-1.5 -ml-2 px-2 rounded-codex-md text-sm text-codex-muted transition-[opacity,color,background-color] duration-150 hover:bg-codex-hover hover:text-codex-foreground focus-visible:opacity-100 pointer-coarse:h-11";

/** Pill over the cover image: an opaque elevated chip, readable on any photo */
const COVER_BUTTON =
  "inline-flex h-8 items-center rounded-full border border-codex-border bg-codex-elevated px-3 text-sm font-medium text-codex-foreground shadow-codex-sm transition-colors duration-150 hover:bg-codex-surface-secondary pointer-coarse:h-11";

function PageDetail({ page }: { page: Page }) {
  const router = useRouter();
  const { message } = useApp();
  const { activeWorkspace } = useWorkspaceStore();
  const { pages, updatePage, createPage } = usePageStore();
  const isFullWidth = useHydratedFullWidth();

  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon);
  const [coverImage, setCoverImage] = useState(page.coverImage);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [localEditedAt, setLocalEditedAt] = useState<Date | string | null>(null);
  const lastEditedAt = localEditedAt || page.updatedAt || null;
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
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

  // Click outside or Escape closes the icon picker
  useEffect(() => {
    if (!isEmojiPickerOpen) return undefined;
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEmojiPickerOpen(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEmojiPickerOpen]);

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
    {
      label: activeWorkspace?.name || "Workspace",
      href: "/workspace",
      icon: <Home className="size-4" aria-hidden="true" />,
    },
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
    const url = await promptDialog({
      title: coverImage ? "Change cover" : "Add cover",
      description: "Pick a cover below, or paste a link to your own image.",
      label: "Image URL",
      placeholder: "https://example.com/cover.jpg",
      defaultValue: coverImage?.startsWith("data:") ? "" : (coverImage ?? ""),
      inputType: "url",
      confirmLabel: coverImage ? "Change cover" : "Add cover",
      validate: validateImageUrl,
      presets: COVER_PRESETS,
    });
    if (url && url !== coverImage) void handleSetCover(url);
  }

  async function handleExportMarkdown() {
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
      message.error("Couldn't export this page. Try again.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleAddSubpage() {
    if (!activeWorkspace) return;
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
      {/* Save status: a dot and a short readout, only while something is happening */}
      {saveStatus !== "idle" && (
        <span
          role="status"
          className={`hidden items-center gap-1.5 px-2 text-xs font-medium sm:flex animate-in fade-in duration-150 ${SAVE_STATUS_TONE[saveStatus]}`}
        >
          {saveStatus === "error" ? (
            <AlertCircle className="size-3.5" aria-hidden="true" />
          ) : (
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full bg-current ${
                saveStatus === "saving" ? "motion-safe:animate-pulse" : ""
              }`}
            />
          )}
          {SAVE_STATUS_LABEL[saveStatus]}
        </span>
      )}

      <DropdownMenu
        label="Page options"
        widthClassName="w-60"
        // Page metadata lives here instead of cluttering the canvas. It sits
        // outside the menu itself, which may only hold menu items.
        footer={
          <dl aria-label="Page details" className="space-y-1 px-2.5 pt-1.5 pb-2 text-xs">
            {lastEditedAt && (
              <div className="flex justify-between gap-3" title={formatFullDate(lastEditedAt)}>
                <dt className="text-codex-muted">Edited</dt>
                <dd className="tabular-nums text-codex-foreground">
                  {formatTimeAgo(lastEditedAt)}
                </dd>
              </div>
            )}
            {page.createdAt && (
              <div className="flex justify-between gap-3" title={formatFullDate(page.createdAt)}>
                <dt className="text-codex-muted">Created</dt>
                <dd className="tabular-nums text-codex-foreground">
                  {formatTimeAgo(page.createdAt)}
                </dd>
              </div>
            )}
          </dl>
        }
        trigger={(props, isOpen) => (
          <button
            type="button"
            {...props}
            className={`${TOP_BAR_ICON_BUTTON} ${isOpen ? "bg-codex-selected text-codex-foreground" : ""}`}
            aria-label="Page options"
            title="Page options"
          >
            <MoreHorizontal className="size-4" />
          </button>
        )}
      >
        <DropdownMenu.Item icon={<Plus className="size-4" />} onSelect={handleAddSubpage}>
          Add subpage
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<ImageIcon className="size-4" />}
          onSelect={() => void handleAddCover()}
        >
          {coverImage ? "Change cover" : "Add cover"}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Download className="size-4" />}
          disabled={isExporting}
          onSelect={() => void handleExportMarkdown()}
        >
          {isExporting ? "Exporting…" : "Export to Markdown"}
        </DropdownMenu.Item>
      </DropdownMenu>
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
            <div className="group/cover relative h-44 w-full overflow-hidden border-b border-codex-border bg-codex-surface-secondary sm:h-60">
              <m.img
                key={coverImage}
                src={coverImage}
                alt=""
                className="cover-img h-full w-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...TWEEN, duration: 0.4 }}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2 opacity-0 transition-opacity group-hover/cover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100">
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
        className={`flex-1 flex flex-col w-full mx-auto pl-10 pr-6 sm:px-12 pb-24 transition-[max-width,padding] duration-200 ${
          coverImage ? "pt-8" : "pt-8 sm:pt-12"
        } ${isFullWidth ? "max-w-none xl:pr-20" : "max-w-3xl"}`}
      >
        {/* Page header: icon, title, byline */}
        <div className="group/title mb-2">
          {/* Add cover affordance: only when the page has no cover yet */}
          {!coverImage && (
            <button
              type="button"
              onClick={handleAddCover}
              className={`${GHOST_BUTTON} mb-1 opacity-0 group-hover/title:opacity-100 pointer-coarse:opacity-100`}
            >
              <ImageIcon className="size-4" aria-hidden="true" />
              <span>Add cover</span>
            </button>
          )}

          <div className="relative" ref={emojiPickerRef}>
            {icon ? (
              // key={icon}: every new icon fades in on its own. With a cover,
              // the icon straddles its bottom edge (pulled up, on an opaque
              // tile) the way an editorial masthead sits over its banner.
              <m.button
                key={icon}
                type="button"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className={`mb-3 rounded-codex-md text-5xl leading-none transition-colors hover:bg-codex-hover ${
                  coverImage
                    ? "relative -mt-[2.2rem] inline-flex bg-codex-background p-2 shadow-codex-sm"
                    : "-ml-1 p-1"
                }`}
                aria-label="Change icon"
                aria-expanded={isEmojiPickerOpen}
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
                aria-expanded={isEmojiPickerOpen}
                className={`${GHOST_BUTTON} mb-1 ${
                  isEmojiPickerOpen
                    ? "opacity-100"
                    : "opacity-0 group-hover/title:opacity-100 pointer-coarse:opacity-100"
                }`}
              >
                <Smile className="size-4" aria-hidden="true" />
                <span>Add icon</span>
              </button>
            )}

            <PopPanel
              open={isEmojiPickerOpen}
              origin="top left"
              className="surface-popover absolute left-0 top-full z-50 w-64 rounded-codex-lg p-2"
            >
              <p className="eyebrow px-1 pb-2 text-codex-muted">Icon</p>
              <div className="grid grid-cols-6 gap-1" role="group" aria-label="Choose an icon">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => handleSelectIcon(emoji)}
                    className={`flex size-9 items-center justify-center rounded-codex-md text-lg transition-colors hover:bg-codex-hover pointer-coarse:size-10 ${
                      emoji === icon
                        ? "bg-codex-selected ring-1 ring-inset ring-codex-border-strong"
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
                    className="flex h-8 w-full items-center rounded-codex-md px-2 text-left text-sm text-codex-foreground transition-colors hover:bg-codex-hover"
                  >
                    Remove icon
                  </button>
                </>
              )}
            </PopPanel>
          </div>

          {/* Editable title in the editorial serif */}
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
            className="block w-full resize-none overflow-hidden border-none bg-transparent p-0 font-serif text-3xl font-medium leading-[1.15] tracking-tight text-codex-foreground caret-codex-accent outline-none placeholder:text-codex-faint sm:text-[2.625rem]"
          />

          {lastEditedAt && (
            <p className="mt-3 text-xs tabular-nums text-codex-muted">
              Edited{" "}
              <time dateTime={toISODate(lastEditedAt)} title={formatFullDate(lastEditedAt)}>
                {formatTimeAgo(lastEditedAt)}
              </time>
            </p>
          )}
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
      <EmptyState
        icon={<FileText className="size-5" />}
        title="Page not found"
        description="This page may have been deleted or moved to Trash."
        actions={
          <Link
            href="/workspace"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-codex-border-strong px-4 text-sm font-medium text-codex-foreground transition-colors hover:bg-codex-hover pointer-coarse:h-11"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Home
          </Link>
        }
      />
    );
  }

  return <PageDetail key={currentPage.id} page={currentPage} />;
}
