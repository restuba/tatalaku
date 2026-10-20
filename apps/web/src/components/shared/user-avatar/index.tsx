type AvatarSize = "sm" | "md" | "lg";

interface UserAvatarProps {
  name?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  size?: AvatarSize;
  className?: string;
}

const SIZE: Record<AvatarSize, string> = {
  sm: "size-7 text-xs",
  md: "size-8 text-sm",
  lg: "size-14 text-xl",
};

/** A person's photo, or their initial on an ink disc */
export function UserAvatar({ name, avatarUrl, size = "md", className = "" }: UserAvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() || "?";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-supplied URL on any host
      <img
        src={avatarUrl}
        alt=""
        className={`${SIZE[size]} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${SIZE[size]} flex shrink-0 items-center justify-center rounded-full bg-codex-foreground font-medium text-codex-background select-none ${className}`}
    >
      {initial}
    </span>
  );
}

export default UserAvatar;
