import { useEffect, useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  GripVertical,
  Copy,
  Trash2,
  Type,
  Heading1,
  Heading2,
  Heading3,
  ListTodo,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

interface BlockMenuProps {
  editor: Editor | null;
}

export function BlockMenu({ editor }: BlockMenuProps) {
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isOpen) return;

      let view;
      try {
        view = editor.view;
        if (!view) return;
      } catch {
        // Editor view not mounted yet
        return;
      }

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
      const relativeParent = view.dom.closest(".relative") || view.dom.parentElement;

      if (!relativeParent) return;

      const parentRect = relativeParent.getBoundingClientRect();

      // Position relative to the editor container
      setMenuPos({
        top: rect.top - parentRect.top + 2, // Geser 2px ke bawah agar sejajar dengan teks
        left: -32, // Kembalikan ke -32 karena sekarang hanya 1 tombol (sebelumnya -48 terlalu jauh)
      });
      setHoveredPos(nodeStart);
    };

    window.addEventListener("mousemove", handleMouseMove);

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

  const handleDragStart = (e: React.DragEvent) => {
    setIsOpen(false);

    const view = editor.view;
    if (!view) return;

    // 1. Select the node to be dragged
    editor.commands.setNodeSelection(hoveredPos);

    // 2. Extract the slice of the document being dragged
    const selection = view.state.selection;
    const slice = selection.content();

    // 3. Serialize to HTML and Plain Text for the DataTransfer object
    const { dom, text } = view.serializeForClipboard(slice);

    e.dataTransfer.clearData();
    e.dataTransfer.setData("text/html", dom.innerHTML);
    e.dataTransfer.setData("text/plain", text);
    e.dataTransfer.effectAllowed = "move";

    // 4. Important: Tell ProseMirror we are dragging this slice internally to perform a MOVE
    // eslint-disable-next-line react-hooks/immutability
    view.dragging = { slice, move: true };
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

  const turnInto = (type: string, level?: number) => {
    if (hoveredPos === null) return;
    editor.chain().focus().setNodeSelection(hoveredPos).run();

    switch (type) {
      case "paragraph":
        editor.chain().focus().setParagraph().run();
        break;
      case "heading":
        editor
          .chain()
          .focus()
          .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
          .run();
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "taskList":
        editor.chain().focus().toggleTaskList().run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
    }

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
      <div className="relative">
        <div
          className="p-1 rounded-codex-sm cursor-grab hover:bg-codex-surface text-codex-muted hover:text-codex-foreground"
          draggable
          onDragStart={handleDragStart}
          onClick={() => setIsOpen(!isOpen)}
          title="Click to open menu, drag to move"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {isOpen && (
          <div className="absolute left-0 mt-1 w-56 glass-surface border border-codex-border rounded-codex-md py-1 text-sm max-h-[60vh] overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-codex-muted uppercase tracking-wider">
              Actions
            </div>
            <button
              onClick={duplicateNode}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={deleteNode}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-danger-bg/10 text-codex-danger"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <div className="h-px bg-codex-border my-1" />

            <div className="px-3 py-1.5 text-[10px] font-semibold text-codex-muted uppercase tracking-wider">
              Turn into
            </div>
            <button
              onClick={() => turnInto("paragraph")}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <Type className="w-4 h-4" /> Text
            </button>
            <button
              onClick={() => turnInto("heading", 1)}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <Heading1 className="w-4 h-4" /> Heading 1
            </button>
            <button
              onClick={() => turnInto("heading", 2)}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <Heading2 className="w-4 h-4" /> Heading 2
            </button>
            <button
              onClick={() => turnInto("heading", 3)}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <Heading3 className="w-4 h-4" /> Heading 3
            </button>
            <button
              onClick={() => turnInto("taskList")}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <ListTodo className="w-4 h-4" /> To-do list
            </button>
            <button
              onClick={() => turnInto("bulletList")}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <List className="w-4 h-4" /> Bullet list
            </button>
            <button
              onClick={() => turnInto("orderedList")}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <ListOrdered className="w-4 h-4" /> Numbered list
            </button>
            <button
              onClick={() => turnInto("blockquote")}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
            >
              <Quote className="w-4 h-4" /> Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
