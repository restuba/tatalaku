/* eslint-disable no-restricted-syntax */
import { ThemeConfig } from "@tatalaku/shared";

export const lightGithub: ThemeConfig = {
  codeThemeId: "github-light",
  variant: "light",
  theme: {
    accent: "#0969da",
    contrast: 40,
    fonts: {
      code: null,
      ui: null,
    },
    ink: "#1f2328",
    opaqueWindows: true,
    semanticColors: {
      diffAdded: "#1a7f37",
      diffRemoved: "#cf222e",
      skill: "#0969da",
    },
    surface: "#ffffff",
  },
};

export const lightAbsolutely = lightGithub;

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

export const darkGithub: ThemeConfig = {
  codeThemeId: "github-dark",
  variant: "dark",
  theme: {
    accent: "#1f6feb",
    contrast: 44,
    fonts: {
      code: null,
      ui: null,
    },
    ink: "#e6edf3",
    opaqueWindows: true,
    semanticColors: {
      diffAdded: "#3fb950",
      diffRemoved: "#f85149",
      skill: "#1f6feb",
    },
    surface: "#0d1117",
  },
};

export const darkAbsolutely = darkGithub;

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

export const darkLobster: ThemeConfig = {
  codeThemeId: "lobster-dark",
  variant: "dark",
  theme: {
    accent: "#ff5c5c",
    contrast: 44,
    fonts: {
      code: null,
      ui: null,
    },
    ink: "#e4e4e7",
    opaqueWindows: true,
    semanticColors: {
      diffAdded: "#4ade80",
      diffRemoved: "#f87171",
      skill: "#ff5c5c",
    },
    surface: "#111827",
  },
};

export const presets: ThemeConfig[] = [
  lightGithub,
  lightEverforest,
  darkGithub,
  darkEverforest,
  darkLobster,
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
