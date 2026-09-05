"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useAuthStore } from "@/stores/auth.store";
import { Building, Copy, Check, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export function GeneralTab({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { activeWorkspace, updateWorkspace, deleteWorkspace, workspaces } = useWorkspaceStore();
  const { user } = useAuthStore();

  const [name, setName] = useState(activeWorkspace?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!activeWorkspace) {
    return (
      <div className="py-12 text-center text-codex-muted text-xs">
        No active workspace selected.
      </div>
    );
  }

  const isOwner = user?.id === activeWorkspace.ownerId;
  const isNameChanged = name.trim() !== activeWorkspace.name && name.trim().length > 0;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!activeWorkspace || !isNameChanged) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateWorkspace(activeWorkspace.id, name.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update workspace name");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCopyId() {
    if (!activeWorkspace) return;
    navigator.clipboard.writeText(activeWorkspace.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  async function handleDeleteWorkspace() {
    if (!activeWorkspace) return;
    if (deleteConfirmText !== activeWorkspace.name) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace(activeWorkspace.id);
      setShowDeleteModal(false);
      if (onClose) onClose();

      // If there are other workspaces, navigate to the next one, otherwise root workspace
      const remaining = workspaces.filter((w) => w.id !== activeWorkspace.id);
      if (remaining.length > 0 && remaining[0]) {
        router.push("/workspace");
      } else {
        router.push("/workspace");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete workspace");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Workspace Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-5 rounded-codex-xl border border-codex-border bg-codex-surface flex items-center gap-4">
          <div className="w-12 h-12 rounded-codex-lg bg-codex-surface-secondary border border-codex-border flex items-center justify-center text-codex-foreground font-bold text-lg shrink-0">
            {activeWorkspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-sm font-semibold text-codex-foreground truncate">
              {activeWorkspace.name}
            </h4>
            <p className="text-xs text-codex-muted">
              {isOwner ? "Owner (Full Admin Access)" : "Member"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="ws-name"
            className="text-xs font-semibold text-codex-muted uppercase tracking-wider"
          >
            Workspace Name
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="ws-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwner}
                placeholder="Workspace name"
                className="w-full px-3 py-2 pl-9 rounded-codex-md border border-codex-border bg-codex-background text-sm text-codex-foreground outline-none focus:border-codex-accent transition-colors disabled:opacity-60"
              />
              <Building className="w-4 h-4 text-codex-muted absolute left-3 top-2.5" />
            </div>
            {isOwner && (
              <button
                type="submit"
                disabled={!isNameChanged || isSaving}
                className="px-4 py-2 rounded-codex-md bg-codex-accent text-codex-background text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            )}
          </div>
          {saveSuccess && (
            <p className="text-xs text-codex-success flex items-center gap-1 mt-1">
              <Check className="w-3.5 h-3.5" />
              <span>Workspace name updated successfully.</span>
            </p>
          )}
          {saveError && <p className="text-xs text-codex-danger mt-1">{saveError}</p>}
        </div>
      </form>

      {/* Workspace Details */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-semibold text-codex-muted uppercase tracking-wider">
          Workspace ID
        </label>
        <div className="flex items-center gap-2 p-2.5 rounded-codex-md border border-codex-border bg-codex-background">
          <span className="text-xs font-mono text-codex-muted truncate flex-1 select-all">
            {activeWorkspace.id}
          </span>
          <button
            onClick={handleCopyId}
            className="p-1 rounded-codex-sm hover:bg-codex-surface text-codex-muted hover:text-codex-foreground transition-colors shrink-0"
            title="Copy Workspace ID"
          >
            {copiedId ? (
              <Check className="w-3.5 h-3.5 text-codex-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      {isOwner && (
        <div className="pt-6 border-t border-codex-border space-y-4">
          <div className="rounded-codex-xl border border-codex-danger/30 bg-codex-danger-bg/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-codex-danger shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-codex-danger">Delete Workspace</h4>
                <p className="text-xs text-codex-muted leading-relaxed">
                  Permanently delete this workspace and all pages inside it. This action cannot be
                  undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3.5 py-1.5 rounded-codex-md bg-codex-danger text-white text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-codex-background/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-codex-2xl border border-codex-border bg-codex-surface p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-codex-danger flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Deletion</span>
              </h4>
              <p className="text-xs text-codex-muted">
                Type{" "}
                <span className="font-semibold text-codex-foreground">{activeWorkspace.name}</span>{" "}
                below to confirm:
              </p>
            </div>

            <input
              type="text"
              autoFocus
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={activeWorkspace.name}
              className="w-full px-3 py-2 rounded-codex-md border border-codex-border bg-codex-background text-sm text-codex-foreground outline-none focus:border-codex-danger transition-colors"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-codex-md border border-codex-border hover:bg-codex-surface-secondary text-xs text-codex-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWorkspace}
                disabled={deleteConfirmText !== activeWorkspace.name || isDeleting}
                className="px-3 py-1.5 rounded-codex-md bg-codex-danger text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
