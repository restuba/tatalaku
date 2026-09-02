"use client";

import { useTheme } from "next-themes";
import { useThemeStore } from "@/stores/theme.store";
import { presets } from "@/lib/themes";
import { X, Monitor, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function AppearanceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { theme, setTheme } = useTheme();
  const { activeConfig, setCodeThemeId } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  const currentVariant = activeConfig.variant;
  const currentPresets = presets.filter((p) => p.variant === currentVariant);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-codex-background/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div
        className="bg-codex-surface/60 dark:bg-codex-surface/40 backdrop-blur-2xl w-full max-w-md border border-codex-border/40 rounded-codex-2xl flex flex-col shadow-2xl shadow-black/10 animate-slide-up-fade"
        style={{ animationDuration: "300ms" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-codex-border/40">
          <h2 className="text-lg font-semibold text-codex-foreground">Appearance</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-codex-sm hover:bg-codex-surface-secondary text-codex-muted hover:text-codex-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Mode Picker */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-codex-foreground">Mode</h3>
            <div className="grid grid-cols-3 gap-3 p-1 bg-codex-surface-secondary/50 rounded-codex-lg border border-codex-border/50">
              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center gap-2 py-3 px-2 rounded-codex-md transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                  theme === "system"
                    ? "bg-codex-surface/80 shadow-sm text-codex-foreground ring-1 ring-codex-border/50"
                    : "text-codex-muted hover:text-codex-foreground hover:bg-codex-surface/40"
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs font-medium">System</span>
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-2 py-3 px-2 rounded-codex-md transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                  theme === "light"
                    ? "bg-codex-surface/80 shadow-sm text-codex-foreground ring-1 ring-codex-border/50"
                    : "text-codex-muted hover:text-codex-foreground hover:bg-codex-surface/40"
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs font-medium">Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-2 py-3 px-2 rounded-codex-md transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                  theme === "dark"
                    ? "bg-codex-surface/80 shadow-sm text-codex-foreground ring-1 ring-codex-border/50"
                    : "text-codex-muted hover:text-codex-foreground hover:bg-codex-surface/40"
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs font-medium">Dark</span>
              </button>
            </div>
          </div>

          {/* Theme Presets */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-codex-foreground">Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {currentPresets.map((preset) => {
                const isActive = activeConfig.codeThemeId === preset.codeThemeId;

                return (
                  <button
                    key={preset.codeThemeId}
                    onClick={() => setCodeThemeId(preset.codeThemeId, currentVariant)}
                    className={`flex items-center gap-3 p-3 rounded-codex-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 border ${
                      isActive
                        ? "border-codex-accent bg-codex-surface/80 ring-1 ring-codex-accent/30 shadow-sm"
                        : "border-codex-border/30 bg-codex-surface-secondary/20 hover:bg-codex-surface-secondary/50 hover:border-codex-border/50"
                    }`}
                  >
                    {/* Swatch Preview */}
                    <div
                      className="w-10 h-10 rounded-codex-md flex items-center justify-center shadow-inner shrink-0 overflow-hidden border border-black/5 dark:border-white/5"
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
                    <span className="text-sm font-medium text-codex-foreground capitalize">
                      {preset.codeThemeId.replace(/-light|-dark/g, "").replace("-", " ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
