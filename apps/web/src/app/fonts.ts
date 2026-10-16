import localFont from "next/font/local";

// Self-hosted (OFL, see ./fonts/LICENSE.txt): no build-time or runtime request
// to Google Fonts, so the UI looks the same offline, behind proxies and in CI.
// Only the latin subsets are shipped.

/** Body / UI */
export const fontSans = localFont({
  src: "./fonts/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
  fallback: ["DM Sans", "system-ui", "sans-serif"],
});

/** ALL CAPS labels, data, code */
export const fontMono = localFont({
  src: [
    { path: "./fonts/space-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-mono-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-mono",
  display: "swap",
  // The default metric-adjusted fallback is Arial, which is proportional:
  // reaching it would misalign code. Fall back to real monospace fonts instead.
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

/**
 * Dot-matrix display face for hero numbers only (36px+). Not preloaded.
 * No fallback of its own: the `font-display` utility (globals.css) continues
 * with Space Mono, so numbers stay monospaced while Doto loads.
 */
export const fontDisplay = localFont({
  src: "./fonts/doto-latin-wght-normal.woff2",
  variable: "--font-doto",
  weight: "100 900",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});
