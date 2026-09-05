"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import { UserMinus, ShieldAlert, Mail, Users, Check } from "lucide-react";

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
          <label className="text-xs font-semibold text-codex-muted uppercase tracking-wider block">
            Invite New Member
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-codex-muted" />
              <input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-codex-md border border-codex-border bg-codex-background text-codex-foreground placeholder:text-codex-muted/60 outline-none focus:border-codex-accent transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!inviteEmail.trim() || isInviting}
              className="px-4 py-2 text-xs font-medium bg-codex-accent text-codex-background rounded-codex-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
            >
              {isInviting ? "Inviting..." : "Invite"}
            </button>
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
                        <span className="text-[11px] text-codex-muted font-normal">(You)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-codex-muted truncate">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full border ${
                      member.role === "owner"
                        ? "bg-codex-accent/15 text-codex-accent border-codex-accent/30"
                        : "bg-codex-surface-secondary text-codex-muted border-codex-border"
                    }`}
                  >
                    {member.role}
                  </span>

                  {isOwner && member.id !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isRemoving === member.id}
                      className="p-1.5 text-codex-muted hover:text-codex-danger hover:bg-codex-danger/10 rounded-codex-sm opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                      title="Remove member"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
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
