"use client";

import { useTheme } from "next-themes";
import { useThemeStore } from "@/stores/theme-store";
import { useUIStore, type MotionPreference } from "@/stores/ui-store";
import { presets } from "@/lib/themes";
import { Monitor, Sun, Moon, Sparkles, CircleSlash, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

const MOTION_OPTIONS: ReadonlyArray<{ value: MotionPreference; label: string; icon: LucideIcon }> =
  [
    { value: "system", label: "System", icon: Monitor },
    { value: "on", label: "On", icon: Sparkles },
    { value: "off", label: "Off", icon: CircleSlash },
  ];

/** Section title in the label voice */
const SECTION_LABEL = "block font-mono text-xs uppercase tracking-label text-codex-muted";

/** Segmented control: an outlined group, the selected segment raised */
const SEGMENT_GROUP = "grid grid-cols-3 gap-1 rounded-codex-lg border border-codex-border p-1";
const SEGMENT =
  "flex flex-col items-center rounded-codex-md px-2 font-mono text-xs uppercase tracking-label transition-colors duration-150";
const SEGMENT_ACTIVE = "bg-codex-surface-raised text-codex-foreground";
const SEGMENT_IDLE = "text-codex-muted hover:text-codex-foreground";

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const { activeConfig, setCodeThemeId } = useThemeStore();
  const { isFullWidth, setFullWidth, motion, setMotion } = useUIStore();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-28 bg-codex-muted/20 rounded-codex-sm animate-pulse" />
        <div className="h-20 w-full bg-codex-muted/20 rounded-codex-lg animate-pulse" />
      </div>
    );
  }

  const currentVariant = activeConfig.variant;
  const currentPresets = presets.filter((p) => p.variant === currentVariant);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Mode Picker */}
      <div className="space-y-3">
        <label className={SECTION_LABEL}>Color Mode</label>
        <div className={SEGMENT_GROUP}>
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`${SEGMENT} gap-2 py-3 ${theme === "system" ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
          >
            <Monitor className="w-5 h-5" />
            <span>System</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`${SEGMENT} gap-2 py-3 ${theme === "light" ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
          >
            <Sun className="w-5 h-5" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`${SEGMENT} gap-2 py-3 ${theme === "dark" ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
          >
            <Moon className="w-5 h-5" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Theme Presets: outlined cards, the selected one outlined in ink */}
      <div className="space-y-3">
        <label className={SECTION_LABEL}>Theme Palette</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentPresets.map((preset) => {
            const isActive = activeConfig.codeThemeId === preset.codeThemeId;

            return (
              <button
                type="button"
                key={preset.codeThemeId}
                onClick={() => setCodeThemeId(preset.codeThemeId, currentVariant)}
                className={`flex items-center gap-3 p-3 rounded-codex-lg text-left border transition-colors duration-150 ${
                  isActive
                    ? "border-codex-foreground"
                    : "border-codex-border hover:border-codex-border-strong"
                }`}
              >
                {/* Swatch Preview: the preset's own colors, drawn as flat bars */}
                <div
                  className="w-10 h-10 rounded-codex-md flex items-center justify-center shrink-0 overflow-hidden border border-codex-border"
                  style={{ backgroundColor: preset.theme.surface }}
                >
                  <div className="flex flex-col gap-1.5 w-full px-2">
                    <div
                      className="h-1.5 w-full"
                      style={{ backgroundColor: preset.theme.accent }}
                    />
                    <div
                      className="h-1 w-2/3 opacity-80"
                      style={{ backgroundColor: preset.theme.ink }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-codex-foreground capitalize truncate">
                  {preset.codeThemeId.replace(/-light|-dark/g, "").replace("-", " ")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout */}
      <div className="space-y-3">
        <label className={SECTION_LABEL}>Layout</label>
        <label className="flex items-center justify-between gap-4 p-4 rounded-codex-lg border border-codex-border cursor-pointer">
          <div className="min-w-0">
            <p className="text-sm font-medium text-codex-foreground">Full width pages</p>
            <p className="text-xs text-codex-muted mt-0.5">
              Use the entire window width for page content on this device.
            </p>
          </div>
          {/* Switch: ink track when on, a strong-border track when off */}
          <button
            type="button"
            role="switch"
            aria-checked={isFullWidth}
            aria-label="Full width pages"
            onClick={() => setFullWidth(!isFullWidth)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-150 ${
              isFullWidth ? "bg-codex-accent" : "bg-codex-border-strong"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-codex-background transition-transform duration-150 ${
                isFullWidth ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </label>
      </div>

      {/* Motion */}
      <fieldset className="space-y-3">
        <legend className={SECTION_LABEL}>Motion</legend>
        <p className="text-xs text-codex-muted -mt-1">
          Transitions and animations across the app. System follows your device&apos;s &ldquo;reduce
          motion&rdquo; setting.
        </p>
        <div role="radiogroup" aria-label="Motion" className={SEGMENT_GROUP}>
          {MOTION_OPTIONS.map((option) => {
            const isActive = motion === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setMotion(option.value)}
                className={`${SEGMENT} gap-1.5 py-2.5 pointer-coarse:py-3.5 ${
                  isActive ? SEGMENT_ACTIVE : SEGMENT_IDLE
                }`}
              >
                <option.icon className="w-4 h-4" aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
