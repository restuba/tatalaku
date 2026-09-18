/**
 * Table cell color palette for the Notion-style simple table.
 *
 * Colors are aligned with the existing Codex theme tokens. Instead of
 * hardcoding hex values, every swatch is derived from theme CSS variables
 * (`--color-ink`, `--color-surface`, `--color-accent`, status colors) via
 * `color-mix`, so the palette adapts to light/dark and the active code theme.
 *
 * These strings are stored verbatim as Tiptap node attributes (`color` /
 * `backgroundColor`) on table cells and applied as inline `style`. Because they
 * reference CSS variables, they resolve correctly whichever theme is active.
 */

export interface TableColorOption {
  /** Stable key persisted nowhere by itself; used for menu state/highlight. */
  key: string;
  /** Human-readable label shown in the menu. */
  label: string;
  /** CSS color value applied to the cell (text or background). `null` = default. */
  value: string | null;
}

/**
 * Text colors. `value` is applied to the cell's `color` style.
 * "Default" clears the attribute so the cell inherits the theme foreground.
 */
export const TABLE_TEXT_COLORS: TableColorOption[] = [
  { key: "default", label: "Default", value: null },
  { key: "muted", label: "Gray", value: "color-mix(in srgb, var(--color-ink) 55%, transparent)" },
  { key: "accent", label: "Accent", value: "var(--color-accent)" },
  { key: "danger", label: "Red", value: "var(--color-danger)" },
  { key: "success", label: "Green", value: "var(--color-success)" },
  { key: "info", label: "Blue", value: "var(--color-info)" },
];

/**
 * Background colors. `value` is applied to the cell's `background-color` style.
 * Kept subtle (low color-mix percentages) to match Notion's soft cell tints and
 * to stay legible against both light and dark surfaces.
 */
export const TABLE_BACKGROUND_COLORS: TableColorOption[] = [
  { key: "default", label: "Default", value: null },
  {
    key: "gray",
    label: "Gray",
    value: "color-mix(in srgb, var(--color-ink) 8%, var(--color-surface))",
  },
  {
    key: "accent",
    label: "Accent",
    value: "color-mix(in srgb, var(--color-accent) 16%, var(--color-surface))",
  },
  {
    key: "red",
    label: "Red",
    value: "color-mix(in srgb, var(--color-danger) 16%, var(--color-surface))",
  },
  {
    key: "green",
    label: "Green",
    value: "color-mix(in srgb, var(--color-success) 16%, var(--color-surface))",
  },
  {
    key: "blue",
    label: "Blue",
    value: "color-mix(in srgb, var(--color-info) 16%, var(--color-surface))",
  },
];
