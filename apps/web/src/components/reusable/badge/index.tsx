import type { BadgeProps, BadgeStatus, BadgeVariant, BadgeSize } from "./types";

function getStatusClasses(status: BadgeStatus, variant: BadgeVariant): string {
  const map: Record<BadgeStatus, Record<BadgeVariant, string>> = {
    default: {
      subtle: "bg-codex-hover text-codex-muted",
      solid: "bg-codex-foreground text-codex-background",
      outline: "border border-codex-border-strong text-codex-foreground",
    },
    primary: {
      subtle: "bg-codex-accent-soft text-codex-accent",
      solid: "bg-codex-accent text-codex-background",
      outline: "border border-codex-accent text-codex-accent",
    },
    success: {
      subtle: "bg-codex-success-bg text-codex-success",
      solid: "bg-codex-success text-codex-background",
      outline: "border border-codex-success text-codex-success",
    },
    warning: {
      subtle: "bg-codex-warning-bg text-codex-warning",
      solid: "bg-codex-warning text-codex-background",
      outline: "border border-codex-warning text-codex-warning",
    },
    danger: {
      subtle: "bg-codex-danger-bg text-codex-danger",
      solid: "bg-codex-danger text-codex-background",
      outline: "border border-codex-danger text-codex-danger",
    },
    info: {
      subtle: "bg-codex-info-bg text-codex-info",
      solid: "bg-codex-info text-codex-background",
      outline: "border border-codex-info text-codex-info",
    },
  };

  return map[status][variant];
}

function getSizeClasses(size: BadgeSize): string {
  const map: Record<BadgeSize, string> = {
    small: "h-5 px-2 text-xs",
    medium: "h-6 px-2.5 text-xs",
  };
  return map[size];
}

function getDotClasses(status: BadgeStatus): string {
  const map: Record<BadgeStatus, string> = {
    default: "bg-codex-muted",
    primary: "bg-codex-accent",
    success: "bg-codex-success",
    warning: "bg-codex-warning",
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
      className={`inline-flex items-center gap-1.5 rounded-full font-medium capitalize select-none ${sizeStyles} ${statusStyles} ${className}`}
    >
      {dot && <span aria-hidden="true" className={`size-1.5 rounded-full ${dotColor}`} />}
      {children && <span>{children}</span>}
    </span>
  );
}

export default Badge;
export type { BadgeProps, BadgeStatus, BadgeVariant, BadgeSize };
