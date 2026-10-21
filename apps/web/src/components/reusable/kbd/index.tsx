import type { ReactNode } from "react";
import { useModKey } from "@/lib/platform";

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

/**
 * A key chip for a shortcut whose primary modifier is the platform's: renders
 * ⌘ on Apple devices and Ctrl elsewhere, followed by `children` (e.g. "K").
 */
export function ModKey({ children, className }: { children?: ReactNode; className?: string }) {
  const mod = useModKey();
  return (
    <Kbd className={className}>
      {mod}
      {children}
    </Kbd>
  );
}

export default Kbd;
