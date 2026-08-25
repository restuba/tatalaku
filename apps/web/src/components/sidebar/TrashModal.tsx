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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <Trash2 className="w-5 h-5 text-neutral-500" />
            Trash
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <p className="text-sm text-neutral-500 text-center py-8">Loading...</p>
          ) : archivedPages.length === 0 ? (
            <div className="text-center py-10 px-4 text-neutral-400">
              <Trash2 className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Tidak ada page di trash</p>
            </div>
          ) : (
            <div className="space-y-1">
              {archivedPages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="text-sm truncate text-neutral-700 dark:text-neutral-300">
                      {page.title || "Untitled"}
                    </span>
                  </div>
                  <button
                    onClick={() => restorePage(page.id)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-green-600 dark:hover:text-green-400 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
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
