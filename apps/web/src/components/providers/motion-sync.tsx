"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";
import { REDUCED_MOTION_QUERY, resolveMotionMode } from "@/lib/motion";

/**
 * Keeps `data-motion` and `data-reading-size` on <html> in sync with the
 * Appearance settings (both are first set before paint by lib/prepaint.ts).
 */
export function MotionSync(): null {
  const motion = useUIStore((s) => s.motion);
  const readingSize = useUIStore((s) => s.readingSize);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const apply = () => {
      document.documentElement.dataset["motion"] = resolveMotionMode(motion, media.matches);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [motion]);

  useEffect(() => {
    const root = document.documentElement;
    if (readingSize === "default") delete root.dataset["readingSize"];
    else root.dataset["readingSize"] = readingSize;
  }, [readingSize]);

  return null;
}
