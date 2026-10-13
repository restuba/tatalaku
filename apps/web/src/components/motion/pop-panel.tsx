"use client";

import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { SPRING } from "./index";

type Origin = "top left" | "top right" | "bottom left" | "bottom right" | "top" | "bottom";

interface PopPanelProps {
  open: boolean;
  children: ReactNode;
  className?: string;
  /** Viewport coordinates for a fixed-position menu (pair with `fixed` in className) */
  position?: { top: number; left: number } | undefined;
  /** Corner the panel grows out of — usually the side its trigger sits on */
  origin?: Origin;
  role?: string;
  id?: string;
}

/**
 * Animated container for dropdowns and popovers: springs out of its trigger
 * corner on open and fades away on close (stays mounted until the exit ends).
 * Positioning stays with the caller's className/style.
 */
export function PopPanel({
  open,
  children,
  className = "",
  position,
  origin = "top left",
  role,
  id,
}: PopPanelProps) {
  const fromAbove = origin.startsWith("top");
  return (
    <AnimatePresence>
      {open && (
        <m.div
          id={id}
          role={role}
          className={className}
          style={
            position
              ? { top: position.top, left: position.left, transformOrigin: origin }
              : { transformOrigin: origin }
          }
          initial={{ opacity: 0, scale: 0.94, y: fromAbove ? -6 : 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
          transition={SPRING}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
}
