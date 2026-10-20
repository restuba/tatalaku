"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import { AlertCircle, UserMinus, ShieldAlert, Mail, Check } from "lucide-react";
import { Modal } from "@/components/reusable/modal";
import { Button } from "@/components/reusable/button";
import { Input } from "@/components/reusable/input";
import { Badge } from "@/components/reusable/badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useApp } from "@/components/app";
import { confirmDialog } from "@/stores/dialog-store";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WorkspaceMembersModal({ isOpen, onClose }: WorkspaceMembersModalProps) {
  const {
    activeWorkspace,
    activeWorkspaceMembers,
    fetchActiveWorkspaceMembers,
    removeMember,
    inviteMember,
  } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { message } = useApp();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && activeWorkspace) {
      fetchActiveWorkspaceMembers();
    }
  }, [isOpen, activeWorkspace, fetchActiveWorkspaceMembers]);

  const handleClose = () => {
    setInviteStatus(null);
    setInviteEmail("");
    onClose();
  };

  const isOwner = user?.id === activeWorkspace?.ownerId;

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!activeWorkspace || !inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteStatus(null);
    try {
      await inviteMember(activeWorkspace.id, inviteEmail.trim());
      setInviteStatus({
        type: "success",
        message: `Invitation sent to ${inviteEmail.trim()}`,
      });
      setInviteEmail("");
      await fetchActiveWorkspaceMembers();
    } catch (err) {
      setInviteStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to send invitation",
      });
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!activeWorkspace) return;
    const member = activeWorkspaceMembers?.find((m) => m.id === userId);
    const confirmed = await confirmDialog({
      title: "Remove member?",
      description: `${member?.name || member?.email || "This member"} will lose access to ${activeWorkspace.name}.`,
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!confirmed) return;

    setIsRemoving(userId);
    try {
      await removeMember(activeWorkspace.id, userId);
      await fetchActiveWorkspaceMembers();
      message.success("Member removed");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setIsRemoving(null);
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-label="Workspace Members"
    >
      <Modal.Header showClose divider>
        <div className="min-w-0">
          <h2 className="leading-tight">Members</h2>
          <p className="mt-1 truncate font-sans text-sm font-normal text-codex-muted">
            {activeWorkspace?.name}
          </p>
        </div>
      </Modal.Header>

      {/* Invite input for owner: set off by a hairline, no tint */}
      {isOwner && (
        <form onSubmit={handleInviteMember} className="px-6 py-4 border-b border-codex-border">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Invite by email address..."
                value={inviteEmail}
                onChange={(val: string) => setInviteEmail(val)}
                size="small"
                prefix={<Mail className="size-4" />}
              />
            </div>
            <Button
              htmlType="submit"
              size="small"
              btnType="primary"
              disabled={!inviteEmail.trim() || isInviting}
              loading={isInviting}
            >
              Invite
            </Button>
          </div>
          {inviteStatus && (
            <p
              role={inviteStatus.type === "error" ? "alert" : "status"}
              className={`mt-2 flex items-start gap-1.5 text-sm ${
                inviteStatus.type === "success" ? "text-codex-success" : "text-codex-danger"
              }`}
            >
              {inviteStatus.type === "success" ? (
                <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              )}
              <span>{inviteStatus.message}</span>
            </p>
          )}
        </form>
      )}

      {/* Members List: hairline-ruled data rows. -mx-2 lets a row's hover fill
          bleed past the text column while the text stays aligned with the title. */}
      <Modal.Content className="overflow-y-auto min-h-[160px] max-h-[50vh]">
        {!activeWorkspaceMembers || activeWorkspaceMembers.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-codex-muted">
            Loading members…
          </div>
        ) : (
          <div className="-mx-2 divide-y divide-codex-border">
            {activeWorkspaceMembers.map((member) => (
              <div
                key={member.id}
                className="group flex items-center justify-between gap-3 rounded-codex-md px-2 py-2.5 transition-colors hover:bg-codex-hover"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar name={member.name || member.email} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm text-codex-foreground truncate">
                      {member.name}{" "}
                      {user?.id === member.id && (
                        <span className="text-xs text-codex-muted">(you)</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-codex-muted">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    status={member.role === "owner" ? "primary" : "default"}
                    variant="subtle"
                    size="small"
                  >
                    {member.role}
                  </Badge>

                  {isOwner && member.id !== user?.id && (
                    <Button
                      variant="text"
                      size="small"
                      color="danger"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isRemoving === member.id}
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
                      title="Remove member"
                      aria-label={`Remove ${member.name || member.email}`}
                      icon={<UserMinus className="w-3.5 h-3.5" />}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Content>

      {/* Footer info for non-owners: set off by a hairline, no tint */}
      {!isOwner && (
        <div className="flex items-center gap-2 border-t border-codex-border px-6 py-3.5 text-sm text-codex-muted">
          <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
          <span>Only the workspace owner can invite or remove members.</span>
        </div>
      )}
    </Modal>
  );
}

export default WorkspaceMembersModal;
