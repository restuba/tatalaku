"use client";

import { m, type Variants } from "motion/react";
import { Blocks, Command, Download, FileText, Search, SlidersHorizontal } from "lucide-react";
import { EASE_OUT } from "@/components/motion";
import { TiltCard } from "@/components/motion/tilt-card";

const FEATURES = [
  {
    icon: Blocks,
    title: "Block-based editor",
    description: "Headings, to-dos, tables, toggles, code, and diagrams. Type / for anything.",
  },
  {
    icon: FileText,
    title: "Nested pages",
    description: "Organize everything in a tree. Drag to reorder, nest, and restructure freely.",
  },
  {
    icon: Search,
    title: "Instant search",
    description: "Find any page by title or content the moment you start typing.",
  },
  {
    icon: Download,
    title: "Markdown in & out",
    description: "Import your existing notes and export any page back to Markdown.",
  },
  {
    icon: Command,
    title: "Keyboard first",
    description: "⌘K to jump anywhere, ⌘\\ to fold the sidebar, ⌘/ for every shortcut.",
  },
  {
    icon: SlidersHorizontal,
    title: "Made to fit you",
    description: "Themes, full-width pages, and a motion switch for calmer screens.",
  },
] as const;

const GRID: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07 } },
};

const CARD: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

/** Feature cards that cascade in once they scroll into view */
export function FeatureGrid() {
  return (
    <m.ul
      className="grid w-full max-w-5xl grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-3"
      variants={GRID}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
    >
      {FEATURES.map((feature) => (
        <m.li key={feature.title} variants={CARD}>
          <TiltCard tilt={4} className="h-full rounded-codex-2xl">
            <div className="flex h-full flex-col gap-4 rounded-codex-2xl border border-codex-border bg-codex-surface/70 p-5 backdrop-blur-sm transition-colors duration-200 group-hover/tilt:border-codex-accent/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-codex-lg bg-codex-accent/10 text-codex-accent transition-transform duration-300 group-hover/tilt:-rotate-6 group-hover/tilt:scale-110">
                <feature.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-codex-foreground">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-codex-muted">
                  {feature.description}
                </p>
              </div>
            </div>
          </TiltCard>
        </m.li>
      ))}
    </m.ul>
  );
}
