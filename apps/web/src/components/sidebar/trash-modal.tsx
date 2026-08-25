import { useEffect, useState } from "react";
import { usePageStore } from "@/stores/page.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { X, RefreshCcw, FileText, Trash2 } from "lucide-react";

export function TrashModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-codex-foreground/50 p-4">
      <div className="w-full max-w-md glass-surface border border-codex-border rounded-codex-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-codex-border">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-codex-foreground">
            <Trash2 className="w-5 h-5 text-codex-muted" />
            Trash
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-codex-sm hover:bg-codex-background text-codex-muted hover:text-codex-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-codex-muted text-center py-8">Loading...</p>
          ) : archivedPages.length === 0 ? (
            <div className="text-center py-10 px-4 text-codex-muted">
              <Trash2 className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Tidak ada page di trash</p>
            </div>
          ) : (
            <div className="space-y-2">
              {archivedPages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 hover:bg-codex-background rounded-codex-md group transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-codex-muted shrink-0" />
                    <span className="text-sm truncate text-codex-foreground">
                      {page.title || "Untitled"}
                    </span>
                  </div>
                  <button
                    onClick={() => restorePage(page.id)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-codex-muted hover:text-codex-success rounded-codex-sm hover:bg-codex-success-bg"
                    title="Restore"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
