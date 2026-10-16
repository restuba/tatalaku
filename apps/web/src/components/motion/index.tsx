"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, type Transition } from "motion/react";
import { useUIStore, type MotionPreference } from "@/stores/ui-store";

/**
 * App-wide animation setup.
 * - LazyMotion + async features: only the tiny `m` renderer ships up front;
 *   the animation engine streams in after hydration.
 * - `strict` forbids the heavy `motion.*` components — always use `m.*`.
 * - Settings → Appearance → Motion maps onto MotionConfig.reducedMotion, so
 *   every motion component (springs, layout, presence) obeys the toggle.
 */

const loadFeatures = () => import("./features").then((mod) => mod.default);

const REDUCED_MOTION: Record<MotionPreference, "user" | "always" | "never"> = {
  system: "user",
  on: "never",
  off: "always",
};

/**
 * Workspace motion is mechanical and quiet: short ease-out tweens, opacity
 * before position, never a spring or bounce.
 */
export const EASE_NOTHING: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
/** Micro interactions: menus, highlights, toggles */
export const TWEEN_FAST: Transition = { duration: 0.18, ease: EASE_NOTHING };
/** Larger surfaces: dialogs, panels, collapsing sections */
export const TWEEN: Transition = { duration: 0.26, ease: EASE_NOTHING };

/** Springs for the landing page's more playful demo */
export const SPRING: Transition = { type: "spring", stiffness: 520, damping: 38, mass: 0.8 };
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 340, damping: 32, mass: 0.9 };
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function MotionProvider({ children }: { children: ReactNode }) {
  const motion = useUIStore((s) => s.motion);
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion={REDUCED_MOTION[motion]} transition={TWEEN_FAST}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
