import type { ThemeId } from "@/lib/themes";

/**
 * A miniature of the workspace drawn with a theme's own tokens: the
 * `data-theme` attribute scopes the palette, so no color is restated here.
 */
export function ThemePreview({ theme }: { theme: ThemeId }) {
  return (
    <div
      data-theme={theme}
      aria-hidden="true"
      className="flex h-24 overflow-hidden rounded-codex-md border border-codex-border bg-codex-background"
    >
      <div className="w-1/4 space-y-1.5 border-r border-codex-border bg-codex-sidebar p-2">
        <span className="block h-1.5 w-3/4 rounded-full bg-codex-accent" />
        <span className="block h-1.5 w-full rounded-full bg-codex-selected" />
        <span className="block h-1 w-2/3 rounded-full bg-codex-border-strong" />
        <span className="block h-1 w-3/4 rounded-full bg-codex-border-strong" />
      </div>
      <div className="min-w-0 flex-1 p-2.5">
        <span className="block font-serif text-base leading-none text-codex-foreground">
          Good <span className="italic text-codex-accent-secondary">day</span>
        </span>
        <span className="mt-2 block h-1 w-5/6 rounded-full bg-codex-border-strong" />
        <span className="mt-1 block h-1 w-2/3 rounded-full bg-codex-border-strong" />
        <span className="mt-2.5 flex gap-1">
          <span className="h-2.5 w-8 rounded-full bg-codex-accent" />
          <span className="h-2.5 w-6 rounded-full border border-codex-border-strong bg-codex-elevated" />
        </span>
      </div>
    </div>
  );
}
