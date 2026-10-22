/**
 * Document text size (Settings → Appearance). Applied as `data-reading-size`
 * on <html>; globals.css maps it to `--reading-size`. Interface text and the
 * layout stay the same, only document prose scales.
 */
export const READING_SIZES = ["small", "default", "large"] as const;

export type ReadingSize = (typeof READING_SIZES)[number];

export function isReadingSize(value: unknown): value is ReadingSize {
  return typeof value === "string" && (READING_SIZES as readonly string[]).includes(value);
}
