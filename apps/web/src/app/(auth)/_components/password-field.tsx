"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/reusable/input";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  minLength?: number;
  describedBy?: string;
}

/** Password input with a show/hide toggle */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
  describedBy,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Input
      id={id}
      label={label}
      size="large"
      type={isVisible ? "text" : "password"}
      autoComplete={autoComplete}
      required
      minLength={minLength}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-describedby={describedBy}
      suffix={
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="-mr-1.5 flex size-8 items-center justify-center rounded-codex-md text-codex-muted transition-colors hover:bg-codex-hover hover:text-codex-foreground"
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
        >
          {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}
