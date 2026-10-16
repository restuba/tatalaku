"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_DARK_THEME_ID, DEFAULT_LIGHT_THEME_ID, presets } from "@/lib/themes";

type ThemeVariant = "light" | "dark";

interface ThemeState {
  lightCodeThemeId: string;
  darkCodeThemeId: string;
  activeConfig: {
    codeThemeId: string;
    variant: ThemeVariant;
    opaqueWindows: boolean;
  };
}

interface ThemeActions {
  setCodeThemeId: (codeThemeId: string, variant: ThemeVariant) => void;
  setResolvedVariant: (variant: ThemeVariant) => void;
}

/** Bumped when the stored shape or defaults change; see `migrate` below */
const STORE_VERSION = 1;

/**
 * v0 → v1: GitHub was the default palette before Nothing. Anyone still on it
 * moves to the new default; an explicitly picked Everforest/Lobster stays.
 */
const PREVIOUS_DEFAULTS: Readonly<Record<string, string>> = {
  "github-light": DEFAULT_LIGHT_THEME_ID,
  "github-dark": DEFAULT_DARK_THEME_ID,
};

function getOpaqueWindows(codeThemeId: string, variant: ThemeVariant): boolean {
  const preset = presets.find((p) => p.codeThemeId === codeThemeId && p.variant === variant);
  return preset ? preset.theme.opaqueWindows : true;
}

const DEFAULT_STATE: ThemeState = {
  lightCodeThemeId: DEFAULT_LIGHT_THEME_ID,
  darkCodeThemeId: DEFAULT_DARK_THEME_ID,
  activeConfig: {
    codeThemeId: DEFAULT_LIGHT_THEME_ID,
    variant: "light",
    opaqueWindows: getOpaqueWindows(DEFAULT_LIGHT_THEME_ID, "light"),
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isThemeState(value: unknown): value is ThemeState {
  if (!isRecord(value) || !isRecord(value["activeConfig"])) return false;
  const { activeConfig } = value;
  return (
    typeof value["lightCodeThemeId"] === "string" &&
    typeof value["darkCodeThemeId"] === "string" &&
    typeof activeConfig["codeThemeId"] === "string" &&
    (activeConfig["variant"] === "light" || activeConfig["variant"] === "dark")
  );
}

function migrateThemeState(persisted: unknown, version: number): ThemeState {
  if (!isThemeState(persisted)) return DEFAULT_STATE;
  if (version >= STORE_VERSION) return persisted;

  const toCurrent = (id: string) => PREVIOUS_DEFAULTS[id] ?? id;
  const { variant } = persisted.activeConfig;
  const activeId = toCurrent(persisted.activeConfig.codeThemeId);
  return {
    lightCodeThemeId: toCurrent(persisted.lightCodeThemeId),
    darkCodeThemeId: toCurrent(persisted.darkCodeThemeId),
    activeConfig: {
      codeThemeId: activeId,
      variant,
      opaqueWindows: getOpaqueWindows(activeId, variant),
    },
  };
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setCodeThemeId: (codeThemeId, variant) => {
        set((state) => ({
          lightCodeThemeId: variant === "light" ? codeThemeId : state.lightCodeThemeId,
          darkCodeThemeId: variant === "dark" ? codeThemeId : state.darkCodeThemeId,
          activeConfig: {
            codeThemeId,
            variant,
            opaqueWindows: getOpaqueWindows(codeThemeId, variant),
          },
        }));
      },

      setResolvedVariant: (variant) => {
        const activeThemeId = variant === "light" ? get().lightCodeThemeId : get().darkCodeThemeId;
        set({
          activeConfig: {
            codeThemeId: activeThemeId,
            variant,
            opaqueWindows: getOpaqueWindows(activeThemeId, variant),
          },
        });
      },
    }),
    {
      name: "tatalaku-theme-v1",
      version: STORE_VERSION,
      // Only the choices are stored; actions are rebuilt on load
      partialize: ({ lightCodeThemeId, darkCodeThemeId, activeConfig }): ThemeState => ({
        lightCodeThemeId,
        darkCodeThemeId,
        activeConfig,
      }),
      migrate: migrateThemeState,
    },
  ),
);
