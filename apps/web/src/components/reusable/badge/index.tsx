import type { BadgeProps, BadgeStatus, BadgeVariant, BadgeSize } from "./types";

function getStatusClasses(status: BadgeStatus, variant: BadgeVariant): string {
  const map: Record<BadgeStatus, Record<BadgeVariant, string>> = {
    default: {
      // Nothing-style tag: an outline and no fill
      subtle: "border border-codex-border-strong text-codex-muted bg-transparent",
      solid: "bg-codex-foreground text-codex-background",
      outline: "border border-codex-border-strong text-codex-foreground bg-transparent",
    },
    primary: {
      subtle: "bg-codex-accent/15 text-codex-accent border border-codex-accent/30",
      solid: "bg-codex-accent text-codex-background",
      outline: "border border-codex-accent text-codex-accent bg-transparent",
    },
    success: {
      subtle: "bg-codex-success-bg text-codex-success border border-codex-success/20",
      solid: "bg-codex-success text-codex-background",
      outline: "border border-codex-success text-codex-success bg-transparent",
    },
    warning: {
      subtle: "bg-codex-accent/15 text-codex-accent border border-codex-accent/20",
      solid: "bg-codex-accent text-codex-background",
      outline: "border border-codex-accent text-codex-accent bg-transparent",
    },
    danger: {
      subtle: "bg-codex-danger-bg text-codex-danger border border-codex-danger/20",
      solid: "bg-codex-danger text-codex-background",
      outline: "border border-codex-danger text-codex-danger bg-transparent",
    },
    info: {
      subtle: "bg-codex-info-bg text-codex-info border border-codex-info/20",
      solid: "bg-codex-info text-codex-background",
      outline: "border border-codex-info text-codex-info bg-transparent",
    },
  };

  return map[status][variant];
}

function getSizeClasses(size: BadgeSize): string {
  const map: Record<BadgeSize, string> = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-2.5 py-0.5 text-xs",
  };
  return map[size];
}

function getDotClasses(status: BadgeStatus): string {
  const map: Record<BadgeStatus, string> = {
    default: "bg-codex-muted",
    primary: "bg-codex-accent",
    success: "bg-codex-success",
    warning: "bg-codex-accent",
    danger: "bg-codex-danger",
    info: "bg-codex-info",
  };
  return map[status];
}

export function Badge({
  status = "default",
  variant = "subtle",
  size = "medium",
  dot = false,
  className = "",
  children,
}: BadgeProps) {
  const statusStyles = getStatusClasses(status, variant);
  const sizeStyles = getSizeClasses(size);
  const dotColor = getDotClasses(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-label rounded-full select-none ${sizeStyles} ${statusStyles} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      {children && <span>{children}</span>}
    </span>
  );
}

export default Badge;
export type { BadgeProps, BadgeStatus, BadgeVariant, BadgeSize };
