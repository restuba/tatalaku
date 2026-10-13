"use client";

import { useEffect } from "react";
import { useUIStore, UI_STORE_KEY } from "@/stores/ui-store";
import { REDUCED_MOTION_QUERY, resolveMotionMode } from "@/lib/motion";

/**
 * Inline script that sets `data-motion` before first paint, so users who
 * turned animations off never see entrance animations flash on load.
 * Mirrors resolveMotionMode(); keep the two in sync.
 */
export const MOTION_PREPAINT_SCRIPT = `(function(){try{var p="system";var raw=localStorage.getItem(${JSON.stringify(
  UI_STORE_KEY,
)});if(raw){var s=JSON.parse(raw);if(s&&s.state&&typeof s.state.motion==="string"){p=s.state.motion}}var r=p==="off"||(p==="system"&&window.matchMedia(${JSON.stringify(
  REDUCED_MOTION_QUERY,
)}).matches);document.documentElement.dataset.motion=r?"reduce":"full"}catch(e){}})();`;

/** Keeps `data-motion` on <html> in sync with the setting and the OS preference. */
export function MotionSync(): null {
  const motion = useUIStore((s) => s.motion);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const apply = () => {
      document.documentElement.dataset["motion"] = resolveMotionMode(motion, media.matches);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [motion]);

  return null;
}
