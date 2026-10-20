"use client";

import type { ReactNode } from "react";

export interface ViewModeOption<T extends string> {
  value: T;
  label?: string | undefined;
  icon?: ReactNode | undefined;
}

export interface ViewModeToggleProps<T extends string> {
  value: T;
  options: ViewModeOption<T>[];
  onChange: (value: T) => void;
  className?: string | undefined;
}

export function ViewModeToggle<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: ViewModeToggleProps<T>) {
  return (
    <div
      className={`inline-flex items-center rounded-codex-md border border-codex-border bg-codex-surface-secondary p-0.5 ${className}`}
      role="radiogroup"
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-1.5 rounded-codex-sm border px-2.5 py-1 text-xs font-medium transition-colors select-none ${
              isSelected
                ? "border-codex-border bg-codex-elevated text-codex-foreground shadow-codex-sm"
                : "border-transparent text-codex-muted hover:text-codex-foreground"
            }`}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            {option.label && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default ViewModeToggle;
