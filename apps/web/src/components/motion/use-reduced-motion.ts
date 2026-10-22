"use client";

import { useReducedMotionConfig } from "motion/react";
import { useIsMounted } from "@/hooks/use-is-mounted";

/**
 * Whether JS-driven effects (tilt, typing demos, cycling text) should hold
 * still, honoring Settings → Appearance → Motion via MotionConfig.
 *
 * Always `false` during SSR and the hydration pass: the server can't know the
 * user's preference, so the first client render must match the server HTML.
 * Components re-render with the real value right after mounting.
 */
export function useShouldReduceMotion(): boolean {
  const isMounted = useIsMounted();
  const shouldReduce = useReducedMotionConfig();
  return isMounted && shouldReduce === true;
}
