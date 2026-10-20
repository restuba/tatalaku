"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, Building, Check, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/reusable/button";
import { Input } from "@/components/reusable/input";
import { Modal } from "@/components/reusable/modal";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

/** Inline error under a field: icon + text, so it never rests on color alone */
function FieldError({ id, children }: { id?: string; children: string }) {
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-sm text-codex-danger">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function GeneralTab({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { activeWorkspace, updateWorkspace, deleteWorkspace } = useWorkspaceStore();
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
    return <p className="py-24 text-center text-sm text-codex-muted">No workspace is selected.</p>;
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

  function closeDeleteModal() {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setDeleteConfirmText("");
    setDeleteError(null);
  }

  async function handleDeleteWorkspace() {
    if (!activeWorkspace) return;
    if (deleteConfirmText !== activeWorkspace.name) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteWorkspace(activeWorkspace.id);
      setShowDeleteModal(false);
      onClose?.();
      router.push("/workspace");
    } catch (err) {
      // The confirmation dialog is still open, so report the error inside it
      setDeleteError(err instanceof Error ? err.message : "Failed to delete workspace");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-codex-lg bg-codex-accent font-serif text-xl font-medium text-codex-background">
          {activeWorkspace.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="truncate font-serif text-xl font-medium text-codex-foreground">
            {activeWorkspace.name}
          </p>
          <p className="text-sm text-codex-muted">{isOwner ? "Owner" : "Member"}</p>
        </div>
      </div>

      {/* Name */}
      <form onSubmit={handleSave} className="space-y-2">
        <label htmlFor="ws-name" className="block text-sm font-medium text-codex-foreground">
          Workspace name
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="ws-name"
            type="text"
            value={name}
            onChange={setName}
            disabled={!isOwner}
            placeholder="Workspace name"
            prefix={<Building className="size-4" />}
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
        {!isOwner && (
          <p className="text-sm text-codex-muted">Only the owner can rename this workspace.</p>
        )}
        {saveSuccess && (
          <p role="status" className="flex items-center gap-1.5 text-sm text-codex-success">
            <Check className="size-4 shrink-0" aria-hidden="true" />
            <span>Workspace name updated.</span>
          </p>
        )}
        {saveError && <FieldError>{saveError}</FieldError>}
      </form>

      {/* ID */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-codex-foreground">Workspace ID</p>
        <div className="flex items-center gap-2 rounded-codex-md border border-codex-border bg-codex-surface-secondary py-1 pr-1 pl-3">
          <span className="flex-1 truncate font-mono text-xs text-codex-muted select-all">
            {activeWorkspace.id}
          </span>
          <Button
            variant="text"
            size="small"
            onClick={handleCopyId}
            aria-label={copiedId ? "Workspace ID copied" : "Copy workspace ID"}
            title="Copy workspace ID"
            className="shrink-0"
            icon={
              copiedId ? (
                <Check className="size-3.5 text-codex-success" />
              ) : (
                <Copy className="size-3.5" />
              )
            }
          />
        </div>
      </div>

      {/* Danger zone */}
      {isOwner && (
        <div className="rounded-codex-lg border border-codex-danger/30 bg-codex-danger-bg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-codex-danger"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="text-sm font-medium text-codex-foreground">Delete workspace</h4>
              <p className="text-sm leading-relaxed text-codex-muted">
                Permanently delete this workspace and every page in it. This can&apos;t be undone.
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              color="danger"
              variant="outlined"
              size="small"
              onClick={() => setShowDeleteModal(true)}
              icon={<Trash2 className="size-3.5" />}
            >
              Delete workspace
            </Button>
          </div>
        </div>
      )}

      {/* Type-to-confirm deletion, stacked above Settings */}
      <Modal
        open={showDeleteModal}
        onClose={closeDeleteModal}
        maxWidth="sm"
        elevated
        aria-label="Confirm workspace deletion"
      >
        <Modal.Header showClose={false}>Delete this workspace?</Modal.Header>
        <Modal.Content className="space-y-3">
          <p className="leading-relaxed text-codex-muted">
            Type <span className="font-medium text-codex-foreground">{activeWorkspace.name}</span>{" "}
            to confirm.
          </p>
          <Input
            id="ws-delete-confirm"
            autoFocus
            aria-label="Workspace name"
            value={deleteConfirmText}
            onChange={setDeleteConfirmText}
            placeholder={activeWorkspace.name}
            status={deleteError ? "error" : undefined}
          />
          {deleteError && <FieldError>{deleteError}</FieldError>}
        </Modal.Content>
        <Modal.Action>
          <Button size="small" disabled={isDeleting} onClick={closeDeleteModal}>
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
            {isDeleting ? "Deleting…" : "Delete permanently"}
          </Button>
        </Modal.Action>
      </Modal>
    </div>
  );
}
