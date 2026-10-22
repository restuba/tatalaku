const BLOCKS = [
  "Headings",
  "To-do lists",
  "Tables",
  "Toggles",
  "Code blocks",
  "Mermaid diagrams",
  "Quotes",
  "Images",
  "Nested pages",
  "Markdown import",
  "Slash commands",
  "Favorites",
] as const;

/** The block types as quiet outlined tags that wrap to fit the width */
export function BlockList() {
  return (
    <ul
      aria-label="Supported blocks"
      className="flex max-w-3xl flex-wrap items-center justify-center gap-2"
    >
      {BLOCKS.map((block) => (
        <li
          key={block}
          className="rounded-full border border-codex-border px-3 py-1 text-sm text-codex-muted"
        >
          {block}
        </li>
      ))}
    </ul>
  );
}
