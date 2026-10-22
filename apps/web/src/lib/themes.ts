import { LEGACY_THEME_MODE_KEY, LEGACY_THEME_STORE_KEY } from "@/constants/storage-keys";

/**
 * Tatalaku themes.
 *
 * Every theme shares one layout, type scale and component set; a theme only
 * swaps the color tokens. The palettes themselves live in globals.css under
 * `[data-theme="…"]` — this module holds the metadata the UI needs (names,
 * color scheme) and the logic that picks a theme, so no color value is ever
 * duplicated in TypeScript.
 */

export const THEME_IDS = ["parchment", "clarity", "nocturne"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** A named theme, or "system" to follow the device's light/dark setting */
export type ThemePreference = ThemeId | "system";

export type ColorScheme = "light" | "dark";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  /** The design direction the palette expresses */
  style: string;
  description: string;
  colorScheme: ColorScheme;
}

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: "parchment",
    name: "Parchment",
    style: "Warm Editorial",
    description: "Warm ivory paper, ink-dark text and muted olive accents.",
    colorScheme: "light",
  },
  {
    id: "clarity",
    name: "Clarity",
    style: "Quiet Minimalism",
    description: "Cool neutral surfaces, crisp lines and slate accents.",
    colorScheme: "light",
  },
  {
    id: "nocturne",
    name: "Nocturne",
    style: "Soft Contrast",
    description: "Charcoal surfaces, warm off-white text and champagne accents.",
    colorScheme: "dark",
  },
];

/** The signature theme, used on a first visit */
export const DEFAULT_THEME: ThemeId = "parchment";

/** Themes used while following the device setting */
export const SYSTEM_THEMES: Readonly<Record<ColorScheme, ThemeId>> = {
  light: "parchment",
  dark: "nocturne",
};

export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || isThemeId(value);
}

export function getTheme(id: ThemeId): ThemeDefinition {
  // THEMES covers every ThemeId, so the fallback is never reached
  return THEMES.find((theme) => theme.id === id) ?? (THEMES[0] as ThemeDefinition);
}

/** The theme that is actually rendered for a preference */
export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ThemeId {
  if (preference !== "system") return preference;
  return prefersDark ? SYSTEM_THEMES.dark : SYSTEM_THEMES.light;
}

/** The old light/dark/system switch, mapped onto the closest new preference */
export const LEGACY_MODE_PREFERENCES: Readonly<Record<string, ThemePreference>> = {
  light: "parchment",
  dark: "nocturne",
  system: "system",
};

/**
 * Preference for a device that has no stored theme yet. Someone who used the
 * old light/dark switch keeps an equivalent theme; the old default was to
 * follow the OS, so existing users keep doing that; first-time visitors get
 * Parchment. The pre-paint script (lib/prepaint.ts) applies the same rules.
 */
export function initialThemePreference(storage: Pick<Storage, "getItem">): ThemePreference {
  const legacyMode = storage.getItem(LEGACY_THEME_MODE_KEY);
  const carried = legacyMode === null ? undefined : LEGACY_MODE_PREFERENCES[legacyMode];
  if (carried) return carried;
  return storage.getItem(LEGACY_THEME_STORE_KEY) !== null ? "system" : DEFAULT_THEME;
}
