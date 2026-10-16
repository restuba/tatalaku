import { Check } from "lucide-react";
import { TABLE_TEXT_COLORS, TABLE_BACKGROUND_COLORS, TableColorOption } from "./table-colors";

/** Section heading in the mono label voice */
const SECTION_LABEL =
  "px-2.5 pt-2 pb-1.5 font-mono text-xs uppercase tracking-label text-codex-muted/80";

interface ColorSubmenuProps {
  /** Currently applied text color value (or null for default). */
  activeColor: string | null;
  /** Currently applied background color value (or null for default). */
  activeBackground: string | null;
  onSelectColor: (value: string | null) => void;
  onSelectBackground: (value: string | null) => void;
}

/**
 * Color picker shown as a submenu from the table action menu.
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
    <div className="w-48 glass-surface rounded-codex-lg border border-codex-border-strong p-1 text-sm animate-in fade-in duration-150">
      <div className={SECTION_LABEL}>Text</div>
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

      <div className="mx-2 my-1 h-px bg-codex-border" />

      <div className={SECTION_LABEL}>Background</div>
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
      className={`flex h-8 w-full items-center gap-2 rounded-codex-md px-2.5 text-left transition-colors ${
        isActive
          ? "bg-codex-surface-raised text-codex-foreground"
          : "text-codex-muted hover:bg-codex-surface-raised hover:text-codex-foreground"
      }`}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-codex-sm border text-xs font-semibold"
        style={swatchStyle}
      >
        {swatchChar ?? ""}
      </span>
      <span className="flex-1">{option.label}</span>
      {isActive && <Check className="h-4 w-4 text-codex-foreground" />}
    </button>
  );
}
