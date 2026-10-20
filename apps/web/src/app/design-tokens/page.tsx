import type { Metadata } from "next";
import { Plus, Search } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { THEMES, type ThemeId } from "@/lib/themes";

export const metadata: Metadata = {
  title: "Design tokens · Tatalaku",
};

const SWATCHES: ReadonlyArray<{ name: string; className: string; outline?: boolean }> = [
  { name: "background", className: "bg-codex-background", outline: true },
  { name: "sidebar", className: "bg-codex-sidebar", outline: true },
  { name: "elevated", className: "bg-codex-elevated", outline: true },
  { name: "border", className: "bg-codex-border" },
  { name: "foreground", className: "bg-codex-foreground" },
  { name: "muted", className: "bg-codex-muted" },
  { name: "faint", className: "bg-codex-faint" },
  { name: "accent", className: "bg-codex-accent" },
  { name: "accent-secondary", className: "bg-codex-accent-secondary" },
  { name: "danger", className: "bg-codex-danger" },
  { name: "success", className: "bg-codex-success" },
  { name: "warning", className: "bg-codex-warning" },
  { name: "info", className: "bg-codex-info" },
];

/** One theme rendered with its own palette via a scoped data-theme */
function ThemeColumn({ id, name, style }: { id: ThemeId; name: string; style: string }) {
  return (
    <section
      data-theme={id}
      aria-labelledby={`tokens-${id}`}
      className="flex flex-col gap-8 rounded-codex-xl border border-codex-border bg-codex-background p-6 text-codex-foreground"
    >
      <header>
        <p className="eyebrow text-codex-muted">{style}</p>
        <h2 id={`tokens-${id}`} className="mt-1 font-serif text-3xl font-medium">
          {name}
        </h2>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {SWATCHES.map((swatch) => (
          <div key={swatch.name} className="space-y-1.5">
            <div
              className={`h-12 rounded-codex-md ${swatch.className} ${
                swatch.outline ? "border border-codex-border" : ""
              }`}
            />
            <p className="truncate text-xs text-codex-muted">{swatch.name}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="eyebrow text-codex-muted">Typography</p>
        <p className="font-serif text-4xl leading-[1.1]">
          Good morning, <span className="italic text-codex-accent">reader</span>
        </p>
        <p className="font-serif text-2xl font-medium">Document heading</p>
        <p className="text-[1.0625rem] leading-[1.7]">
          Body text is set in Inter at 17px on a 1.7 line height, for long, comfortable reading
          sessions.
        </p>
        <p className="text-sm text-codex-muted">Secondary text for metadata and hints.</p>
        <code className="inline-block rounded-codex-sm border border-codex-border bg-codex-surface-secondary px-1.5 py-0.5 font-mono text-sm">
          const theme = &quot;{id}&quot;;
        </code>
      </div>

      <div className="space-y-3">
        <p className="eyebrow text-codex-muted">Components</p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex h-9 items-center gap-2 rounded-full bg-codex-accent px-4 text-sm font-medium text-codex-background">
            <Plus className="size-4" aria-hidden="true" /> New page
          </span>
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-codex-border-strong px-4 text-sm font-medium">
            <Search className="size-4" aria-hidden="true" /> Search
          </span>
        </div>
        <div className="flex h-9 items-center rounded-codex-md border border-codex-border-strong bg-codex-elevated px-3 text-sm text-codex-faint">
          Placeholder text
        </div>
        <div className="surface-popover rounded-codex-lg p-1 text-sm">
          <div className="rounded-codex-md px-2.5 py-1.5">Menu item</div>
          <div className="rounded-codex-md bg-codex-hover px-2.5 py-1.5">Hovered item</div>
          <div className="rounded-codex-md bg-codex-selected px-2.5 py-1.5 font-medium">
            Selected item
          </div>
          <div className="rounded-codex-md px-2.5 py-1.5 text-codex-danger">Destructive item</div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-codex-success-bg px-2.5 py-1 text-codex-success">
            Saved
          </span>
          <span className="rounded-full bg-codex-warning-bg px-2.5 py-1 text-codex-warning">
            Pending
          </span>
          <span className="rounded-full bg-codex-danger-bg px-2.5 py-1 text-codex-danger">
            Not saved
          </span>
          <span className="rounded-full bg-codex-info-bg px-2.5 py-1 text-codex-info">Info</span>
        </div>
      </div>
    </section>
  );
}

/** Living reference of the design system: all three themes, side by side */
export default function DesignTokensPage() {
  return (
    <div className="min-h-dvh bg-codex-background px-6 py-10 text-codex-foreground sm:px-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-3">
          <Logo size="md" />
          <h1 className="font-serif text-4xl font-normal">Design tokens</h1>
          <p className="max-w-2xl text-codex-muted">
            One design language, three palettes. Layout, type and components are identical; only the
            color tokens change. Source of truth: <code className="font-mono">globals.css</code>.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {THEMES.map((theme) => (
            <ThemeColumn key={theme.id} id={theme.id} name={theme.name} style={theme.style} />
          ))}
        </div>
      </div>
    </div>
  );
}
