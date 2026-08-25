"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Page } from "@tatalaku/shared";
import { usePageStore } from "@/stores/page.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import {
  ChevronRight,
  FileText,
  Plus,
  Trash2,
  Smile,
  Sparkles,
  ArrowLeft,
  Calendar,
} from "lucide-react";

const COMMON_EMOJIS = ["📝", "🚀", "💡", "🎯", "📌", "✨", "📚", "🎨", "🔥", "📋", "💻", "⭐"];

function PageDetail({ page }: { page: Page }) {
  const router = useRouter();
  const { activeWorkspace } = useWorkspaceStore();
  const { pages, updatePage, archivePage, createPage } = usePageStore();

  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);

  // Build breadcrumb hierarchy
  const breadcrumbs: Page[] = [];
  let curr: Page | undefined = page;
  while (curr?.parentPageId) {
    const parent = pages.find((p) => p.id === curr?.parentPageId);
    if (parent) {
      breadcrumbs.unshift(parent);
      curr = parent;
    } else {
      break;
    }
  }

  const childPages = pages.filter((p) => p.parentPageId === page.id && !p.isArchived);

  async function handleTitleBlur() {
    const finalTitle = title.trim() || "Untitled";
    if (finalTitle !== page.title) {
      await updatePage(page.id, { title: finalTitle });
    }
  }

  async function handleSelectIcon(selectedIcon: string | null) {
    setIcon(selectedIcon);
    setIsEmojiPickerOpen(false);
    await updatePage(page.id, { icon: selectedIcon });
  }

  async function handleArchive() {
    if (confirm("Move this page and its subpages to archive?")) {
      await archivePage(page.id);
      router.push("/workspace");
    }
  }

  async function handleAddSubpage() {
    if (!activeWorkspace) return;
    const subpage = await createPage({
      workspaceId: activeWorkspace.id,
      parentPageId: page.id,
      title: "Untitled",
    });
    router.push(`/workspace/${subpage.id}`);
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-6 sm:p-12">
      {/* Top Bar / Breadcrumb & Actions */}
      <div className="flex items-center justify-between text-xs text-neutral-500 mb-8 select-none">
        <div className="flex items-center gap-1.5 flex-wrap truncate">
          <Link
            href="/workspace"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {activeWorkspace?.name || "Workspace"}
          </Link>
          {breadcrumbs.map((b) => (
            <div key={b.id} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
              <Link
                href={`/workspace/${b.id}`}
                className="hover:text-neutral-900 dark:hover:text-white truncate max-w-[120px] transition-colors"
              >
                {b.title || "Untitled"}
              </Link>
            </div>
          ))}
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate max-w-[160px]">
            {page.title || "Untitled"}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-4">
          <button
            onClick={handleArchive}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            title="Archive page"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archive</span>
          </button>
        </div>
      </div>

      {/* Page Header: Icon & Title */}
      <div className="mb-6 space-y-3">
        {/* Icon picker toggle */}
        <div className="relative inline-block">
          {icon ? (
            <button
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className="text-4xl hover:opacity-80 transition-opacity p-1 -ml-1 rounded-lg"
              title="Change icon"
            >
              {icon}
            </button>
          ) : (
            <button
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 py-1 rounded-lg transition-colors"
            >
              <Smile className="w-4 h-4" />
              <span>Add icon</span>
            </button>
          )}

          {isEmojiPickerOpen && (
            <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-3 w-64 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Select Icon
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSelectIcon(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {icon && (
                <button
                  onClick={() => handleSelectIcon(null)}
                  className="w-full text-center text-xs text-red-500 hover:underline mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800"
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
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              titleInputRef.current?.blur();
            }
          }}
          className="w-full text-4xl font-bold bg-transparent text-neutral-950 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 outline-none resize-none border-none p-0 tracking-tight leading-tight"
        />

        {/* Metadata info */}
        <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Created {new Date(page.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Subpages Section */}
      {childPages.length > 0 && (
        <div className="mb-8 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Subpages ({childPages.length})
            </h3>
            <button
              onClick={handleAddSubpage}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Plus className="w-3 h-3" />
              <span>Add subpage</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {childPages.map((child) => (
              <Link
                key={child.id}
                href={`/workspace/${child.id}`}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-white dark:hover:bg-neutral-900 text-sm transition-all"
              >
                <span className="text-neutral-400">
                  {child.icon ? child.icon : <FileText className="w-4 h-4" />}
                </span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {child.title || "Untitled"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Editor Placeholder Container */}
      <div className="flex-1 min-h-[300px] border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-neutral-50/30 dark:bg-neutral-950/30 mt-4">
        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Empty page ready for blocks
        </p>
        <p className="text-xs text-neutral-400 max-w-sm mt-1">
          Block-based editor (paragraphs, headings, lists, toggles, code) will be connected here in
          the next step.
        </p>
        <button
          onClick={handleAddSubpage}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add subpage</span>
        </button>
      </div>
    </div>
  );
}

export default function PageView() {
  const params = useParams();
  const pageId = params?.["pageId"] as string;
  const { pages } = usePageStore();
  const currentPage = pages.find((p) => p.id === pageId);

  if (!currentPage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <FileText className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mb-3" />
        <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
          Page not found
        </h2>
        <p className="text-xs text-neutral-500 mt-1 mb-4">
          This page may have been deleted or archived.
        </p>
        <Link
          href="/workspace"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </Link>
      </div>
    );
  }

  return <PageDetail key={currentPage.id} page={currentPage} />;
}
