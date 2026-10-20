"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { DropdownMenu } from "@/components/reusable/dropdown-menu";
import { ThemeSwatch } from "@/components/shared/theme-swatch";
import { THEMES, getTheme } from "@/lib/themes";
import { useHydratedThemePreference, useThemeStore } from "@/stores/theme-store";
import { useUIStore } from "@/stores/ui-store";
import { TOP_BAR_ICON_BUTTON } from "./constants";

/** Quick theme switch in the top bar; the full options live in Settings */
export function ThemeMenu() {
  const preference = useHydratedThemePreference();
  const setPreference = useThemeStore((s) => s.setPreference);
  const openSettings = useUIStore((s) => s.openSettings);

  // Icon hints at the current choice (neutral sun until hydrated)
  let TriggerIcon = Sun;
  if (preference === "system") TriggerIcon = Monitor;
  else if (preference && getTheme(preference).colorScheme === "dark") TriggerIcon = Moon;

  return (
    <DropdownMenu
      label="Theme"
      widthClassName="w-64"
      trigger={(props, isOpen) => (
        <button
          type="button"
          {...props}
          className={`${TOP_BAR_ICON_BUTTON} ${isOpen ? "bg-codex-selected text-codex-foreground" : ""}`}
          aria-label="Theme"
          title="Theme"
        >
          <TriggerIcon className="size-4" />
        </button>
      )}
    >
      <DropdownMenu.Label>Theme</DropdownMenu.Label>
      {THEMES.map((theme) => (
        <DropdownMenu.RadioItem
          key={theme.id}
          checked={preference === theme.id}
          icon={<ThemeSwatch theme={theme.id} />}
          description={theme.style}
          onSelect={() => setPreference(theme.id)}
        >
          {theme.name}
        </DropdownMenu.RadioItem>
      ))}
      <DropdownMenu.RadioItem
        checked={preference === "system"}
        icon={<ThemeSwatch theme="system" />}
        description="Parchment by day, Nocturne by night"
        onSelect={() => setPreference("system")}
      >
        Match system
      </DropdownMenu.RadioItem>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onSelect={() => openSettings("appearance")}>
        Appearance settings…
      </DropdownMenu.Item>
    </DropdownMenu>
  );
}
