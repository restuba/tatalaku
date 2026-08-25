import { Node, mergeAttributes } from "@tiptap/core";

export const Toggle = Node.create({
  name: "toggle",
  group: "block",
  content: "paragraph block*",
  defining: true,

  parseHTML() {
    return [{ tag: "details" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(HTMLAttributes, { class: "tiptap-toggle" }),
      [
        "summary",
        {
          class:
            "cursor-pointer text-sm font-medium py-0.5 text-neutral-800 dark:text-neutral-200 select-none",
        },
        "Toggle list",
      ],
      [
        "div",
        {
          class: "pl-4 pt-1 border-l border-codex-border dark:border-codex-border ml-1.5 mt-1",
        },
        0,
      ],
    ];
  },
});
