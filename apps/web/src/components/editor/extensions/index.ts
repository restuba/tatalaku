import type { AnyExtension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import Image from "@tiptap/extension-image";
import { TextStyle, Color, BackgroundColor } from "@tiptap/extension-text-style";
// `common` = 37 widely used languages (incl. plaintext). The full set (`all`,
// 192 languages) roughly triples the highlighter's size for rarely used grammars.
import { common, createLowlight } from "lowlight";
import { CodeBlock } from "./code-block";
import { Toggle } from "./toggle";
import { GlobalId } from "./global-id";
import { Mermaid } from "./mermaid";
import { ColorTableCell, ColorTableHeader } from "../table/table-extensions";

const lowlight = createLowlight(common);

/** Heading levels supported by the editor. Anything deeper is clamped. */
export const HEADING_LEVELS = [1, 2, 3] as const;

/**
 * Extensions that define the document schema (nodes, marks, attributes).
 *
 * Shared by the interactive editor and non-UI consumers (e.g. Markdown import)
 * so content produced outside the editor always matches the editor's schema.
 * UI-only behavior (placeholder, slash menu, selection, drag & drop) is added
 * by the editor on top of this list.
 */
export function createContentExtensions(): AnyExtension[] {
  return [
    GlobalId,
    StarterKit.configure({
      heading: { levels: [...HEADING_LEVELS] },
      codeBlock: false,
    }),
    CodeBlock.configure({ lowlight }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true }),
    TableRow,
    ColorTableHeader,
    ColorTableCell,
    Image.configure({ inline: false, allowBase64: true }),
    // Text color + background color marks for the bubble menu. TextStyle is the
    // shared <span> container; Color and BackgroundColor add their attributes.
    TextStyle,
    Color,
    BackgroundColor,
    Toggle,
    Mermaid,
  ];
}
