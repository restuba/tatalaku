import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, NodeSelection, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";

export const blockDragDropKey = new PluginKey<BlockDragDropState>("blockDragDrop");

export interface BlockDragDropState {
  isDragging: boolean;
  draggedRange: { from: number; to: number } | null;
  dropTargetPos: number | null;
}

/**
 * Counts top-level blocks within a [from, to] range.
 */
export function countBlocksInRange(view: EditorView, from: number, to: number): number {
  let count = 0;
  view.state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isBlock && view.state.doc.resolve(pos).depth === 0) {
      count++;
      return false;
    }
  });
  return Math.max(1, count);
}

/**
 * Dispatches start drag action into the BlockDragDrop plugin.
 */
export function startBlockDrag(view: EditorView, range: { from: number; to: number }) {
  const tr = view.state.tr.setMeta(blockDragDropKey, {
    type: "startDrag",
    range,
  });
  view.dispatch(tr);
}

/**
 * Dispatches end drag action into the BlockDragDrop plugin.
 */
export function endBlockDrag(view: EditorView) {
  const tr = view.state.tr.setMeta(blockDragDropKey, {
    type: "endDrag",
  });
  view.dispatch(tr);
}

// Throttle / helper for auto-scrolling when dragging near top/bottom edges
function handleAutoScroll(clientY: number) {
  const threshold = 80;
  const viewportHeight = window.innerHeight;
  const scrollContainer = document.querySelector("main") || window;

  let speed = 0;
  if (clientY < threshold) {
    speed = -Math.min(18, Math.max(4, Math.round((threshold - clientY) / 3)));
  } else if (clientY > viewportHeight - threshold) {
    speed = Math.min(18, Math.max(4, Math.round((clientY - (viewportHeight - threshold)) / 3)));
  }

  if (speed !== 0) {
    if (scrollContainer === window) {
      window.scrollBy({ top: speed, behavior: "auto" });
    } else {
      (scrollContainer as HTMLElement).scrollTop += speed;
    }
  }
}

export const BlockDragDrop = Extension.create({
  name: "blockDragDrop",

  addProseMirrorPlugins() {
    return [
      new Plugin<BlockDragDropState>({
        key: blockDragDropKey,

        state: {
          init(): BlockDragDropState {
            return {
              isDragging: false,
              draggedRange: null,
              dropTargetPos: null,
            };
          },

          apply(tr, prev): BlockDragDropState {
            const meta = tr.getMeta(blockDragDropKey);

            if (meta?.type === "startDrag") {
              return {
                isDragging: true,
                draggedRange: meta.range,
                dropTargetPos: null,
              };
            }

            if (meta?.type === "setDropTarget") {
              return {
                ...prev,
                dropTargetPos: meta.pos,
              };
            }

            if (meta?.type === "endDrag") {
              return {
                isDragging: false,
                draggedRange: null,
                dropTargetPos: null,
              };
            }

            // If document changed while dragging (unlikely, but keep range mapped)
            if (prev.isDragging && prev.draggedRange && tr.docChanged) {
              const mappedFrom = tr.mapping.map(prev.draggedRange.from);
              const mappedTo = tr.mapping.map(prev.draggedRange.to);
              const mappedDrop =
                prev.dropTargetPos !== null ? tr.mapping.map(prev.dropTargetPos) : null;
              return {
                isDragging: true,
                draggedRange: { from: mappedFrom, to: mappedTo },
                dropTargetPos: mappedDrop,
              };
            }

            return prev;
          },
        },

        view(editorView) {
          const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
              const state = blockDragDropKey.getState(editorView.state);
              if (state?.isDragging) {
                endBlockDrag(editorView);
              }
            }
          };

          const handleGlobalDragEnd = () => {
            const state = blockDragDropKey.getState(editorView.state);
            if (state?.isDragging) {
              endBlockDrag(editorView);
            }
          };

          window.addEventListener("keydown", handleGlobalKeyDown);
          window.addEventListener("dragend", handleGlobalDragEnd);

          return {
            destroy() {
              window.removeEventListener("keydown", handleGlobalKeyDown);
              window.removeEventListener("dragend", handleGlobalDragEnd);
            },
          };
        },

        props: {
          decorations(state) {
            const pluginState = blockDragDropKey.getState(state);
            if (!pluginState?.isDragging) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];

            // 1. Mark the source block(s) currently being dragged with opacity dimming
            if (pluginState.draggedRange) {
              const { from, to } = pluginState.draggedRange;
              state.doc.nodesBetween(from, to, (node, pos) => {
                if (node.isBlock && state.doc.resolve(pos).depth === 0) {
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: "is-dragging-source",
                    }),
                  );
                  return false;
                }
              });
            }

            // 2. Render the drop line indicator between blocks
            if (pluginState.dropTargetPos !== null) {
              decorations.push(
                Decoration.widget(
                  pluginState.dropTargetPos,
                  () => {
                    const line = document.createElement("div");
                    line.className = "tiptap-drop-indicator";
                    line.setAttribute("aria-hidden", "true");
                    return line;
                  },
                  {
                    side: -1,
                    key: "tatalaku-drop-indicator",
                  },
                ),
              );
            }

            return DecorationSet.create(state.doc, decorations);
          },

          handleDOMEvents: {
            dragover(view, event) {
              const pluginState = blockDragDropKey.getState(view.state);
              if (!pluginState?.isDragging || !pluginState.draggedRange) {
                return false;
              }

              event.preventDefault();
              if (event.dataTransfer) {
                event.dataTransfer.dropEffect = "move";
              }

              handleAutoScroll(event.clientY);

              const coords = { left: event.clientX, top: event.clientY };
              const posAtCoords = view.posAtCoords(coords);

              if (!posAtCoords) return true;

              const $pos = view.state.doc.resolve(posAtCoords.pos);

              // Find top-level block boundaries (depth 1)
              let dropPos: number | null = null;

              if ($pos.depth >= 1) {
                const blockStart = $pos.before(1);
                const blockNode = $pos.node(1);

                if (blockNode) {
                  const nodeDOM = view.nodeDOM(blockStart) as HTMLElement | null;
                  let isTopHalf = true;

                  if (nodeDOM && typeof nodeDOM.getBoundingClientRect === "function") {
                    const rect = nodeDOM.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    isTopHalf = event.clientY < midY;
                  }

                  dropPos = isTopHalf ? blockStart : blockStart + blockNode.nodeSize;
                }
              } else {
                // If cursor is at doc edges (depth 0)
                if (posAtCoords.pos <= 0) {
                  dropPos = 0;
                } else {
                  dropPos = view.state.doc.content.size;
                }
              }

              if (dropPos === null) return true;

              // Validate: do not drop onto the dragged block(s) themselves
              const { from, to } = pluginState.draggedRange;
              if (dropPos >= from && dropPos <= to) {
                if (pluginState.dropTargetPos !== null) {
                  view.dispatch(
                    view.state.tr.setMeta(blockDragDropKey, {
                      type: "setDropTarget",
                      pos: null,
                    }),
                  );
                }
                return true;
              }

              if (pluginState.dropTargetPos !== dropPos) {
                view.dispatch(
                  view.state.tr.setMeta(blockDragDropKey, {
                    type: "setDropTarget",
                    pos: dropPos,
                  }),
                );
              }

              return true;
            },

            dragleave(view, event) {
              const pluginState = blockDragDropKey.getState(view.state);
              if (!pluginState?.isDragging) return false;

              // If moving outside the editor element
              if (!view.dom.contains(event.relatedTarget as Node)) {
                if (pluginState.dropTargetPos !== null) {
                  view.dispatch(
                    view.state.tr.setMeta(blockDragDropKey, {
                      type: "setDropTarget",
                      pos: null,
                    }),
                  );
                }
              }
              return false;
            },

            drop(view, event) {
              const pluginState = blockDragDropKey.getState(view.state);
              if (!pluginState?.isDragging || !pluginState.draggedRange) {
                return false;
              }

              event.preventDefault();
              event.stopPropagation();

              const { from, to } = pluginState.draggedRange;
              const targetPos = pluginState.dropTargetPos;

              // First reset the drag & drop indicator state
              let tr = view.state.tr.setMeta(blockDragDropKey, { type: "endDrag" });

              if (targetPos === null || (targetPos >= from && targetPos <= to)) {
                view.dispatch(tr);
                return true;
              }

              const slice = view.state.doc.slice(from, to);
              const sliceSize = to - from;

              const numBlocks = countBlocksInRange(view, from, to);

              if (targetPos > to) {
                // Moving downward: target is after source
                tr = tr.delete(from, to);
                const adjustedTarget = targetPos - sliceSize;
                tr = tr.insert(adjustedTarget, slice.content);

                try {
                  if (numBlocks > 1) {
                    const newFrom = adjustedTarget;
                    const newTo = adjustedTarget + slice.content.size;
                    const textFrom = Math.min(newFrom + 1, tr.doc.content.size);
                    const textTo = Math.max(textFrom, newTo - 1);
                    tr = tr.setSelection(TextSelection.create(tr.doc, textFrom, textTo));
                  } else {
                    const selNode = tr.doc.nodeAt(adjustedTarget);
                    if (selNode && selNode.isBlock) {
                      tr = tr.setSelection(NodeSelection.create(tr.doc, adjustedTarget));
                    }
                  }
                } catch {
                  // Fallback if Selection fails on custom marks
                }
              } else if (targetPos < from) {
                // Moving upward: target is before source
                tr = tr.delete(from, to);
                tr = tr.insert(targetPos, slice.content);

                try {
                  if (numBlocks > 1) {
                    const newFrom = targetPos;
                    const newTo = targetPos + slice.content.size;
                    const textFrom = Math.min(newFrom + 1, tr.doc.content.size);
                    const textTo = Math.max(textFrom, newTo - 1);
                    tr = tr.setSelection(TextSelection.create(tr.doc, textFrom, textTo));
                  } else {
                    const selNode = tr.doc.nodeAt(targetPos);
                    if (selNode && selNode.isBlock) {
                      tr = tr.setSelection(NodeSelection.create(tr.doc, targetPos));
                    }
                  }
                } catch {
                  // Fallback
                }
              }

              view.dispatch(tr.scrollIntoView());
              return true;
            },
          },
        },
      }),
    ];
  },
});
