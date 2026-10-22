"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_STORE_KEY } from "@/constants/storage-keys";
import {
  DARK_SCHEME_QUERY,
  DEFAULT_THEME,
  initialThemePreference,
  isThemePreference,
  resolveTheme,
  type ThemeId,
  type ThemePreference,
} from "@/lib/themes";

interface ThemeState {
  /** What the user picked: a named theme, or "system" */
  preference: ThemePreference;
}

interface ThemeActions {
  setPreference: (preference: ThemePreference) => void;
}

function readInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    return initialThemePreference(window.localStorage);
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Device-level theme preference, persisted in localStorage like the other UI
 * preferences. The pre-paint script (lib/prepaint.ts) reads the same key so
 * the right theme is on screen before React hydrates; ThemeSync applies
 * changes afterwards without a reload.
 */
export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set) => ({
      preference: readInitialPreference(),
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: THEME_STORE_KEY,
      version: 1,
      partialize: ({ preference }): ThemeState => ({ preference }),
      // Ignore anything that isn't a known preference (old or hand-edited data)
      merge: (persisted, current) => {
        const stored = (persisted as Partial<ThemeState> | null | undefined)?.preference;
        return isThemePreference(stored) ? { ...current, preference: stored } : current;
      },
    },
  ),
);

const noopSubscribe = () => () => {};

function subscribeToColorScheme(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_SCHEME_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Whether the device is in dark mode (false during SSR and hydration) */
export function usePrefersDark(): boolean {
  return useSyncExternalStore(
    subscribeToColorScheme,
    () => window.matchMedia(DARK_SCHEME_QUERY).matches,
    () => false,
  );
}

/**
 * The stored preference once mounted, `null` before. Settings and menus use it
 * to mark the active choice without a hydration mismatch.
 */
export function useHydratedThemePreference(): ThemePreference | null {
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const preference = useThemeStore((s) => s.preference);
  return isMounted ? preference : null;
}

/** The theme currently on screen (Parchment until mounted) */
export function useResolvedTheme(): ThemeId {
  const preference = useHydratedThemePreference();
  const prefersDark = usePrefersDark();
  return preference ? resolveTheme(preference, prefersDark) : DEFAULT_THEME;
}
