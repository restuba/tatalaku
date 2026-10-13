/**
 * Design Tokens
 * ─────────────────────────────────────────────────────────────────────
 * Standard tokens matching the Codex design system and globals.css.
 * All color references map to theme CSS variables or utility classes.
 */

export const THEME_VARIABLES = {
  surface: "var(--color-surface)",
  surfaceSecondary: "var(--color-surface-secondary)",
  border: "var(--color-border)",
  ink: "var(--color-ink)",
  muted: "var(--color-muted)",
  accent: "var(--color-accent)",
  danger: "var(--color-danger)",
  dangerBg: "var(--color-danger-bg)",
  success: "var(--color-success)",
  successBg: "var(--color-success-bg)",
  info: "var(--color-info)",
  infoBg: "var(--color-info-bg)",
} as const;

export type StatusTone = "success" | "warning" | "danger" | "info" | "default";

export const STATUS_CLASSES: Record<StatusTone, { bg: string; text: string; border: string }> = {
  success: {
    bg: "bg-codex-success-bg",
    text: "text-codex-success",
    border: "border-codex-success/20",
  },
  warning: {
    bg: "bg-codex-accent/15",
    text: "text-codex-accent",
    border: "border-codex-accent/20",
  },
  danger: {
    bg: "bg-codex-danger-bg",
    text: "text-codex-danger",
    border: "border-codex-danger/20",
  },
  info: {
    bg: "bg-codex-info-bg",
    text: "text-codex-info",
    border: "border-codex-info/20",
  },
  default: {
    bg: "bg-codex-surface-secondary",
    text: "text-codex-foreground",
    border: "border-codex-border",
  },
};

export const FONT_VARIABLES = {
  ui: "var(--font-ui)",
  code: "var(--font-code)",
} as const;
