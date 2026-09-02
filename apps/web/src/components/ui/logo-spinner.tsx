import { Logo } from "./logo";

interface LogoSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
}

export function LogoSpinner({ className, size = "md", text }: LogoSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className || ""}`}>
      <div className="animate-pulse">
        <Logo variant="icon-only" size={size} />
      </div>
      {text && <span className="text-sm font-medium text-codex-muted animate-pulse">{text}</span>}
    </div>
  );
}
