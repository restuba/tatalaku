import React, { useState, useRef, useEffect, ReactNode } from "react";
import { Editor } from "@tiptap/react";

interface LassoSelectionProps {
  editor: Editor | null;
  children: ReactNode;
}

interface Point {
  x: number;
  y: number;
}

export function LassoSelection({ editor, children }: LassoSelectionProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Attach global event listeners to the <main> element (the scrollable area)
  // so lasso can start from the far edges of the screen
  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;

    const handleGlobalPointerDown = (e: PointerEvent) => {
      if (!editor) return;

      const target = e.target as HTMLElement;

      // Ignore right clicks
      if (e.button !== 0) return;

      // Check if clicking on interactive elements
      const interactiveTags = ["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A", "IMG"];
      if (interactiveTags.includes(target.tagName)) return;

      // Check if target is a drag handle, interactive menu, or part of a link
      if (
        target.closest("[draggable]") ||
        target.closest(".glass-surface") ||
        target.closest("button") ||
        target.closest("a")
      ) {
        return;
      }

      // Allow lasso if clicking empty spaces in the main container
      const isEditorContainer =
        target === containerRef.current ||
        target.classList.contains("tiptap") ||
        target.classList.contains("prose");
      const isMargin = target.tagName === "DIV" || target.tagName === "MAIN";

      if (!isEditorContainer && !isMargin) return;

      // Capture pointer so we keep getting events even if mouse goes outside
      mainEl.setPointerCapture(e.pointerId);

      // Get container rect for coordinate calculations
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const point = {
        x: e.clientX,
        y: e.clientY,
      };

      setStartPoint(point);
      setCurrentPoint(point);
      setContainerRect(rect);
      setIsSelecting(true);

      // Clear current selection on start
      editor.commands.focus();
      editor.commands.setTextSelection(editor.state.selection.from);
    };

    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isSelecting || !startPoint || !editor) return;

      const current = {
        x: e.clientX,
        y: e.clientY,
      };
      setCurrentPoint(current);

      // Calculate Lasso Rectangle
      const lassoRect = {
        top: Math.min(startPoint.y, current.y),
        left: Math.min(startPoint.x, current.x),
        bottom: Math.max(startPoint.y, current.y),
        right: Math.max(startPoint.x, current.x),
        width: Math.abs(current.x - startPoint.x),
        height: Math.abs(current.y - startPoint.y),
      };

      if (lassoRect.width < 5 && lassoRect.height < 5) return;

      const tiptapContainer = containerRef.current?.querySelector(".tiptap");
      if (!tiptapContainer) return;

      const blocks = Array.from(tiptapContainer.children) as HTMLElement[];
      let firstIntersectingBlock: HTMLElement | null = null;
      let lastIntersectingBlock: HTMLElement | null = null;

      for (const block of blocks) {
        const blockRect = block.getBoundingClientRect();

        // Vertical only intersection
        const intersects = !(blockRect.bottom < lassoRect.top || blockRect.top > lassoRect.bottom);

        if (intersects) {
          if (!firstIntersectingBlock) firstIntersectingBlock = block;
          lastIntersectingBlock = block;
        }
      }

      if (firstIntersectingBlock && lastIntersectingBlock) {
        try {
          const view = editor.view;
          const fromPos = view.posAtDOM(firstIntersectingBlock, 0);

          let toPos = view.posAtDOM(lastIntersectingBlock, 0);
          const lastNode = editor.state.doc.nodeAt(toPos);
          if (lastNode) {
            toPos += lastNode.nodeSize;
          }

          if (fromPos >= 0 && toPos >= 0) {
            editor.commands.setTextSelection({ from: fromPos, to: toPos });
          }
        } catch {
          // Ignore pos errors
        }
      } else {
        // Clear selection if nothing intersects
        try {
          editor.commands.setTextSelection({
            from: editor.state.selection.from,
            to: editor.state.selection.from,
          });
        } catch {
          // Ignore
        }
      }
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (isSelecting) {
        try {
          mainEl.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore if pointer is already released or invalid
        }
        setIsSelecting(false);
        setStartPoint(null);
        setCurrentPoint(null);
        setContainerRect(null);
      }
    };

    mainEl.addEventListener("pointerdown", handleGlobalPointerDown);
    mainEl.addEventListener("pointermove", handleGlobalPointerMove);
    mainEl.addEventListener("pointerup", handleGlobalPointerUp);
    mainEl.addEventListener("pointercancel", handleGlobalPointerUp);

    return () => {
      mainEl.removeEventListener("pointerdown", handleGlobalPointerDown);
      mainEl.removeEventListener("pointermove", handleGlobalPointerMove);
      mainEl.removeEventListener("pointerup", handleGlobalPointerUp);
      mainEl.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [editor, isSelecting, startPoint]);

  // Calculate coordinates for rendering the lasso box relative to the container
  let lassoStyle = {};
  if (isSelecting && startPoint && currentPoint && containerRect) {
    const left = Math.min(startPoint.x, currentPoint.x) - containerRect.left;
    const top = Math.min(startPoint.y, currentPoint.y) - containerRect.top;
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    if (width > 5 || height > 5) {
      lassoStyle = {
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: "var(--color-info)",
        opacity: 0.15,
        border: "1px solid var(--color-info)",
        borderRadius: "2px",
        pointerEvents: "none",
        zIndex: 50,
      };
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[500px] ${isSelecting ? "is-lassoing" : ""}`}
      onContextMenu={(e) => isSelecting && e.preventDefault()}
    >
      {children}
      {isSelecting && <div style={lassoStyle} />}
    </div>
  );
}
