"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  ChevronsUpDown,
  Plus,
  Check,
  Briefcase,
  Trash2,
  UserPlus,
  Users,
  LogOut,
} from "lucide-react";
import { useApp } from "@/components/app";
import { confirmDialog } from "@/stores/dialog-store";
import { PopPanel } from "@/components/motion/pop-panel";
import { WorkspaceMembersModal } from "./workspace-members-modal";

const ROW_ACTION =
  "flex size-6 items-center justify-center rounded-codex-sm opacity-0 transition-[opacity,color,background-color] group-hover:opacity-100 focus-visible:opacity-100 hover:bg-codex-border hover:text-codex-foreground pointer-coarse:opacity-100";

const FIELD =
  "min-w-0 rounded-codex-md border border-codex-border-strong bg-codex-background px-2.5 py-1.5 text-sm text-codex-foreground outline-none transition-colors placeholder:text-codex-muted/70 focus:border-codex-foreground";

const SMALL_PRIMARY =
  "rounded-full bg-codex-accent px-3 py-1 font-mono text-xs uppercase tracking-label text-codex-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40";

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
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`group flex h-11 w-full items-center gap-2.5 rounded-codex-lg px-2 text-left transition-colors duration-150 hover:bg-codex-surface-raised/60 ${
          isOpen ? "bg-codex-surface-raised/60" : ""
        }`}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-codex-md bg-codex-foreground text-sm font-semibold text-codex-background">
          {activeWorkspace?.name?.charAt(0).toUpperCase() || "W"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight tracking-tight text-codex-foreground">
            {activeWorkspace?.name || "Select Workspace"}
          </span>
          <span className="block truncate font-mono text-xs uppercase tracking-label text-codex-muted/80">
            Tatalaku
          </span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-codex-muted" />
      </button>

      <PopPanel
        open={isOpen}
        origin="top left"
        // w-56 fits inside the sidebar, whose panel clips overflow
        className="absolute top-full left-0 mt-1 z-50 w-56 glass-surface rounded-codex-lg border border-codex-border-strong p-1"
      >
        {/* User Profile Section */}
        <div className="flex items-center gap-2.5 px-2 py-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-codex-border-strong font-mono text-xs font-bold text-codex-foreground">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-codex-foreground">
              {user?.name || "User"}
            </p>
            <p className="truncate font-mono text-xs text-codex-muted">{user?.email}</p>
          </div>
        </div>
        <div className="mx-2 h-px bg-codex-border" />
        <div className="px-2 pt-3 pb-1.5 font-mono text-xs uppercase tracking-label text-codex-muted/80">
          Workspaces
        </div>

        <div className="space-y-px max-h-56 overflow-y-auto">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace?.id === ws.id;
            return (
              <div key={ws.id} className="flex flex-col">
                <div
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setIsOpen(false);
                    router.push("/workspace");
                  }}
                  className={`group flex h-9 cursor-pointer items-center justify-between rounded-codex-md px-2 text-sm transition-colors ${
                    isActive
                      ? "bg-codex-surface-raised font-medium text-codex-foreground"
                      : "text-codex-muted hover:bg-codex-surface-raised hover:text-codex-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Briefcase className="w-4 h-4 shrink-0 text-codex-muted/80" />
                    <span className="truncate">{ws.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-codex-muted">
                    {isActive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                          setIsMembersModalOpen(true);
                        }}
                        className={ROW_ACTION}
                        aria-label="View members"
                        title="View members"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsInviting(isInviting === ws.id ? null : ws.id);
                        setInviteEmail("");
                      }}
                      className={ROW_ACTION}
                      aria-label="Invite member"
                      title="Invite member"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                    {workspaces.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteWorkspace(ws.id, e)}
                        className={`${ROW_ACTION} hover:text-codex-danger`}
                        aria-label="Delete workspace"
                        title="Delete workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isActive && (
                      <Check className="ml-0.5 w-4 h-4 shrink-0 text-codex-foreground" />
                    )}
                  </div>
                </div>

                {isInviting === ws.id && (
                  <form
                    onSubmit={(e) => handleInvite(ws.id, e)}
                    className="mx-1 my-1 rounded-codex-md border border-codex-border p-2"
                  >
                    <p className="mb-2 truncate font-mono text-xs uppercase tracking-label text-codex-muted">
                      Invite to {ws.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="email"
                        autoFocus
                        aria-label="Email address"
                        placeholder="Email address..."
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className={`${FIELD} flex-1 py-1`}
                      />
                      <button
                        type="submit"
                        disabled={!inviteEmail.trim()}
                        className={SMALL_PRIMARY}
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-2 my-1 h-px bg-codex-border" />
        {isCreating ? (
          <form onSubmit={handleCreateWorkspace} className="p-1 space-y-2">
            <input
              type="text"
              autoFocus
              aria-label="Workspace name"
              placeholder="Workspace name..."
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className={`${FIELD} w-full`}
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-full px-3 py-1 font-mono text-xs uppercase tracking-label text-codex-muted transition-colors hover:text-codex-foreground"
              >
                Cancel
              </button>
              <button type="submit" disabled={!newWorkspaceName.trim()} className={SMALL_PRIMARY}>
                Create
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex h-9 w-full items-center gap-2 rounded-codex-md px-2 text-sm text-codex-muted transition-colors hover:bg-codex-surface-raised hover:text-codex-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New workspace</span>
          </button>
        )}

        {/* Logout */}
        <div className="mx-2 my-1 h-px bg-codex-border" />
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="flex h-9 w-full items-center gap-2 rounded-codex-md px-2 text-sm text-codex-muted transition-colors hover:bg-codex-danger-bg hover:text-codex-danger"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </PopPanel>

      <WorkspaceMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
      />
    </div>
  );
}
