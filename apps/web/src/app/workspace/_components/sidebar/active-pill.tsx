"use client";

import { m } from "motion/react";
import { TWEEN } from "@/components/motion";
import { SIDEBAR_ACTIVE_LAYOUT_ID } from "./constants";

/**
 * The active row's highlight: a selected fill behind the row. One shared
 * layoutId, so it glides between the nav items and the page tree. The row
 * also turns medium weight and sets aria-current, so the state never rests
 * on the fill alone. `data-drop-line` keeps it out of the page-row drag image.
 */
export function SidebarActivePill() {
  return (
    <m.span
      layoutId={SIDEBAR_ACTIVE_LAYOUT_ID}
      data-drop-line
      className="absolute inset-0 -z-10 rounded-codex-md bg-codex-selected"
      transition={TWEEN}
      aria-hidden="true"
    />
  );
}
