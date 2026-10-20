"use client";

import { forwardRef } from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name when no visible label is associated (aria-labelledby) */
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  className?: string | undefined;
}

/**
 * On/off switch. The thumb position carries the state as well as the track
 * color, so it never relies on color alone.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, disabled = false, className = "", ...aria }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-150 disabled:opacity-50 ${
        checked ? "bg-codex-accent" : "bg-codex-faint"
      } ${className}`}
      {...aria}
    >
      <span
        aria-hidden="true"
        className={`size-4 rounded-full bg-codex-elevated transition-transform duration-150 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  ),
);

Switch.displayName = "Switch";

export default Switch;
