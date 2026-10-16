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
// Buttons speak in the label voice: Space Mono, ALL CAPS, tracked out.
// Primary is the one solid action on a screen; everything else is outlined
// or ghost. Destructive actions are outlined in red, never filled.

function getSizeClasses(size: ButtonSize, shape: ButtonShape): string {
  if (shape === "circle") {
    const map: Record<ButtonSize, string> = {
      small: "h-8 w-8 text-xs",
      medium: "h-9 w-9 text-xs",
      large: "h-11 w-11 text-sm",
    };
    return map[size];
  }

  const map: Record<ButtonSize, string> = {
    small: "h-8 px-3.5 text-xs gap-1.5 pointer-coarse:h-10",
    medium: "h-9 px-4 text-xs gap-2 pointer-coarse:h-11",
    large: "h-11 px-6 text-xs gap-2.5 pointer-coarse:h-12",
  };
  return map[size];
}

function getShapeClasses(shape: ButtonShape): string {
  const map: Record<ButtonShape, string> = {
    // Technical: a squared-off control for dense toolbars
    default: "rounded-codex-sm",
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
      solid: "border border-codex-accent bg-codex-accent text-codex-background hover:opacity-85",
      outlined: `border ${borderStyle} border-codex-accent text-codex-accent bg-transparent hover:bg-codex-accent/10`,
      filled: "bg-codex-accent/10 text-codex-accent hover:bg-codex-accent/20",
      text: "text-codex-accent bg-transparent hover:bg-codex-accent/10",
      link: "text-codex-accent underline-offset-4 hover:underline bg-transparent",
    },
    danger: {
      // Destructive: outlined red at every weight, tinted on hover
      solid: "border border-codex-danger text-codex-danger bg-transparent hover:bg-codex-danger-bg",
      outlined: `border ${borderStyle} border-codex-danger text-codex-danger bg-transparent hover:bg-codex-danger-bg`,
      filled: "bg-codex-danger-bg text-codex-danger hover:bg-codex-danger-bg/70",
      text: "text-codex-danger bg-transparent hover:bg-codex-danger-bg",
      link: "text-codex-danger underline-offset-4 hover:underline bg-transparent",
    },
    warning: {
      solid: "border border-codex-accent bg-codex-accent text-codex-background hover:opacity-85",
      outlined: `border ${borderStyle} border-codex-accent text-codex-accent bg-transparent hover:bg-codex-accent/10`,
      filled: "bg-codex-accent/10 text-codex-accent hover:bg-codex-accent/20",
      text: "text-codex-accent bg-transparent hover:bg-codex-accent/10",
      link: "text-codex-accent underline-offset-4 hover:underline bg-transparent",
    },
    default: {
      solid:
        "border border-codex-border-strong bg-codex-surface-raised text-codex-foreground hover:border-codex-muted",
      outlined: `border ${borderStyle} border-codex-border-strong text-codex-foreground bg-transparent hover:border-codex-muted active:bg-codex-surface-raised`,
      filled: "bg-codex-surface-raised text-codex-foreground hover:bg-codex-border",
      text: "text-codex-muted bg-transparent hover:bg-codex-surface-raised hover:text-codex-foreground",
      link: "text-codex-foreground underline-offset-4 hover:underline bg-transparent",
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
      "inline-flex shrink-0 items-center justify-center font-mono uppercase tracking-label cursor-pointer select-none transition-[background-color,border-color,color,opacity] duration-150",
      "focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-codex-foreground",
      getSizeClasses(size, effectiveShape),
      getShapeClasses(effectiveShape),
      getVariantClasses(resolvedVariant, resolvedColor, btnType === "dashed"),
      block ? "w-full" : "",
      isDisabled ? "pointer-events-none opacity-40 cursor-not-allowed" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconElement = loading ? <SpinnerIcon size={size === "small" ? 12 : 16} /> : icon;

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
          <span className="shrink-0">{iconElement}</span>
        )}
        {children && <span className="truncate">{children}</span>}
        {iconElement && iconPlacement === "end" && <span className="shrink-0">{iconElement}</span>}
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
