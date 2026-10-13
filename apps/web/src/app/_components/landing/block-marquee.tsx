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

/**
 * An endless, slow ribbon of block types. Pure CSS (no JS, no hydration):
 * the list is rendered twice and shifted by half its width, so the loop is
 * seamless. Pauses on hover; motion off leaves it still.
 */
export function BlockMarquee() {
  return (
    <div
      aria-hidden="true"
      className="marquee-mask group relative w-full max-w-5xl overflow-hidden py-2"
    >
      {/* Each copy carries its own trailing gap (pr-3), so -50% lands exactly on the seam */}
      <div className="marquee-track flex w-max group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 gap-3 pr-3">
            {BLOCKS.map((block) => (
              <li
                key={block}
                className="whitespace-nowrap rounded-full border border-codex-border bg-codex-surface/60 px-3.5 py-1.5 font-mono text-xs text-codex-muted"
              >
                {block}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
