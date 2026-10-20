import { useMemo, useRef, useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Copy,
  Palette,
  XCircle,
  Trash2,
  Columns3,
  Rows3,
  ChevronRight,
} from "lucide-react";
import { ColorSubmenu } from "./color-submenu";
import { setCellsColor, clearCellsContents, duplicateColumnOrRow } from "./table-commands";

type Axis = "column" | "row";

interface TableActionMenuProps {
  editor: Editor;
  axis: Axis;
  /** Called after any action runs so the parent can close the menu. */
  onClose: () => void;
  /** Runs a table chain command after ensuring the target cell is selected. */
  runChain: (action: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) => void;
  /** Ensures the target cell holds the selection before a raw command runs. */
  ensureCellSelected: () => boolean;
  /** Current color attrs of the active cell, for highlighting the palette. */
  activeColor: string | null;
  activeBackground: string | null;
}

interface ActionItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  onSelect: () => void;
}

/**
 * Context menu for a table column or row.
 *
 * Layout: a "Search actions" input at the top, then a
 * header toggle (column menu only), a Color submenu, insert directions,
 * duplicate, clear contents, and a destructive delete.
 */
export function TableActionMenu({
  editor,
  axis,
  onClose,
  runChain,
  ensureCellSelected,
  activeColor,
  activeBackground,
}: TableActionMenuProps) {
  const [query, setQuery] = useState("");
  const [showColorSubmenu, setShowColorSubmenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Autofocus the search box so actions can be filtered right away.
    inputRef.current?.focus();
  }, []);

  const isColumn = axis === "column";
  const isHeaderActive = editor.isActive("tableHeader");

  const items = useMemo<ActionItem[]>(() => {
    const list: ActionItem[] = [];

    if (isColumn) {
      list.push({
        key: "header-column",
        label: "Header column",
        icon: <Columns3 className="h-4 w-4" />,
        onSelect: () => {
          runChain((c) => c.toggleHeaderColumn());
          onClose();
        },
      });
    } else {
      list.push({
        key: "header-row",
        label: "Header row",
        icon: <Rows3 className="h-4 w-4" />,
        onSelect: () => {
          runChain((c) => c.toggleHeaderRow());
          onClose();
        },
      });
    }

    list.push({
      key: "color",
      label: "Color",
      icon: <Palette className="h-4 w-4" />,
      onSelect: () => setShowColorSubmenu((v) => !v),
    });

    if (isColumn) {
      list.push(
        {
          key: "insert-left",
          label: "Insert left",
          icon: <ArrowLeft className="h-4 w-4" />,
          onSelect: () => {
            runChain((c) => c.addColumnBefore());
            onClose();
          },
        },
        {
          key: "insert-right",
          label: "Insert right",
          icon: <ArrowRight className="h-4 w-4" />,
          onSelect: () => {
            runChain((c) => c.addColumnAfter());
            onClose();
          },
        },
      );
    } else {
      list.push(
        {
          key: "insert-above",
          label: "Insert above",
          icon: <ArrowUp className="h-4 w-4" />,
          onSelect: () => {
            runChain((c) => c.addRowBefore());
            onClose();
          },
        },
        {
          key: "insert-below",
          label: "Insert below",
          icon: <ArrowDown className="h-4 w-4" />,
          onSelect: () => {
            runChain((c) => c.addRowAfter());
            onClose();
          },
        },
      );
    }

    list.push(
      {
        key: "duplicate",
        label: "Duplicate",
        icon: <Copy className="h-4 w-4" />,
        shortcut: "⌘D",
        onSelect: () => {
          if (ensureCellSelected()) duplicateColumnOrRow(editor, axis);
          onClose();
        },
      },
      {
        key: "clear",
        label: "Clear contents",
        icon: <XCircle className="h-4 w-4" />,
        onSelect: () => {
          if (ensureCellSelected()) clearCellsContents(editor, axis);
          onClose();
        },
      },
      {
        key: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        danger: true,
        onSelect: () => {
          runChain((c) => (isColumn ? c.deleteColumn() : c.deleteRow()));
          onClose();
        },
      },
    );

    return list;
  }, [isColumn, axis, editor, runChain, ensureCellSelected, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  const applyColor = (kind: "color" | "background", value: string | null) => {
    if (!ensureCellSelected()) return;
    setCellsColor(editor, axis, kind === "color" ? { color: value } : { backgroundColor: value });
    onClose();
  };

  return (
    <div className="surface-popover w-56 rounded-codex-lg p-1 text-sm animate-in fade-in duration-150">
      <div className="pb-1">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions…"
          aria-label="Search actions"
          className="h-8 w-full rounded-codex-md border border-codex-border-strong bg-codex-elevated px-2.5 text-sm text-codex-foreground outline-none transition-[border-color,box-shadow] placeholder:text-codex-faint focus:border-codex-accent focus:ring-2 focus:ring-codex-accent-soft"
        />
      </div>

      {filtered.length === 0 && (
        <p role="status" className="px-2.5 py-2 text-sm text-codex-muted">
          No actions found
        </p>
      )}

      {filtered.map((item, index) => {
        const isDivierBeforeDelete = item.key === "delete" && index > 0;
        // The Color row stays highlighted while its submenu is open
        const isSubmenuOpen = item.key === "color" && showColorSubmenu;
        return (
          <div key={item.key}>
            {isDivierBeforeDelete && <div className="mx-1.5 my-1 h-px bg-codex-border" />}
            <div className="relative">
              <button
                type="button"
                onClick={item.onSelect}
                className={`flex h-8 w-full items-center gap-2.5 rounded-codex-md px-2.5 text-left transition-colors ${
                  item.danger
                    ? "text-codex-danger hover:bg-codex-danger-bg"
                    : isSubmenuOpen
                      ? "bg-codex-selected text-codex-foreground"
                      : "text-codex-foreground hover:bg-codex-hover"
                }`}
              >
                <span className={`shrink-0 ${item.danger ? "" : "text-codex-muted"}`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {(item.key === "header-column" || item.key === "header-row") && (
                  <HeaderToggle active={isHeaderActive} />
                )}
                {item.key === "color" && <ChevronRight className="h-4 w-4 text-codex-muted" />}
                {item.shortcut && <span className="text-xs text-codex-muted">{item.shortcut}</span>}
              </button>

              {/* ml-2 clears this menu's own padding and border */}
              {item.key === "color" && showColorSubmenu && (
                <div className="absolute left-full top-0 ml-2 z-30">
                  <ColorSubmenu
                    activeColor={activeColor}
                    activeBackground={activeBackground}
                    onSelectColor={(value) => applyColor("color", value)}
                    onSelectBackground={(value) => applyColor("background", value)}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Small switch for the "Header column/row" toggle: the thumb position carries
 * the state as well as the track color.
 */
function HeaderToggle({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-150 ${
        active ? "bg-codex-accent" : "bg-codex-faint"
      }`}
    >
      <span
        className={`inline-block h-3 w-3 rounded-full bg-codex-elevated transition duration-150 ${
          active ? "translate-x-3.5" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}
