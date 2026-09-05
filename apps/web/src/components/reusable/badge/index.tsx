import type { BadgeProps, BadgeStatus, BadgeVariant, BadgeSize } from "./types";

function getStatusClasses(status: BadgeStatus, variant: BadgeVariant): string {
  const map: Record<BadgeStatus, Record<BadgeVariant, string>> = {
    default: {
      subtle: "bg-surface-secondary text-ink border border-border",
      solid: "bg-muted text-surface",
      outline: "border border-border text-ink bg-transparent",
    },
    success: {
      subtle: "bg-success-bg text-success border border-success/20",
      solid: "bg-success text-surface",
      outline: "border border-success text-success bg-transparent",
    },
    warning: {
      subtle: "bg-accent/15 text-accent border border-accent/20",
      solid: "bg-accent text-surface",
      outline: "border border-accent text-accent bg-transparent",
    },
    danger: {
      subtle: "bg-danger-bg text-danger border border-danger/20",
      solid: "bg-danger text-surface",
      outline: "border border-danger text-danger bg-transparent",
    },
    info: {
      subtle: "bg-info-bg text-info border border-info/20",
      solid: "bg-info text-surface",
      outline: "border border-info text-info bg-transparent",
    },
  };

  return map[status][variant];
}

function getSizeClasses(size: BadgeSize): string {
  const map: Record<BadgeSize, string> = {
    small: "px-1.5 py-0.5 text-[11px]",
    medium: "px-2 py-0.5 text-xs",
  };
  return map[size];
}

function getDotClasses(status: BadgeStatus): string {
  const map: Record<BadgeStatus, string> = {
    default: "bg-muted",
    success: "bg-success",
    warning: "bg-accent",
    danger: "bg-danger",
    info: "bg-info",
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
      className={`inline-flex items-center gap-1.5 font-medium rounded-full select-none ${sizeStyles} ${statusStyles} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      {children && <span>{children}</span>}
    </span>
  );
}

export default Badge;
export type { BadgeProps, BadgeStatus, BadgeVariant, BadgeSize };
