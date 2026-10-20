type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  className?: string;
  variant?: "icon-only" | "full";
  size?: LogoSize;
}

const MARK_SIZE: Record<LogoSize, string> = {
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
  xl: "size-12",
};

const WORDMARK_SIZE: Record<LogoSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-4xl",
};

/**
 * The Tatalaku leaf: a single folio, its vein cut out (evenodd), so it takes
 * `currentColor` and reads on any surface in every theme.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M4 20C4 11 10 4 20 4c0 9-6 16-16 16Zm2.2-2.2Q11.84 14.14 15.5 8.5 9.86 12.16 6.2 17.8Z"
      />
    </svg>
  );
}

/** Leaf mark in the accent color plus the serif wordmark */
export function Logo({ className = "", variant = "full", size = "md" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <LogoMark className={`${MARK_SIZE[size]} shrink-0 text-codex-accent`} />
      {variant === "full" ? (
        <span
          className={`font-serif font-medium leading-none tracking-tight text-codex-foreground ${WORDMARK_SIZE[size]}`}
        >
          Tatalaku
        </span>
      ) : (
        <span className="sr-only">Tatalaku</span>
      )}
    </span>
  );
}
