import type { Block, BlockType } from "@tatalaku/shared";
import type { JSONContent } from "@tiptap/core";

export function tiptapDocToBlocks(
  doc: JSONContent,
  _pageId?: string,
): Array<{
  id?: string;
  type: BlockType;
  content?: unknown;
  order: number;
  parentBlockId?: string | null;
}> {
  if (!doc.content || doc.content.length === 0) {
    return [
      {
        type: "paragraph",
        content: [],
        order: 0,
        parentBlockId: null,
      },
    ];
  }

  return doc.content.map((node, index) => {
    let type: BlockType = "paragraph";
    let content: unknown = node.content ?? null;

    switch (node.type) {
      case "heading": {
        const level = node.attrs?.["level"] ?? 1;
        if (level === 1) type = "heading1";
        else if (level === 2) type = "heading2";
        else type = "heading3";
        break;
      }
      case "bulletList":
        type = "bulletList";
        break;
      case "orderedList":
        type = "numberedList";
        break;
      case "taskList":
        type = "todo";
        break;
      case "toggle":
        type = "toggle";
        break;
      case "codeBlock":
        type = "code";
        break;
      case "blockquote":
        type = "quote";
        break;
      case "horizontalRule":
        type = "divider";
        content = null;
        break;
      case "image":
        type = "image";
        content = node.attrs ?? null;
        break;
      case "paragraph":
      default:
        type = "paragraph";
        break;
    }

    return {
      type,
      content,
      order: index,
      parentBlockId: null,
    };
  });
}

export function blocksToTiptapDoc(blocks: Block[]): JSONContent {
  if (!blocks || blocks.length === 0) {
    return {
      type: "doc",
      content: [{ type: "paragraph" }],
    };
  }

  const content: JSONContent[] = blocks
    .sort((a, b) => a.order - b.order)
    .map((block) => {
      switch (block.type) {
        case "heading1":
          return {
            type: "heading",
            attrs: { level: 1 },
            content: (block.content as JSONContent[]) ?? [],
          };
        case "heading2":
          return {
            type: "heading",
            attrs: { level: 2 },
            content: (block.content as JSONContent[]) ?? [],
          };
        case "heading3":
          return {
            type: "heading",
            attrs: { level: 3 },
            content: (block.content as JSONContent[]) ?? [],
          };
        case "bulletList":
          return {
            type: "bulletList",
            content: (block.content as JSONContent[]) ?? [],
          };
        case "numberedList":
          return {
            type: "orderedList",
            content: (block.content as JSONContent[]) ?? [],
          };
        case "todo":
          return {
            type: "taskList",
            content: (block.content as JSONContent[]) ?? [],
          };
        case "toggle":
          return {
            type: "toggle",
            content: (block.content as JSONContent[]) ?? [],
          };
        case "code":
          return {
            type: "codeBlock",
            content: (block.content as JSONContent[]) ?? [],
          };
        case "quote":
          return {
            type: "blockquote",
            content: (block.content as JSONContent[]) ?? [],
          };
        case "divider":
          return {
            type: "horizontalRule",
          };
        case "image":
          return {
            type: "image",
            attrs: (block.content as Record<string, unknown>) ?? {},
          };
        case "paragraph":
        default:
          return {
            type: "paragraph",
            content: (block.content as JSONContent[]) ?? [],
          };
      }
    });

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}
