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
  // Lines carry every state: the border brightens to ink on focus and turns
  // red on error. No rings, no glow.
  if (disabled) {
    return variant === "borderless"
      ? "bg-transparent text-codex-muted cursor-not-allowed"
      : "border border-codex-border bg-codex-surface-secondary text-codex-muted cursor-not-allowed";
  }

  const isError = status === "error";
  const isWarning = status === "warning";

  if (variant === "borderless") {
    if (isError) return "bg-transparent border border-codex-danger";
    if (isWarning) return "bg-transparent border border-codex-accent";
    return "bg-transparent border border-transparent";
  }

  if (variant === "filled") {
    if (isError) return "bg-codex-danger-bg border border-codex-danger";
    if (focused) return "bg-codex-surface-raised border border-codex-foreground";
    return "bg-codex-surface-raised border border-transparent hover:border-codex-border-strong";
  }

  // outlined (default)
  if (isError) return "border border-codex-danger bg-codex-background";
  if (isWarning) return "border border-codex-accent bg-codex-background";
  if (focused) return "border border-codex-foreground bg-codex-background";
  return "border border-codex-border-strong bg-codex-background hover:border-codex-muted";
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
          <label
            htmlFor={id}
            className="mb-2 block font-mono text-xs uppercase tracking-label text-codex-muted"
          >
            {label}
          </label>
        )}
        <div
          className={`inline-flex w-full items-center gap-2 rounded-codex-md transition-colors duration-150 ${sizeStyles.wrapper} ${variantStyles}`}
          onClick={() => inputRef.current?.focus()}
        >
          {prefix && <span className="shrink-0 text-codex-muted">{prefix}</span>}

          <input
            ref={inputRef}
            id={id}
            type={type}
            value={currentValue}
            disabled={disabled}
            maxLength={maxLength}
            placeholder={placeholder}
            className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-codex-muted/70 disabled:cursor-not-allowed ${sizeStyles.input} text-codex-foreground`}
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
              className="shrink-0 cursor-pointer text-codex-muted hover:text-codex-foreground transition-colors"
              aria-label="Clear input"
              tabIndex={-1}
            >
              <CloseIcon size={14} />
            </button>
          )}

          {suffix && <span className="shrink-0 text-codex-muted">{suffix}</span>}
        </div>

        {showCount && maxLength && (
          <div className="mt-1 text-right text-xs text-codex-muted">
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
            className={`inline-flex items-center justify-center gap-1.5 rounded-r-codex-md border border-l-0 border-codex-accent bg-codex-accent font-mono uppercase tracking-label text-codex-background transition-opacity hover:opacity-85 disabled:pointer-events-none disabled:opacity-40 cursor-pointer ${btnSizeMap[size]}`}
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
            className="cursor-pointer text-codex-muted transition-colors hover:text-codex-foreground"
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

const CompoundInput = Object.assign(Input, { Search });

export { CompoundInput as Input };
export default CompoundInput;
export type { InputProps, SearchProps, InputRef, InputSize, InputVariant, InputStatus };
