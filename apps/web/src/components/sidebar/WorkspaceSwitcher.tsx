"use client";

import { useState, useRef, useEffect } from "react";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { ChevronDown, Plus, Check, Briefcase, Trash2 } from "lucide-react";

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace, deleteWorkspace } =
    useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      await createWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName("");
      setIsCreating(false);
      setIsOpen(false);
    } catch {
      // Error handled by store
    }
  }

  async function handleDeleteWorkspace(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this workspace and all its pages?")) {
      try {
        await deleteWorkspace(id);
      } catch {
        // Error handled by store
      }
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-semibold shrink-0">
            {activeWorkspace?.name?.charAt(0).toUpperCase() || "W"}
          </div>
          <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200 truncate">
            {activeWorkspace?.name || "Select Workspace"}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-1.5 min-w-[240px] animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-2 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Workspaces
          </div>

          <div className="space-y-0.5 max-h-56 overflow-y-auto">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => {
                  setActiveWorkspace(ws);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-sm cursor-pointer group transition-colors ${
                  activeWorkspace?.id === ws.id
                    ? "bg-neutral-100 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-white"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Briefcase className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="truncate">{ws.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {activeWorkspace?.id === ws.id && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                  {workspaces.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteWorkspace(ws.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 rounded transition-all"
                      title="Delete workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1.5 pt-1.5">
            {isCreating ? (
              <form onSubmit={handleCreateWorkspace} className="p-1 space-y-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Workspace name..."
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-neutral-900/20 dark:focus:ring-neutral-100/20"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newWorkspaceName.trim()}
                    className="px-2.5 py-1 text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-md disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New workspace</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
