"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import { UserMinus, ShieldAlert, Mail, Users, Check } from "lucide-react";
import { Input } from "@/components/reusable/input";
import { Button } from "@/components/reusable/button";
import { Badge } from "@/components/reusable/badge";
import { useApp } from "@/components/app";
import { confirmDialog } from "@/stores/dialog-store";

/** Section title in the label voice */
const SECTION_LABEL = "block font-mono text-xs uppercase tracking-label text-codex-muted";

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
    return (
      <div className="py-24 text-center font-mono text-xs uppercase tracking-label text-codex-muted">
        [ No active workspace selected ]
      </div>
    );
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Invite form (for Owner): an outlined card, no tint */}
      {isOwner ? (
        <form
          onSubmit={handleInviteMember}
          className="p-4 rounded-codex-lg border border-codex-border space-y-3"
        >
          <label htmlFor="invite-member-email" className={SECTION_LABEL}>
            Invite New Member
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="invite-member-email"
              type="email"
              size="small"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={setInviteEmail}
              prefix={<Mail className="w-3.5 h-3.5" />}
              className="flex-1"
            />
            <Button
              htmlType="submit"
              btnType="primary"
              size="small"
              loading={isInviting}
              disabled={!inviteEmail.trim()}
              className="shrink-0"
            >
              {isInviting ? "Inviting…" : "Invite"}
            </Button>
          </div>
          {inviteStatus && (
            <p
              className={`text-xs flex items-center gap-1.5 ${
                inviteStatus.type === "success" ? "text-codex-success" : "text-codex-danger"
              }`}
            >
              {inviteStatus.type === "success" && <Check className="w-3.5 h-3.5 shrink-0" />}
              {inviteStatus.type === "error" && (
                <span className="font-mono uppercase tracking-label">[Error]</span>
              )}
              <span>{inviteStatus.message}</span>
            </p>
          )}
        </form>
      ) : (
        <div className="px-4 py-3 rounded-codex-lg border border-codex-border flex items-center gap-2.5 text-xs text-codex-muted">
          <ShieldAlert className="w-4 h-4 shrink-0 text-codex-muted" />
          <span>Only the workspace owner can invite or remove members.</span>
        </div>
      )}

      {/* Members List: hairline-ruled rows inside an outlined card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={SECTION_LABEL}>
            All Members ({activeWorkspaceMembers?.length || 0})
          </label>
        </div>

        <div className="rounded-codex-lg border border-codex-border divide-y divide-codex-border overflow-hidden">
          {!activeWorkspaceMembers || activeWorkspaceMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-codex-muted">
              <Users className="w-5 h-5 text-codex-muted/60" />
              <span className="font-mono text-xs uppercase tracking-label">
                [ Loading members ]
              </span>
            </div>
          ) : (
            activeWorkspaceMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-codex-surface-raised/60 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-codex-border-strong font-mono text-xs font-bold text-codex-foreground">
                    {member.name ? member.name.charAt(0).toUpperCase() : "M"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-codex-foreground truncate">
                      {member.name}{" "}
                      {user?.id === member.id && (
                        <span className="font-mono text-xs uppercase tracking-label text-codex-muted/70">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-xs text-codex-muted truncate">{member.email}</p>
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
