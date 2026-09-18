import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { NodeSelection, TextSelection, AllSelection, Selection } from "@tiptap/pm/state";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

export const blockSelectionKey = new PluginKey("blockSelection");

export interface BlockSelectionState {
  activeBlockPos: number | null;
}

export const getBlockRange = (
  selection: Selection,
  doc: ProseMirrorNode,
  pluginState: BlockSelectionState | undefined,
) => {
  if (selection.empty && !pluginState?.activeBlockPos) return null;

  if (selection instanceof NodeSelection) {
    return { start: selection.from, end: selection.to };
  }

  // If we explicitly marked a single block as selected (Step 2)
  if (pluginState?.activeBlockPos !== null && pluginState?.activeBlockPos !== undefined) {
    const pos = pluginState.activeBlockPos;
    const node = doc.nodeAt(pos);
    if (node) {
      return { start: pos, end: pos + node.nodeSize };
    }
  }

  const { $from, $to } = selection;

  // Find top-level block boundaries
  const startBlockPos = $from.depth > 0 ? $from.before(1) : $from.pos;
  const endBlockPos = $to.depth > 0 ? $to.before(1) : $to.pos;

  // Case 1: Multiple blocks selected (e.g., via dragging/lasso or AllSelection)
  if (startBlockPos !== endBlockPos) {
    let start = startBlockPos;
    let end = $to.depth > 0 ? $to.after(1) : $to.pos;

    // Safety for AllSelection on some edge cases
    if (
      selection instanceof AllSelection ||
      (selection.from === 0 && selection.to === doc.content.size)
    ) {
      start = 0;
      end = doc.content.size;
    }

    return { start, end };
  }

  // Case 2: Single block. We ONLY consider it a block selection natively if it's an AllSelection
  // (e.g. document has only 1 block and user triggered Step 3).
  // Otherwise, full TextSelection remains native text selection (Step 1).
  if (startBlockPos === endBlockPos) {
    if (
      selection instanceof AllSelection ||
      (selection.from === 0 && selection.to === doc.content.size)
    ) {
      const node = doc.nodeAt(startBlockPos);
      if (node && node.isBlock) {
        return { start: startBlockPos, end: startBlockPos + node.nodeSize };
      }
    }
  }

  return null;
};

export const BlockSelection = Extension.create({
  name: "blockSelection",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: blockSelectionKey,
        state: {
          init() {
            return { activeBlockPos: null };
          },
          apply(tr, value) {
            const meta = tr.getMeta(blockSelectionKey);

            if (meta?.type === "setBlockSelection") {
              return { activeBlockPos: meta.pos };
            }
            if (meta?.type === "clearBlockSelection") {
              return { activeBlockPos: null };
            }

            // If selection changes natively via click or typing, clear the block selection
            if (tr.selectionSet && !meta) {
              return { activeBlockPos: null };
            }

            if (value.activeBlockPos !== null && tr.docChanged) {
              const mapped = tr.mapping.map(value.activeBlockPos);
              return { activeBlockPos: mapped };
            }

            return value;
          },
        },
        props: {
          attributes(state) {
            const pluginState = blockSelectionKey.getState(state);
            const range = getBlockRange(state.selection, state.doc, pluginState);
            if (range) {
              return { class: "is-multi-block" };
            }
            return {};
          },
          decorations(state) {
            const { doc, selection } = state;
            const pluginState = blockSelectionKey.getState(state);
            const range = getBlockRange(selection, doc, pluginState);

            if (!range) return DecorationSet.empty;

            const decorations: Decoration[] = [];

            doc.nodesBetween(range.start, range.end, (node, pos) => {
              // We only want to decorate top-level blocks
              if (node.isBlock && doc.resolve(pos).depth === 0) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "block-selected",
                  }),
                );
                return false; // Skip children
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-a": ({ editor }) => {
        const { state, dispatch } = editor.view;
        const { selection, doc } = state;
        const pluginState = blockSelectionKey.getState(state);

        // Step 3: If already a custom block selection, select all page
        if (pluginState?.activeBlockPos !== null) {
          // Clear custom block state and let Tiptap do selectAll (Step 3)
          dispatch(state.tr.setMeta(blockSelectionKey, { type: "clearBlockSelection" }));
          return false;
        }

        if (selection instanceof TextSelection && selection.$from.sameParent(selection.$to)) {
          const $pos = selection.$from;

          if ($pos.parent.isTextblock) {
            const blockStart = $pos.start();
            const blockEnd = $pos.end();

            // Step 2: If text is fully selected (or block is empty), convert to Block Selection
            if (selection.from === blockStart && selection.to === blockEnd) {
              const blockPos = $pos.before(1);
              const tr = state.tr.setSelection(TextSelection.create(doc, blockStart, blockEnd));
              tr.setMeta(blockSelectionKey, { type: "setBlockSelection", pos: blockPos });
              dispatch(tr);
              return true;
            } else {
              // Step 1: Select all text in the block
              const tr = state.tr.setSelection(TextSelection.create(doc, blockStart, blockEnd));
              dispatch(tr);
              return true;
            }
          }
        }

        return false;
      },
      Backspace: ({ editor }) => {
        const { state, dispatch } = editor.view;
        const pluginState = blockSelectionKey.getState(state);

        // If a block is fully selected (Step 2), Backspace should delete the entire block
        if (pluginState?.activeBlockPos !== null) {
          const pos = pluginState.activeBlockPos;
          const node = state.doc.nodeAt(pos);
          if (node) {
            const tr = state.tr.delete(pos, pos + node.nodeSize);
            tr.setMeta(blockSelectionKey, { type: "clearBlockSelection" });
            dispatch(tr);
            return true;
          }
        }
        return false;
      },
      Escape: ({ editor }) => {
        const { state, dispatch } = editor.view;
        const pluginState = blockSelectionKey.getState(state);

        if (pluginState?.activeBlockPos !== null) {
          dispatch(state.tr.setMeta(blockSelectionKey, { type: "clearBlockSelection" }));
          return true;
        }
        return false;
      },
    };
  },
});
