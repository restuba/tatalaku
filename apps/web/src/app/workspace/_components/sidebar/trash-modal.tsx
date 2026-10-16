"use client";

import { useEffect, useState } from "react";
import { usePageStore } from "@/stores/page-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { RefreshCcw, FileText, Trash2, X, Check } from "lucide-react";
import { Modal } from "@/components/reusable/modal";
import { Button } from "@/components/reusable/button";

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
    <Modal open={isOpen} onClose={onClose} maxWidth="sm" fullWidth aria-label="Trash">
      <Modal.Header showClose divider>
        <div className="flex items-center gap-2.5">
          <Trash2 className="w-4 h-4 shrink-0 text-codex-muted" />
          <span>Trash</span>
        </div>
      </Modal.Header>

      <Modal.Content className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <p className="py-12 text-center font-mono text-xs uppercase tracking-label text-codex-muted">
            [ Loading ]
          </p>
        ) : archivedPages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center text-codex-muted">
            <Trash2 className="w-6 h-6 text-codex-muted/60" />
            <p className="font-mono text-xs uppercase tracking-label">[ Trash is empty ]</p>
          </div>
        ) : (
          // Hairline-ruled rows; -mx-2 lets the hover fill bleed past the text column
          <div className="-mx-2 divide-y divide-codex-border">
            {archivedPages.map((page) => {
              const isConfirming = confirmingId === page.id;
              const isDeleting = deletingId === page.id;

              return (
                <div
                  key={page.id}
                  className="flex items-center justify-between gap-3 px-2 py-2 hover:bg-codex-surface-raised/60 group transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-codex-muted/70 shrink-0" />
                    <span className="text-sm truncate text-codex-foreground">
                      {page.title || "Untitled"}
                    </span>
                  </div>

                  {isConfirming ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="mr-1 font-mono text-xs uppercase tracking-label text-codex-muted">
                        Delete forever?
                      </span>
                      <Button
                        variant="text"
                        color="danger"
                        size="small"
                        loading={isDeleting}
                        onClick={() => handlePermanentDelete(page.id)}
                        title="Confirm permanent delete"
                        icon={<Check className="w-4 h-4" />}
                      />
                      <Button
                        variant="text"
                        size="small"
                        disabled={isDeleting}
                        onClick={() => setConfirmingId(null)}
                        title="Cancel"
                        icon={<X className="w-4 h-4" />}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100 transition-opacity">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => restorePage(page.id)}
                        title="Restore"
                        icon={<RefreshCcw className="w-4 h-4" />}
                      />
                      <Button
                        variant="text"
                        color="danger"
                        size="small"
                        onClick={() => setConfirmingId(page.id)}
                        title="Delete permanently"
                        icon={<Trash2 className="w-4 h-4" />}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
}

export default TrashModal;
