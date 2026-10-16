"use client";

import { m } from "motion/react";
import { TWEEN } from "@/components/motion";
import { SIDEBAR_ACTIVE_LAYOUT_ID } from "./constants";

/**
 * The active row's highlight: a raised background with a signal bar on its
 * left edge. One shared layoutId, so it glides between the nav items and the
 * page tree. `data-drop-line` keeps it out of the page-row drag image.
 */
export function SidebarActivePill() {
  return (
    <m.span
      layoutId={SIDEBAR_ACTIVE_LAYOUT_ID}
      data-drop-line
      className="absolute inset-0 -z-10 rounded-codex-md bg-codex-surface-raised"
      transition={TWEEN}
      aria-hidden="true"
    >
      <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-codex-signal" />
    </m.span>
  );
}
