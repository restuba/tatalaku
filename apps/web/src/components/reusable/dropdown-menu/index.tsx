"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { PopPanel } from "@/components/motion/pop-panel";

// ─── Types ──────────────────────────────────────────────────────────

type Align = "start" | "end";
type Side = "bottom" | "top";

export interface DropdownTriggerProps {
  id: string;
  onClick: () => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
}

export interface DropdownMenuProps {
  /** Renders the trigger; spread the props onto a <button> */
  trigger: (props: DropdownTriggerProps, isOpen: boolean) => ReactNode;
  children: ReactNode;
  /** Edge of the trigger the menu lines up with */
  align?: Align;
  /** Opens below (default) or above the trigger */
  side?: Side;
  /** Width utility for the panel */
  widthClassName?: string;
  /** Accessible name for the menu */
  label: string;
  /**
   * Static content under the items (e.g. page details). Rendered outside the
   * `role="menu"` element, which may only contain menu items.
   */
  footer?: ReactNode;
  className?: string;
}

interface MenuContextValue {
  close: (restoreFocus?: boolean) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

const ITEM_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"])';

function getMenuItems(root: HTMLElement | null): HTMLElement[] {
  return Array.from(root?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);
}

const PANEL_POSITION: Record<Side, Record<Align, string>> = {
  bottom: { start: "top-full left-0 mt-1", end: "top-full right-0 mt-1" },
  top: { start: "bottom-full left-0 mb-1", end: "bottom-full right-0 mb-1" },
};

const ORIGIN: Record<
  Side,
  Record<Align, "top left" | "top right" | "bottom left" | "bottom right">
> = {
  bottom: { start: "top left", end: "top right" },
  top: { start: "bottom left", end: "bottom right" },
};

// ─── Root ───────────────────────────────────────────────────────────

/**
 * Accessible dropdown menu: opens from its trigger, moves focus into the
 * items (arrow keys, Home/End), closes on Escape, Tab, outside click or
 * selection, and returns focus to the trigger.
 */
export function DropdownMenu({
  trigger,
  children,
  align = "end",
  side = "bottom",
  widthClassName = "w-56",
  label,
  footer,
  className = "",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  const menuId = useId();
  /** Which item gets focus once the menu has rendered */
  const [focusOnOpen, setFocusOnOpen] = useState<"first" | "last">("first");

  const close = useCallback(
    (restoreFocus = true) => {
      setIsOpen(false);
      if (restoreFocus) document.getElementById(triggerId)?.focus();
    },
    [triggerId],
  );

  // Focus an item as soon as the panel exists
  useEffect(() => {
    if (!isOpen) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const items = getMenuItems(rootRef.current);
      const target = focusOnOpen === "last" ? items[items.length - 1] : items[0];
      target?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, focusOnOpen]);

  // Outside click closes without stealing focus back
  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, close]);

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setFocusOnOpen(event.key === "ArrowUp" ? "last" : "first");
      setIsOpen(true);
    }
  };

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = getMenuItems(rootRef.current);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) => items[(i + items.length) % items.length]?.focus();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(items.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <MenuContext.Provider value={{ close }}>
      <div ref={rootRef} className={`relative ${className}`}>
        {trigger(
          {
            id: triggerId,
            onClick: () => {
              setFocusOnOpen("first");
              setIsOpen((open) => !open);
            },
            onKeyDown: onTriggerKeyDown,
            "aria-haspopup": "menu",
            "aria-expanded": isOpen,
            "aria-controls": menuId,
          },
          isOpen,
        )}
        <PopPanel
          open={isOpen}
          origin={ORIGIN[side][align]}
          className={`surface-popover absolute z-50 rounded-codex-lg p-1 text-sm ${PANEL_POSITION[side][align]} ${widthClassName}`}
        >
          <div id={menuId} role="menu" aria-label={label} onKeyDown={onMenuKeyDown}>
            {children}
          </div>
          {footer && (
            <>
              <div aria-hidden="true" className="mx-1.5 my-1 h-px bg-codex-border" />
              {footer}
            </>
          )}
        </PopPanel>
      </div>
    </MenuContext.Provider>
  );
}

// ─── Parts ──────────────────────────────────────────────────────────

const ITEM_BASE =
  "flex min-h-8 w-full items-center gap-2.5 rounded-codex-md px-2.5 py-1.5 text-left text-sm outline-none transition-colors duration-150 focus-visible:bg-codex-hover pointer-coarse:min-h-11";

interface DropdownItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onSelect: () => void;
  /** Destructive actions read in the danger color */
  danger?: boolean;
  disabled?: boolean;
}

function DropdownItem({ icon, children, onSelect, danger, disabled }: DropdownItemProps) {
  const menu = useContext(MenuContext);
  return (
    <button
      type="button"
      role="menuitem"
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      onClick={() => {
        if (disabled) return;
        menu?.close();
        onSelect();
      }}
      className={`${ITEM_BASE} ${
        disabled
          ? "cursor-not-allowed text-codex-faint"
          : danger
            ? "text-codex-danger hover:bg-codex-danger-bg focus-visible:bg-codex-danger-bg"
            : "text-codex-foreground hover:bg-codex-hover"
      }`}
    >
      {icon && (
        <span
          className={`flex size-4 shrink-0 items-center justify-center ${danger ? "" : "text-codex-muted"}`}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

function DropdownSeparator() {
  return <div role="separator" className="mx-1.5 my-1 h-px bg-codex-border" />;
}

DropdownMenu.Item = DropdownItem;
DropdownMenu.Separator = DropdownSeparator;

export default DropdownMenu;
