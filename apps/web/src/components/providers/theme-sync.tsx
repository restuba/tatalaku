"use client";

import { useEffect } from "react";
import {
  LEGACY_THEME_MODE_KEY,
  LEGACY_THEME_STORE_KEY,
  THEME_STORE_KEY,
} from "@/constants/storage-keys";
import { DARK_SCHEME_QUERY, resolveTheme, type ThemeId } from "@/lib/themes";
import { useThemeStore } from "@/stores/theme-store";

/**
 * Swap `data-theme` without letting every `transition-colors` element animate
 * to its new color (that reads as a slow, uneven flash).
 */
function applyTheme(theme: ThemeId): void {
  const root = document.documentElement;
  if (root.getAttribute("data-theme") === theme) return;

  const freeze = document.createElement("style");
  freeze.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(freeze);
  root.setAttribute("data-theme", theme);
  // Flush styles with transitions off, then allow them again
  window.getComputedStyle(root).getPropertyValue("color");
  window.setTimeout(() => freeze.remove(), 1);
}

/** Browser UI color (mobile address bar) follows the page background */
function syncThemeColorMeta(): void {
  const color = getComputedStyle(document.documentElement).getPropertyValue("--color-surface");
  if (!color.trim()) return;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = color.trim();
}

/**
 * Keeps `data-theme` on <html> in sync with the theme store, the device's
 * light/dark setting (for "system") and other tabs. Only an attribute changes,
 * so switching themes never remounts the editor or touches document state.
 */
export function ThemeSync(): null {
  const preference = useThemeStore((s) => s.preference);

  useEffect(() => {
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const apply = () => {
      applyTheme(resolveTheme(preference, media.matches));
      syncThemeColorMeta();
    };
    apply();
    if (preference !== "system") return undefined;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);

  // A change in another tab arrives as a storage event: re-read it
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORE_KEY) void useThemeStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // First visit after the redesign: store the carried-over preference, then
  // drop the keys of the previous theme system
  useEffect(() => {
    try {
      if (window.localStorage.getItem(THEME_STORE_KEY) === null) {
        const { preference: current, setPreference } = useThemeStore.getState();
        setPreference(current);
      }
      window.localStorage.removeItem(LEGACY_THEME_MODE_KEY);
      window.localStorage.removeItem(LEGACY_THEME_STORE_KEY);
    } catch {
      // Storage unavailable (private mode, blocked): nothing to migrate
    }
  }, []);

  return null;
}
