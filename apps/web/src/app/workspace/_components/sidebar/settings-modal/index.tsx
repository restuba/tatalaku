"use client";

import { useState, useEffect } from "react";
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-codex-background/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div
        className="w-full max-w-3xl h-[620px] max-h-[90vh] bg-codex-surface border border-codex-border rounded-codex-2xl flex shadow-2xl shadow-black/10 animate-slide-up-fade overflow-hidden"
        style={{ animationDuration: "250ms" }}
      >
        {/* Left Navigation Column */}
        <aside className="w-56 bg-codex-sidebar border-r border-codex-border flex flex-col p-3 select-none shrink-0">
          {/* Header */}
          <div className="px-2 py-2 mb-2">
            <h2 className="text-sm font-semibold text-codex-foreground">Settings</h2>
            {activeWorkspace && (
              <p className="text-[11px] text-codex-muted truncate mt-0.5">{activeWorkspace.name}</p>
            )}
          </div>

          {/* Nav Groups */}
          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Account Group */}
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-semibold text-codex-muted uppercase tracking-wider">
                Account
              </div>
              <button
                onClick={() => setActiveTab("account")}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-codex-md text-xs font-medium transition-colors ${
                  activeTab === "account"
                    ? "bg-codex-surface text-codex-foreground shadow-sm ring-1 ring-codex-border/40"
                    : "text-codex-muted hover:text-codex-foreground hover:bg-codex-surface/50"
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>My Account</span>
              </button>
              <button
                onClick={() => setActiveTab("appearance")}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-codex-md text-xs font-medium transition-colors ${
                  activeTab === "appearance"
                    ? "bg-codex-surface text-codex-foreground shadow-sm ring-1 ring-codex-border/40"
                    : "text-codex-muted hover:text-codex-foreground hover:bg-codex-surface/50"
                }`}
              >
                <Palette className="w-3.5 h-3.5 shrink-0" />
                <span>Appearance</span>
              </button>
            </div>

            {/* Workspace Group */}
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-semibold text-codex-muted uppercase tracking-wider">
                Workspace
              </div>
              <button
                onClick={() => setActiveTab("general")}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-codex-md text-xs font-medium transition-colors ${
                  activeTab === "general"
                    ? "bg-codex-surface text-codex-foreground shadow-sm ring-1 ring-codex-border/40"
                    : "text-codex-muted hover:text-codex-foreground hover:bg-codex-surface/50"
                }`}
              >
                <Building className="w-3.5 h-3.5 shrink-0" />
                <span>General</span>
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-codex-md text-xs font-medium transition-colors ${
                  activeTab === "members"
                    ? "bg-codex-surface text-codex-foreground shadow-sm ring-1 ring-codex-border/40"
                    : "text-codex-muted hover:text-codex-foreground hover:bg-codex-surface/50"
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Members</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-codex-surface">
          {/* Header with Title, Subtitle & Close Button (No divide / border) */}
          <div className="flex items-start justify-between px-6 sm:px-8 pt-6 pb-2 shrink-0">
            <div>
              <h3 className="text-base font-semibold text-codex-foreground">
                {TAB_METADATA[activeTab].title}
              </h3>
              <p className="text-xs text-codex-muted mt-0.5">{TAB_METADATA[activeTab].subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 -mt-1 rounded-codex-sm hover:bg-codex-surface-secondary text-codex-muted hover:text-codex-foreground transition-colors"
              title="Close Settings (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Pane */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4">
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
