"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Mail, User as UserIcon } from "lucide-react";
import { Button } from "@/components/reusable/button";
import { Input } from "@/components/reusable/input";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuthStore } from "@/stores/auth-store";
import { confirmDialog } from "@/stores/dialog-store";

export function AccountTab() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    const confirmed = await confirmDialog({
      title: "Log out?",
      description: "You'll need to sign in again to open your workspaces.",
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
    <div className="space-y-8">
      {/* Profile */}
      <div className="flex items-center gap-4">
        <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="lg" />
        <div className="min-w-0 space-y-0.5">
          <p className="truncate font-serif text-xl font-medium text-codex-foreground">
            {user?.name || "User"}
          </p>
          <p className="truncate text-sm text-codex-muted">{user?.email || "No email available"}</p>
        </div>
      </div>

      {/* Details (read-only: the API has no profile update yet) */}
      <div className="space-y-5">
        <Input
          id="account-name"
          label="Full name"
          readOnly
          value={user?.name || ""}
          prefix={<UserIcon className="size-4" />}
        />
        <Input
          id="account-email"
          label="Email address"
          type="email"
          readOnly
          value={user?.email || ""}
          prefix={<Mail className="size-4" />}
        />
      </div>

      {/* Session */}
      <div className="flex items-center justify-between gap-4 border-t border-codex-border pt-6">
        <div className="min-w-0 space-y-0.5">
          <h4 className="text-sm font-medium text-codex-foreground">Log out</h4>
          <p className="text-sm text-codex-muted">Sign out of your account on this browser.</p>
        </div>
        <Button
          color="danger"
          variant="outlined"
          size="small"
          loading={isLoggingOut}
          onClick={handleLogout}
          icon={<LogOut className="size-3.5" />}
        >
          {isLoggingOut ? "Logging out…" : "Log out"}
        </Button>
      </div>
    </div>
  );
}
