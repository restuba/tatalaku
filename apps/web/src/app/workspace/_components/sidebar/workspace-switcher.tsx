"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ChevronDown, Plus, Check, Briefcase, Trash2, UserPlus, Users, LogOut } from "lucide-react";
import { useApp } from "@/components/app";
import { confirmDialog } from "@/stores/dialog-store";
import { PopPanel } from "@/components/motion/pop-panel";
import { WorkspaceMembersModal } from "./workspace-members-modal";

export function WorkspaceSwitcher() {
  const { user, logout } = useAuthStore();
  const { message } = useApp();
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
    const ws = workspaces.find((w) => w.id === id);
    setIsOpen(false);
    const confirmed = await confirmDialog({
      title: "Delete workspace?",
      description: `${ws?.name ?? "This workspace"} and all of its pages will be deleted. This can't be undone.`,
      confirmLabel: "Delete workspace",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteWorkspace(id);
      if (activeWorkspace?.id === id) {
        router.push("/workspace");
      }
      message.success("Workspace deleted");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to delete workspace");
    }
  }

  async function handleInvite(id: string, e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await useWorkspaceStore.getState().inviteMember(id, inviteEmail.trim());
      setInviteEmail("");
      setIsInviting(null);
      message.success("Invitation sent");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to send invitation");
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-codex-md hover:bg-codex-border/40 transition-colors duration-150 text-left group"
      >
        <div className="w-5 h-5 rounded-codex-sm bg-codex-foreground text-codex-background flex items-center justify-center text-xs font-semibold shrink-0">
          {activeWorkspace?.name?.charAt(0).toUpperCase() || "W"}
        </div>
        <span className="min-w-0 truncate font-medium text-sm text-codex-foreground">
          {activeWorkspace?.name || "Select Workspace"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-codex-muted shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <PopPanel
        open={isOpen}
        origin="top left"
        className="absolute top-full left-0 mt-1.5 z-50 glass-surface border border-codex-border rounded-codex-xl p-1.5 w-56"
      >
        {/* User Profile Section */}
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1.5 border-b border-codex-border/50">
          <div className="w-8 h-8 rounded-full bg-codex-background border border-codex-border text-codex-foreground flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-codex-foreground truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-codex-muted truncate">{user?.email}</p>
          </div>
        </div>
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
                        className="opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 p-1 hover:text-codex-info rounded transition-all"
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
                    className="opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 p-1 hover:text-codex-info rounded transition-all"
                    title="Invite member"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                  {workspaces.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteWorkspace(ws.id, e)}
                      className="opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 p-1 hover:text-codex-danger rounded transition-all"
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
                  <p className="text-xs uppercase font-semibold text-codex-muted mb-1.5">
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
                      className="px-2 py-1 text-xs font-medium bg-codex-accent hover:opacity-90 text-codex-background rounded-codex-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="px-2.5 py-1 text-xs font-medium bg-codex-accent text-codex-background rounded-codex-md disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Settings & Logout */}
        <div className="border-t border-codex-border mt-1.5 pt-1.5 space-y-0.5">
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-codex-danger hover:bg-codex-danger/10 hover:text-codex-danger rounded-codex-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </PopPanel>

      <WorkspaceMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
      />
    </div>
  );
}
