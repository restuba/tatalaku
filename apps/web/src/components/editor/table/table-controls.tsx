import { useEffect, useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import { GripHorizontal, GripVertical, Plus } from "lucide-react";
import { TableActionMenu } from "./table-action-menu";
import { selectColumnOrRow } from "./table-commands";

interface TableControlsProps {
  editor: Editor | null;
}

type ActiveMenu = "column" | "row" | null;

interface CellColors {
  color: string | null;
  backgroundColor: string | null;
}

/**
 * Notion-style contextual table controls.
 *
 * Behavior (mirrors Notion):
 * - Hovering the top edge of a column (or left edge of a row) reveals an
 *   elongated strip handle that spans the whole column width / row height. The
 *   strip itself is the indicator (there is no separate accent line).
 * - Clicking the strip selects the entire column/row (CellSelection => active
 *   state highlighted via `.selectedCell`), turns the strip solid accent, and
 *   opens the {@link TableActionMenu}.
 * - Thin "+" strips run along the right edge (add column) and bottom edge
 *   (add row) of the table.
 *
 * Reordering (drag to move a column/row) is out of scope for this phase.
 */
export function TableControls({ editor }: TableControlsProps) {
  const [tableRect, setTableRect] = useState<DOMRect | null>(null);
  const [cellRect, setCellRect] = useState<DOMRect | null>(null);
  // Column rect: cell horizontal span x table vertical span.
  // Row rect: table horizontal span x cell vertical span.
  const [colRect, setColRect] = useState<DOMRect | null>(null);
  const [rowRect, setRowRect] = useState<DOMRect | null>(null);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const [showColHandle, setShowColHandle] = useState(false);
  const [showRowHandle, setShowRowHandle] = useState(false);
  // Frozen rects for the column/row whose menu is open (the clicked one). Only
  // this one shows the 6-dot grip + active border; others keep the hover hint.
  const [activeColRect, setActiveColRect] = useState<DOMRect | null>(null);
  const [activeRowRect, setActiveRowRect] = useState<DOMRect | null>(null);
  const [activeColors, setActiveColors] = useState<CellColors>({
    color: null,
    backgroundColor: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const activeCellPos = useRef<number>(-1);

  useEffect(() => {
    if (!editor) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't recompute while interacting with our own controls (e.g. an open
      // menu), so the active grip/border stays put.
      if (containerRef.current?.contains(target)) return;

      const tableDOM = target.closest("table");
      const cellDOM = target.closest("td, th");

      if (!tableDOM || !cellDOM) {
        if (tableRect && !activeMenu) {
          const padding = 32;
          const relativeParent =
            editor.view.dom.closest(".relative") || editor.view.dom.parentElement;
          if (relativeParent) {
            const parentRect = relativeParent.getBoundingClientRect();
            const absTableLeft = tableRect.left + parentRect.left;
            const absTableTop = tableRect.top + parentRect.top;

            const isOutside =
              e.clientX < absTableLeft - padding ||
              e.clientX > absTableLeft + tableRect.width + padding ||
              e.clientY < absTableTop - padding ||
              e.clientY > absTableTop + tableRect.height + padding;

            if (isOutside) {
              setTableRect(null);
              setCellRect(null);
              setColRect(null);
              setRowRect(null);
              setShowColHandle(false);
              setShowRowHandle(false);
            }
          }
        }
        return;
      }

      const relativeParent = editor.view.dom.closest(".relative") || editor.view.dom.parentElement;
      if (!relativeParent) return;

      const newTableRect = tableDOM.getBoundingClientRect();
      const newCellRect = cellDOM.getBoundingClientRect();
      const parentRect = relativeParent.getBoundingClientRect();

      const relTable = new DOMRect(
        newTableRect.left - parentRect.left,
        newTableRect.top - parentRect.top,
        newTableRect.width,
        newTableRect.height,
      );
      const relCell = new DOMRect(
        newCellRect.left - parentRect.left,
        newCellRect.top - parentRect.top,
        newCellRect.width,
        newCellRect.height,
      );

      setTableRect(relTable);
      setCellRect(relCell);
      setColRect(new DOMRect(relCell.left, relTable.top, relCell.width, relTable.height));
      setRowRect(new DOMRect(relTable.left, relCell.top, relTable.width, relCell.height));

      // Whenever the cursor is inside a cell, show both the column handle (above
      // the hovered column) and the row handle (left of the hovered row), like
      // Notion — no need to aim for a specific edge zone or click first.
      setShowColHandle(true);
      setShowRowHandle(true);

      try {
        const pos = editor.view.posAtDOM(cellDOM, 0);
        if (typeof pos === "number") {
          activeCellPos.current = pos;
        }
      } catch {
        // Ignore posAtDOM failures near edges.
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [editor, activeMenu, tableRect]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenu && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setActiveColRect(null);
        setActiveRowRect(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setActiveColRect(null);
        setActiveRowRect(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeMenu]);

  if (!editor || !tableRect || !cellRect || !colRect || !rowRect) return null;

  /** Move the text selection into the currently hovered cell. */
  const ensureCellSelected = (): boolean => {
    if (activeCellPos.current === -1) return false;
    editor.chain().focus().setTextSelection(activeCellPos.current).run();
    return true;
  };

  const runChain = (
    action: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>,
  ) => {
    if (ensureCellSelected()) {
      action(editor.chain().focus()).run();
    }
    closeMenu();
  };

  /**
   * Strip click: select the whole column/row (active state), snapshot its
   * colors for the palette, then open the action menu.
   */
  const openMenu = (menu: Exclude<ActiveMenu, null>) => {
    if (activeMenu === menu) {
      closeMenu();
      return;
    }

    if (ensureCellSelected()) {
      selectColumnOrRow(editor, menu);

      const attrs = editor.getAttributes("tableCell");
      const headerAttrs = editor.getAttributes("tableHeader");
      setActiveColors({
        color: (attrs.color ?? headerAttrs.color ?? null) as string | null,
        backgroundColor: (attrs.backgroundColor ?? headerAttrs.backgroundColor ?? null) as
          string | null,
      });
    }

    // Freeze the clicked column/row so only it shows the grip + active border,
    // regardless of where the cursor moves afterwards.
    if (menu === "column") {
      setActiveColRect(colRect);
      setActiveRowRect(null);
    } else {
      setActiveRowRect(rowRect);
      setActiveColRect(null);
    }
    setActiveMenu(menu);
  };

  const closeMenu = () => {
    setActiveMenu(null);
    setActiveColRect(null);
    setActiveRowRect(null);
  };

  const goToEnd = (axis: "row" | "col"): boolean => {
    const relativeParent = editor.view.dom.closest(".relative") || editor.view.dom.parentElement;
    if (!relativeParent) return false;
    const parentRect = relativeParent.getBoundingClientRect();

    let x = tableRect.left + parentRect.left + tableRect.width - 10;
    let y = tableRect.top + parentRect.top + tableRect.height - 10;

    if (axis === "col") {
      y = tableRect.top + parentRect.top + 10;
    } else {
      x = tableRect.left + parentRect.left + 10;
    }

    const pos = editor.view.posAtCoords({ left: x, top: y });
    if (pos && pos.pos) {
      editor.chain().focus().setTextSelection(pos.pos).run();
      return true;
    }
    return false;
  };

  const columnActive = activeMenu === "column";
  const rowActive = activeMenu === "row";

  // Geometry constants.
  const SUGGESTION_LEN = 26; // hover hint length
  const SUGGESTION_THICK = 4; // hover hint thickness
  const GRIP_LEN = 30; // active grip main-axis length
  const GRIP_THICK = 14; // active grip cross-axis thickness
  const GAP = 4; // gap between handle and the column/row edge

  // Show the hover suggestion for the hovered column/row, but not for the one
  // that's currently active (it already shows the grip). This lets other
  // columns/rows keep showing their hint while one is active.
  const showColSuggestion = showColHandle && !columnActive;
  const showRowSuggestion = showRowHandle && !rowActive;

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
      {/* Active column: accent border around the whole column block. */}
      {columnActive && activeColRect && (
        <div
          className="absolute rounded-codex-sm border-2 border-codex-accent pointer-events-none z-[5]"
          style={{
            top: activeColRect.top,
            left: activeColRect.left,
            width: activeColRect.width,
            height: activeColRect.height,
          }}
        />
      )}

      {/* Active row: accent border around the whole row block. */}
      {rowActive && activeRowRect && (
        <div
          className="absolute rounded-codex-sm border-2 border-codex-accent pointer-events-none z-[5]"
          style={{
            top: activeRowRect.top,
            left: activeRowRect.left,
            width: activeRowRect.width,
            height: activeRowRect.height,
          }}
        />
      )}

      {/* Hover suggestion line above the hovered column (thin, short). */}
      {showColSuggestion && (
        <button
          type="button"
          aria-label="Column options"
          className="absolute rounded-codex-xl bg-codex-muted/70 hover:bg-codex-accent pointer-events-auto transition-colors"
          style={{
            top: colRect.top - (SUGGESTION_THICK + GAP),
            left: colRect.left + colRect.width / 2 - SUGGESTION_LEN / 2,
            width: SUGGESTION_LEN,
            height: SUGGESTION_THICK,
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => openMenu("column")}
        />
      )}

      {/* Active column grip (6 dots) + menu, on the frozen active rect. */}
      {columnActive && activeColRect && (
        <div
          className="absolute pointer-events-auto"
          style={{
            top: activeColRect.top - (GRIP_THICK + GAP),
            left: activeColRect.left + activeColRect.width / 2 - GRIP_LEN / 2,
            width: GRIP_LEN,
            height: GRIP_THICK,
          }}
        >
          <button
            type="button"
            aria-label="Column options"
            className="flex h-full w-full items-center justify-center rounded-codex-sm border border-codex-accent bg-codex-accent shadow-sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openMenu("column")}
          >
            <GripHorizontal className="h-3 w-3 text-codex-surface" />
          </button>
          <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 z-20">
            <TableActionMenu
              editor={editor}
              axis="column"
              onClose={closeMenu}
              runChain={runChain}
              ensureCellSelected={ensureCellSelected}
              activeColor={activeColors.color}
              activeBackground={activeColors.backgroundColor}
            />
          </div>
        </div>
      )}

      {/* Hover suggestion line left of the hovered row (thin, short). */}
      {showRowSuggestion && (
        <button
          type="button"
          aria-label="Row options"
          className="absolute rounded-codex-xl bg-codex-muted/70 hover:bg-codex-accent pointer-events-auto transition-colors"
          style={{
            top: rowRect.top + rowRect.height / 2 - SUGGESTION_LEN / 2,
            left: rowRect.left - (SUGGESTION_THICK + GAP),
            width: SUGGESTION_THICK,
            height: SUGGESTION_LEN,
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => openMenu("row")}
        />
      )}

      {/* Active row grip (6 dots) + menu, on the frozen active rect. */}
      {rowActive && activeRowRect && (
        <div
          className="absolute pointer-events-auto"
          style={{
            top: activeRowRect.top + activeRowRect.height / 2 - GRIP_LEN / 2,
            left: activeRowRect.left - (GRIP_THICK + GAP),
            width: GRIP_THICK,
            height: GRIP_LEN,
          }}
        >
          <button
            type="button"
            aria-label="Row options"
            className="flex h-full w-full items-center justify-center rounded-codex-sm border border-codex-accent bg-codex-accent shadow-sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openMenu("row")}
          >
            <GripVertical className="h-3 w-3 text-codex-surface" />
          </button>
          <div className="absolute left-full top-1/2 ml-1 -translate-y-1/2 z-20">
            <TableActionMenu
              editor={editor}
              axis="row"
              onClose={closeMenu}
              runChain={runChain}
              ensureCellSelected={ensureCellSelected}
              activeColor={activeColors.color}
              activeBackground={activeColors.backgroundColor}
            />
          </div>
        </div>
      )}

      {/* Add-column strip along the right edge */}
      <button
        type="button"
        aria-label="Add column"
        className="group absolute flex items-center justify-center rounded-codex-sm bg-transparent hover:bg-codex-surface-secondary pointer-events-auto z-10 transition-colors"
        style={{
          top: tableRect.top,
          left: tableRect.left + tableRect.width + 2,
          width: 8,
          height: tableRect.height,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          if (goToEnd("col")) editor.chain().focus().addColumnAfter().run();
        }}
      >
        <Plus className="h-3 w-3 text-codex-muted opacity-0 group-hover:opacity-100" />
      </button>

      {/* Add-row strip along the bottom edge */}
      <button
        type="button"
        aria-label="Add row"
        className="group absolute flex items-center justify-center rounded-codex-sm bg-transparent hover:bg-codex-surface-secondary pointer-events-auto z-10 transition-colors"
        style={{
          top: tableRect.top + tableRect.height + 2,
          left: tableRect.left,
          width: tableRect.width,
          height: 8,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          if (goToEnd("row")) editor.chain().focus().addRowAfter().run();
        }}
      >
        <Plus className="h-3 w-3 text-codex-muted opacity-0 group-hover:opacity-100" />
      </button>
    </div>
  );
}
