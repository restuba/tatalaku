import { Blocks, Command, Download, FileText, Palette, Search } from "lucide-react";

const FEATURES = [
  {
    icon: Blocks,
    title: "A block editor",
    description: "Headings, to-dos, tables, toggles, code and diagrams. Press / for anything.",
  },
  {
    icon: FileText,
    title: "Nested pages",
    description: "Organize everything in a tree. Drag to reorder, nest and restructure freely.",
  },
  {
    icon: Search,
    title: "Instant search",
    description: "Find any page by title or content the moment you start typing.",
  },
  {
    icon: Download,
    title: "Markdown in and out",
    description: "Import your existing notes and export any page back to Markdown.",
  },
  {
    icon: Command,
    title: "Keyboard first",
    description: "⌘K to jump anywhere, ⌘\\ to fold the sidebar, ⌘/ for every shortcut.",
  },
  {
    icon: Palette,
    title: "Made for long sessions",
    description: "Three calm themes, adjustable text size and a switch for motion.",
  },
] as const;

/** Features as an editorial index: hairline-topped columns, no cards */
export function FeatureGrid() {
  return (
    <ul className="grid w-full max-w-5xl grid-cols-1 gap-x-10 gap-y-10 text-left sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature) => (
        <li key={feature.title} className="border-t border-codex-border pt-5">
          <feature.icon className="size-5 text-codex-accent" aria-hidden="true" />
          <h3 className="mt-4 font-serif text-xl font-medium text-codex-foreground">
            {feature.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-codex-muted">{feature.description}</p>
        </li>
      ))}
    </ul>
  );
}
