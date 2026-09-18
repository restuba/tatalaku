import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import type { Attributes } from "@tiptap/core";

/**
 * Shared color attributes for table cells and header cells.
 *
 * `backgroundColor` and `color` are persisted as node attributes and rendered
 * as inline styles, so they round-trip through the page `content` JSON without
 * any change to `packages/shared`. Values come from the Codex-aligned palette
 * in `table-colors.ts` (CSS-variable based), keeping them theme-aware.
 */
function colorAttributes(): Attributes {
  return {
    backgroundColor: {
      default: null as string | null,
      parseHTML: (element) => element.getAttribute("data-background-color"),
      renderHTML: (attributes: { backgroundColor?: string | null }) => {
        if (!attributes.backgroundColor) return {};
        return {
          "data-background-color": attributes.backgroundColor,
          style: `background-color: ${attributes.backgroundColor}`,
        };
      },
    },
    color: {
      default: null as string | null,
      parseHTML: (element) => element.getAttribute("data-color"),
      renderHTML: (attributes: { color?: string | null }) => {
        if (!attributes.color) return {};
        return {
          "data-color": attributes.color,
          style: `color: ${attributes.color}`,
        };
      },
    },
  };
}

/**
 * TableCell extended with theme-aware color attributes.
 *
 * `mergeNestedStyles` is not built into Tiptap's attribute renderer, so when
 * both `backgroundColor` and `color` are set they each contribute a `style`
 * entry; Tiptap merges duplicate `style` attributes for us via mergeAttributes
 * at render time.
 */
export const ColorTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...colorAttributes(),
    };
  },
});

/** TableHeader extended with the same color attributes as ColorTableCell. */
export const ColorTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...colorAttributes(),
    };
  },
});
