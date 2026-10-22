import {
  LEGACY_THEME_MODE_KEY,
  LEGACY_THEME_STORE_KEY,
  THEME_STORE_KEY,
  UI_STORE_KEY,
} from "@/constants/storage-keys";
import { REDUCED_MOTION_QUERY } from "./motion";
import { READING_SIZES } from "./reading-size";
import {
  DARK_SCHEME_QUERY,
  DEFAULT_THEME,
  LEGACY_MODE_PREFERENCES,
  SYSTEM_THEMES,
  THEME_IDS,
} from "./themes";

const config = JSON.stringify({
  themeKey: THEME_STORE_KEY,
  legacyModeKey: LEGACY_THEME_MODE_KEY,
  legacyStoreKey: LEGACY_THEME_STORE_KEY,
  legacyModes: LEGACY_MODE_PREFERENCES,
  themes: THEME_IDS,
  defaultTheme: DEFAULT_THEME,
  systemLight: SYSTEM_THEMES.light,
  systemDark: SYSTEM_THEMES.dark,
  darkQuery: DARK_SCHEME_QUERY,
  uiKey: UI_STORE_KEY,
  reducedQuery: REDUCED_MOTION_QUERY,
  readingSizes: READING_SIZES,
});

/**
 * Runs in <head> before the first paint (a plain inline script — next/script's
 * beforeInteractive only queues inline code until the runtime loads). Sets:
 * - `data-theme`: the persisted theme (same rules as resolveTheme and
 *   initialThemePreference in lib/themes.ts), so no wrong theme flashes
 * - `data-motion`: mirrors resolveMotionMode() in lib/motion.ts
 * - `data-reading-size`: the document text size
 * - `data-full-width`: the content width preference, so the skeleton and the
 *   first content paint pick the right max-width before hydration (no flash
 *   of a narrow column for full-width users)
 * ThemeSync and MotionSync keep the attributes current afterwards.
 */
export const PREPAINT_SCRIPT = `(function(c){var d=document.documentElement;function get(k){try{return localStorage.getItem(k)}catch(e){return null}}function read(k){try{var r=get(k);return r?JSON.parse(r):null}catch(e){return null}}function matches(q){try{return window.matchMedia(q).matches}catch(e){return false}}var t=read(c.themeKey),p=t&&t.state?t.state.preference:null;if(p!=="system"&&c.themes.indexOf(p)===-1){var l=get(c.legacyModeKey);p=l!==null&&c.legacyModes[l]?c.legacyModes[l]:get(c.legacyStoreKey)!==null?"system":c.defaultTheme}d.setAttribute("data-theme",p==="system"?(matches(c.darkQuery)?c.systemDark:c.systemLight):p);var u=read(c.uiKey),s=u&&u.state?u.state:{},m=typeof s.motion==="string"?s.motion:"system";d.setAttribute("data-motion",m==="off"||(m==="system"&&matches(c.reducedQuery))?"reduce":"full");if(c.readingSizes.indexOf(s.readingSize)!==-1)d.setAttribute("data-reading-size",s.readingSize);if(s.isFullWidth===true)d.setAttribute("data-full-width","true")})(${config});`;
