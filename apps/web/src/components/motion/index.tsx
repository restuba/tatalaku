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

/** Snappy, slightly springy default used across the UI */
export const SPRING: Transition = { type: "spring", stiffness: 520, damping: 38, mass: 0.8 };
/** Softer spring for larger surfaces (dialogs, panels) */
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 340, damping: 32, mass: 0.9 };
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function MotionProvider({ children }: { children: ReactNode }) {
  const motion = useUIStore((s) => s.motion);
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion={REDUCED_MOTION[motion]} transition={SPRING}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
