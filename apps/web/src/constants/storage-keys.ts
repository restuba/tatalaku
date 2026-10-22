/**
 * localStorage keys for device-level preferences. Kept in a plain module (no
 * "use client") because the root layout's pre-paint script reads them too.
 */

/** Persisted UI store: layout, motion and reading preferences */
export const UI_STORE_KEY = "tatalaku-ui-v1";

/** Persisted theme preference (see stores/theme-store.ts) */
export const THEME_STORE_KEY = "tatalaku-theme";

/**
 * Keys written by the pre-redesign theme system (next-themes' mode and the
 * old preset store). Read once to carry a user's choice over, then removed.
 */
export const LEGACY_THEME_MODE_KEY = "theme";
export const LEGACY_THEME_STORE_KEY = "tatalaku-theme-v1";
