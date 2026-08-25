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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Workspace Members
            </h2>
            <p className="text-xs text-neutral-500">{activeWorkspace?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto min-h-[200px]">
          {!activeWorkspaceMembers || activeWorkspaceMembers.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-neutral-500 text-sm">
              Loading members...
            </div>
          ) : (
            <div className="space-y-3">
              {activeWorkspaceMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-semibold shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {member.name} {user?.id === member.id && "(You)"}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        member.role === "owner"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {member.role}
                    </span>

                    {isOwner && member.id !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isRemoving === member.id}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
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
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-100 dark:border-orange-900/30 flex gap-2 text-xs text-orange-800 dark:text-orange-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <p>Only the workspace owner can remove members.</p>
          </div>
        )}
      </div>
    </div>
  );
}
