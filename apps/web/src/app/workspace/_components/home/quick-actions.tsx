"use client";

import { m } from "motion/react";
import { Plus, Search, Upload } from "lucide-react";
import { TWEEN } from "@/components/motion";
import { useUIStore } from "@/stores/ui-store";

interface QuickActionsProps {
  onCreatePage: () => void;
  disabled?: boolean;
}

/** The one primary action on the screen: solid accent pill */
const PRIMARY =
  "inline-flex h-11 items-center gap-2 rounded-full bg-codex-accent px-6 font-mono text-xs uppercase tracking-label text-codex-background transition-opacity duration-150 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 pointer-coarse:h-12";
/** Everything else: outlined pill */
const SECONDARY =
  "inline-flex h-11 items-center gap-2.5 rounded-full border border-codex-border-strong px-5 font-mono text-xs uppercase tracking-label text-codex-foreground transition-colors duration-150 hover:border-codex-muted disabled:cursor-not-allowed disabled:opacity-40 pointer-coarse:h-12";

export function QuickActions({ onCreatePage, disabled }: QuickActionsProps) {
  const { setCommandPaletteOpen, setImportMarkdownOpen } = useUIStore();

  return (
    <m.div
      className="mt-10 flex flex-wrap items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...TWEEN, delay: 0.25 }}
    >
      <button type="button" onClick={onCreatePage} disabled={disabled} className={PRIMARY}>
        <Plus className="w-4 h-4" aria-hidden="true" />
        New page
      </button>
      <button
        type="button"
        onClick={() => setImportMarkdownOpen(true)}
        disabled={disabled}
        className={SECONDARY}
      >
        <Upload className="w-4 h-4" aria-hidden="true" />
        Import
      </button>
      <button type="button" onClick={() => setCommandPaletteOpen(true)} className={SECONDARY}>
        <Search className="w-4 h-4" aria-hidden="true" />
        Search
        <kbd className="font-mono text-xs text-codex-muted pointer-coarse:hidden">⌘K</kbd>
      </button>
    </m.div>
  );
}
