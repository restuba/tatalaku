"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isSidebarOpen: boolean;
  isOutlineOpen: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleOutline: () => void;
  setOutlineOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isOutlineOpen: false,

      toggleSidebar: () => {
        set((state) => ({
          isSidebarOpen: !state.isSidebarOpen,
        }));
      },

      setSidebarOpen: (isOpen) => {
        set({ isSidebarOpen: isOpen });
      },

      toggleOutline: () => {
        set((state) => ({
          isOutlineOpen: !state.isOutlineOpen,
        }));
      },

      setOutlineOpen: (isOpen) => {
        set({ isOutlineOpen: isOpen });
      },
    }),
    {
      name: "tatalaku-ui-v1",
    },
  ),
);
