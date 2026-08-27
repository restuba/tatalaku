"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Page } from "@tatalaku/shared";
import { usePageStore } from "@/stores/page.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { BlockEditor } from "@/components/editor/block-editor";
import { ChevronRight, FileText, Plus, Trash2, Smile, ArrowLeft, Calendar } from "lucide-react";

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
    <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-6 sm:p-12">
      {/* Top Bar / Breadcrumb & Actions */}
      <div className="flex items-center justify-between text-xs text-codex-muted mb-8 select-none">
        <div className="flex items-center gap-1.5 flex-wrap truncate">
          <Link href="/workspace" className="hover:text-codex-foreground transition-colors">
            {activeWorkspace?.name || "Workspace"}
          </Link>
          {breadcrumbs.map((b) => (
            <div key={b.id} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-codex-muted shrink-0" />
              <Link
                href={`/workspace/${b.id}`}
                className="hover:text-codex-foreground truncate max-w-[120px] transition-colors"
              >
                {b.title || "Untitled"}
              </Link>
            </div>
          ))}
          <ChevronRight className="w-3 h-3 text-codex-muted shrink-0" />
          <span className="text-codex-foreground font-medium truncate max-w-[160px]">
            {page.title || "Untitled"}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-4">
          <button
            onClick={handleArchive}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-codex-muted hover:text-codex-danger hover:bg-codex-danger-bg/10 rounded-codex-sm transition-colors"
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
              className="text-4xl hover:opacity-80 transition-opacity p-1 -ml-1 rounded-codex-sm"
              title="Change icon"
            >
              {icon}
            </button>
          ) : (
            <button
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className="inline-flex items-center gap-1.5 text-xs text-codex-muted hover:text-codex-foreground py-1 rounded-codex-sm transition-colors"
            >
              <Smile className="w-4 h-4" />
              <span>Add icon</span>
            </button>
          )}

          {isEmojiPickerOpen && (
            <div className="absolute left-0 top-full mt-2 z-50 glass-surface border border-codex-border rounded-codex-xl p-3 w-64 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[11px] font-semibold text-codex-muted uppercase tracking-wider mb-2">
                Select Icon
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSelectIcon(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-lg rounded-codex-md hover:bg-codex-background transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {icon && (
                <button
                  onClick={() => handleSelectIcon(null)}
                  className="w-full text-center text-xs text-codex-danger hover:underline mt-2 pt-2 border-t border-codex-border"
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
          className="w-full text-4xl font-bold bg-transparent text-codex-foreground placeholder:text-codex-muted/40 outline-none resize-none border-none p-0 tracking-tight leading-tight"
        />

        {/* Metadata info */}
        <div className="flex items-center gap-4 text-xs text-codex-muted pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Created {new Date(page.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Subpages Section */}
      {childPages.length > 0 && (
        <div className="mb-8 pt-4 border-t border-codex-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-codex-muted">
              Subpages ({childPages.length})
            </h3>
            <button
              onClick={handleAddSubpage}
              className="inline-flex items-center gap-1 text-xs text-codex-accent hover:opacity-80 transition-opacity"
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
                className="flex items-center gap-2 p-3 rounded-codex-xl border border-codex-border bg-codex-surface hover:border-codex-accent/50 hover:bg-codex-surface/80 text-sm transition-all"
              >
                <span className="text-codex-muted">
                  {child.icon ? child.icon : <FileText className="w-4 h-4" />}
                </span>
                <span className="font-medium text-codex-foreground truncate">
                  {child.title || "Untitled"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Block Editor Area */}
      <BlockEditor pageId={page.id} />
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
