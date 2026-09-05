import type { TabItem } from "./types";

interface TabButtonProps extends TabItem {
  isActive: boolean;
  isFullWidth: boolean;
  onClick: () => void;
}

export function TabButton({
  label,
  icon,
  isActive,
  isFullWidth,
  disabled,
  onClick,
  value,
}: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      data-tab-value={value}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer select-none ${
        isFullWidth ? "flex-1" : ""
      } ${
        isActive ? "text-accent font-semibold" : "text-muted hover:text-ink"
      } ${disabled ? "pointer-events-none opacity-40 cursor-not-allowed" : ""}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

export default TabButton;
