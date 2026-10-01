"use client";

import type { ReactNode } from "react";
import { Plus, Search } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

interface QuickActionsProps {
  onCreatePage: () => void;
  disabled?: boolean;
}

function ActionChip({
  icon,
  label,
  shortcut,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 h-8 px-3 rounded-codex-md border border-codex-border text-sm text-codex-foreground hover:bg-codex-surface-secondary transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-codex-muted">{icon}</span>
      <span>{label}</span>
      {shortcut && <kbd className="font-sans text-xs text-codex-muted">{shortcut}</kbd>}
    </button>
  );
}

export function QuickActions({ onCreatePage, disabled }: QuickActionsProps) {
  const { setCommandPaletteOpen } = useUIStore();

  return (
    <div className="flex flex-wrap items-center gap-2 mt-6">
      <ActionChip
        icon={<Plus className="w-4 h-4" />}
        label="New page"
        onClick={onCreatePage}
        disabled={disabled}
      />
      <ActionChip
        icon={<Search className="w-4 h-4" />}
        label="Search"
        shortcut="⌘K"
        onClick={() => setCommandPaletteOpen(true)}
      />
    </div>
  );
}
