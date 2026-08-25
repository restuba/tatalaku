"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useAuthStore } from "@/stores/auth.store";
import { X, UserMinus, ShieldAlert } from "lucide-react";

interface WorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceMembersModal({ isOpen, onClose }: WorkspaceMembersModalProps) {
  const { activeWorkspace, activeWorkspaceMembers, fetchActiveWorkspaceMembers, removeMember } =
    useWorkspaceStore();
  const { user } = useAuthStore();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeWorkspace) {
      fetchActiveWorkspaceMembers();
    }
  }, [isOpen, activeWorkspace, fetchActiveWorkspaceMembers]);

  if (!isOpen) return null;

  const isOwner = user?.id === activeWorkspace?.ownerId;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-codex-foreground/50 p-4 animate-in fade-in duration-200">
      <div className="bg-codex-surface border border-codex-border w-full max-w-md rounded-codex-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b border-codex-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-codex-foreground">Workspace Members</h2>
            <p className="text-xs text-codex-muted">{activeWorkspace?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-codex-muted hover:text-codex-foreground hover:bg-codex-background rounded-codex-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto min-h-[200px]">
          {!activeWorkspaceMembers || activeWorkspaceMembers.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-codex-muted text-sm">
              Loading members...
            </div>
          ) : (
            <div className="space-y-4">
              {activeWorkspaceMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-codex-md hover:bg-codex-background transition-colors border border-transparent hover:border-codex-border"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-codex-info-bg dark:bg-codex-info-bg/30 text-codex-info dark:text-codex-info flex items-center justify-center text-xs font-semibold shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-codex-foreground truncate">
                        {member.name} {user?.id === member.id && "(You)"}
                      </p>
                      <p className="text-xs text-codex-muted truncate">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${
                        member.role === "owner"
                          ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50"
                          : "bg-codex-background text-codex-muted border-codex-border/50"
                      }`}
                    >
                      {member.role}
                    </span>

                    {isOwner && member.id !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isRemoving === member.id}
                        className="p-1.5 text-codex-muted hover:text-codex-danger hover:bg-codex-danger-bg/10 rounded-codex-sm transition-colors disabled:opacity-50"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isOwner && (
          <div className="p-4 bg-codex-background dark:bg-orange-900/20 border-t border-orange-100 dark:border-orange-900/30 flex gap-3 text-xs text-orange-800 dark:text-orange-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <p>Only the workspace owner can remove members.</p>
          </div>
        )}
      </div>
    </div>
  );
}
