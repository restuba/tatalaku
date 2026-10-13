import type { MotionPreference } from "@/stores/ui-store";

/** Value of `data-motion` on <html>: "reduce" disables transitions/animations. */
export type MotionMode = "full" | "reduce";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function resolveMotionMode(
  pref: MotionPreference,
  systemPrefersReduced: boolean,
): MotionMode {
  if (pref === "off") return "reduce";
  if (pref === "on") return "full";
  return systemPrefersReduced ? "reduce" : "full";
}

/**
 * For imperative code (scrollIntoView, canvas loops) that CSS can't reach.
 * Reads the attribute set by the pre-paint script / MotionSync.
 */
export function isMotionReduced(): boolean {
  if (typeof document === "undefined") return true;
  return document.documentElement.dataset["motion"] === "reduce";
}

/** Smooth scrolling unless the user turned motion off. */
export function scrollBehavior(): ScrollBehavior {
  return isMotionReduced() ? "auto" : "smooth";
}
