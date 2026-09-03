import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const GlobalId = Extension.create({
  name: "globalId",

  addGlobalAttributes() {
    return [
      {
        types: [
          "paragraph",
          "heading",
          "bulletList",
          "orderedList",
          "taskList",
          "toggle",
          "codeBlock",
          "blockquote",
          "image",
          "horizontalRule",
        ],
        attributes: {
          id: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-id") || element.getAttribute("id"),
            renderHTML: (attributes) => {
              if (!attributes["id"]) {
                return {};
              }
              return {
                id: attributes["id"],
                "data-id": attributes["id"],
              };
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("globalIdInject"),
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((tr) => tr.docChanged)) {
            return;
          }

          let tr = newState.tr;
          let modified = false;
          const blockTypes = [
            "paragraph",
            "heading",
            "bulletList",
            "orderedList",
            "taskList",
            "toggle",
            "codeBlock",
            "blockquote",
            "image",
            "horizontalRule",
          ];

          newState.doc.descendants((node, pos) => {
            if (blockTypes.includes(node.type.name)) {
              if (!node.attrs["id"]) {
                tr = tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  id: crypto.randomUUID(),
                });
                modified = true;
              }
            }
          });

          if (modified) {
            return tr;
          }
        },
      }),
    ];
  },
});
