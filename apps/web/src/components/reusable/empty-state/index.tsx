import type { ReactNode } from "react";

type Tone = "default" | "danger";

export interface EmptyStateProps {
  icon?: ReactNode;
  /** `danger` tints the icon for error states */
  tone?: Tone;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const ICON_TONE: Record<Tone, string> = {
  default: "bg-codex-surface-secondary text-codex-muted",
  danger: "bg-codex-danger-bg text-codex-danger",
};

/** Centered message for empty, not-found and error screens */
export function EmptyState({
  icon,
  tone = "default",
  title,
  description,
  actions,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center px-8 py-24 text-center ${className}`}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={`mb-6 flex size-12 items-center justify-center rounded-full ${ICON_TONE[tone]}`}
        >
          {icon}
        </span>
      )}
      <h2 className="font-serif text-3xl font-medium leading-tight text-codex-foreground text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-codex-muted text-pretty">
          {description}
        </p>
      )}
      {actions && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      )}
    </div>
  );
}

export default EmptyState;
