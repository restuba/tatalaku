"use client";

import { useTheme } from "next-themes";
import { useThemeStore } from "@/stores/theme-store";
import { presets } from "@/lib/themes";
import { Monitor, Sun, Moon } from "lucide-react";
import { Modal } from "@/components/reusable/modal";

// ─── Styles ──────────────────────────────────────────────────────────────────

/** Section title in the label voice */
const SECTION_LABEL = "font-mono text-xs uppercase tracking-label text-codex-muted";
const SEGMENT =
  "flex flex-col items-center gap-2 py-3 px-2 rounded-codex-md font-mono text-xs uppercase tracking-label transition-colors duration-150";
const SEGMENT_ACTIVE = "bg-codex-surface-raised text-codex-foreground";
const SEGMENT_IDLE = "text-codex-muted hover:text-codex-foreground";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AppearanceModal({ isOpen, onClose }: AppearanceModalProps) {
  const { theme, setTheme } = useTheme();
  const { activeConfig, setCodeThemeId } = useThemeStore();

  const currentVariant = activeConfig.variant;
  const currentPresets = presets.filter((p) => p.variant === currentVariant);

  return (
    <Modal open={isOpen} onClose={onClose} maxWidth="sm" fullWidth aria-label="Appearance Settings">
      <Modal.Header showClose divider>
        Appearance
      </Modal.Header>

      <Modal.Content className="space-y-8 py-6">
        {/* Mode Picker: an outlined segmented group, the selected segment raised */}
        <div className="space-y-3">
          <h3 className={SECTION_LABEL}>Mode</h3>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-codex-lg border border-codex-border">
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`${SEGMENT} ${theme === "system" ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
            >
              <Monitor className="w-5 h-5" />
              <span>System</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`${SEGMENT} ${theme === "light" ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
            >
              <Sun className="w-5 h-5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`${SEGMENT} ${theme === "dark" ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
            >
              <Moon className="w-5 h-5" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Theme Presets: outlined cards, the selected one outlined in ink */}
        <div className="space-y-3">
          <h3 className={SECTION_LABEL}>Theme</h3>
          <div className="grid grid-cols-2 gap-3">
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
                  <span className="text-sm font-medium text-codex-foreground capitalize">
                    {preset.codeThemeId.replace(/-light|-dark/g, "").replace("-", " ")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}

export default AppearanceModal;
