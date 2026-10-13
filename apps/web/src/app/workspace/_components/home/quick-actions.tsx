"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { Plus, Search, Upload } from "lucide-react";
import { EASE_OUT } from "@/components/motion";
import { useUIStore } from "@/stores/ui-store";

interface QuickActionsProps {
  onCreatePage: () => void;
  disabled?: boolean;
}

interface ActionTileProps {
  icon: ReactNode;
  label: string;
  hint: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean | undefined;
  index: number;
}

function ActionTile({ icon, label, hint, shortcut, onClick, disabled, index }: ActionTileProps) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 + index * 0.06, ease: EASE_OUT }}
      {...(disabled ? {} : { whileHover: { y: -3 }, whileTap: { scale: 0.97 } })}
      className="group relative flex items-center gap-3 min-h-14 px-3 py-2.5 rounded-codex-xl border border-codex-border bg-codex-surface text-left hover:border-codex-accent/40 hover:bg-codex-surface-secondary/60 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-codex-lg bg-codex-accent/10 text-codex-accent transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-codex-foreground">{label}</span>
        <span className="block text-xs text-codex-muted truncate">{hint}</span>
      </span>
      {shortcut && (
        <kbd className="shrink-0 px-1.5 py-0.5 rounded-codex-sm border border-codex-border font-sans text-xs text-codex-muted">
          {shortcut}
        </kbd>
      )}
    </m.button>
  );
}

export function QuickActions({ onCreatePage, disabled }: QuickActionsProps) {
  const { setCommandPaletteOpen, setImportMarkdownOpen } = useUIStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-8">
      <ActionTile
        index={0}
        icon={<Plus className="w-4 h-4" />}
        label="New page"
        hint="Start from a blank canvas"
        onClick={onCreatePage}
        disabled={disabled}
      />
      <ActionTile
        index={1}
        icon={<Upload className="w-4 h-4" />}
        label="Import"
        hint="Bring in Markdown files"
        onClick={() => setImportMarkdownOpen(true)}
        disabled={disabled}
      />
      <ActionTile
        index={2}
        icon={<Search className="w-4 h-4" />}
        label="Search"
        hint="Jump to anything"
        shortcut="⌘K"
        onClick={() => setCommandPaletteOpen(true)}
      />
    </div>
  );
}
