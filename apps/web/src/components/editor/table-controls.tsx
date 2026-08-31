import { useEffect, useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  Plus,
  GripHorizontal,
  GripVertical,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface TableControlsProps {
  editor: Editor | null;
}

export function TableControls({ editor }: TableControlsProps) {
  const [tableRect, setTableRect] = useState<DOMRect | null>(null);
  const [cellRect, setCellRect] = useState<DOMRect | null>(null);
  const [activeMenu, setActiveMenu] = useState<"col" | "row" | "options" | null>(null);
  const [showColHandle, setShowColHandle] = useState(false);
  const [showRowHandle, setShowRowHandle] = useState(false);

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

      setTableRect(
        new DOMRect(
          newTableRect.left - parentRect.left,
          newTableRect.top - parentRect.top,
          newTableRect.width,
          newTableRect.height,
        ),
      );

      setCellRect(
        new DOMRect(
          newCellRect.left - parentRect.left,
          newCellRect.top - parentRect.top,
          newCellRect.width,
          newCellRect.height,
        ),
      );

      // Determine if cursor is near the top or left edge of the cell
      const hoverZone = 24;
      const isTop = e.clientY - newCellRect.top < hoverZone;
      const isLeft = e.clientX - newCellRect.left < hoverZone;
      const isFirstRow = cellDOM.parentElement?.previousElementSibling === null;
      const isFirstCol = cellDOM.previousElementSibling === null;

      // Only show col handle on the very top row cells, and row handle on the very left col cells
      setShowColHandle(isTop || isFirstRow);
      setShowRowHandle(isLeft || isFirstCol);

      // Track exact prosemirror position of the hovered cell
      try {
        const pos = editor.view.posAtDOM(cellDOM, 0);
        if (typeof pos === "number") {
          activeCellPos.current = pos;
        }
      } catch {
        // Fallback or ignore if posAtDOM fails
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
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu]);

  if (!editor || !tableRect || !cellRect) return null;

  // Move cursor to hovered cell before running table command
  const selectCell = () => {
    if (!editor || activeCellPos.current === -1) return false;

    // Set selection inside the target cell
    editor.chain().focus().setTextSelection(activeCellPos.current).run();
    return true;
  };

  const handleAction = (
    action: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>,
  ) => {
    if (selectCell()) {
      action(editor.chain().focus()).run();
    }
    setActiveMenu(null);
  };

  // Move to the last cell of the table to add at the very end
  const goToEnd = (axis: "row" | "col") => {
    if (!editor || !tableRect) return false;
    const relativeParent = editor.view.dom.closest(".relative") || editor.view.dom.parentElement;
    if (!relativeParent) return false;
    const parentRect = relativeParent.getBoundingClientRect();

    let x = tableRect.left + parentRect.left + tableRect.width - 10;
    let y = tableRect.top + parentRect.top + tableRect.height - 10;

    if (axis === "col") {
      y = tableRect.top + parentRect.top + 10; // top right cell
    } else {
      x = tableRect.left + parentRect.left + 10; // bottom left cell
    }

    const pos = editor.view.posAtCoords({ left: x, top: y });
    if (pos && pos.pos) {
      editor.chain().focus().setTextSelection(pos.pos).run();
      return true;
    }
    return false;
  };

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
      {/* Column Handle */}
      {showColHandle && (
        <div
          className="absolute flex flex-col items-center pointer-events-auto"
          style={{ top: tableRect.top - 20, left: cellRect.left + cellRect.width / 2 - 12 }}
        >
          <div
            className="p-0.5 rounded-codex-sm bg-codex-surface border border-codex-border/50 text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground cursor-pointer shadow-sm"
            onClick={() => setActiveMenu(activeMenu === "col" ? null : "col")}
          >
            <GripHorizontal className="w-4 h-4" />
          </div>
          {activeMenu === "col" && (
            <div className="absolute top-full mt-1 w-40 glass-surface border border-codex-border rounded-codex-md py-1 shadow-lg text-sm z-20">
              <button
                onClick={() => handleAction((c) => c.addColumnBefore())}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
              >
                <ArrowLeft className="w-4 h-4" /> Insert Left
              </button>
              <button
                onClick={() => handleAction((c) => c.addColumnAfter())}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
              >
                <ArrowRight className="w-4 h-4" /> Insert Right
              </button>
              <div className="h-px bg-codex-border my-1" />
              <button
                onClick={() => handleAction((c) => c.deleteColumn())}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-danger-bg/10 text-codex-danger"
              >
                <Trash2 className="w-4 h-4" /> Delete Column
              </button>
            </div>
          )}
        </div>
      )}

      {/* Row Handle */}
      {showRowHandle && (
        <div
          className="absolute flex items-center pointer-events-auto"
          style={{ top: cellRect.top + cellRect.height / 2 - 12, left: tableRect.left - 20 }}
        >
          <div
            className="p-0.5 rounded-codex-sm bg-codex-surface border border-codex-border/50 text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground cursor-pointer shadow-sm"
            onClick={() => setActiveMenu(activeMenu === "row" ? null : "row")}
          >
            <GripVertical className="w-4 h-4" />
          </div>
          {activeMenu === "row" && (
            <div className="absolute left-full ml-1 w-40 glass-surface border border-codex-border rounded-codex-md py-1 shadow-lg text-sm z-20">
              <button
                onClick={() => handleAction((c) => c.addRowBefore())}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
              >
                <ArrowUp className="w-4 h-4" /> Insert Above
              </button>
              <button
                onClick={() => handleAction((c) => c.addRowAfter())}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
              >
                <ArrowDown className="w-4 h-4" /> Insert Below
              </button>
              <div className="h-px bg-codex-border my-1" />
              <button
                onClick={() => handleAction((c) => c.deleteRow())}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-danger-bg/10 text-codex-danger"
              >
                <Trash2 className="w-4 h-4" /> Delete Row
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Column End (Top Right Plus) */}
      <div
        className="absolute flex items-center justify-center bg-codex-surface border border-codex-border text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground cursor-pointer rounded-codex-sm shadow-sm w-6 h-6 transition-colors z-10 pointer-events-auto"
        style={{ top: tableRect.top - 24, left: tableRect.left + tableRect.width - 24 }}
        onClick={(e) => {
          e.preventDefault();
          if (goToEnd("col")) editor.chain().focus().addColumnAfter().run();
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Plus className="w-4 h-4" />
      </div>

      {/* Add Row End (Bottom Left Plus) */}
      <div
        className="absolute flex items-center justify-center bg-codex-surface border border-codex-border text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground cursor-pointer rounded-codex-sm shadow-sm w-6 h-6 transition-colors z-10 pointer-events-auto"
        style={{
          top: tableRect.top + tableRect.height,
          left: tableRect.left + tableRect.width / 2 - 12,
        }}
        onClick={(e) => {
          e.preventDefault();
          if (goToEnd("row")) editor.chain().focus().addRowAfter().run();
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Plus className="w-4 h-4" />
      </div>

      {/* Table Global Options (Top Left corner) */}
      <div
        className="absolute flex items-center pointer-events-auto"
        style={{ top: tableRect.top - 20, left: tableRect.left - 20 }}
      >
        <div
          className="w-4 h-4 rounded-sm border border-codex-border/50 text-codex-muted hover:bg-codex-surface-secondary hover:text-codex-foreground cursor-pointer flex items-center justify-center"
          onClick={() => setActiveMenu(activeMenu === "options" ? null : "options")}
        >
          <GripVertical className="w-3 h-3" />
        </div>
        {activeMenu === "options" && (
          <div className="absolute top-full left-0 mt-1 w-48 glass-surface border border-codex-border rounded-codex-md py-1 shadow-lg text-sm z-20">
            <button
              onClick={() => {
                editor.chain().focus().toggleHeaderRow().run();
                setActiveMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <div className="w-3 h-3 border border-codex-muted/50 rounded-[2px] bg-codex-surface-secondary" />
              Toggle Header Row
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleHeaderColumn().run();
                setActiveMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <div className="w-3 h-3 border border-codex-muted/50 rounded-[2px] bg-codex-surface-secondary" />
              Toggle Header Column
            </button>
            <div className="h-px bg-codex-border my-1" />
            <button
              onClick={() => {
                editor.chain().focus().deleteTable().run();
                setActiveMenu(null);
                setTableRect(null);
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-danger-bg/10 text-codex-danger"
            >
              <Trash2 className="w-4 h-4" /> Delete Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
