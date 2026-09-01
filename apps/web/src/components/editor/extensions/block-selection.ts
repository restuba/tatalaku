import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";

export const BlockSelection = Extension.create({
  name: "blockSelection",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("blockSelection"),
        props: {
          decorations(state) {
            const { selection, doc } = state;
            const decorations: Decoration[] = [];

            if (selection.empty) {
              return DecorationSet.empty;
            }

            const { $from, $to } = selection;
            let isMultiBlock = false;

            if (selection instanceof NodeSelection) {
              isMultiBlock = true;
            } else if (selection instanceof TextSelection) {
              // Check if selection spans multiple top-level blocks
              const startBlock = $from.depth > 0 ? $from.before(1) : null;
              const endBlock = $to.depth > 0 ? $to.before(1) : null;

              if (startBlock !== null && endBlock !== null && startBlock !== endBlock) {
                isMultiBlock = true;
              }
            }

            if (!isMultiBlock) {
              return DecorationSet.empty;
            }

            // Find start and end range for the top-level blocks
            let startPos = $from.depth > 0 ? $from.before(1) : $from.pos;
            let endPos = $to.depth > 0 ? $to.after(1) : $to.pos;

            if (selection instanceof NodeSelection) {
              startPos = selection.from;
              endPos = selection.to;
            }

            doc.nodesBetween(startPos, endPos, (node, pos) => {
              // We only want to decorate top-level blocks
              if (node.isBlock && doc.resolve(pos).depth === 0) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "block-selected",
                  }),
                );
                return false; // Skip children, we only decorate the top-level wrapper
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
