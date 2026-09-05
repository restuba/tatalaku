"use client";

import { useEffect, useState } from "react";
import { usePageStore } from "@/stores/page-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { RefreshCcw, FileText, Trash2 } from "lucide-react";
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
  const { archivedPages, fetchArchivedPages, restorePage } = usePageStore();
  const [loading, setLoading] = useState(false);

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
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-muted" />
          <span>Trash</span>
        </div>
      </Modal.Header>

      <Modal.Content className="p-4 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <p className="text-sm text-muted text-center py-8">Loading...</p>
        ) : archivedPages.length === 0 ? (
          <div className="text-center py-10 px-4 text-muted">
            <Trash2 className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Tidak ada page di trash</p>
          </div>
        ) : (
          <div className="space-y-2">
            {archivedPages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-3 hover:bg-surface-secondary/50 rounded-codex-md group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-muted shrink-0" />
                  <span className="text-sm truncate text-ink">{page.title || "Untitled"}</span>
                </div>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => restorePage(page.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-success"
                  title="Restore"
                  icon={<RefreshCcw className="w-4 h-4" />}
                />
              </div>
            ))}
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
}

export default TrashModal;
