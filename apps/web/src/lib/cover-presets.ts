import type { PromptPreset } from "@/stores/dialog-store";

/**
 * Built-in page covers: gentle linear gradients, no network needed. Each is a
 * data-URL SVG so it saves like any other cover URL. Colors are literal (not
 * theme tokens) so a cover looks the same in every theme, the way a real
 * photo would. The CSS `background` is the same gradient, so the dialog
 * swatch and the saved cover match exactly.
 */
interface CoverPreset {
  label: string;
  /** CSS gradient, reused for both the saved SVG and the dialog swatch */
  gradient: string;
}

const PRESETS: ReadonlyArray<CoverPreset> = [
  { label: "Sage", gradient: "linear-gradient(105deg, #8a9a7b 0%, #d9c7a7 100%)" },
  { label: "Clay", gradient: "linear-gradient(105deg, #b07250 0%, #e4d3bd 100%)" },
  { label: "Dusk", gradient: "linear-gradient(105deg, #46607a 0%, #9aa7b4 100%)" },
  { label: "Rose", gradient: "linear-gradient(105deg, #a65d6e 0%, #e6cdbd 100%)" },
  { label: "Slate", gradient: "linear-gradient(105deg, #3f4a4a 0%, #8f9a94 100%)" },
  { label: "Amber", gradient: "linear-gradient(105deg, #b8862f 0%, #ead9b0 100%)" },
];

/** Turn a two-stop CSS linear-gradient into an SVG linearGradient data URL */
function gradientToDataUrl(gradient: string): string {
  const angleMatch = gradient.match(/([\d.]+)deg/);
  const angle = angleMatch ? Number(angleMatch[1]) : 105;
  const stops = [...gradient.matchAll(/(#[0-9a-f]{3,8})\s+([\d.]+)%/gi)].map((m) => ({
    color: m[1],
    offset: `${m[2]}%`,
  }));
  // CSS gradient angles go clockwise from "up"; map to an SVG vector.
  const rad = ((angle - 90) * Math.PI) / 180;
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  const x1 = (50 - x * 50).toFixed(2);
  const y1 = (50 - y * 50).toFixed(2);
  const x2 = (50 + x * 50).toFixed(2);
  const y2 = (50 + y * 50).toFixed(2);
  const stopEls = stops.map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="500">` +
    `<defs><linearGradient id="g" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stopEls}</linearGradient></defs>` +
    `<rect width="1600" height="500" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Cover presets as prompt-dialog swatches */
export const COVER_PRESETS: ReadonlyArray<PromptPreset> = PRESETS.map((p) => ({
  label: p.label,
  value: gradientToDataUrl(p.gradient),
  swatch: p.gradient,
}));
