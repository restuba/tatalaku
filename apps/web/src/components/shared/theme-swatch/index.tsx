import type { ThemeId, ThemePreference } from "@/lib/themes";

interface ThemeSwatchProps {
  theme: ThemePreference;
  className?: string;
}

function Dot({ theme }: { theme: ThemeId }) {
  // data-theme scopes the palette, so the dot shows that theme's real tokens
  return (
    <span
      data-theme={theme}
      className="flex h-full flex-1 items-center justify-center bg-codex-background"
    >
      <span className="size-2 rounded-full bg-codex-accent" />
    </span>
  );
}

/**
 * A small circular sample of a theme: its canvas with its accent in the
 * middle. "system" shows the light and dark themes side by side.
 */
export function ThemeSwatch({ theme, className = "" }: ThemeSwatchProps) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-5 shrink-0 overflow-hidden rounded-full border border-codex-border-strong ${className}`}
    >
      {theme === "system" ? (
        <>
          <Dot theme="parchment" />
          <Dot theme="nocturne" />
        </>
      ) : (
        <Dot theme={theme} />
      )}
    </span>
  );
}

export default ThemeSwatch;
