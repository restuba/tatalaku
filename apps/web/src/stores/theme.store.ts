"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { presets } from "@/lib/themes";

interface ThemeState {
  lightCodeThemeId: string;
  darkCodeThemeId: string;
  activeConfig: {
    codeThemeId: string;
    variant: "light" | "dark";
    opaqueWindows: boolean;
  };
}

interface ThemeActions {
  setCodeThemeId: (codeThemeId: string, variant: "light" | "dark") => void;
  setResolvedVariant: (variant: "light" | "dark") => void;
}

function getOpaqueWindows(codeThemeId: string, variant: "light" | "dark"): boolean {
  const preset = presets.find((p) => p.codeThemeId === codeThemeId && p.variant === variant);
  return preset ? preset.theme.opaqueWindows : true;
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      lightCodeThemeId: "github-light",
      darkCodeThemeId: "github-dark",
      activeConfig: {
        codeThemeId: "github-light",
        variant: "light",
        opaqueWindows: true,
      },

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
    },
  ),
);
