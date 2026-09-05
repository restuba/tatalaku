"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace } from "@tatalaku/shared";
import { getListWorkspaces } from "@/services/workspace/get-list-workspaces";
import { createWorkspace } from "@/services/workspace/create-workspace";
import { updateWorkspace } from "@/services/workspace/update-workspace";
import { deleteWorkspace } from "@/services/workspace/delete-workspace";
import { inviteMember } from "@/services/workspace/invite-member";
import { acceptInvite } from "@/services/workspace/accept-invite";
import { removeMember } from "@/services/workspace/remove-member";
import { getMembers } from "@/services/workspace/get-members";

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceMembers: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: "owner" | "member";
  }>;
  isLoading: boolean;
  isInitialized: boolean;
}

interface WorkspaceActions {
  fetchWorkspaces: () => Promise<Workspace[]>;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  updateWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  inviteMember: (workspaceId: string, email: string) => Promise<void>;
  acceptInvite: (workspaceId: string, token: string) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  fetchActiveWorkspaceMembers: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspace: null,
      activeWorkspaceMembers: [],
      isLoading: false,
      isInitialized: false,

      fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
          const res = await getListWorkspaces();
          const workspaces = res.data;

          const currentActive = get().activeWorkspace;
          let nextActive: Workspace | null = null;

          if (currentActive) {
            nextActive = workspaces.find((w) => w.id === currentActive.id) ?? workspaces[0] ?? null;
          } else {
            nextActive = workspaces[0] ?? null;
          }

          set({
            workspaces,
            activeWorkspace: nextActive,
            isLoading: false,
            isInitialized: true,
          });

          return workspaces;
        } catch (err) {
          set({ isLoading: false, isInitialized: true });
          throw err;
        }
      },

      setActiveWorkspace: (workspace) => {
        set({ activeWorkspace: workspace, activeWorkspaceMembers: [] });
      },

      fetchActiveWorkspaceMembers: async () => {
        const active = get().activeWorkspace;
        if (!active) return;
        try {
          const res = await getMembers(active.id);
          set({ activeWorkspaceMembers: res.data });
        } catch (err) {
          console.error("Failed to fetch workspace members:", err);
        }
      },

      createWorkspace: async (name: string) => {
        set({ isLoading: true });
        try {
          const res = await createWorkspace({ name });
          const newWorkspace = res.data;
          set((state) => ({
            workspaces: [newWorkspace, ...state.workspaces],
            activeWorkspace: newWorkspace,
            isLoading: false,
          }));
          return newWorkspace;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      updateWorkspace: async (id: string, name: string) => {
        const previous = get().workspaces;
        // Optimistic update
        set((state) => ({
          workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, name } : w)),
          activeWorkspace:
            state.activeWorkspace?.id === id
              ? { ...state.activeWorkspace, name }
              : state.activeWorkspace,
        }));

        try {
          const res = await updateWorkspace(id, { name });
          set((state) => ({
            workspaces: state.workspaces.map((w) => (w.id === id ? res.data : w)),
            activeWorkspace: state.activeWorkspace?.id === id ? res.data : state.activeWorkspace,
          }));
        } catch (err) {
          // Rollback
          set({ workspaces: previous });
          throw err;
        }
      },

      deleteWorkspace: async (id: string) => {
        const previous = get().workspaces;
        const previousActive = get().activeWorkspace;

        // Optimistic delete
        const remaining = previous.filter((w) => w.id !== id);
        set({
          workspaces: remaining,
          activeWorkspace: previousActive?.id === id ? (remaining[0] ?? null) : previousActive,
        });

        try {
          await deleteWorkspace(id);
        } catch (err) {
          // Rollback
          set({ workspaces: previous, activeWorkspace: previousActive });
          throw err;
        }
      },

      inviteMember: async (workspaceId: string, email: string) => {
        await inviteMember(workspaceId, email);
        await get().fetchWorkspaces();
      },

      acceptInvite: async (workspaceId: string, token: string) => {
        await acceptInvite(workspaceId, token);
        await get().fetchWorkspaces();
      },

      removeMember: async (workspaceId: string, userId: string) => {
        await removeMember(workspaceId, userId);
        await get().fetchWorkspaces();
      },
    }),
    {
      name: "tatalaku-workspace",
      partialize: (state) => ({ activeWorkspace: state.activeWorkspace }),
    },
  ),
);
