"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { ChevronDown, Plus, Check, Briefcase, Trash2, UserPlus, Users } from "lucide-react";
import { WorkspaceMembersModal } from "./workspace-members-modal";

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace, deleteWorkspace } =
    useWorkspaceStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState<string | null>(null); // store workspace id being invited to
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      await createWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName("");
      setIsCreating(false);
      setIsOpen(false);
      router.push("/workspace");
    } catch {
      // Error handled by store
    }
  }

  async function handleDeleteWorkspace(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this workspace and all its pages?")) {
      try {
        await deleteWorkspace(id);
        if (activeWorkspace?.id === id) {
          router.push("/workspace");
        }
      } catch {
        // Error handled by store
      }
    }
  }

  async function handleInvite(id: string, e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await useWorkspaceStore.getState().inviteMember(id, inviteEmail.trim());
      setInviteEmail("");
      setIsInviting(null);
      alert("Invitation sent successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send invitation");
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-codex-md hover:bg-codex-surface/50 transition-colors text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-codex-sm bg-codex-surface border border-codex-border text-codex-foreground flex items-center justify-center text-xs font-semibold shrink-0">
            {activeWorkspace?.name?.charAt(0).toUpperCase() || "W"}
          </div>
          <span className="font-medium text-sm text-codex-foreground truncate">
            {activeWorkspace?.name || "Select Workspace"}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-codex-muted group-hover:text-codex-foreground transition-colors shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 glass-surface border border-codex-border rounded-codex-xl p-1.5 min-w-[240px] animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-2 py-1.5 text-xs font-semibold text-codex-muted uppercase tracking-wider">
            Workspaces
          </div>

          <div className="space-y-0.5 max-h-56 overflow-y-auto">
            {workspaces.map((ws) => (
              <div key={ws.id} className="flex flex-col">
                <div
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setIsOpen(false);
                    router.push("/workspace");
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-codex-md text-sm cursor-pointer group transition-colors ${
                    activeWorkspace?.id === ws.id
                      ? "bg-codex-background font-medium text-codex-foreground border border-codex-border/50"
                      : "text-codex-muted hover:bg-codex-surface/80 hover:text-codex-foreground border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Briefcase className="w-4 h-4 text-codex-muted shrink-0" />
                    <span className="truncate">{ws.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {activeWorkspace?.id === ws.id && (
                      <>
                        <Check className="w-4 h-4 text-codex-accent shrink-0" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            setIsMembersModalOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-codex-info rounded transition-all"
                          title="View members"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsInviting(isInviting === ws.id ? null : ws.id);
                        setInviteEmail("");
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-codex-info rounded transition-all"
                      title="Invite member"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                    {workspaces.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteWorkspace(ws.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-codex-danger rounded transition-all"
                        title="Delete workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {isInviting === ws.id && (
                  <form
                    onSubmit={(e) => handleInvite(ws.id, e)}
                    className="px-2 py-1.5 mb-1 bg-codex-background rounded-codex-md border border-codex-border mt-1"
                  >
                    <p className="text-[10px] uppercase font-semibold text-codex-muted mb-1.5">
                      Invite to {ws.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="email"
                        autoFocus
                        placeholder="Email address..."
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1 min-w-0 px-2 py-1 text-xs rounded-codex-sm border border-codex-border bg-codex-surface text-codex-foreground outline-none focus:border-codex-accent focus:ring-1 focus:ring-codex-accent/20"
                      />
                      <button
                        type="submit"
                        disabled={!inviteEmail.trim()}
                        className="px-2 py-1 text-xs font-medium bg-codex-accent hover:opacity-90 text-codex-background rounded-codex-sm disabled:opacity-50 transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-codex-border mt-1.5 pt-1.5">
            {isCreating ? (
              <form onSubmit={handleCreateWorkspace} className="p-1 space-y-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Workspace name..."
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-codex-md border border-codex-border bg-codex-background text-codex-foreground outline-none focus:border-codex-accent focus:ring-1 focus:ring-codex-accent/20"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2 py-1 text-xs text-codex-muted hover:text-codex-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newWorkspaceName.trim()}
                    className="px-2.5 py-1 text-xs font-medium bg-codex-accent text-codex-background rounded-codex-md disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-codex-muted hover:bg-codex-background hover:text-codex-foreground rounded-codex-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New workspace</span>
              </button>
            )}
          </div>
        </div>
      )}

      <WorkspaceMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
      />
    </div>
  );
}
