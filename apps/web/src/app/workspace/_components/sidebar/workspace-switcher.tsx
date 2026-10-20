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
import { UserAvatar } from "@/components/shared/user-avatar";
import { WorkspaceMembersModal } from "./workspace-members-modal";

const ROW_ACTION =
  "flex size-6 items-center justify-center rounded-codex-sm transition-colors hover:bg-codex-selected hover:text-codex-foreground pointer-coarse:size-9";

const FIELD =
  "min-w-0 rounded-codex-md border border-codex-border-strong bg-codex-elevated px-2.5 py-1.5 text-sm text-codex-foreground outline-none transition-[border-color,box-shadow] placeholder:text-codex-muted focus:border-codex-accent focus:ring-2 focus:ring-codex-accent-soft";

const SMALL_PRIMARY =
  "inline-flex h-7 items-center rounded-full bg-codex-accent px-3 text-sm font-medium text-codex-background transition-colors hover:bg-codex-accent-hover disabled:cursor-not-allowed disabled:opacity-50";

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

  // Escape closes the panel and hands focus back to its trigger
  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setIsOpen(false);
      setIsCreating(false);
      dropdownRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
        aria-haspopup="true"
        aria-label={`Workspace: ${activeWorkspace?.name ?? "none selected"}`}
        className={`group flex h-10 w-full items-center gap-2.5 rounded-codex-md px-2 text-left transition-colors duration-150 hover:bg-codex-hover pointer-coarse:h-12 ${
          isOpen ? "bg-codex-selected" : ""
        }`}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-codex-md bg-codex-accent text-xs font-semibold text-codex-background">
          {activeWorkspace?.name?.charAt(0).toUpperCase() || "W"}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-codex-foreground">
          {activeWorkspace?.name || "Select workspace"}
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-codex-muted" />
      </button>

      <PopPanel
        open={isOpen}
        origin="bottom left"
        // Opens upward from the sidebar footer; w-56 fits the sidebar, whose
        // panel clips overflow
        className="absolute bottom-full left-0 mb-1 z-50 w-56 surface-popover rounded-codex-lg p-1"
      >
        {/* User Profile Section */}
        <div className="flex items-center gap-2.5 px-2 py-2.5">
          <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-codex-foreground">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-codex-muted">{user?.email}</p>
          </div>
        </div>
        <div className="mx-1.5 h-px bg-codex-border" />
        <div className="eyebrow px-2 pt-3 pb-1.5 text-codex-muted">Workspaces</div>

        <div className="space-y-px max-h-56 overflow-y-auto">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace?.id === ws.id;
            return (
              <div key={ws.id} className="flex flex-col">
                <div
                  className={`group flex h-9 items-center rounded-codex-md text-sm text-codex-foreground transition-colors pointer-coarse:h-11 ${
                    isActive ? "bg-codex-selected font-medium" : "hover:bg-codex-hover"
                  }`}
                >
                  {/* A real button, so keyboard users can switch workspaces too */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsOpen(false);
                      router.push("/workspace");
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className="flex h-full min-w-0 flex-1 items-center gap-2 rounded-codex-md px-2 text-left focus-visible:-outline-offset-2"
                  >
                    <Briefcase className="size-4 shrink-0 text-codex-muted" />
                    <span className="truncate">{ws.name}</span>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5 pr-1.5 text-codex-muted">
                    {/* Row actions take no room until the row is hovered or
                        focused, so the name gets the full width at rest */}
                    <div className="hidden items-center gap-0.5 group-focus-within:flex group-hover:flex pointer-coarse:flex">
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
                    </div>
                    {isActive && (
                      <Check
                        className="ml-0.5 size-4 shrink-0 text-codex-accent"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>

                {isInviting === ws.id && (
                  <form
                    onSubmit={(e) => handleInvite(ws.id, e)}
                    className="mx-1 my-1 rounded-codex-md border border-codex-border p-2"
                  >
                    <p className="mb-2 truncate text-xs font-medium text-codex-muted">
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

        <div className="mx-1.5 my-1 h-px bg-codex-border" />
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
                className="inline-flex h-7 items-center rounded-full px-3 text-sm text-codex-muted transition-colors hover:bg-codex-hover hover:text-codex-foreground"
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
            className="flex h-9 w-full items-center gap-2 rounded-codex-md px-2 text-sm text-codex-foreground transition-colors hover:bg-codex-hover pointer-coarse:h-11"
          >
            <Plus className="w-3.5 h-3.5 text-codex-muted" />
            <span>New workspace</span>
          </button>
        )}

        {/* Logout */}
        <div className="mx-1.5 my-1 h-px bg-codex-border" />
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="flex h-9 w-full items-center gap-2 rounded-codex-md px-2 text-sm text-codex-danger transition-colors hover:bg-codex-danger-bg pointer-coarse:h-11"
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
