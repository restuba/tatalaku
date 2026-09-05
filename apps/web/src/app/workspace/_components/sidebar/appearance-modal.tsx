"use client";

import { useTheme } from "next-themes";
import { useThemeStore } from "@/stores/theme-store";
import { presets } from "@/lib/themes";
import { Monitor, Sun, Moon } from "lucide-react";
import { Modal } from "@/components/reusable/modal";

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
        {/* Mode Picker */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-ink">Mode</h3>
          <div className="grid grid-cols-3 gap-3 p-1 bg-surface-secondary/50 rounded-codex-lg border border-border/50">
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-2 py-3 px-2 rounded-codex-md transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                theme === "system"
                  ? "bg-surface/80 shadow-sm text-ink ring-1 ring-border/50"
                  : "text-muted hover:text-ink hover:bg-surface/40"
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span className="text-xs font-medium">System</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-2 py-3 px-2 rounded-codex-md transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                theme === "light"
                  ? "bg-surface/80 shadow-sm text-ink ring-1 ring-border/50"
                  : "text-muted hover:text-ink hover:bg-surface/40"
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs font-medium">Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-2 py-3 px-2 rounded-codex-md transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                theme === "dark"
                  ? "bg-surface/80 shadow-sm text-ink ring-1 ring-border/50"
                  : "text-muted hover:text-ink hover:bg-surface/40"
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs font-medium">Dark</span>
            </button>
          </div>
        </div>

        {/* Theme Presets */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-ink">Theme</h3>
          <div className="grid grid-cols-2 gap-3">
            {currentPresets.map((preset) => {
              const isActive = activeConfig.codeThemeId === preset.codeThemeId;

              return (
                <button
                  type="button"
                  key={preset.codeThemeId}
                  onClick={() => setCodeThemeId(preset.codeThemeId, currentVariant)}
                  className={`flex items-center gap-3 p-3 rounded-codex-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 border ${
                    isActive
                      ? "border-accent bg-surface/80 ring-1 ring-accent/30 shadow-sm"
                      : "border-border/30 bg-surface-secondary/20 hover:bg-surface-secondary/50 hover:border-border/50"
                  }`}
                >
                  {/* Swatch Preview */}
                  <div
                    className="w-10 h-10 rounded-codex-md flex items-center justify-center shadow-inner shrink-0 overflow-hidden border border-border/20"
                    style={{ backgroundColor: preset.theme.surface }}
                  >
                    <div className="flex flex-col gap-1.5 w-full px-2">
                      <div
                        className="h-1.5 rounded-full w-full"
                        style={{ backgroundColor: preset.theme.accent }}
                      />
                      <div
                        className="h-1 rounded-full w-2/3 opacity-80"
                        style={{ backgroundColor: preset.theme.ink }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-ink capitalize">
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
