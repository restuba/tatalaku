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

function getSizeClasses(size: ButtonSize, shape: ButtonShape): string {
  if (shape === "circle") {
    const map: Record<ButtonSize, string> = {
      small: "h-8 w-8 text-xs",
      medium: "h-9 w-9 text-sm",
      large: "h-11 w-11 text-base",
    };
    return map[size];
  }

  const map: Record<ButtonSize, string> = {
    small: "h-8 px-2.5 text-xs gap-1.5",
    medium: "h-9 px-3.5 text-sm gap-2",
    large: "h-11 px-5 text-base gap-2.5",
  };
  return map[size];
}

function getShapeClasses(shape: ButtonShape): string {
  const map: Record<ButtonShape, string> = {
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
      solid: "bg-codex-accent text-codex-surface hover:opacity-90 active:opacity-100 shadow-xs",
      outlined: `border ${borderStyle} border-codex-accent text-codex-accent bg-transparent hover:bg-codex-accent/10 active:bg-codex-accent/20`,
      filled:
        "bg-codex-accent/15 text-codex-accent hover:bg-codex-accent/25 active:bg-codex-accent/30",
      text: "text-codex-accent bg-transparent hover:bg-codex-accent/10 active:bg-codex-accent/20",
      link: "text-codex-accent underline-offset-4 hover:underline bg-transparent",
    },
    danger: {
      solid: "bg-codex-danger text-codex-surface hover:opacity-90 active:opacity-100 shadow-xs",
      outlined: `border ${borderStyle} border-codex-danger text-codex-danger bg-transparent hover:bg-codex-danger-bg/40 active:bg-codex-danger-bg`,
      filled:
        "bg-codex-danger-bg text-codex-danger hover:bg-codex-danger-bg/80 active:bg-codex-danger-bg",
      text: "text-codex-danger bg-transparent hover:bg-codex-danger-bg/40 active:bg-codex-danger-bg",
      link: "text-codex-danger underline-offset-4 hover:underline bg-transparent",
    },
    warning: {
      solid: "bg-codex-accent text-codex-surface hover:opacity-90 active:opacity-100 shadow-xs",
      outlined: `border ${borderStyle} border-codex-accent text-codex-accent bg-transparent hover:bg-codex-accent/10`,
      filled: "bg-codex-accent/15 text-codex-accent hover:bg-codex-accent/25",
      text: "text-codex-accent bg-transparent hover:bg-codex-accent/10",
      link: "text-codex-accent underline-offset-4 hover:underline bg-transparent",
    },
    default: {
      solid:
        "bg-codex-surface-secondary text-codex-foreground border border-codex-border hover:bg-codex-muted/15 shadow-xs",
      outlined: `border ${borderStyle} border-codex-border text-codex-foreground bg-codex-surface hover:border-codex-accent hover:text-codex-accent active:bg-codex-surface-secondary`,
      filled:
        "bg-codex-surface-secondary text-codex-foreground hover:bg-codex-muted/20 active:bg-codex-muted/30",
      text: "text-codex-foreground bg-transparent hover:bg-codex-surface-secondary active:bg-codex-muted/20",
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
      shape = "default",
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
      "inline-flex items-center justify-center font-medium cursor-pointer select-none transition-all duration-150",
      "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-codex-accent",
      getSizeClasses(size, effectiveShape),
      getShapeClasses(effectiveShape),
      getVariantClasses(resolvedVariant, resolvedColor, btnType === "dashed"),
      block ? "w-full" : "",
      isDisabled ? "pointer-events-none opacity-50 cursor-not-allowed" : "",
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
