"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace } from "@tatalaku/shared";
import { api } from "@/lib/api";

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
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
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspace: null,
      isLoading: false,
      isInitialized: false,

      fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
          const res = await api.workspaces.list();
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
        set({ activeWorkspace: workspace });
      },

      createWorkspace: async (name: string) => {
        set({ isLoading: true });
        try {
          const res = await api.workspaces.create({ name });
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
          const res = await api.workspaces.update(id, { name });
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
          await api.workspaces.delete(id);
        } catch (err) {
          // Rollback
          set({ workspaces: previous, activeWorkspace: previousActive });
          throw err;
        }
      },

      inviteMember: async (workspaceId: string, email: string) => {
        await api.workspaces.inviteMember(workspaceId, email);
        await get().fetchWorkspaces();
      },

      acceptInvite: async (workspaceId: string, token: string) => {
        await api.workspaces.acceptInvite(workspaceId, token);
        await get().fetchWorkspaces();
      },

      removeMember: async (workspaceId: string, userId: string) => {
        await api.workspaces.removeMember(workspaceId, userId);
        await get().fetchWorkspaces();
      },
    }),
    {
      name: "tatalaku-workspace",
      partialize: (state) => ({ activeWorkspace: state.activeWorkspace }),
    },
  ),
);
