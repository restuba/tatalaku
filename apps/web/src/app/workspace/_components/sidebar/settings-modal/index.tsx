"use client";

import { useState, useEffect, type ComponentType } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { AccountTab } from "./account-tab";
import { AppearanceTab } from "./appearance-tab";
import { GeneralTab } from "./general-tab";
import { MembersTab } from "./members-tab";
import { X, User, Palette, Building, Users } from "lucide-react";

export type SettingsTab = "account" | "appearance" | "general" | "members";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

const TAB_METADATA: Record<SettingsTab, { title: string; subtitle: string }> = {
  account: {
    title: "My Account",
    subtitle: "Manage your personal profile and account credentials.",
  },
  appearance: {
    title: "Appearance",
    subtitle: "Customize how Tatalaku looks on your device.",
  },
  general: {
    title: "Workspace General",
    subtitle: "Update your workspace profile and general preferences.",
  },
  members: {
    title: "Workspace Members",
    subtitle: "Manage team members who have access to this workspace.",
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
      { tab: "account", label: "My Account", icon: User },
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

export function SettingsModal({ isOpen, onClose, initialTab = "account" }: SettingsModalProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Sync activeTab when initialTab prop changes
  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      // Dense scrim instead of a blur, faded in with the card
      className="fixed inset-0 z-[60] flex items-center justify-center bg-codex-background/80 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Phone: full-screen sheet with tabs on top. sm+: centered two-column card,
          flat and set off by a strong border */}
      <div
        className="flex h-dvh w-full flex-col overflow-hidden bg-codex-background sm:h-[620px] sm:max-h-[90vh] sm:max-w-3xl sm:flex-row sm:rounded-codex-xl sm:border sm:border-codex-border-strong animate-row-in"
        style={{ animationDuration: "250ms" }}
      >
        {/* Navigation: horizontal scroller on phones, left column from sm */}
        <aside className="sm:w-56 bg-codex-sidebar border-b sm:border-b-0 sm:border-r border-codex-border flex flex-col p-2 select-none shrink-0">
          {/* Header */}
          <div className="hidden sm:block px-2 pt-2 pb-4">
            <h2 className="text-sm font-semibold leading-tight tracking-tight text-codex-foreground">
              Settings
            </h2>
            {activeWorkspace && (
              <p className="mt-1 truncate font-mono text-xs uppercase tracking-label text-codex-muted/80">
                {activeWorkspace.name}
              </p>
            )}
          </div>

          {/* Nav Groups */}
          <nav
            aria-label="Settings sections"
            className="flex sm:flex-col gap-1 sm:gap-5 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto sm:flex-1 [scrollbar-width:none]"
          >
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="flex sm:flex-col gap-1 sm:gap-px shrink-0">
                <div className="hidden sm:block px-2 pb-1.5 font-mono text-xs uppercase tracking-label text-codex-muted/80">
                  {group.label}
                </div>
                {group.items.map(({ tab, label, icon: Icon }) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex h-8 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-codex-md px-2.5 text-sm transition-colors duration-150 pointer-coarse:h-11 sm:w-full sm:px-2 ${
                        isActive
                          ? "bg-codex-surface-raised font-medium text-codex-foreground"
                          : "text-codex-muted hover:bg-codex-surface-raised/60 hover:text-codex-foreground"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-codex-foreground"
                            : "text-codex-muted/70 group-hover:text-codex-foreground"
                        }`}
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-codex-background">
          {/* Header with Title, Subtitle & Close Button (No divide / border) */}
          <div className="flex items-start justify-between gap-3 px-4 sm:px-8 pt-4 sm:pt-6 pb-2 shrink-0">
            <div className="min-w-0">
              <h3
                id="settings-title"
                className="text-lg font-medium tracking-tight text-codex-foreground"
              >
                {TAB_METADATA[activeTab].title}
              </h3>
              <p className="mt-1 text-sm text-codex-muted">{TAB_METADATA[activeTab].subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-codex-muted transition-colors hover:bg-codex-surface-raised hover:text-codex-foreground pointer-coarse:h-11 pointer-coarse:w-11"
              title="Close Settings (Esc)"
              aria-label="Close settings"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content Pane */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-8 pt-4 pb-8">
            {activeTab === "account" && <AccountTab />}
            {activeTab === "appearance" && <AppearanceTab />}
            {activeTab === "general" && <GeneralTab key={activeWorkspace?.id} onClose={onClose} />}
            {activeTab === "members" && <MembersTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
