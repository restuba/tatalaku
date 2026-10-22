"use client";

import { useSyncExternalStore } from "react";

/**
 * True on Apple platforms, where the command key (⌘) is the primary modifier.
 * Everywhere else the shortcuts use Ctrl.
 */
export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  // `userAgentData.platform` is the modern signal; fall back to the UA string.
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    navigator.userAgent;
  return /Mac|iPhone|iPad|iPod/i.test(platform);
}

const noopSubscribe = () => () => {};

/**
 * The display label for the primary modifier key: "⌘" on Apple platforms,
 * "Ctrl" elsewhere. Returns "Ctrl" during SSR and the first client render so
 * the markup matches, then settles to the real value after mount — so a hint
 * never shows ⌘ to a Windows or Linux user.
 */
export function useModKey(): "⌘" | "Ctrl" {
  const isApple = useSyncExternalStore(
    noopSubscribe,
    () => isApplePlatform(),
    () => false,
  );
  return isApple ? "⌘" : "Ctrl";
}
