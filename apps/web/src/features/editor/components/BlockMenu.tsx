import { useEffect, useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import { GripVertical, Copy, Trash2, MoreVertical } from "lucide-react";

interface BlockMenuProps {
  editor: Editor | null;
}

export function BlockMenu({ editor }: BlockMenuProps) {
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isOpen) return;

      const view = editor.view;
      if (!view) return;

      // Ensure we don't hide if moving over the menu itself
      if (containerRef.current?.contains(e.target as Node)) {
        return;
      }

      const editorRect = view.dom.getBoundingClientRect();
      const isOutsideEditor =
        e.clientX < editorRect.left - 40 ||
        e.clientX > editorRect.right + 40 ||
        e.clientY < editorRect.top ||
        e.clientY > editorRect.bottom;

      if (isOutsideEditor) {
        setMenuPos(null);
        setHoveredPos(null);
        return;
      }

      const coords = { left: Math.max(e.clientX, editorRect.left + 10), top: e.clientY };
      const pos = view.posAtCoords(coords);

      if (!pos) return;

      const $pos = view.state.doc.resolve(pos.pos);
      if ($pos.depth < 1) return;

      const nodeStart = $pos.before(1);
      const node = $pos.node(1);

      if (!node) return;

      const nodeDOM = view.nodeDOM(nodeStart) as HTMLElement;
      if (!nodeDOM || nodeDOM.nodeType !== 1) return;

      const rect = nodeDOM.getBoundingClientRect();
      const parentRect = view.dom.parentElement?.getBoundingClientRect();

      if (!parentRect) return;

      // Position relative to the editor container
      setMenuPos({
        top: rect.top - parentRect.top,
        // Usually position it to the left of the editor content.
        left: -32,
      });
      setHoveredPos(nodeStart);
    };

    const wrapper = editor.view.dom.parentElement;
    if (wrapper) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [editor, isOpen]);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!editor || !menuPos || hoveredPos === null) return null;

  const handleDragStart = (_e: React.DragEvent) => {
    setIsOpen(false);
    editor.commands.setNodeSelection(hoveredPos);
  };

  const duplicateNode = () => {
    const node = editor.state.doc.nodeAt(hoveredPos);
    if (node) {
      // Regenerate ID for the new block to avoid duplicate IDs
      const newNodeJSON = { ...node.toJSON() };
      if (newNodeJSON.attrs) {
        newNodeJSON.attrs.id = crypto.randomUUID();
      }
      editor
        .chain()
        .focus()
        .insertContentAt(hoveredPos + node.nodeSize, newNodeJSON)
        .run();
    }
    setIsOpen(false);
    setMenuPos(null);
  };

  const deleteNode = () => {
    editor.chain().focus().setNodeSelection(hoveredPos).deleteSelection().run();
    setIsOpen(false);
    setMenuPos(null);
  };

  return (
    <div
      ref={containerRef}
      className="absolute z-10 flex items-center gap-1 transition-opacity duration-150"
      style={{
        top: `${menuPos.top}px`,
        left: `${menuPos.left}px`,
      }}
    >
      <div
        className="p-1 rounded cursor-grab hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        draggable
        onDragStart={handleDragStart}
        title="Drag to move"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          title="Block options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1 w-32 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg py-1 text-sm">
            <button
              onClick={duplicateNode}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={deleteNode}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
