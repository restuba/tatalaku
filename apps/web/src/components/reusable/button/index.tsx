"use client";

import { forwardRef } from "react";
import { SpinnerIcon } from "@/components/icons";
import type {
  ButtonProps,
  ButtonType,
  ButtonVariant,
  ButtonSize,
  ButtonShape,
  ButtonColor,
  IconPlacement,
} from "./types";

// ─── Style Builders ──────────────────────────────────────────────────
// Buttons use the interface voice (Inter, sentence case, medium weight).
// Primary is the one solid accent action on a screen; secondary actions are
// outlined or quiet text buttons. Focus uses the global 2px accent ring.

function getSizeClasses(size: ButtonSize, shape: ButtonShape): string {
  if (shape === "circle") {
    const map: Record<ButtonSize, string> = {
      small: "size-8 pointer-coarse:size-10",
      medium: "size-9 pointer-coarse:size-11",
      large: "size-11 pointer-coarse:size-12",
    };
    return map[size];
  }

  const map: Record<ButtonSize, string> = {
    small: "h-8 px-3 gap-1.5 text-sm pointer-coarse:h-10",
    medium: "h-9 px-4 gap-2 text-sm pointer-coarse:h-11",
    large: "h-11 px-5 gap-2 text-base pointer-coarse:h-12",
  };
  return map[size];
}

function getShapeClasses(shape: ButtonShape): string {
  const map: Record<ButtonShape, string> = {
    default: "rounded-codex-md",
    circle: "rounded-full p-0",
    round: "rounded-full",
  };
  return map[shape];
}

function resolveVariant(btnType: ButtonType): ButtonVariant {
  const map: Record<ButtonType, ButtonVariant> = {
    primary: "solid",
    default: "outlined",
    dashed: "outlined",
    text: "text",
    link: "link",
  };
  return map[btnType];
}

function getVariantClasses(variant: ButtonVariant, color: ButtonColor, isDashed: boolean): string {
  const borderStyle = isDashed ? "border-dashed" : "border-solid";

  const colorVariants: Record<ButtonColor, Record<ButtonVariant, string>> = {
    primary: {
      solid: "bg-codex-accent text-codex-background hover:bg-codex-accent-hover",
      outlined: `border ${borderStyle} border-codex-accent text-codex-accent hover:bg-codex-accent-soft`,
      filled: "bg-codex-accent-soft text-codex-accent hover:bg-codex-selected",
      text: "text-codex-accent hover:bg-codex-accent-soft",
      link: "text-codex-accent underline-offset-4 hover:underline",
    },
    danger: {
      solid: "bg-codex-danger text-codex-background hover:bg-codex-danger/90",
      outlined: `border ${borderStyle} border-codex-danger text-codex-danger hover:bg-codex-danger-bg`,
      filled: "bg-codex-danger-bg text-codex-danger hover:bg-codex-danger/20",
      text: "text-codex-danger hover:bg-codex-danger-bg",
      link: "text-codex-danger underline-offset-4 hover:underline",
    },
    warning: {
      solid: "bg-codex-warning text-codex-background hover:bg-codex-warning/90",
      outlined: `border ${borderStyle} border-codex-warning text-codex-warning hover:bg-codex-warning-bg`,
      filled: "bg-codex-warning-bg text-codex-warning hover:bg-codex-warning/20",
      text: "text-codex-warning hover:bg-codex-warning-bg",
      link: "text-codex-warning underline-offset-4 hover:underline",
    },
    default: {
      solid:
        "border border-codex-border-strong bg-codex-elevated text-codex-foreground hover:bg-codex-hover",
      outlined: `border ${borderStyle} border-codex-border-strong text-codex-foreground hover:bg-codex-hover`,
      filled: "bg-codex-hover text-codex-foreground hover:bg-codex-selected",
      text: "text-codex-muted hover:bg-codex-hover hover:text-codex-foreground",
      link: "text-codex-foreground underline-offset-4 hover:underline",
    },
  };

  return colorVariants[color][variant];
}

// ─── Component ──────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      btnType = "default",
      variant,
      color = "default",
      size = "medium",
      shape = "round",
      icon,
      iconPlacement = "start",
      loading = false,
      disabled = false,
      block = false,
      htmlType = "button",
      className = "",
      children,
      ...rest
    },
    ref,
  ) => {
    const resolvedVariant = variant ?? resolveVariant(btnType);
    const resolvedColor = btnType === "primary" && color === "default" ? "primary" : color;
    const isDisabled = disabled || loading;
    const isIconOnly = icon && !children;
    const effectiveShape = isIconOnly ? "circle" : shape;

    const classes = [
      "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,opacity] duration-150",
      getSizeClasses(size, effectiveShape),
      getShapeClasses(effectiveShape),
      getVariantClasses(resolvedVariant, resolvedColor, btnType === "dashed"),
      block ? "w-full" : "",
      isDisabled ? "pointer-events-none opacity-50" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconElement = loading ? <SpinnerIcon size={size === "small" ? 14 : 16} /> : icon;

    return (
      <button
        ref={ref}
        type={htmlType}
        disabled={isDisabled}
        className={classes}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        {...rest}
      >
        {iconElement && iconPlacement === "start" && (
          <span className="flex shrink-0 items-center">{iconElement}</span>
        )}
        {children && <span className="truncate">{children}</span>}
        {iconElement && iconPlacement === "end" && (
          <span className="flex shrink-0 items-center">{iconElement}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
export default Button;
export type {
  ButtonProps,
  ButtonType,
  ButtonVariant,
  ButtonSize,
  ButtonShape,
  ButtonColor,
  IconPlacement,
};
