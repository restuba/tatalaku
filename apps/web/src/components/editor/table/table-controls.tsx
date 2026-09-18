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
  const [activeColors, setActiveColors] = useState<CellColors>({
    color: null,
    backgroundColor: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const activeCellPos = useRef<number>(-1);

  useEffect(() => {
    if (!editor) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (activeMenu) return;

      const target = e.target as HTMLElement;
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
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMenu(null);
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
    setActiveMenu(null);
  };

  /**
   * Strip click: select the whole column/row (active state), snapshot its
   * colors for the palette, then open the action menu.
   */
  const openMenu = (menu: Exclude<ActiveMenu, null>) => {
    if (activeMenu === menu) {
      setActiveMenu(null);
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
    setActiveMenu(menu);
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

  const HANDLE_THICKNESS = 6; // px — thin strip, like Notion's edge handle
  const columnActive = activeMenu === "column";
  const rowActive = activeMenu === "row";
  const showColStrip = showColHandle || columnActive;
  const showRowStrip = showRowHandle || rowActive;

  const HANDLE_GAP = 3; // px — gap between the handle strip and the column/row edge

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
      {/* Active state: accent border wrapping the entire selected column block
          (all four sides), like Notion. No inner cell tint. */}
      {columnActive && (
        <div
          className="absolute rounded-codex-sm border-2 border-codex-accent pointer-events-none z-[5]"
          style={{
            top: colRect.top,
            left: colRect.left,
            width: colRect.width,
            height: colRect.height,
          }}
        />
      )}

      {/* Active state: accent border wrapping the entire selected row block. */}
      {rowActive && (
        <div
          className="absolute rounded-codex-sm border-2 border-codex-accent pointer-events-none z-[5]"
          style={{
            top: rowRect.top,
            left: rowRect.left,
            width: rowRect.width,
            height: rowRect.height,
          }}
        />
      )}

      {/* Column handle: elongated strip spanning the full column width, sitting
          just above the column. Solid accent when its menu is active. */}
      {showColStrip && (
        <div
          className="absolute pointer-events-auto"
          style={{
            top: colRect.top - (HANDLE_THICKNESS + HANDLE_GAP),
            left: colRect.left,
            width: colRect.width,
            height: HANDLE_THICKNESS,
          }}
        >
          <button
            type="button"
            aria-label="Column options"
            className={`group relative flex h-full w-full items-center justify-center rounded-codex-sm border shadow-sm transition-colors ${
              columnActive
                ? "bg-codex-accent border-codex-accent"
                : "bg-codex-surface-secondary border-codex-border hover:bg-codex-accent/40"
            }`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openMenu("column")}
          >
            <GripHorizontal
              className={`h-3 w-3 ${columnActive ? "text-codex-surface" : "text-codex-muted"}`}
            />
          </button>
          {columnActive && (
            <div className="absolute left-0 top-full mt-1 z-20">
              <TableActionMenu
                editor={editor}
                axis="column"
                onClose={() => setActiveMenu(null)}
                runChain={runChain}
                ensureCellSelected={ensureCellSelected}
                activeColor={activeColors.color}
                activeBackground={activeColors.backgroundColor}
              />
            </div>
          )}
        </div>
      )}

      {/* Row handle: elongated strip spanning the full row height, sitting just
          left of the row. Solid accent when its menu is active. */}
      {showRowStrip && (
        <div
          className="absolute pointer-events-auto"
          style={{
            top: rowRect.top,
            left: rowRect.left - (HANDLE_THICKNESS + HANDLE_GAP),
            width: HANDLE_THICKNESS,
            height: rowRect.height,
          }}
        >
          <button
            type="button"
            aria-label="Row options"
            className={`group relative flex h-full w-full items-center justify-center rounded-codex-sm border shadow-sm transition-colors ${
              rowActive
                ? "bg-codex-accent border-codex-accent"
                : "bg-codex-surface-secondary border-codex-border hover:bg-codex-accent/40"
            }`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openMenu("row")}
          >
            <GripVertical
              className={`h-3 w-3 ${rowActive ? "text-codex-surface" : "text-codex-muted"}`}
            />
          </button>
          {rowActive && (
            <div className="absolute left-full top-0 ml-1 z-20">
              <TableActionMenu
                editor={editor}
                axis="row"
                onClose={() => setActiveMenu(null)}
                runChain={runChain}
                ensureCellSelected={ensureCellSelected}
                activeColor={activeColors.color}
                activeBackground={activeColors.backgroundColor}
              />
            </div>
          )}
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
          width: HANDLE_THICKNESS,
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
          height: HANDLE_THICKNESS,
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
