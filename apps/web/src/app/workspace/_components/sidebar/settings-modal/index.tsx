"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { X, User, Palette, Building, Users, Keyboard } from "lucide-react";
import { TWEEN } from "@/components/motion";
import { Kbd } from "@/components/reusable/kbd";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useUIStore, type SettingsTab } from "@/stores/ui-store";
import { AccountTab } from "./account-tab";
import { AppearanceTab } from "./appearance-tab";
import { GeneralTab } from "./general-tab";
import { MembersTab } from "./members-tab";

export type { SettingsTab };

const TAB_METADATA: Record<SettingsTab, { title: string; subtitle: string }> = {
  account: {
    title: "My account",
    subtitle: "Your profile and sign-in details.",
  },
  appearance: {
    title: "Appearance",
    subtitle: "Theme, reading size and motion on this device.",
  },
  general: {
    title: "Workspace",
    subtitle: "The workspace name and its details.",
  },
  members: {
    title: "Members",
    subtitle: "People who can open this workspace.",
  },
};

interface NavItem {
  tab: SettingsTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const NAV_GROUPS: ReadonlyArray<{ label: string; items: ReadonlyArray<NavItem> }> = [
  {
    label: "Account",
    items: [
      { tab: "account", label: "My account", icon: User },
      { tab: "appearance", label: "Appearance", icon: Palette },
    ],
  },
  {
    label: "Workspace",
    items: [
      { tab: "general", label: "General", icon: Building },
      { tab: "members", label: "Members", icon: Users },
    ],
  },
];

/** Settings dialog. Open state lives in the UI store, so any surface can open it. */
export function SettingsModal() {
  const settingsTab = useUIStore((s) => s.settingsTab);
  const closeSettings = useUIStore((s) => s.closeSettings);
  const mounted = useIsMounted();

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {settingsTab && (
        <SettingsDialog key="settings" activeTab={settingsTab} onClose={closeSettings} />
      )}
    </AnimatePresence>,
    document.body,
  );
}

function SettingsDialog({ activeTab, onClose }: { activeTab: SettingsTab; onClose: () => void }) {
  const { activeWorkspace } = useWorkspaceStore();
  const setSettingsTab = useUIStore((s) => s.setSettingsTab);
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef);

  // Escape closes (nested dialogs stop the event before it gets here)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // The page behind doesn't scroll while Settings is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <m.div
        aria-hidden="true"
        className="absolute inset-0 bg-codex-scrim"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={TWEEN}
      />

      {/* Phone: full-screen sheet with tabs on top. sm+: centered two-column dialog */}
      <m.div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-codex-elevated outline-none sm:h-[640px] sm:max-h-[calc(100dvh-2rem)] sm:max-w-3xl sm:flex-row sm:rounded-codex-xl sm:surface-dialog"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        transition={TWEEN}
      >
        {/* Navigation: horizontal scroller on phones, left column from sm */}
        <aside className="flex shrink-0 flex-col border-b border-codex-border bg-codex-sidebar p-2 select-none sm:w-56 sm:border-r sm:border-b-0">
          <div className="hidden px-2 pt-2 pb-4 sm:block">
            <h2 className="font-serif text-lg font-medium leading-tight text-codex-foreground">
              Settings
            </h2>
            {activeWorkspace && (
              <p className="mt-1 truncate text-xs text-codex-muted">{activeWorkspace.name}</p>
            )}
          </div>

          <nav
            aria-label="Settings sections"
            className="flex gap-1 overflow-x-auto [scrollbar-width:none] sm:flex-1 sm:flex-col sm:gap-5 sm:overflow-x-visible sm:overflow-y-auto"
          >
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="flex shrink-0 gap-1 sm:flex-col sm:gap-px">
                <div className="eyebrow hidden px-2 pb-1.5 text-codex-muted sm:block">
                  {group.label}
                </div>
                {group.items.map(({ tab, label, icon: Icon }) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSettingsTab(tab)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex h-8 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-codex-md px-2.5 text-sm transition-colors duration-150 pointer-coarse:h-11 sm:w-full sm:px-2 ${
                        isActive
                          ? "bg-codex-selected font-medium text-codex-foreground"
                          : "text-codex-muted hover:bg-codex-hover hover:text-codex-foreground"
                      }`}
                    >
                      <Icon
                        className={`size-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-codex-foreground"
                            : "text-codex-muted group-hover:text-codex-foreground"
                        }`}
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Not a section: hands over to the shortcuts sheet, which has no
              other mouse entry point besides the command palette */}
          <button
            type="button"
            onClick={() => {
              onClose();
              setShortcutsOpen(true);
            }}
            className="mt-2 hidden h-8 shrink-0 items-center gap-2.5 rounded-codex-md px-2 text-sm text-codex-muted transition-colors duration-150 hover:bg-codex-hover hover:text-codex-foreground pointer-coarse:h-11 sm:flex"
          >
            <Keyboard className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left">Keyboard shortcuts</span>
            <Kbd className="pointer-coarse:hidden">⌘/</Kbd>
          </button>
        </aside>

        {/* Content */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-codex-elevated">
          <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-2 sm:px-8 sm:pt-7">
            <div className="min-w-0">
              <h3
                id="settings-title"
                className="font-serif text-2xl font-medium leading-tight text-codex-foreground"
              >
                {TAB_METADATA[activeTab].title}
              </h3>
              <p className="mt-1.5 text-sm text-codex-muted">{TAB_METADATA[activeTab].subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mt-0.5 -mr-2 flex size-8 shrink-0 items-center justify-center rounded-codex-md text-codex-muted transition-colors hover:bg-codex-hover hover:text-codex-foreground pointer-coarse:size-11"
              title="Close settings (Esc)"
              aria-label="Close settings"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-10 sm:px-8">
            {activeTab === "account" && <AccountTab />}
            {activeTab === "appearance" && <AppearanceTab />}
            {activeTab === "general" && <GeneralTab key={activeWorkspace?.id} onClose={onClose} />}
            {activeTab === "members" && <MembersTab />}
          </div>
        </main>
      </m.div>
    </div>
  );
}
