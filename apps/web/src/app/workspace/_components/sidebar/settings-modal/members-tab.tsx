"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import { UserMinus, ShieldAlert, Mail, Users, Check } from "lucide-react";
import { Input } from "@/components/reusable/input";
import { Button } from "@/components/reusable/button";
import { Badge } from "@/components/reusable/badge";

export function MembersTab() {
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
    if (activeWorkspace) {
      fetchActiveWorkspaceMembers();
    }
  }, [activeWorkspace, fetchActiveWorkspaceMembers]);

  if (!activeWorkspace) {
    return (
      <div className="py-12 text-center text-codex-muted text-xs">
        No active workspace selected.
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Invite form (for Owner) */}
      {isOwner ? (
        <form
          onSubmit={handleInviteMember}
          className="p-4 rounded-codex-xl border border-codex-border bg-codex-surface space-y-2.5"
        >
          <label
            htmlFor="invite-member-email"
            className="text-xs font-semibold text-codex-muted uppercase tracking-wider block"
          >
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
              className={`text-xs mt-1 flex items-center gap-1 ${
                inviteStatus.type === "success" ? "text-codex-success" : "text-codex-danger"
              }`}
            >
              {inviteStatus.type === "success" && <Check className="w-3.5 h-3.5" />}
              <span>{inviteStatus.message}</span>
            </p>
          )}
        </form>
      ) : (
        <div className="p-3.5 rounded-codex-xl border border-codex-border bg-codex-surface flex items-center gap-2.5 text-xs text-codex-muted">
          <ShieldAlert className="w-4 h-4 shrink-0 text-codex-muted" />
          <span>Only the workspace owner can invite or remove members.</span>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-codex-muted uppercase tracking-wider">
            All Members ({activeWorkspaceMembers?.length || 0})
          </label>
        </div>

        <div className="rounded-codex-xl border border-codex-border bg-codex-surface divide-y divide-codex-border overflow-hidden">
          {!activeWorkspaceMembers || activeWorkspaceMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-codex-muted text-xs gap-2">
              <Users className="w-6 h-6 opacity-40" />
              <span>Loading members...</span>
            </div>
          ) : (
            activeWorkspaceMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 hover:bg-codex-surface-secondary/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-codex-surface-secondary border border-codex-border text-codex-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                    {member.name ? member.name.charAt(0).toUpperCase() : "M"}
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
                    status={member.role === "owner" ? "primary" : "default"}
                    size="small"
                    className="uppercase tracking-wider font-semibold"
                  >
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
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
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
