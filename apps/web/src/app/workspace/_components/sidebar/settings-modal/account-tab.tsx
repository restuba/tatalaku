"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { LogOut, Mail, User as UserIcon } from "lucide-react";
import { useState } from "react";

export function AccountTab() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  async function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
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
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Profile Info */}
      <div className="p-5 rounded-codex-xl border border-codex-border bg-codex-surface space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-codex-accent/15 border border-codex-accent/30 flex items-center justify-center text-codex-accent font-semibold text-xl shrink-0">
            {initial}
          </div>
          <div className="space-y-1 min-w-0">
            <h4 className="text-sm font-semibold text-codex-foreground truncate">
              {user?.name || "User"}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-codex-muted">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user?.email || "No email available"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-codex-muted">Full Name</label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={user?.name || ""}
              className="w-full px-3 py-2 pl-9 rounded-codex-md border border-codex-border bg-codex-background text-sm text-codex-foreground select-all outline-none"
            />
            <UserIcon className="w-4 h-4 text-codex-muted absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-codex-muted">Email Address</label>
          <div className="relative">
            <input
              type="email"
              readOnly
              value={user?.email || ""}
              className="w-full px-3 py-2 pl-9 rounded-codex-md border border-codex-border bg-codex-background text-sm text-codex-foreground select-all outline-none"
            />
            <Mail className="w-4 h-4 text-codex-muted absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Account Actions / Logout */}
      <div className="pt-4 border-t border-codex-border">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium text-codex-foreground">Log Out</h4>
            <p className="text-xs text-codex-muted">Sign out of your account on this browser.</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-3.5 py-2 rounded-codex-md border border-codex-danger/30 text-codex-danger hover:bg-codex-danger/10 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
