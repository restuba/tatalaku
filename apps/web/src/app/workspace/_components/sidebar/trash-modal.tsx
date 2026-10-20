"use client";

import { useEffect, useState } from "react";
import { usePageStore } from "@/stores/page-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { RefreshCcw, FileText, Trash2, X, Check } from "lucide-react";
import { Modal } from "@/components/reusable/modal";
import { Button } from "@/components/reusable/button";
import { formatTimeAgo } from "@/lib/date";
import { LogoSpinner } from "@/components/ui/logo-spinner";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TrashModal({ isOpen, onClose }: TrashModalProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { archivedPages, fetchArchivedPages, restorePage, deletePagePermanently } = usePageStore();
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reset any pending delete confirmation when the modal transitions closed
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setConfirmingId(null);
  }

  async function handlePermanentDelete(id: string) {
    setDeletingId(id);
    try {
      await deletePagePermanently(id);
    } catch {
      // Error handled by store (rollback)
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  }

  useEffect(() => {
    if (isOpen && activeWorkspace) {
      const timeoutId = setTimeout(() => setLoading(true), 0);
      fetchArchivedPages(activeWorkspace.id).finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, activeWorkspace, fetchArchivedPages]);

  return (
    <Modal open={isOpen} onClose={onClose} maxWidth="md" fullWidth aria-label="Trash">
      <Modal.Header showClose divider>
        <div className="min-w-0">
          <span className="block leading-tight">Trash</span>
          <span className="mt-1 block font-sans text-sm font-normal text-codex-muted">
            Restore pages, or delete them for good.
          </span>
        </div>
      </Modal.Header>

      <Modal.Content className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <LogoSpinner size="md" text="Loading trash…" className="text-codex-muted" />
          </div>
        ) : archivedPages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <Trash2 className="size-6 text-codex-faint" aria-hidden="true" />
            <p className="text-sm font-medium text-codex-foreground">Trash is empty</p>
            <p className="text-sm text-codex-muted">
              Deleted pages stay here until you remove them.
            </p>
          </div>
        ) : (
          // -mx-2 lets the hover fill bleed past the text column
          <ul className="-mx-2 divide-y divide-codex-border">
            {archivedPages.map((page) => {
              const isConfirming = confirmingId === page.id;
              const isDeleting = deletingId === page.id;
              const title = page.title || "Untitled";

              return (
                <li
                  key={page.id}
                  className="group flex items-center justify-between gap-3 rounded-codex-md px-2 py-2 transition-colors hover:bg-codex-hover"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex w-5 shrink-0 justify-center leading-none">
                      {page.icon ?? (
                        <FileText className="size-4 text-codex-muted" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-codex-foreground">{title}</p>
                      <p className="text-xs tabular-nums text-codex-muted">
                        Deleted {formatTimeAgo(page.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {isConfirming ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="mr-1 text-sm text-codex-danger">Delete forever?</span>
                      <Button
                        variant="text"
                        color="danger"
                        size="small"
                        loading={isDeleting}
                        onClick={() => handlePermanentDelete(page.id)}
                        aria-label={`Confirm deleting ${title} forever`}
                        title="Delete forever"
                        icon={<Check className="size-4" />}
                      />
                      <Button
                        variant="text"
                        size="small"
                        disabled={isDeleting}
                        onClick={() => setConfirmingId(null)}
                        aria-label="Keep the page"
                        title="Cancel"
                        icon={<X className="size-4" />}
                      />
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => restorePage(page.id)}
                        aria-label={`Restore ${title}`}
                        title="Restore"
                        icon={<RefreshCcw className="size-4" />}
                      />
                      <Button
                        variant="text"
                        color="danger"
                        size="small"
                        onClick={() => setConfirmingId(page.id)}
                        aria-label={`Delete ${title} forever`}
                        title="Delete forever"
                        icon={<Trash2 className="size-4" />}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Modal.Content>
    </Modal>
  );
}

export default TrashModal;
