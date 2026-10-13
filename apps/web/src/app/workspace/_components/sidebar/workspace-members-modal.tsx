"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import { UserMinus, ShieldAlert, Users, Mail } from "lucide-react";
import { Modal } from "@/components/reusable/modal";
import { Button } from "@/components/reusable/button";
import { Input } from "@/components/reusable/input";
import { Badge } from "@/components/reusable/badge";

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
    if (confirm("Are you sure you want to remove this member from the workspace?")) {
      setIsRemoving(userId);
      try {
        await removeMember(activeWorkspace.id, userId);
        await fetchActiveWorkspaceMembers();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to remove member");
      } finally {
        setIsRemoving(null);
      }
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
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-codex-muted" />
          <div>
            <h2 className="text-base font-semibold text-codex-foreground leading-tight">Members</h2>
            <p className="text-xs text-codex-muted mt-0.5">{activeWorkspace?.name}</p>
          </div>
        </div>
      </Modal.Header>

      {/* Invite input for owner */}
      {isOwner && (
        <form
          onSubmit={handleInviteMember}
          className="p-4 border-b border-codex-border bg-codex-surface-secondary/20"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Invite by email address..."
                value={inviteEmail}
                onChange={(val: string) => setInviteEmail(val)}
                size="small"
                prefix={<Mail className="w-3.5 h-3.5 text-codex-muted" />}
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
              className={`text-xs mt-1.5 ${
                inviteStatus.type === "success" ? "text-codex-success" : "text-codex-danger"
              }`}
            >
              {inviteStatus.message}
            </p>
          )}
        </form>
      )}

      {/* Members List */}
      <Modal.Content className="p-4 overflow-y-auto space-y-1.5 min-h-[160px] max-h-[50vh]">
        {!activeWorkspaceMembers || activeWorkspaceMembers.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-codex-muted text-xs">
            Loading members...
          </div>
        ) : (
          activeWorkspaceMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-2.5 rounded-codex-md hover:bg-codex-surface-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-codex-surface-secondary border border-codex-border text-codex-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-codex-foreground truncate">
                    {member.name}{" "}
                    {user?.id === member.id && (
                      <span className="text-xs text-codex-muted font-normal">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-codex-muted truncate">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  status={member.role === "owner" ? "warning" : "default"}
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
                    className="opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove member"
                    icon={<UserMinus className="w-3.5 h-3.5" />}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </Modal.Content>

      {/* Footer info for non-owners */}
      {!isOwner && (
        <div className="p-3.5 bg-codex-surface-secondary/30 border-t border-codex-border flex items-center gap-2 text-xs text-codex-muted">
          <ShieldAlert className="w-4 h-4 shrink-0 text-codex-muted" />
          <span>Only the workspace owner can invite or remove members.</span>
        </div>
      )}
    </Modal>
  );
}

export default WorkspaceMembersModal;
