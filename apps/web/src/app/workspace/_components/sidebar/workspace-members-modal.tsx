"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useAuthStore } from "@/stores/auth.store";
import { X, UserMinus, ShieldAlert, Users, Mail } from "lucide-react";

interface WorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-codex-background/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div
        className="w-full max-w-md bg-codex-surface border border-codex-border rounded-codex-2xl flex flex-col max-h-[85vh] shadow-2xl shadow-black/10 animate-slide-up-fade overflow-hidden"
        style={{ animationDuration: "300ms" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-codex-border shrink-0">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-codex-muted" />
            <div>
              <h2 className="text-lg font-semibold text-codex-foreground leading-tight">Members</h2>
              <p className="text-xs text-codex-muted mt-0.5">{activeWorkspace?.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-codex-sm hover:bg-codex-surface-secondary text-codex-muted hover:text-codex-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invite input (for owner) */}
        {isOwner && (
          <form
            onSubmit={handleInviteMember}
            className="p-4 border-b border-codex-border bg-codex-surface-secondary/20 shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-codex-muted" />
                <input
                  type="email"
                  placeholder="Invite by email address..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-codex-md border border-codex-border bg-codex-background text-codex-foreground placeholder:text-codex-muted/60 outline-none focus:border-codex-accent focus:ring-1 focus:ring-codex-accent/20"
                />
              </div>
              <button
                type="submit"
                disabled={!inviteEmail.trim() || isInviting}
                className="px-3 py-1.5 text-xs font-medium bg-codex-accent text-codex-background rounded-codex-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
              >
                {isInviting ? "Inviting..." : "Invite"}
              </button>
            </div>
            {inviteStatus && (
              <p
                className={`text-[11px] mt-1.5 ${
                  inviteStatus.type === "success" ? "text-emerald-500" : "text-codex-danger"
                }`}
              >
                {inviteStatus.message}
              </p>
            )}
          </form>
        )}

        {/* Members List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-1.5 min-h-[160px]">
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
                      className="p-1.5 text-codex-muted hover:text-codex-danger hover:bg-codex-danger-bg/20 rounded-codex-sm opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Footer info */}
        {!isOwner && (
          <div className="p-3.5 bg-codex-surface-secondary/30 border-t border-codex-border flex items-center gap-2 text-xs text-codex-muted shrink-0">
            <ShieldAlert className="w-4 h-4 shrink-0 text-codex-muted" />
            <span>Only the workspace owner can invite or remove members.</span>
          </div>
        )}
      </div>
    </div>
  );
}
