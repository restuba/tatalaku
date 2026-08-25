/* eslint-disable no-restricted-syntax */
import { ThemeConfig } from "@tatalaku/shared";

export const lightAbsolutely: ThemeConfig = {
  codeThemeId: "github-light",
  variant: "light",
  theme: {
    accent: "#cc7d5e",
    contrast: 40,
    fonts: {
      code: '"Geist Mono", ui-monospace, SFMono-Regular',
      ui: "Geist, Inter",
    },
    ink: "#2d2d2b",
    opaqueWindows: true,
    semanticColors: {
      diffAdded: "#00c853",
      diffRemoved: "#ff5f38",
      skill: "#cc7d5e",
    },
    surface: "#f9f9f7",
  },
};

export const lightEverforest: ThemeConfig = {
  codeThemeId: "everforest-light",
  variant: "light",
  theme: {
    accent: "#93b259",
    contrast: 40,
    fonts: {
      code: '"Geist Mono", ui-monospace, SFMono-Regular',
      ui: "Geist, Inter",
    },
    ink: "#5c6a72",
    opaqueWindows: true,
    semanticColors: {
      diffAdded: "#8da101",
      diffRemoved: "#f85552",
      skill: "#df69ba",
    },
    surface: "#fdf6e3",
  },
};

export const darkAbsolutely: ThemeConfig = {
  codeThemeId: "github-dark",
  variant: "dark",
  theme: {
    accent: "#cc7d5e",
    contrast: 44,
    fonts: {
      code: null,
      ui: null,
    },
    ink: "#f9f9f7",
    opaqueWindows: false,
    semanticColors: {
      diffAdded: "#00c853",
      diffRemoved: "#ff5f38",
      skill: "#cc7d5e",
    },
    surface: "#2d2d2b",
  },
};

export const darkEverforest: ThemeConfig = {
  codeThemeId: "everforest-dark",
  variant: "dark",
  theme: {
    accent: "#a7c080",
    contrast: 44,
    fonts: {
      code: null,
      ui: null,
    },
    ink: "#d3c6aa",
    opaqueWindows: false,
    semanticColors: {
      diffAdded: "#a7c080",
      diffRemoved: "#e67e80",
      skill: "#d699b6",
    },
    surface: "#2d353b",
  },
};

export const presets: ThemeConfig[] = [
  lightAbsolutely,
  lightEverforest,
  darkAbsolutely,
  darkEverforest,
];

/**
 * Maps a ThemeConfig to a record of CSS custom properties.
 * This can be used in a style attribute.
 */
export function mapThemeToCSS(config: ThemeConfig): Record<string, string> {
  const cssVars: Record<string, string> = {
    "--color-accent": config.theme.accent,
    "--color-ink": config.theme.ink,
    "--color-surface": config.theme.surface,
    "--theme-contrast": config.theme.contrast.toString(),
    "--color-diff-added": config.theme.semanticColors.diffAdded,
    "--color-diff-removed": config.theme.semanticColors.diffRemoved,
    "--color-skill": config.theme.semanticColors.skill,
  };

  if (config.theme.fonts.ui) {
    cssVars["--font-ui"] = config.theme.fonts.ui;
  }
  if (config.theme.fonts.code) {
    cssVars["--font-code"] = config.theme.fonts.code;
  }

  return cssVars;
}
