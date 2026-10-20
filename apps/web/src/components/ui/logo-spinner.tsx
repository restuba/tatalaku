import { LogoMark } from "./logo";

interface LogoSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
}

const SIZE: Record<NonNullable<LogoSpinnerProps["size"]>, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-12",
};

/** Busy indicator: the leaf mark, gently pulsing (static with motion off) */
export function LogoSpinner({ className, size = "md", text }: LogoSpinnerProps) {
  return (
    <span
      role="status"
      className={`inline-flex flex-col items-center justify-center gap-3 ${className ?? ""}`}
    >
      <LogoMark className={`${SIZE[size]} animate-pulse`} />
      {text ? (
        <span className="text-sm text-codex-muted">{text}</span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </span>
  );
}
