import localFont from "next/font/local";

// Self-hosted (OFL, see ./fonts/LICENSE.txt): no build-time or runtime request
// to Google Fonts, so the UI looks the same offline, behind proxies and in CI.
// Latin subsets only — they cover Indonesian and Western European text; any
// other script falls back to the system font glyph by glyph.
//
// Typography is the same in every theme: themes only change colors.

/** Inter: interface, body text and document prose */
export const fontSans = localFont({
  src: [
    { path: "./fonts/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/inter-latin-wght-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

/**
 * Fraunces: the editorial voice for display text, page titles and document
 * headings. Ships with the optical-size axis, so the same file is sturdy at
 * heading sizes and refined at display sizes (`font-optical-sizing: auto`).
 * Not preloaded: it is only needed for headings, and its metric-matched
 * fallback keeps the swap from shifting the layout.
 */
export const fontSerif = localFont({
  src: [
    { path: "./fonts/fraunces-latin-opsz-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-latin-opsz-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
  fallback: ["Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
});
