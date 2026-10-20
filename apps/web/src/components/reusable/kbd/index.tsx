import type { ReactNode } from "react";

export interface KbdProps {
  children: ReactNode;
  className?: string | undefined;
}

/** A keyboard key chip for shortcut hints */
export function Kbd({ children, className = "" }: KbdProps) {
  return (
    <kbd
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-codex-sm border border-codex-border bg-codex-elevated px-1 font-sans text-xs leading-none text-codex-muted ${className}`}
    >
      {children}
    </kbd>
  );
}

export default Kbd;
