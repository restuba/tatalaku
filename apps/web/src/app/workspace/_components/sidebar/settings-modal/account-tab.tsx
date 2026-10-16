"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { LogOut, Mail, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { confirmDialog } from "@/stores/dialog-store";

/** Label voice above a field */
const FIELD_LABEL = "block font-mono text-xs uppercase tracking-label text-codex-muted";
/** Read-only field: outlined, brightens to ink on focus (no ring) */
const FIELD =
  "w-full rounded-codex-md border border-codex-border-strong bg-codex-background py-2 pl-9 pr-3 text-sm text-codex-foreground outline-none transition-colors select-all focus:border-codex-foreground";
/** Leading icon inside a field */
const FIELD_ICON =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-codex-muted/70";

export function AccountTab() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  async function handleLogout() {
    const confirmed = await confirmDialog({
      title: "Log out?",
      description: "You'll need to sign in again to access your workspaces.",
      confirmLabel: "Log out",
    });
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Profile Info: an outlined card, no tint */}
      <div className="p-5 rounded-codex-lg border border-codex-border space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-codex-border-strong font-mono text-lg text-codex-foreground">
            {initial}
          </div>
          <div className="space-y-1 min-w-0">
            <h4 className="text-sm font-medium text-codex-foreground truncate">
              {user?.name || "User"}
            </h4>
            <div className="flex items-center gap-1.5 text-codex-muted">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate font-mono text-xs">
                {user?.email || "No email available"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="space-y-5">
        <div className="space-y-2">
          <label className={FIELD_LABEL}>Full Name</label>
          <div className="relative">
            <input type="text" readOnly value={user?.name || ""} className={FIELD} />
            <UserIcon className={FIELD_ICON} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={FIELD_LABEL}>Email Address</label>
          <div className="relative">
            <input type="email" readOnly value={user?.email || ""} className={FIELD} />
            <Mail className={FIELD_ICON} />
          </div>
        </div>
      </div>

      {/* Account Actions / Logout */}
      <div className="pt-6 border-t border-codex-border">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium text-codex-foreground">Log Out</h4>
            <p className="text-xs text-codex-muted">Sign out of your account on this browser.</p>
          </div>
          {/* Destructive: outlined red pill, tinted on hover */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-codex-danger px-5 font-mono text-xs uppercase tracking-label text-codex-danger transition-colors hover:bg-codex-danger-bg disabled:cursor-not-allowed disabled:opacity-40 pointer-coarse:h-11"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
