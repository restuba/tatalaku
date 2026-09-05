"use client";

import { forwardRef, useState, useRef, useCallback, useImperativeHandle } from "react";
import { CloseIcon, SearchIcon, SpinnerIcon } from "@/components/icons";
import type { KeyboardEvent } from "react";
import type {
  InputProps,
  InputRef,
  SearchProps,
  InputSize,
  InputVariant,
  InputStatus,
} from "./types";

// ─── Style Builders ──────────────────────────────────────────────────

function getSizeClasses(size: InputSize): { wrapper: string; input: string } {
  const map: Record<InputSize, { wrapper: string; input: string }> = {
    small: { wrapper: "h-8 px-2.5 text-xs", input: "text-xs" },
    medium: { wrapper: "h-9 px-3 text-sm", input: "text-sm" },
    large: { wrapper: "h-11 px-3.5 text-base", input: "text-base" },
  };
  return map[size];
}

function getVariantClasses(
  variant: InputVariant,
  status: InputStatus,
  focused: boolean,
  disabled: boolean,
): string {
  if (disabled) {
    return variant === "borderless"
      ? "bg-transparent text-muted cursor-not-allowed"
      : "border border-border bg-surface-secondary text-muted cursor-not-allowed";
  }

  const isError = status === "error";
  const isWarning = status === "warning";

  if (variant === "borderless") {
    if (isError) return "bg-transparent border border-danger shadow-xs";
    if (isWarning) return "bg-transparent border border-accent shadow-xs";
    return "bg-transparent border border-transparent";
  }

  if (variant === "filled") {
    if (isError) return "bg-danger-bg/40 border border-danger";
    if (focused) return "bg-surface border border-accent ring-2 ring-accent/20";
    return "bg-surface-secondary border border-transparent hover:bg-muted/15";
  }

  // outlined (default)
  if (isError) return "border border-danger bg-surface ring-2 ring-danger/15";
  if (isWarning) return "border border-accent bg-surface ring-2 ring-accent/15";
  if (focused) return "border border-accent bg-surface ring-2 ring-accent/15 shadow-xs";
  return "border border-border bg-surface hover:border-accent/70";
}

// ─── Input Component ────────────────────────────────────────────────

const Input = forwardRef<InputRef, InputProps>(
  (
    {
      label,
      allowClear = false,
      className = "",
      defaultValue,
      disabled = false,
      id,
      maxLength,
      showCount = false,
      prefix,
      suffix,
      status,
      size = "medium",
      type = "text",
      value: controlledValue,
      variant = "outlined",
      placeholder,
      onChange,
      onPressEnter,
      onClear,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      input: inputRef.current,
    }));

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!isControlled) setInternalValue(val);
        onChange?.(val);
      },
      [isControlled, onChange],
    );

    const handleClear = useCallback(() => {
      if (!isControlled) setInternalValue("");
      onChange?.("");
      onClear?.();
      inputRef.current?.focus();
    }, [isControlled, onChange, onClear]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onPressEnter?.();
      },
      [onPressEnter],
    );

    const sizeStyles = getSizeClasses(size);
    const variantStyles = getVariantClasses(variant, status, focused, disabled);
    const showClearBtn = allowClear && Boolean(currentValue) && !disabled;

    return (
      <div className={className}>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink">
            {label}
          </label>
        )}
        <div
          className={`inline-flex w-full items-center gap-2 rounded-md transition-all duration-150 ${sizeStyles.wrapper} ${variantStyles}`}
          onClick={() => inputRef.current?.focus()}
        >
          {prefix && <span className="shrink-0 text-muted">{prefix}</span>}

          <input
            ref={inputRef}
            id={id}
            type={type}
            value={currentValue}
            disabled={disabled}
            maxLength={maxLength}
            placeholder={placeholder}
            className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted disabled:cursor-not-allowed ${sizeStyles.input} text-ink`}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            aria-invalid={status === "error" || undefined}
            {...rest}
          />

          {showClearBtn && (
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 cursor-pointer text-muted hover:text-ink transition-colors"
              aria-label="Clear input"
              tabIndex={-1}
            >
              <CloseIcon size={14} />
            </button>
          )}

          {suffix && <span className="shrink-0 text-muted">{suffix}</span>}
        </div>

        {showCount && maxLength && (
          <div className="mt-1 text-right text-[11px] text-muted">
            {currentValue.length}/{maxLength}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

// ─── Input.Search ───────────────────────────────────────────────────

const Search = forwardRef<InputRef, SearchProps>(
  (
    {
      enterButton,
      onSearch,
      onPressEnter,
      loading = false,
      size = "medium",
      className = "",
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<InputRef>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      input: inputRef.current?.input ?? null,
    }));

    const currentValue = rest.value ?? "";

    const handleSearch = useCallback(() => {
      onSearch?.(currentValue);
    }, [onSearch, currentValue]);

    const handlePressEnter = useCallback(() => {
      handleSearch();
      onPressEnter?.();
    }, [handleSearch, onPressEnter]);

    const btnSizeMap: Record<InputSize, string> = {
      small: "h-8 px-2.5 text-xs",
      medium: "h-9 px-3.5 text-sm",
      large: "h-11 px-4 text-base",
    };

    if (enterButton) {
      const buttonContent = enterButton === true ? <SearchIcon size={14} /> : enterButton;

      return (
        <div className={`flex ${className}`}>
          <Input
            ref={inputRef}
            size={size}
            onPressEnter={handlePressEnter}
            className="flex-1 [&>div]:rounded-r-none"
            {...rest}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || rest.disabled}
            className={`inline-flex items-center justify-center gap-1.5 rounded-r-md border border-l-0 border-accent bg-accent font-medium text-surface transition-opacity hover:opacity-90 active:opacity-100 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${btnSizeMap[size]}`}
          >
            {loading ? <SpinnerIcon size={14} /> : null}
            {buttonContent}
          </button>
        </div>
      );
    }

    return (
      <Input
        ref={inputRef}
        size={size}
        className={className}
        onPressEnter={handlePressEnter}
        suffix={
          <button
            type="button"
            onClick={handleSearch}
            className="cursor-pointer text-muted transition-colors hover:text-ink"
            tabIndex={-1}
            aria-label="Search"
          >
            {loading ? <SpinnerIcon size={14} /> : <SearchIcon size={14} />}
          </button>
        }
        {...rest}
      />
    );
  },
);

Search.displayName = "InputSearch";

// ─── Compound export ────────────────────────────────────────────────

export default Object.assign(Input, { Search });
export type { InputProps, SearchProps, InputRef, InputSize, InputVariant, InputStatus };
