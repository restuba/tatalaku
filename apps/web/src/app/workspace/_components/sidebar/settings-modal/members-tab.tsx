"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import { AlertCircle, UserMinus, ShieldAlert, Mail, Users, Check } from "lucide-react";
import { Input } from "@/components/reusable/input";
import { Button } from "@/components/reusable/button";
import { Badge } from "@/components/reusable/badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useApp } from "@/components/app";
import { confirmDialog } from "@/stores/dialog-store";

export function MembersTab() {
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
    if (activeWorkspace) {
      fetchActiveWorkspaceMembers();
    }
  }, [activeWorkspace, fetchActiveWorkspaceMembers]);

  if (!activeWorkspace) {
    return <p className="py-24 text-center text-sm text-codex-muted">No workspace is selected.</p>;
  }

  const isOwner = user?.id === activeWorkspace.ownerId;

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
    <div className="space-y-8">
      {/* Invite form (for Owner): an outlined card, no tint */}
      {isOwner ? (
        <form onSubmit={handleInviteMember} className="space-y-2">
          <label
            htmlFor="invite-member-email"
            className="block text-sm font-medium text-codex-foreground"
          >
            Invite a member
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="invite-member-email"
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={setInviteEmail}
              prefix={<Mail className="size-4" />}
              className="flex-1"
            />
            <Button
              htmlType="submit"
              btnType="primary"
              loading={isInviting}
              disabled={!inviteEmail.trim()}
              className="shrink-0"
            >
              {isInviting ? "Inviting…" : "Invite"}
            </Button>
          </div>
          {inviteStatus && (
            <p
              role={inviteStatus.type === "error" ? "alert" : "status"}
              className={`flex items-start gap-1.5 text-sm ${
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
      ) : (
        <div className="flex items-center gap-2.5 rounded-codex-lg border border-codex-border bg-codex-surface-secondary px-4 py-3 text-sm text-codex-muted">
          <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
          <span>Only the workspace owner can invite or remove members.</span>
        </div>
      )}

      {/* Members List: hairline-ruled rows inside an outlined card */}
      <div className="space-y-3">
        <h4 className="eyebrow text-codex-muted">
          Members · {String(activeWorkspaceMembers?.length || 0).padStart(2, "0")}
        </h4>

        <div className="rounded-codex-lg border border-codex-border divide-y divide-codex-border overflow-hidden">
          {!activeWorkspaceMembers || activeWorkspaceMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-codex-muted">
              <Users className="size-5" aria-hidden="true" />
              <span className="text-sm">Loading members…</span>
            </div>
          ) : (
            activeWorkspaceMembers.map((member) => (
              <div
                key={member.id}
                className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-codex-hover"
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
                  <Badge status={member.role === "owner" ? "primary" : "default"} size="small">
                    {member.role}
                  </Badge>

                  {isOwner && member.id !== user?.id && (
                    <Button
                      variant="text"
                      color="danger"
                      size="small"
                      loading={isRemoving === member.id}
                      onClick={() => handleRemoveMember(member.id)}
                      icon={<UserMinus className="w-3.5 h-3.5" />}
                      aria-label={`Remove ${member.name || member.email}`}
                      title="Remove member"
                      className="opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 focus-visible:opacity-100"
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
