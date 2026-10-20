/**
 * Design Tokens
 * ─────────────────────────────────────────────────────────────────────
 * TypeScript handles to the semantic tokens defined in app/globals.css.
 * Values are CSS variables, so they follow the active theme (Parchment,
 * Clarity or Nocturne); no color is restated here.
 */

export const THEME_VARIABLES = {
  background: "var(--color-surface)",
  sidebar: "var(--color-sidebar)",
  surfaceSecondary: "var(--color-surface-secondary)",
  elevated: "var(--color-elevated)",
  hover: "var(--color-hover)",
  selected: "var(--color-selected)",
  border: "var(--color-border)",
  borderStrong: "var(--color-border-strong)",
  foreground: "var(--color-ink)",
  muted: "var(--color-muted)",
  faint: "var(--color-faint)",
  accent: "var(--color-accent)",
  accentSoft: "var(--color-accent-soft)",
  accentSecondary: "var(--color-accent-secondary)",
  focus: "var(--color-focus)",
  danger: "var(--color-danger)",
  dangerBg: "var(--color-danger-bg)",
  success: "var(--color-success)",
  successBg: "var(--color-success-bg)",
  warning: "var(--color-warning)",
  warningBg: "var(--color-warning-bg)",
  info: "var(--color-info)",
  infoBg: "var(--color-info-bg)",
} as const;

export type StatusTone = "success" | "warning" | "danger" | "info" | "default";

/** Status pairs: a soft background with the matching text color */
export const STATUS_CLASSES: Record<StatusTone, { bg: string; text: string; border: string }> = {
  success: {
    bg: "bg-codex-success-bg",
    text: "text-codex-success",
    border: "border-codex-success/30",
  },
  warning: {
    bg: "bg-codex-warning-bg",
    text: "text-codex-warning",
    border: "border-codex-warning/30",
  },
  danger: {
    bg: "bg-codex-danger-bg",
    text: "text-codex-danger",
    border: "border-codex-danger/30",
  },
  info: {
    bg: "bg-codex-info-bg",
    text: "text-codex-info",
    border: "border-codex-info/30",
  },
  default: {
    bg: "bg-codex-surface-secondary",
    text: "text-codex-foreground",
    border: "border-codex-border",
  },
};

export const FONT_VARIABLES = {
  /** Inter: interface and prose */
  sans: "var(--font-ui-stack)",
  /** Fraunces: display text and document headings */
  serif: "var(--font-serif-stack)",
  /** System monospace: code */
  mono: "var(--font-code-stack)",
} as const;
