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
      className={`inline-flex items-center rounded-md border border-border bg-surface-secondary p-0.5 ${className}`}
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
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all cursor-pointer select-none ${
              isSelected
                ? "bg-surface text-ink shadow-xs border border-border"
                : "text-muted hover:text-ink border border-transparent"
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
