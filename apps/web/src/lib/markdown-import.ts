import { getSchema, type JSONContent } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import { createContentExtensions, HEADING_LEVELS } from "@/components/editor/extensions";
import {
  MAX_MARKDOWN_FILE_SIZE,
  MarkdownImportError,
  isMarkdownFile,
  titleFromFileName,
} from "./markdown-file";

export {
  MAX_MARKDOWN_FILE_SIZE,
  MARKDOWN_FILE_EXTENSIONS,
  MarkdownImportError,
  isMarkdownFile,
  titleFromFileName,
} from "./markdown-file";

const MAX_TITLE_LENGTH = 500;
const MAX_HEADING_LEVEL = Math.max(...HEADING_LEVELS);
const SAFE_LINK_PROTOCOL = /^(https?:|mailto:|tel:|#|\/)/i;
const SAFE_IMAGE_SRC = /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp);base64,)/i;
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

export interface ParsedMarkdownPage {
  title: string;
  content: JSONContent;
}

// Built lazily: the extension list (lowlight, node views) is heavy and only
// needed once the user actually imports something.
let manager: MarkdownManager | null = null;
let schema: ReturnType<typeof getSchema> | null = null;

function getParser() {
  if (!manager || !schema) {
    const extensions = createContentExtensions();
    manager = new MarkdownManager({ extensions });
    schema = getSchema(extensions);
  }
  return { manager, schema };
}

function getText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(getText).join("");
}

/**
 * Maps parser output onto what the editor supports and strips unsafe values:
 * - headings deeper than the editor allows are clamped
 * - ```mermaid code blocks become Mermaid diagram blocks
 * - links / images with unsafe protocols (e.g. javascript:) are removed
 */
function normalizeNode(node: JSONContent): JSONContent | null {
  // ProseMirror rejects empty text nodes
  if (node.type === "text" && !node.text) return null;

  if (node.type === "image") {
    const src = typeof node.attrs?.["src"] === "string" ? node.attrs["src"] : "";
    return SAFE_IMAGE_SRC.test(src) ? node : null;
  }

  if (node.type === "codeBlock" && node.attrs?.["language"] === "mermaid") {
    return { type: "mermaid", attrs: { code: getText(node) } };
  }

  // In Markdown a fence without an info string (or an indented block) is plain
  // text. Left as `null`, the editor would auto-detect a language and colorize
  // things like ASCII trees, so pin it to plaintext.
  if (node.type === "codeBlock" && !node.attrs?.["language"]) {
    return { ...node, attrs: { ...node.attrs, language: "plaintext" } };
  }

  const next: JSONContent = { ...node };

  if (node.type === "heading") {
    const level = Number(node.attrs?.["level"]) || 1;
    next.attrs = { ...node.attrs, level: Math.min(level, MAX_HEADING_LEVEL) };
  }

  if (node.marks) {
    next.marks = node.marks.filter((mark) => {
      if (mark.type !== "link") return true;
      const href = typeof mark.attrs?.["href"] === "string" ? mark.attrs["href"].trim() : "";
      return SAFE_LINK_PROTOCOL.test(href);
    });
    if (next.marks.length === 0) delete next.marks;
  }

  if (node.content) {
    next.content = node.content
      .map(normalizeNode)
      .filter((child): child is JSONContent => child !== null);
  }

  return next;
}

/**
 * The editor treats images as block nodes, but the Markdown parser emits them
 * inline inside paragraphs. Hoist any image out of a paragraph to the block
 * level and drop the (now whitespace-only) wrapper.
 */
function hoistBlockImages(blocks: JSONContent[]): JSONContent[] {
  const result: JSONContent[] = [];

  for (const block of blocks) {
    if (block.type !== "paragraph" || !block.content?.some((c) => c.type === "image")) {
      result.push(block);
      continue;
    }

    let inline: JSONContent[] = [];
    const flushInline = () => {
      if (inline.some((c) => (c.text ?? "").trim() !== "")) {
        result.push({ type: "paragraph", content: inline });
      }
      inline = [];
    };

    for (const child of block.content) {
      if (child.type === "image") {
        flushInline();
        result.push(child);
      } else {
        inline.push(child);
      }
    }
    flushInline();
  }

  return result;
}

/**
 * Converts a Markdown document into a page title + Tiptap JSON content that
 * matches the editor schema. The first top-level `# H1` becomes the title and
 * is removed from the body; otherwise `fallbackTitle` is used.
 */
export function parseMarkdownPage(markdown: string, fallbackTitle: string): ParsedMarkdownPage {
  const { manager, schema } = getParser();
  const source = markdown.replace(/^\uFEFF/, "").replace(FRONTMATTER, "");

  const doc = normalizeNode(manager.parse(source)) ?? { type: "doc", content: [] };
  const blocks = hoistBlockImages(doc.content ?? []);

  let title = fallbackTitle;
  const first = blocks[0];
  if (first?.type === "heading" && first.attrs?.["level"] === 1) {
    const headingText = getText(first).trim();
    if (headingText) {
      title = headingText;
      blocks.shift();
    }
  }

  const content: JSONContent = {
    type: "doc",
    content: blocks.length > 0 ? blocks : [{ type: "paragraph" }],
  };

  try {
    // Throws if the parser produced a structure the editor can't represent
    schema.nodeFromJSON(content).check();
  } catch {
    throw new MarkdownImportError("This file contains content that can't be imported.");
  }

  return { title: title.slice(0, MAX_TITLE_LENGTH), content };
}

/** Reads, validates, and parses a Markdown file picked by the user. */
export async function parseMarkdownFile(file: File): Promise<ParsedMarkdownPage> {
  if (!isMarkdownFile(file)) {
    throw new MarkdownImportError("Only .md or .markdown files are supported.");
  }
  if (file.size > MAX_MARKDOWN_FILE_SIZE) {
    throw new MarkdownImportError(
      `File is too large (max ${Math.round(MAX_MARKDOWN_FILE_SIZE / 1024)} KB).`,
    );
  }
  const text = await file.text();
  return parseMarkdownPage(text, titleFromFileName(file.name));
}
