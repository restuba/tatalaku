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

export type SidebarPeek = "hidden" | "shown" | "leaving";

/** Below this width the sidebar is an overlay drawer instead of a docked column */
export const SIDEBAR_DRAWER_QUERY = "(max-width: 767px)";

/** Where the sidebar peek is available: wide layouts with a hovering pointer */
const PEEK_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";
/** Pointer may leave the peek this long before it starts closing (no flicker) */
const PEEK_GRACE_MS = 180;
/** Matches the peek panel's exit transition before its layout is dropped */
const PEEK_EXIT_MS = 220;
let peekGraceTimer: ReturnType<typeof setTimeout> | undefined;
let peekExitTimer: ReturnType<typeof setTimeout> | undefined;

function clearPeekTimers(): void {
  clearTimeout(peekGraceTimer);
  clearTimeout(peekExitTimer);
  peekGraceTimer = undefined;
  peekExitTimer = undefined;
}

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
  /**
   * Transient: floating "peek" of the collapsed sidebar (hover the left edge
   * or the open-sidebar button). `leaving` keeps the floating layout while it
   * animates out, then settles back to `hidden`.
   */
  sidebarPeek: SidebarPeek;
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
  /** Show the floating sidebar peek (no-op while the sidebar is docked open) */
  peekSidebar: () => void;
  /** Close the peek after a short grace period */
  unpeekSidebar: () => void;
  dismissOnboarding: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      motion: "system",
      isSidebarOpen: true,
      isOutlineOpen: false,
      isFullWidth: false,
      isCommandPaletteOpen: false,
      isImportMarkdownOpen: false,
      isShortcutsOpen: false,
      sidebarPeek: "hidden",
      hasUsedCommandPalette: false,
      isOnboardingDismissed: false,

      setMotion: (motion) => {
        set({ motion });
      },

      // Docking/undocking always ends any peek in progress
      toggleSidebar: () => {
        clearPeekTimers();
        set((state) => ({
          isSidebarOpen: !state.isSidebarOpen,
          sidebarPeek: "hidden",
        }));
      },

      setSidebarOpen: (isOpen) => {
        clearPeekTimers();
        set({ isSidebarOpen: isOpen, sidebarPeek: "hidden" });
      },

      peekSidebar: () => {
        clearPeekTimers();
        // Hover-only affordance: phones/tablets use the drawer instead
        if (get().isSidebarOpen || !window.matchMedia(PEEK_QUERY).matches) return;
        set({ sidebarPeek: "shown" });
      },

      unpeekSidebar: () => {
        clearPeekTimers();
        if (get().sidebarPeek === "hidden") return;
        peekGraceTimer = setTimeout(() => {
          set({ sidebarPeek: "leaving" });
          peekExitTimer = setTimeout(() => set({ sidebarPeek: "hidden" }), PEEK_EXIT_MS);
        }, PEEK_GRACE_MS);
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
      // The drawer always starts closed on small screens. Done at rehydration
      // (before the first render) so an "open" preference saved on a wide
      // screen never flashes the drawer open on load.
      onRehydrateStorage: () => (state) => {
        if (
          state?.isSidebarOpen &&
          typeof window !== "undefined" &&
          window.matchMedia(SIDEBAR_DRAWER_QUERY).matches
        ) {
          state.setSidebarOpen(false);
        }
      },
    },
  ),
);

const noopSubscribe = () => () => {};

/**
 * Reads persisted UI state, but returns `fallback` (the store default) until
 * the client has mounted. This keeps SSR and the first client render in sync
 * and avoids a hydration mismatch from persisted zustand state.
 */
export function useHydratedUIValue<T>(selector: (state: UIState) => T, fallback: T): T {
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const value = useUIStore(selector);
  return isMounted ? value : fallback;
}

export function useHydratedFullWidth(): boolean {
  return useHydratedUIValue((s) => s.isFullWidth, false);
}

export function useHydratedSidebarOpen(): boolean {
  return useHydratedUIValue((s) => s.isSidebarOpen, true);
}
