"use client";

import { useId, type ReactNode } from "react";
import { CheckCircle2, CircleSlash, Monitor, Sparkles, type LucideIcon } from "lucide-react";
import { Switch } from "@/components/reusable/switch";
import { useRadioGroup } from "@/hooks/use-radio-group";
import { READING_SIZES, type ReadingSize } from "@/lib/reading-size";
import { THEME_IDS, THEMES, getTheme, resolveTheme, type ThemeId } from "@/lib/themes";
import { useHydratedThemePreference, usePrefersDark, useThemeStore } from "@/stores/theme-store";
import { useUIStore, type MotionPreference } from "@/stores/ui-store";
import { ThemePreview } from "@/components/shared/theme-preview";

const MOTION_OPTIONS: ReadonlyArray<{ value: MotionPreference; label: string; icon: LucideIcon }> =
  [
    { value: "system", label: "System", icon: Monitor },
    { value: "on", label: "On", icon: Sparkles },
    { value: "off", label: "Off", icon: CircleSlash },
  ];
const MOTION_VALUES = MOTION_OPTIONS.map((o) => o.value);

const READING_LABEL: Record<ReadingSize, { label: string; sample: string }> = {
  small: { label: "Small", sample: "text-sm" },
  default: { label: "Default", sample: "text-base" },
  large: { label: "Large", sample: "text-lg" },
};

/** Section heading inside the tab */
function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div>
        <h4 id={id} className="text-sm font-medium text-codex-foreground">
          {title}
        </h4>
        {description && <p className="mt-0.5 text-sm text-codex-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** Segmented radio control (one tab stop, arrow keys move) */
const SEGMENT_GROUP =
  "grid gap-1 rounded-codex-lg border border-codex-border bg-codex-surface-secondary p-1";
const SEGMENT =
  "flex items-center justify-center gap-2 rounded-codex-md px-2 text-sm transition-colors duration-150";
const SEGMENT_ACTIVE = "bg-codex-elevated font-medium text-codex-foreground shadow-codex-sm";
const SEGMENT_IDLE = "text-codex-muted hover:text-codex-foreground";

export function AppearanceTab() {
  const ids = useId();
  const preference = useHydratedThemePreference();
  const setPreference = useThemeStore((s) => s.setPreference);
  const prefersDark = usePrefersDark();
  const { isFullWidth, setFullWidth, motion, setMotion, readingSize, setReadingSize } =
    useUIStore();

  const isSystem = preference === "system";
  const activeTheme: ThemeId | null = preference ? resolveTheme(preference, prefersDark) : null;
  const selectedTheme: ThemeId | null = preference && !isSystem ? preference : null;

  const themeGroup = useRadioGroup(THEME_IDS, selectedTheme, setPreference);
  const readingGroup = useRadioGroup(READING_SIZES, readingSize, setReadingSize);
  const motionGroup = useRadioGroup(MOTION_VALUES, motion, setMotion);

  return (
    <div className="space-y-10">
      {/* Theme */}
      <Section
        id={`${ids}-theme`}
        title="Theme"
        description="Only colors change between themes; layout and type stay the same."
      >
        <div
          role="radiogroup"
          aria-labelledby={`${ids}-theme`}
          onKeyDown={themeGroup.onKeyDown}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {THEMES.map((theme) => {
            const isChecked = selectedTheme === theme.id;
            const isAuto = isSystem && activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                ref={themeGroup.register(theme.id)}
                type="button"
                role="radio"
                aria-checked={isChecked}
                aria-describedby={`${ids}-${theme.id}-desc`}
                tabIndex={themeGroup.tabIndexFor(theme.id)}
                onClick={() => setPreference(theme.id)}
                className={`flex flex-col gap-2.5 rounded-codex-lg border p-2 text-left transition-colors duration-150 ${
                  isChecked
                    ? "border-codex-accent ring-1 ring-codex-accent"
                    : "border-codex-border hover:border-codex-border-strong"
                }`}
              >
                <ThemePreview theme={theme.id} />
                <span className="flex items-start justify-between gap-2 px-1 pb-0.5">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-codex-foreground">
                      {theme.name}
                    </span>
                    <span id={`${ids}-${theme.id}-desc`} className="block text-xs text-codex-muted">
                      {theme.style}
                    </span>
                  </span>
                  {isChecked && (
                    <CheckCircle2
                      className="size-4 shrink-0 text-codex-accent"
                      aria-hidden="true"
                    />
                  )}
                  {isAuto && <span className="eyebrow shrink-0 text-codex-muted">Auto</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-codex-lg border border-codex-border px-4 py-3.5">
          <div className="min-w-0">
            <p id={`${ids}-system`} className="text-sm font-medium text-codex-foreground">
              Match system
            </p>
            <p id={`${ids}-system-desc`} className="mt-0.5 text-sm text-codex-muted">
              Use Parchment in light mode and Nocturne in dark mode
              {isSystem && activeTheme ? ` — now ${getTheme(activeTheme).name}` : ""}.
            </p>
          </div>
          <Switch
            checked={isSystem}
            aria-labelledby={`${ids}-system`}
            aria-describedby={`${ids}-system-desc`}
            onChange={(on) => {
              // Turning it off keeps whatever is on screen right now
              setPreference(on ? "system" : (activeTheme ?? "parchment"));
            }}
          />
        </div>
      </Section>

      {/* Text size */}
      <Section
        id={`${ids}-reading`}
        title="Text size"
        description="Size of document text. Interface text stays the same."
      >
        <div
          role="radiogroup"
          aria-labelledby={`${ids}-reading`}
          onKeyDown={readingGroup.onKeyDown}
          className={`${SEGMENT_GROUP} grid-cols-3`}
        >
          {READING_SIZES.map((size) => {
            const isActive = readingSize === size;
            return (
              <button
                key={size}
                ref={readingGroup.register(size)}
                type="button"
                role="radio"
                aria-checked={isActive}
                tabIndex={readingGroup.tabIndexFor(size)}
                onClick={() => setReadingSize(size)}
                className={`${SEGMENT} h-12 ${isActive ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
              >
                <span aria-hidden="true" className={`font-serif ${READING_LABEL[size].sample}`}>
                  Aa
                </span>
                <span>{READING_LABEL[size].label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Layout */}
      <Section id={`${ids}-layout`} title="Page width">
        <div className="flex items-center justify-between gap-4 rounded-codex-lg border border-codex-border px-4 py-3.5">
          <div className="min-w-0">
            <p id={`${ids}-width`} className="text-sm font-medium text-codex-foreground">
              Full width pages
            </p>
            <p id={`${ids}-width-desc`} className="mt-0.5 text-sm text-codex-muted">
              Use the whole window for wide tables and diagrams on this device.
            </p>
          </div>
          <Switch
            checked={isFullWidth}
            onChange={setFullWidth}
            aria-labelledby={`${ids}-width`}
            aria-describedby={`${ids}-width-desc`}
          />
        </div>
      </Section>

      {/* Motion */}
      <Section
        id={`${ids}-motion`}
        title="Motion"
        description="Transitions across the app. System follows your device's reduce-motion setting."
      >
        <div
          role="radiogroup"
          aria-labelledby={`${ids}-motion`}
          onKeyDown={motionGroup.onKeyDown}
          className={`${SEGMENT_GROUP} grid-cols-3`}
        >
          {MOTION_OPTIONS.map((option) => {
            const isActive = motion === option.value;
            return (
              <button
                key={option.value}
                ref={motionGroup.register(option.value)}
                type="button"
                role="radio"
                aria-checked={isActive}
                tabIndex={motionGroup.tabIndexFor(option.value)}
                onClick={() => setMotion(option.value)}
                className={`${SEGMENT} h-10 pointer-coarse:h-12 ${isActive ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
              >
                <option.icon className="size-4" aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
