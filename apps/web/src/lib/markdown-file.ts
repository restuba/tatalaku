/**
 * Lightweight Markdown-file helpers with no editor/parser dependencies, so UI
 * (e.g. the import dropzone) can validate files without pulling the parser
 * bundle. The heavy parser lives in `markdown-import.ts` and is lazy-loaded.
 */

/**
 * Max size of a single Markdown file. The converted Tiptap JSON is usually
 * 2–3x larger than the source and the API caps request bodies at 1 MB.
 */
export const MAX_MARKDOWN_FILE_SIZE = 300 * 1024;
export const MARKDOWN_FILE_EXTENSIONS = [".md", ".markdown"] as const;

export class MarkdownImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarkdownImportError";
  }
}

export function isMarkdownFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return MARKDOWN_FILE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/** "my-notes_v2.md" -> "my notes v2" */
export function titleFromFileName(fileName: string): string {
  const base = fileName
    .replace(/\.(md|markdown)$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return base || "Untitled";
}
