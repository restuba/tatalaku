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
    bg: "bg-success-bg",
    text: "text-success",
    border: "border-success/20",
  },
  warning: {
    bg: "bg-accent/15",
    text: "text-accent",
    border: "border-accent/20",
  },
  danger: {
    bg: "bg-danger-bg",
    text: "text-danger",
    border: "border-danger/20",
  },
  info: {
    bg: "bg-info-bg",
    text: "text-info",
    border: "border-info/20",
  },
  default: {
    bg: "bg-surface-secondary",
    text: "text-ink",
    border: "border-border",
  },
};

export const FONT_VARIABLES = {
  ui: "var(--font-ui)",
  code: "var(--font-code)",
} as const;
