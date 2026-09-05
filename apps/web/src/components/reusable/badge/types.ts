import type { ReactNode } from "react";

export type BadgeStatus = "default" | "success" | "warning" | "danger" | "info";
export type BadgeVariant = "subtle" | "solid" | "outline";
export type BadgeSize = "small" | "medium";

export interface BadgeProps {
  status?: BadgeStatus | undefined;
  variant?: BadgeVariant | undefined;
  size?: BadgeSize | undefined;
  dot?: boolean | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
}
