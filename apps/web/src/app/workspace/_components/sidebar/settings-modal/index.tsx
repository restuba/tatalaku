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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-codex-background/60 backdrop-blur-sm sm:p-4 transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Phone: full-screen sheet with tabs on top. sm+: centered two-column card. */}
      <div
        className="w-full h-dvh sm:h-[620px] sm:max-w-3xl sm:max-h-[90vh] bg-codex-surface sm:border sm:border-codex-border sm:rounded-codex-2xl flex flex-col sm:flex-row shadow-2xl shadow-black/10 animate-slide-up-fade overflow-hidden"
        style={{ animationDuration: "250ms" }}
      >
        {/* Navigation: horizontal scroller on phones, left column from sm */}
        <aside className="sm:w-56 bg-codex-sidebar border-b sm:border-b-0 sm:border-r border-codex-border flex flex-col p-2 sm:p-3 select-none shrink-0">
          {/* Header */}
          <div className="hidden sm:block px-2 py-2 mb-2">
            <h2 className="text-sm font-semibold text-codex-foreground">Settings</h2>
            {activeWorkspace && (
              <p className="text-xs text-codex-muted truncate mt-0.5">{activeWorkspace.name}</p>
            )}
          </div>

          {/* Nav Groups */}
          <nav
            aria-label="Settings sections"
            className="flex sm:flex-col gap-1 sm:gap-4 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto sm:flex-1 [scrollbar-width:none]"
          >
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="flex sm:flex-col gap-1 sm:gap-0.5 shrink-0">
                <div className="hidden sm:block px-2 py-1 text-xs font-semibold text-codex-muted uppercase tracking-wider">
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
                      className={`shrink-0 sm:w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-2.5 py-2 pointer-coarse:py-2.5 rounded-codex-md text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-codex-surface text-codex-foreground shadow-sm ring-1 ring-codex-border/40"
                          : "text-codex-muted hover:text-codex-foreground hover:bg-codex-surface/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-codex-surface">
          {/* Header with Title, Subtitle & Close Button (No divide / border) */}
          <div className="flex items-start justify-between gap-3 px-4 sm:px-8 pt-4 sm:pt-6 pb-2 shrink-0">
            <div className="min-w-0">
              <h3 id="settings-title" className="text-base font-semibold text-codex-foreground">
                {TAB_METADATA[activeTab].title}
              </h3>
              <p className="text-xs text-codex-muted mt-0.5">{TAB_METADATA[activeTab].subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-1.5 pointer-coarse:p-2.5 -mr-1.5 -mt-1 rounded-codex-sm hover:bg-codex-surface-secondary text-codex-muted hover:text-codex-foreground transition-colors"
              title="Close Settings (Esc)"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Pane */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-8 py-4">
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
