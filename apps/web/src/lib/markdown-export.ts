import type { JSONContent } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import type { Page } from "@tatalaku/shared";
import { createContentExtensions } from "@/components/editor/extensions";

// Built lazily: the extension list is heavy and only needed on first export.
let manager: MarkdownManager | null = null;

const PLAIN_TEXT_LANGUAGES = new Set(["plaintext", "text"]);

function getSerializer(): MarkdownManager {
  if (!manager) {
    manager = new MarkdownManager({ extensions: createContentExtensions() });
  }
  return manager;
}

/**
 * The Mermaid node has no Markdown serializer. Represent it as a fenced
 * ```mermaid code block so it round-trips back on import.
 */
function toSerializable(node: JSONContent): JSONContent {
  if (node.type === "mermaid") {
    const code = typeof node.attrs?.["code"] === "string" ? node.attrs["code"] : "";
    return {
      type: "codeBlock",
      attrs: { language: "mermaid" },
      content: code ? [{ type: "text", text: code }] : [],
    };
  }

  // Plain-text blocks round-trip as a bare ``` fence (the Markdown default)
  if (node.type === "codeBlock" && PLAIN_TEXT_LANGUAGES.has(String(node.attrs?.["language"]))) {
    return { ...node, attrs: { ...node.attrs, language: null } };
  }

  if (node.content) {
    return { ...node, content: node.content.map(toSerializable) };
  }

  return node;
}

/** Converts a page's stored content into a Markdown document, with the title as an H1. */
export function pageToMarkdown(page: Page): string {
  const title = page.title?.trim() || "Untitled";

  let body = "";
  if (page.content) {
    try {
      const doc = JSON.parse(page.content) as JSONContent;
      body = getSerializer().serialize(toSerializable(doc)).trim();
    } catch {
      // Legacy/non-JSON content: fall back to the raw string
      body = page.content.trim();
    }
  }

  return body ? `# ${title}\n\n${body}\n` : `# ${title}\n`;
}

/** "My Page: Notes/Draft" -> "my-page-notes-draft.md" */
export function markdownFileName(title: string): string {
  const slug = (title?.trim() || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return `${slug || "untitled"}.md`;
}

/** Triggers a client-side download of the given Markdown text. */
export function downloadMarkdown(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Serializes a page and downloads it as a `.md` file. */
export function exportPageToMarkdown(page: Page): void {
  downloadMarkdown(markdownFileName(page.title), pageToMarkdown(page));
}
