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
  Link2,
  Check,
} from "lucide-react";
import { startBlockDrag, endBlockDrag, countBlocksInRange } from "./extensions/drag-drop-block";
import { getBlockRange, blockSelectionKey } from "./extensions/block-selection";

/** Group heading inside the menu, in the mono label voice */
const MENU_LABEL =
  "px-2.5 pt-2 pb-1.5 font-mono text-xs uppercase tracking-label text-codex-muted/80";

const MENU_ITEM =
  "flex h-8 w-full items-center gap-2 rounded-codex-md px-2.5 text-left text-sm text-codex-muted transition-colors";

/** Regular action: lifts to the raised surface on hover */
const MENU_ITEM_DEFAULT = `${MENU_ITEM} hover:bg-codex-surface-raised hover:text-codex-foreground`;

interface BlockMenuProps {
  editor: Editor | null;
}

export function BlockMenu({ editor }: BlockMenuProps) {
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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

      // Get exact text coordinates for vertical alignment
      let targetTop = rect.top;
      try {
        const textCoords = view.coordsAtPos(nodeStart + 1);
        const textHeight = textCoords.bottom - textCoords.top;

        // Push the grip down slightly. Since the user said it's too high,
        // we add +4 pixels to push it down further.
        targetTop = textCoords.top + textHeight / 2 - 8;
      } catch {
        // Fallback to block boundary if pos is invalid
      }

      setMenuPos((prev) => {
        // Position relative to the editor container
        const newTop = targetTop - parentRect.top;
        const newLeft = -32;

        if (prev && prev.top === newTop && prev.left === newLeft) {
          return prev;
        }

        return { top: newTop, left: newLeft };
      });
      setHoveredPos(nodeStart);
    };

    // Touch/pen have no hover: show the handle for the block that was tapped
    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") handleMouseMove(e);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("pointerdown", handlePointerDown);
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

    // 1. Determine what to drag (check for multi-block selection first)
    const pluginState = blockSelectionKey.getState(editor.state);
    const multiBlockRange = getBlockRange(editor.state.selection, editor.state.doc, pluginState);

    let from = hoveredPos;
    let to = hoveredPos;
    const node = editor.state.doc.nodeAt(hoveredPos);
    if (node) {
      to = hoveredPos + node.nodeSize;
    }

    const isHoveredInsideMultiSelection =
      multiBlockRange !== null &&
      hoveredPos >= multiBlockRange.start &&
      hoveredPos < multiBlockRange.end;

    if (isHoveredInsideMultiSelection && multiBlockRange) {
      from = multiBlockRange.start;
      to = multiBlockRange.end;
    } else {
      editor.commands.setNodeSelection(hoveredPos);
    }

    // 2. Extract the slice of the document being dragged (entire block range)
    const slice = view.state.doc.slice(from, to);

    // 3. Serialize to HTML and Plain Text for the DataTransfer object
    const { dom, text } = view.serializeForClipboard(slice);

    e.dataTransfer.clearData();
    e.dataTransfer.setData("application/x-tatalaku-block-drag", JSON.stringify({ from, to }));
    e.dataTransfer.setData("text/html", dom.innerHTML);
    e.dataTransfer.setData("text/plain", text);
    e.dataTransfer.effectAllowed = "move";

    // 4. Dispatch startBlockDrag to BlockDragDrop plugin
    startBlockDrag(view, { from, to });

    // 5. Create clean drag preview badge: a flat chip (raised surface, strong
    //    border, mono label), no shadow
    const count = countBlocksInRange(view, from, to);
    const ghost = document.createElement("div");
    ghost.style.position = "absolute";
    ghost.style.top = "-9999px";
    ghost.style.left = "-9999px";
    ghost.style.zIndex = "99999";
    ghost.style.pointerEvents = "none";
    ghost.innerHTML = `
      <div class="inline-flex items-center gap-1.5 rounded-codex-sm border border-codex-border-strong bg-codex-surface-raised px-3 py-1.5 font-mono text-xs uppercase tracking-label text-codex-foreground">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="12" r="1.5"></circle>
          <circle cx="9" cy="5" r="1.5"></circle>
          <circle cx="9" cy="19" r="1.5"></circle>
          <circle cx="15" cy="12" r="1.5"></circle>
          <circle cx="15" cy="5" r="1.5"></circle>
          <circle cx="15" cy="19" r="1.5"></circle>
        </svg>
        <span>${count === 1 ? "1 block" : `${count} blocks`}</span>
      </div>
    `;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 12, 12);
    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    }, 0);

    // 6. Tell ProseMirror we are dragging this slice internally
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

  const copyLinkToBlock = async () => {
    if (hoveredPos === null || !editor) return;
    const node = editor.state.doc.nodeAt(hoveredPos);
    let blockId = node?.attrs?.id;

    // Fallback if node doesn't have an ID in attrs
    if (!blockId) {
      blockId = crypto.randomUUID();
      const tr = editor.state.tr.setNodeMarkup(hoveredPos, undefined, {
        ...node?.attrs,
        id: blockId,
      });
      editor.view.dispatch(tr);
    }

    const url = `${window.location.origin}${window.location.pathname}#${blockId}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        setIsOpen(false);
      }, 700);
    } catch {
      setIsOpen(false);
    }
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
          className={`p-1 rounded-codex-sm cursor-grab active:cursor-grabbing select-none transition-colors duration-150 ${
            isOpen
              ? "bg-codex-surface-raised text-codex-foreground"
              : "text-codex-muted/70 hover:bg-codex-surface-raised hover:text-codex-foreground"
          }`}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={() => {
            if (editor && !editor.isDestroyed) {
              endBlockDrag(editor.view);
            }
          }}
          onClick={(e) => {
            if (e.shiftKey && hoveredPos !== null) {
              const currentSelection = editor.state.selection;
              const startPos = currentSelection.from;
              const node = editor.state.doc.nodeAt(hoveredPos);
              const endPos = hoveredPos + (node ? node.nodeSize : 0);

              const from = Math.min(startPos, hoveredPos);
              const to = Math.max(currentSelection.to, endPos);

              editor.chain().focus().setTextSelection({ from, to }).run();
            } else if (hoveredPos !== null) {
              editor.chain().focus().setNodeSelection(hoveredPos).run();
              setIsOpen(!isOpen);
            }
          }}
          title="Click to open menu, drag to move (Shift+Click to select blocks)"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {isOpen && (
          <div className="absolute left-0 mt-1 w-56 max-h-[60vh] overflow-y-auto glass-surface rounded-codex-lg border border-codex-border-strong p-1 text-sm animate-in fade-in duration-150">
            <div className={MENU_LABEL}>Actions</div>
            <button type="button" onClick={copyLinkToBlock} className={MENU_ITEM_DEFAULT}>
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-codex-success" />
                  <span className="font-mono text-xs uppercase tracking-label text-codex-success">
                    [ Link copied ]
                  </span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Copy link to block</span>
                </>
              )}
            </button>
            <button type="button" onClick={duplicateNode} className={MENU_ITEM_DEFAULT}>
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className={`${MENU_ITEM} hover:bg-codex-danger-bg hover:text-codex-danger`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <div className="mx-2 my-1 h-px bg-codex-border" />

            <div className={MENU_LABEL}>Turn into</div>
            <button
              type="button"
              onClick={() => turnInto("paragraph")}
              className={MENU_ITEM_DEFAULT}
            >
              <Type className="w-4 h-4" /> Text
            </button>
            <button
              type="button"
              onClick={() => turnInto("heading", 1)}
              className={MENU_ITEM_DEFAULT}
            >
              <Heading1 className="w-4 h-4" /> Heading 1
            </button>
            <button
              type="button"
              onClick={() => turnInto("heading", 2)}
              className={MENU_ITEM_DEFAULT}
            >
              <Heading2 className="w-4 h-4" /> Heading 2
            </button>
            <button
              type="button"
              onClick={() => turnInto("heading", 3)}
              className={MENU_ITEM_DEFAULT}
            >
              <Heading3 className="w-4 h-4" /> Heading 3
            </button>
            <button
              type="button"
              onClick={() => turnInto("taskList")}
              className={MENU_ITEM_DEFAULT}
            >
              <ListTodo className="w-4 h-4" /> To-do list
            </button>
            <button
              type="button"
              onClick={() => turnInto("bulletList")}
              className={MENU_ITEM_DEFAULT}
            >
              <List className="w-4 h-4" /> Bullet list
            </button>
            <button
              type="button"
              onClick={() => turnInto("orderedList")}
              className={MENU_ITEM_DEFAULT}
            >
              <ListOrdered className="w-4 h-4" /> Numbered list
            </button>
            <button
              type="button"
              onClick={() => turnInto("blockquote")}
              className={MENU_ITEM_DEFAULT}
            >
              <Quote className="w-4 h-4" /> Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
