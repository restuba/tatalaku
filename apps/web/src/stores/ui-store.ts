"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Animation preference. `system` follows the OS "reduce motion" setting;
 * `on`/`off` override it. Applied as `data-motion` on <html> (see MotionSync).
 */
export type MotionPreference = "system" | "on" | "off";

/** localStorage key of the persisted UI store (also read by the pre-paint script) */
export const UI_STORE_KEY = "tatalaku-ui-v1";

interface UIState {
  motion: MotionPreference;
  isSidebarOpen: boolean;
  isOutlineOpen: boolean;
  /** Render page content full width across the whole app (device preference) */
  isFullWidth: boolean;
  /** Transient: never persisted, so a reload always starts closed */
  isCommandPaletteOpen: boolean;
  /** Transient: never persisted */
  isImportMarkdownOpen: boolean;
  /** Transient: keyboard shortcuts sheet (⌘/) */
  isShortcutsOpen: boolean;
  /** Used by the Home "Getting started" checklist */
  hasUsedCommandPalette: boolean;
  isOnboardingDismissed: boolean;
}

interface UIActions {
  setMotion: (motion: MotionPreference) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleOutline: () => void;
  setOutlineOpen: (isOpen: boolean) => void;
  toggleFullWidth: () => void;
  setFullWidth: (isFullWidth: boolean) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  toggleCommandPalette: () => void;
  setImportMarkdownOpen: (isOpen: boolean) => void;
  setShortcutsOpen: (isOpen: boolean) => void;
  dismissOnboarding: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      motion: "system",
      isSidebarOpen: true,
      isOutlineOpen: false,
      isFullWidth: false,
      isCommandPaletteOpen: false,
      isImportMarkdownOpen: false,
      isShortcutsOpen: false,
      hasUsedCommandPalette: false,
      isOnboardingDismissed: false,

      setMotion: (motion) => {
        set({ motion });
      },

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

      toggleFullWidth: () => {
        set((state) => ({ isFullWidth: !state.isFullWidth }));
      },

      setFullWidth: (isFullWidth) => {
        set({ isFullWidth });
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

      setImportMarkdownOpen: (isOpen) => {
        set({ isImportMarkdownOpen: isOpen });
      },

      setShortcutsOpen: (isOpen) => {
        set({ isShortcutsOpen: isOpen });
      },

      dismissOnboarding: () => {
        set({ isOnboardingDismissed: true });
      },
    }),
    {
      name: UI_STORE_KEY,
      // Only persist layout preferences, not transient overlays
      partialize: (state) => ({
        motion: state.motion,
        isSidebarOpen: state.isSidebarOpen,
        isOutlineOpen: state.isOutlineOpen,
        isFullWidth: state.isFullWidth,
        hasUsedCommandPalette: state.hasUsedCommandPalette,
        isOnboardingDismissed: state.isOnboardingDismissed,
      }),
    },
  ),
);

const noopSubscribe = () => () => {};

/**
 * Reads the persisted full-width preference, but returns the default (false)
 * until the client has mounted. This keeps SSR and the first client render in
 * sync and avoids a hydration mismatch from persisted zustand state.
 */
export function useHydratedFullWidth(): boolean {
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const isFullWidth = useUIStore((s) => s.isFullWidth);
  return isMounted ? isFullWidth : false;
}
