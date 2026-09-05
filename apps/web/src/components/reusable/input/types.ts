import type { InputHTMLAttributes, ReactNode } from "react";

export type InputSize = "small" | "medium" | "large";
export type InputVariant = "outlined" | "filled" | "borderless";
export type InputStatus = "error" | "warning" | undefined;

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "onChange" | "prefix"
> {
  /** Field label displayed above the input */
  label?: string | undefined;
  /** Visual variant of the input */
  variant?: InputVariant | undefined;
  /** Size dimension preset */
  size?: InputSize | undefined;
  /** Validation status */
  status?: InputStatus | undefined;
  /** Prefix icon or adornment */
  prefix?: ReactNode | undefined;
  /** Suffix icon or adornment */
  suffix?: ReactNode | undefined;
  /** Allows clearing input content with one click */
  allowClear?: boolean | undefined;
  /** Controlled value */
  value?: string | undefined;
  /** Default value (uncontrolled) */
  defaultValue?: string | undefined;
  /** Character limit with optional count display */
  maxLength?: number | undefined;
  /** Displays remaining/total character count */
  showCount?: boolean | undefined;
  /** Additional class names on the root container */
  className?: string | undefined;
  /** Change handler receiving current string value */
  onChange?: ((value: string) => void) | undefined;
  /** Triggered when Enter key is pressed */
  onPressEnter?: (() => void) | undefined;
  /** Triggered when clear button is clicked */
  onClear?: (() => void) | undefined;
}

export interface InputRef {
  focus: () => void;
  blur: () => void;
  input: HTMLInputElement | null;
}

export interface SearchProps extends Omit<InputProps, "suffix"> {
  /** Search button text or custom element */
  enterButton?: ReactNode | boolean | undefined;
  /** Search trigger handler */
  onSearch?: ((value: string) => void) | undefined;
  /** Loading state for search button */
  loading?: boolean | undefined;
}
