import { Check } from "lucide-react";
import { TABLE_TEXT_COLORS, TABLE_BACKGROUND_COLORS, TableColorOption } from "./table-colors";

interface ColorSubmenuProps {
  /** Currently applied text color value (or null for default). */
  activeColor: string | null;
  /** Currently applied background color value (or null for default). */
  activeBackground: string | null;
  onSelectColor: (value: string | null) => void;
  onSelectBackground: (value: string | null) => void;
}

/**
 * Notion-style color picker shown as a submenu from the table action menu.
 * Lists text colors then background colors, each swatch derived from the
 * Codex theme tokens (see table-colors.ts).
 */
export function ColorSubmenu({
  activeColor,
  activeBackground,
  onSelectColor,
  onSelectBackground,
}: ColorSubmenuProps) {
  return (
    <div className="w-48 glass-surface border border-codex-border rounded-codex-md py-1 shadow-lg text-sm">
      <div className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-codex-muted">
        Text
      </div>
      {TABLE_TEXT_COLORS.map((option) => (
        <ColorRow
          key={option.key}
          option={option}
          isActive={activeColor === option.value}
          swatchStyle={{
            color: option.value ?? "var(--color-ink)",
            borderColor: "var(--color-border)",
          }}
          swatchChar="A"
          onSelect={() => onSelectColor(option.value)}
        />
      ))}

      <div className="h-px bg-codex-border my-1" />

      <div className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-codex-muted">
        Background
      </div>
      {TABLE_BACKGROUND_COLORS.map((option) => (
        <ColorRow
          key={option.key}
          option={option}
          isActive={activeBackground === option.value}
          swatchStyle={{
            backgroundColor: option.value ?? "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
          onSelect={() => onSelectBackground(option.value)}
        />
      ))}
    </div>
  );
}

interface ColorRowProps {
  option: TableColorOption;
  isActive: boolean;
  swatchStyle: React.CSSProperties;
  swatchChar?: string;
  onSelect: () => void;
}

function ColorRow({ option, isActive, swatchStyle, swatchChar, onSelect }: ColorRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-codex-sm border text-xs font-semibold"
        style={swatchStyle}
      >
        {swatchChar ?? ""}
      </span>
      <span className="flex-1">{option.label}</span>
      {isActive && <Check className="h-4 w-4 text-codex-accent" />}
    </button>
  );
}
