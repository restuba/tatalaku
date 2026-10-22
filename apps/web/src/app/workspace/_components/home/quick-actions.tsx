"use client";

import { Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/reusable/button";
import { ModKey } from "@/components/reusable/kbd";
import { useUIStore } from "@/stores/ui-store";

interface QuickActionsProps {
  onCreatePage: () => void;
  disabled?: boolean;
}

/** The one primary action (new page) plus two quiet secondary ones */
export function QuickActions({ onCreatePage, disabled }: QuickActionsProps) {
  const { setCommandPaletteOpen, setImportMarkdownOpen } = useUIStore();

  return (
    <div className="mt-9 flex flex-wrap items-center gap-2.5">
      <Button
        btnType="primary"
        onClick={onCreatePage}
        disabled={disabled}
        icon={<Plus className="size-4" />}
      >
        New page
      </Button>
      <Button
        onClick={() => setImportMarkdownOpen(true)}
        disabled={disabled}
        icon={<Upload className="size-4" />}
      >
        Import
      </Button>
      <Button
        onClick={() => setCommandPaletteOpen(true)}
        icon={<Search className="size-4" />}
        iconPlacement="start"
        aria-keyshortcuts="Meta+K Control+K"
      >
        <span className="flex items-center gap-2">
          Search
          <ModKey className="pointer-coarse:hidden">K</ModKey>
        </span>
      </Button>
    </div>
  );
}
