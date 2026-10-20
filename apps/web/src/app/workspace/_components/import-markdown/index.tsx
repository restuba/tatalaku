"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, UploadCloud, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/reusable/modal";
import { Button } from "@/components/reusable/button";
import { useUIStore } from "@/stores/ui-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usePageStore } from "@/stores/page-store";
import { isMarkdownFile, MarkdownImportError, MAX_MARKDOWN_FILE_SIZE } from "@/lib/markdown-file";

type ItemStatus = "pending" | "importing" | "done" | "error";

interface ImportItem {
  file: File;
  status: ItemStatus;
  error?: string;
  pageId?: string;
}

const MAX_KB = Math.round(MAX_MARKDOWN_FILE_SIZE / 1024);

function StatusIcon({ status }: { status: ItemStatus }) {
  switch (status) {
    case "importing":
      return <Loader2 className="w-4 h-4 text-codex-muted animate-spin shrink-0" />;
    case "done":
      return <CheckCircle2 className="w-4 h-4 text-codex-success shrink-0" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-codex-danger shrink-0" />;
    default:
      return <FileText className="w-4 h-4 text-codex-muted shrink-0" />;
  }
}

export function ImportMarkdownModal() {
  const router = useRouter();
  const { isImportMarkdownOpen, setImportMarkdownOpen } = useUIStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { importPage } = usePageStore();

  const [items, setItems] = useState<ImportItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setItems([]);
    setIsDragging(false);
    setIsImporting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (isImporting) return;
    setImportMarkdownOpen(false);
    reset();
  }, [isImporting, setImportMarkdownOpen, reset]);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList)
      .filter(isMarkdownFile)
      .map<ImportItem>((file) => ({ file, status: "pending" }));
    if (next.length === 0) return;
    // De-dupe by name+size so dropping the same file twice doesn't stack
    setItems((prev) => {
      const seen = new Set(prev.map((i) => `${i.file.name}:${i.file.size}`));
      return [...prev, ...next.filter((i) => !seen.has(`${i.file.name}:${i.file.size}`))];
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleImport = useCallback(async () => {
    if (!activeWorkspace || items.length === 0) return;
    setIsImporting(true);

    let lastPageId: string | undefined;

    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      if (!current || current.status === "done") continue;

      setItems((prev) =>
        prev.map((it, idx) => {
          if (idx !== i) return it;
          const next: ImportItem = { file: it.file, status: "importing" };
          return next;
        }),
      );

      try {
        // Parser (marked + schema) is only downloaded when an import runs
        const { parseMarkdownFile } = await import("@/lib/markdown-import");
        const { title, content } = await parseMarkdownFile(current.file);
        const page = await importPage({
          workspaceId: activeWorkspace.id,
          title,
          content,
        });
        lastPageId = page.id;
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i ? { file: it.file, status: "done", pageId: page.id } : it,
          ),
        );
      } catch (err) {
        const message =
          err instanceof MarkdownImportError ? err.message : "Failed to import. Please try again.";
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i ? { file: it.file, status: "error", error: message } : it,
          ),
        );
      }
    }

    setIsImporting(false);

    // If everything succeeded, close and jump to the last imported page
    setItems((prev) => {
      const allDone = prev.length > 0 && prev.every((it) => it.status === "done");
      if (allDone && lastPageId) {
        setImportMarkdownOpen(false);
        router.push(`/workspace/${lastPageId}`);
        reset();
      }
      return prev;
    });
  }, [activeWorkspace, items, importPage, router, setImportMarkdownOpen, reset]);

  const pendingCount = items.filter((it) => it.status !== "done").length;

  return (
    <Modal open={isImportMarkdownOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <Modal.Header showClose divider>
        <div className="min-w-0">
          <span className="block leading-tight">Import from Markdown</span>
          <span className="mt-1 block font-sans text-sm font-normal text-codex-muted">
            Each file becomes a new page in {activeWorkspace?.name ?? "this workspace"}.
          </span>
        </div>
      </Modal.Header>

      <Modal.Content className="space-y-3 max-h-[60vh] overflow-y-auto">
        {/* Dropzone: a dashed outline that brightens on hover; raised while a file is over it */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`group w-full flex flex-col items-center justify-center gap-2 py-10 px-4 rounded-codex-lg border border-dashed transition-colors duration-150 ${
            isDragging
              ? "border-codex-accent bg-codex-accent-soft"
              : "border-codex-border-strong bg-codex-surface-secondary hover:border-codex-accent"
          }`}
        >
          <UploadCloud
            aria-hidden="true"
            className={`mb-1 size-6 transition-colors ${
              isDragging ? "text-codex-accent" : "text-codex-muted group-hover:text-codex-accent"
            }`}
          />
          <span className="text-sm font-medium text-codex-foreground">
            Drop <code className="font-mono text-xs">.md</code> files here, or click to browse
          </span>
          <span className="text-xs text-codex-muted">Up to {MAX_KB} KB per file</span>
          <input
            ref={inputRef}
            type="file"
            accept=".md,.markdown,text/markdown"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </button>

        {/* Selected files: hairline-ruled rows in an outlined list */}
        {items.length > 0 && (
          <ul className="rounded-codex-lg border border-codex-border bg-codex-elevated divide-y divide-codex-border">
            {items.map((item, index) => (
              <li
                key={`${item.file.name}:${item.file.size}`}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <StatusIcon status={item.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-codex-foreground truncate">{item.file.name}</p>
                  {item.status === "error" && item.error && (
                    <p role="alert" className="text-xs text-codex-danger">
                      {item.error}
                    </p>
                  )}
                </div>
                {!isImporting && item.status !== "done" && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="flex size-6 shrink-0 items-center justify-center rounded-codex-sm text-codex-muted transition-colors hover:bg-codex-hover hover:text-codex-foreground pointer-coarse:size-9"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal.Content>

      <Modal.Action divider>
        <Button variant="text" onClick={handleClose} disabled={isImporting}>
          Cancel
        </Button>
        <Button
          btnType="primary"
          color="primary"
          onClick={handleImport}
          loading={isImporting}
          disabled={!activeWorkspace || pendingCount === 0}
        >
          {isImporting
            ? "Importing…"
            : pendingCount > 1
              ? `Import ${pendingCount} pages`
              : "Import"}
        </Button>
      </Modal.Action>
    </Modal>
  );
}

export default ImportMarkdownModal;
