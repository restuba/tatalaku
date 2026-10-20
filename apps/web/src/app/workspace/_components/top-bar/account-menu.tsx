"use client";

import { useRouter } from "next/navigation";
import { Keyboard, LogOut, Palette, Settings } from "lucide-react";
import { DropdownMenu } from "@/components/reusable/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

/** The signed-in user's menu: settings, shortcuts and sign out */
export function AccountMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { openSettings, setShortcutsOpen } = useUIStore();

  return (
    <DropdownMenu
      label="Account"
      widthClassName="w-64"
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className="flex size-8 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-85 pointer-coarse:size-11"
          aria-label="Account"
          title={user?.name ?? "Account"}
        >
          <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="sm" />
        </button>
      )}
    >
      <div className="flex items-center gap-3 px-2.5 py-2">
        <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-codex-foreground">
            {user?.name ?? "Signed in"}
          </p>
          {user?.email && <p className="truncate text-xs text-codex-muted">{user.email}</p>}
        </div>
      </div>
      <DropdownMenu.Separator />
      <DropdownMenu.Item icon={<Settings className="size-4" />} onSelect={() => openSettings()}>
        Settings
      </DropdownMenu.Item>
      <DropdownMenu.Item
        icon={<Palette className="size-4" />}
        onSelect={() => openSettings("appearance")}
      >
        Appearance
      </DropdownMenu.Item>
      <DropdownMenu.Item
        icon={<Keyboard className="size-4" />}
        hint="⌘/"
        onSelect={() => setShortcutsOpen(true)}
      >
        Keyboard shortcuts
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        icon={<LogOut className="size-4" />}
        danger
        onSelect={async () => {
          await logout();
          router.push("/login");
        }}
      >
        Log out
      </DropdownMenu.Item>
    </DropdownMenu>
  );
}
