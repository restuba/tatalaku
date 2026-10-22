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
 * The Tatalaku leaf: a round-lobed leaf with its tip up and to the right and
 * the stem sweeping in from the lower left. The midrib is cut out of the blade
 * (evenodd) and starts a little inside it, so the stem reads as flowing into
 * the vein. Everything uses `currentColor`, so it works on any surface in
 * every theme. Keep in sync with app/icon.svg.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      {/* Blade, with the midrib cut out */}
      <path
        fillRule="evenodd"
        d="M11.65 20.41A7.2 7.2 0 0 1 9.15 6.41C12.85 5.11 16.85 4.21 20.35 1.81C21.85 4.41 22.35 7.71 22.05 10.81C21.55 16.51 16.85 20.61 11.65 20.41ZM7.15 16.29C9.22 14.54 12.07 12.32 16.05 9.41C11.76 11.83 8.54 13.59 6.34 15.28A0.65 0.65 0 0 0 7.15 16.29Z"
      />
      {/* Stem: its end tucks just under the blade's edge */}
      <path
        d="M2.65 21.41C2.91 19.84 3.78 18.46 5.42 16.93"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.55}
        strokeLinecap="round"
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
          className={`font-serif font-medium italic leading-none tracking-tight text-codex-foreground ${WORDMARK_SIZE[size]}`}
        >
          Tatalaku
        </span>
      ) : (
        <span className="sr-only">Tatalaku</span>
      )}
    </span>
  );
}
