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
    default: "rounded-md",
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
      solid: "bg-accent text-surface hover:opacity-90 active:opacity-100 shadow-xs",
      outlined: `border ${borderStyle} border-accent text-accent bg-transparent hover:bg-accent/10 active:bg-accent/20`,
      filled: "bg-accent/15 text-accent hover:bg-accent/25 active:bg-accent/30",
      text: "text-accent bg-transparent hover:bg-accent/10 active:bg-accent/20",
      link: "text-accent underline-offset-4 hover:underline bg-transparent",
    },
    danger: {
      solid: "bg-danger text-surface hover:opacity-90 active:opacity-100 shadow-xs",
      outlined: `border ${borderStyle} border-danger text-danger bg-transparent hover:bg-danger-bg/40 active:bg-danger-bg`,
      filled: "bg-danger-bg text-danger hover:bg-danger-bg/80 active:bg-danger-bg",
      text: "text-danger bg-transparent hover:bg-danger-bg/40 active:bg-danger-bg",
      link: "text-danger underline-offset-4 hover:underline bg-transparent",
    },
    warning: {
      solid: "bg-accent text-surface hover:opacity-90 active:opacity-100 shadow-xs",
      outlined: `border ${borderStyle} border-accent text-accent bg-transparent hover:bg-accent/10`,
      filled: "bg-accent/15 text-accent hover:bg-accent/25",
      text: "text-accent bg-transparent hover:bg-accent/10",
      link: "text-accent underline-offset-4 hover:underline bg-transparent",
    },
    default: {
      solid: "bg-surface-secondary text-ink border border-border hover:bg-muted/15 shadow-xs",
      outlined: `border ${borderStyle} border-border text-ink bg-surface hover:border-accent hover:text-accent active:bg-surface-secondary`,
      filled: "bg-surface-secondary text-ink hover:bg-muted/20 active:bg-muted/30",
      text: "text-ink bg-transparent hover:bg-surface-secondary active:bg-muted/20",
      link: "text-ink underline-offset-4 hover:underline bg-transparent",
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
      "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
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
