"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import { Building, Copy, Check, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/reusable/input";
import { Button } from "@/components/reusable/button";

/** Section title in the label voice */
const SECTION_LABEL = "block font-mono text-xs uppercase tracking-label text-codex-muted";
/** Mono status prefix for inline error messages */
const ERROR_PREFIX = "mr-1.5 font-mono uppercase tracking-label";

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
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!activeWorkspace) {
    return (
      <div className="py-24 text-center font-mono text-xs uppercase tracking-label text-codex-muted">
        [ No active workspace selected ]
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
    setDeleteError(null);
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
      // The confirmation modal is still open, so report the error inside it
      setDeleteError(err instanceof Error ? err.message : "Failed to delete workspace");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Workspace Profile Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Outlined card, no tint; the tile matches the sidebar's workspace switcher */}
        <div className="p-5 rounded-codex-lg border border-codex-border flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-codex-lg bg-codex-foreground text-lg font-semibold text-codex-background">
            {activeWorkspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 min-w-0">
            <h4 className="text-sm font-medium text-codex-foreground truncate">
              {activeWorkspace.name}
            </h4>
            <p className="font-mono text-xs uppercase tracking-label text-codex-muted">
              {isOwner ? "Owner (Full Admin Access)" : "Member"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="ws-name" className={SECTION_LABEL}>
            Workspace Name
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="ws-name"
              type="text"
              value={name}
              onChange={setName}
              disabled={!isOwner}
              placeholder="Workspace name"
              prefix={<Building className="w-4 h-4" />}
              className="flex-1"
            />
            {isOwner && (
              <Button
                htmlType="submit"
                btnType="primary"
                loading={isSaving}
                disabled={!isNameChanged}
                className="shrink-0"
              >
                {isSaving ? "Saving…" : "Save"}
              </Button>
            )}
          </div>
          {saveSuccess && (
            <p className="text-xs text-codex-success flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Workspace name updated successfully.</span>
            </p>
          )}
          {saveError && (
            <p className="text-xs text-codex-danger">
              <span className={ERROR_PREFIX}>[Error]</span>
              {saveError}
            </p>
          )}
        </div>
      </form>

      {/* Workspace Details: a mono readout in a hairline frame */}
      <div className="space-y-2">
        <label className={SECTION_LABEL}>Workspace ID</label>
        <div className="flex items-center gap-2 py-1 pl-3 pr-1 rounded-codex-md border border-codex-border">
          <span className="text-xs font-mono text-codex-muted truncate flex-1 select-all">
            {activeWorkspace.id}
          </span>
          <Button
            variant="text"
            size="small"
            onClick={handleCopyId}
            aria-label={copiedId ? "Workspace ID copied" : "Copy workspace ID"}
            title="Copy Workspace ID"
            className="shrink-0"
            icon={
              copiedId ? (
                <Check className="w-3.5 h-3.5 text-codex-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
          />
        </div>
      </div>

      {/* Danger Zone: a hairline card set apart by spacing; the red is kept for
          the warning mark and the outlined destructive button */}
      {isOwner && (
        <div className="pt-4">
          <div className="rounded-codex-lg border border-codex-border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-codex-danger shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-codex-foreground">Delete Workspace</h4>
                <p className="text-xs text-codex-muted leading-relaxed">
                  Permanently delete this workspace and all pages inside it. This action cannot be
                  undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                btnType="primary"
                color="danger"
                size="small"
                onClick={() => setShowDeleteModal(true)}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Workspace
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal: dense scrim, flat elevated dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-codex-background/80 p-4">
          <div className="glass-surface w-full max-w-sm rounded-codex-xl border border-codex-border-strong p-6 space-y-4 animate-in fade-in duration-150">
            <div className="space-y-2">
              <h4 className="text-lg font-medium tracking-tight text-codex-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-codex-danger" />
                <span>Confirm Deletion</span>
              </h4>
              <p className="text-sm text-codex-muted">
                Type{" "}
                <span className="font-medium text-codex-foreground">{activeWorkspace.name}</span>{" "}
                below to confirm:
              </p>
            </div>

            <input
              type="text"
              autoFocus
              aria-label="Workspace name"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={activeWorkspace.name}
              className="h-9 w-full px-3 rounded-codex-md border border-codex-border-strong bg-codex-background text-sm text-codex-foreground outline-none placeholder:text-codex-muted/70 focus:border-codex-foreground transition-colors"
            />

            {deleteError && (
              <p role="alert" className="text-xs text-codex-danger">
                <span className={ERROR_PREFIX}>[Error]</span>
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                size="small"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                btnType="primary"
                color="danger"
                size="small"
                loading={isDeleting}
                disabled={deleteConfirmText !== activeWorkspace.name}
                onClick={handleDeleteWorkspace}
              >
                {isDeleting ? "Deleting…" : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
