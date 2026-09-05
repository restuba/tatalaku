import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonType = "primary" | "default" | "dashed" | "text" | "link";
export type ButtonVariant = "solid" | "outlined" | "filled" | "text" | "link";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonShape = "default" | "circle" | "round";
export type ButtonColor = "primary" | "danger" | "warning" | "default";
export type IconPlacement = "start" | "end";

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "color"
> {
  /** Visual type mapping to variant presets */
  btnType?: ButtonType | undefined;
  /** Direct variant control */
  variant?: ButtonVariant | undefined;
  /** Color theme palette */
  color?: ButtonColor | undefined;
  /** Size dimension preset */
  size?: ButtonSize | undefined;
  /** Geometric shape */
  shape?: ButtonShape | undefined;
  /** Leading or trailing icon element */
  icon?: ReactNode | undefined;
  /** Position of the icon relative to children */
  iconPlacement?: IconPlacement | undefined;
  /** Shows loading spinner and disables interaction */
  loading?: boolean | undefined;
  /** Disabled state */
  disabled?: boolean | undefined;
  /** Full width button */
  block?: boolean | undefined;
  /** Native button type */
  htmlType?: "button" | "submit" | "reset" | undefined;
  /** Custom CSS classes */
  className?: string | undefined;
  /** Button content */
  children?: ReactNode | undefined;
}
