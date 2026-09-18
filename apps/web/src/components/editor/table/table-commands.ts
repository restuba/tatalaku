import { Editor } from "@tiptap/react";
import { CellSelection, TableMap, selectedRect } from "@tiptap/pm/tables";
import { Transaction } from "@tiptap/pm/state";

/**
 * Low-level helpers around prosemirror-tables to implement Notion-style
 * column/row actions (color, duplicate, clear contents) that Tiptap's table
 * extension does not expose directly.
 *
 * All helpers assume the caller has already placed a text selection inside the
 * target cell (the TableControls component does this before invoking an action).
 */

type Axis = "column" | "row";

/** Apply a set of attributes to every cell in the current column or row. */
export function setCellsColor(
  editor: Editor,
  axis: Axis,
  attrs: { backgroundColor?: string | null; color?: string | null },
): boolean {
  const { state } = editor.view;
  let rect;
  try {
    rect = selectedRect(state);
  } catch {
    return false;
  }

  const { map, tableStart, table } = rect;
  const tr = state.tr;

  const cellsToUpdate: number[] = [];

  if (axis === "column") {
    for (let col = rect.left; col < rect.right; col += 1) {
      for (let row = 0; row < map.height; row += 1) {
        collectCell(map, table, tableStart, row, col, cellsToUpdate);
      }
    }
  } else {
    for (let row = rect.top; row < rect.bottom; row += 1) {
      for (let col = 0; col < map.width; col += 1) {
        collectCell(map, table, tableStart, row, col, cellsToUpdate);
      }
    }
  }

  applyAttrs(tr, editor, cellsToUpdate, attrs);

  if (tr.docChanged) {
    editor.view.dispatch(tr);
    return true;
  }
  return false;
}

/** Clear the text content of every cell in the current column or row. */
export function clearCellsContents(editor: Editor, axis: Axis): boolean {
  const { state } = editor.view;
  let rect;
  try {
    rect = selectedRect(state);
  } catch {
    return false;
  }

  const { map, tableStart, table } = rect;
  const tr = state.tr;
  const seen = new Set<number>();

  const iterate = (row: number, col: number) => {
    const cellPos = map.map[row * map.width + col];
    if (cellPos === undefined || seen.has(cellPos)) return;
    seen.add(cellPos);

    const cellNode = table.nodeAt(cellPos);
    if (!cellNode) return;

    const from = tableStart + cellPos + 1;
    const to = tableStart + cellPos + cellNode.nodeSize - 1;
    // Replace inner content with an empty paragraph.
    const paragraphType = state.schema.nodes.paragraph;
    if (!paragraphType) return;
    tr.replaceWith(from, to, paragraphType.create());
  };

  if (axis === "column") {
    for (let col = rect.left; col < rect.right; col += 1) {
      for (let row = 0; row < map.height; row += 1) iterate(row, col);
    }
  } else {
    for (let row = rect.top; row < rect.bottom; row += 1) {
      for (let col = 0; col < map.width; col += 1) iterate(row, col);
    }
  }

  if (tr.docChanged) {
    editor.view.dispatch(tr.setMeta("addToHistory", true));
    return true;
  }
  return false;
}

/**
 * Duplicate the current column or row.
 *
 * Implemented on top of Tiptap's add/copy commands: we add an adjacent
 * column/row, then copy the source cells' content and attributes into it.
 */
export function duplicateColumnOrRow(editor: Editor, axis: Axis): boolean {
  const { state } = editor.view;
  let rect;
  try {
    rect = selectedRect(state);
  } catch {
    return false;
  }

  const source = axis === "column" ? rect.left : rect.top;

  // Snapshot source cells before mutating the table.
  const snapshot = snapshotLine(rect.map, rect.table, rect.tableStart, axis, source, state);

  // Insert an empty adjacent column/row after the source.
  const added =
    axis === "column"
      ? editor.chain().focus().addColumnAfter().run()
      : editor.chain().focus().addRowAfter().run();

  if (!added) return false;

  // Re-read the table after the structural change and paste the snapshot.
  const freshState = editor.view.state;
  let freshRect;
  try {
    freshRect = selectedRect(freshState);
  } catch {
    return false;
  }

  const targetIndex = source + 1;
  const tr = freshState.tr;

  snapshot.forEach((cell, i) => {
    const map = freshRect.map;
    const targetPos =
      axis === "column"
        ? map.map[i * map.width + targetIndex]
        : map.map[targetIndex * map.width + i];
    if (targetPos === undefined) return;

    const cellNode = freshRect.table.nodeAt(targetPos);
    if (!cellNode) return;

    const from = freshRect.tableStart + targetPos;
    const to = from + cellNode.nodeSize;
    const newCell = cellNode.type.create({ ...cellNode.attrs, ...cell.attrs }, cell.content);
    tr.replaceWith(from, to, newCell);
  });

  if (tr.docChanged) {
    editor.view.dispatch(tr);
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* internal helpers                                                    */
/* ------------------------------------------------------------------ */

function collectCell(
  map: TableMap,
  table: import("@tiptap/pm/model").Node,
  _tableStart: number,
  row: number,
  col: number,
  out: number[],
): void {
  const cellPos = map.map[row * map.width + col];
  if (cellPos === undefined || out.includes(cellPos)) return;
  const cellNode = table.nodeAt(cellPos);
  if (!cellNode) return;
  out.push(cellPos);
}

function applyAttrs(
  tr: Transaction,
  editor: Editor,
  cellPositions: number[],
  attrs: { backgroundColor?: string | null; color?: string | null },
): void {
  const rect = selectedRect(editor.view.state);
  cellPositions.forEach((cellPos) => {
    const cellNode = rect.table.nodeAt(cellPos);
    if (!cellNode) return;
    const pos = rect.tableStart + cellPos;
    tr.setNodeMarkup(pos, undefined, { ...cellNode.attrs, ...attrs });
  });
}

function snapshotLine(
  map: TableMap,
  table: import("@tiptap/pm/model").Node,
  _tableStart: number,
  axis: Axis,
  index: number,
  _state: import("@tiptap/pm/state").EditorState,
): { attrs: Record<string, unknown>; content: import("@tiptap/pm/model").Fragment }[] {
  const cells: { attrs: Record<string, unknown>; content: import("@tiptap/pm/model").Fragment }[] =
    [];
  const length = axis === "column" ? map.height : map.width;

  for (let i = 0; i < length; i += 1) {
    const cellPos =
      axis === "column" ? map.map[i * map.width + index] : map.map[index * map.width + i];
    if (cellPos === undefined) continue;
    const cellNode = table.nodeAt(cellPos);
    if (!cellNode) continue;
    cells.push({ attrs: { ...cellNode.attrs }, content: cellNode.content });
  }

  return cells;
}

/** True when the current selection is a table CellSelection. */
export function isCellSelection(editor: Editor): boolean {
  return editor.view.state.selection instanceof CellSelection;
}

/**
 * Select the entire column or row that contains the current text selection,
 * producing a CellSelection. This is what turns a hovered column/row into the
 * "active" state (highlighted via `.selectedCell`) when the user clicks the
 * grip handle, mirroring Notion.
 */
export function selectColumnOrRow(editor: Editor, axis: Axis): boolean {
  const { state } = editor.view;
  let rect;
  try {
    rect = selectedRect(state);
  } catch {
    return false;
  }

  const { map, tableStart, table } = rect;

  const firstIndex = axis === "column" ? rect.left : rect.top;

  // Anchor = first cell of the line, head = last cell of the line.
  const anchorCellPos =
    axis === "column" ? map.map[0 * map.width + firstIndex] : map.map[firstIndex * map.width + 0];
  const headCellPos =
    axis === "column"
      ? map.map[(map.height - 1) * map.width + firstIndex]
      : map.map[firstIndex * map.width + (map.width - 1)];

  if (anchorCellPos === undefined || headCellPos === undefined) return false;

  const anchorNode = table.nodeAt(anchorCellPos);
  const headNode = table.nodeAt(headCellPos);
  if (!anchorNode || !headNode) return false;

  const $anchor = state.doc.resolve(tableStart + anchorCellPos);
  const $head = state.doc.resolve(tableStart + headCellPos);

  const selection = new CellSelection($anchor, $head);
  const tr = state.tr.setSelection(selection);
  editor.view.dispatch(tr);
  editor.view.focus();
  return true;
}
