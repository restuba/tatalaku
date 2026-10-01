"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isSidebarOpen: boolean;
  isOutlineOpen: boolean;
  /** Transient: never persisted, so a reload always starts closed */
  isCommandPaletteOpen: boolean;
  /** Used by the Home "Getting started" checklist */
  hasUsedCommandPalette: boolean;
  isOnboardingDismissed: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleOutline: () => void;
  setOutlineOpen: (isOpen: boolean) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  toggleCommandPalette: () => void;
  dismissOnboarding: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isOutlineOpen: false,
      isCommandPaletteOpen: false,
      hasUsedCommandPalette: false,
      isOnboardingDismissed: false,

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

      setCommandPaletteOpen: (isOpen) => {
        set((state) => ({
          isCommandPaletteOpen: isOpen,
          hasUsedCommandPalette: state.hasUsedCommandPalette || isOpen,
        }));
      },

      toggleCommandPalette: () => {
        set((state) => ({
          isCommandPaletteOpen: !state.isCommandPaletteOpen,
          hasUsedCommandPalette: true,
        }));
      },

      dismissOnboarding: () => {
        set({ isOnboardingDismissed: true });
      },
    }),
    {
      name: "tatalaku-ui-v1",
      // Only persist layout preferences, not transient overlays
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        isOutlineOpen: state.isOutlineOpen,
        hasUsedCommandPalette: state.hasUsedCommandPalette,
        isOnboardingDismissed: state.isOnboardingDismissed,
      }),
    },
  ),
);
